using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VillanettWS;
using Modal.Model.Model;
using Modal;
using log4net;
using DocumentFormat.OpenXml.Spreadsheet;

namespace Business
{
    public class Villanet
    {
        private static readonly ILog _logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public async Task<FacturaResult> GenerarFacturaAsync(int idRecarga, int idUsuario)
        {
            var result = new FacturaResult();
            try
            {
                CreditRecharge recarga;
                BillingInformation user;
                string useremail;

                using (var ctx = new Entities())
                {
                    recarga = ctx.CreditRecharge.FirstOrDefault(x => x.Id == idRecarga);
                    user = ctx.BillingInformation.FirstOrDefault(x => x.userId == idUsuario);
                    useremail = ctx.Users.Where(x => x.Id == idUsuario).Select(x => x.email).FirstOrDefault();
                }

                if (recarga == null || user == null)
                {
                    result.Success = false;
                    result.ErrorMessage = "Recarga o datos fiscales no encontrados";
                    return result;
                }


                var articulo = string.Empty;
                if (recarga.Chanel == "short_sms")
                {
                    articulo = "MENSAJES SMS CORTO";
                }
                if (recarga.Chanel == "long_sms")
                {
                    articulo = "MENSAJES SMS LARGO";
                }


                var articuloxml = ObtenerArticulos(articulo);

                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                // XML esperado por Villanett (solo clave y cantidad)
                var cantidad = recarga.quantityCredits;
                var precioUnitario = recarga.quantityMoney / recarga.quantityCredits;
                var subtotal = Math.Round(cantidad * precioUnitario, 2);
                var iva = Math.Round(subtotal * 0.16m, 2);
                var total = subtotal + iva;

                string xmlArticulos = $@"
<VILLANETT>
  <articulo codigo=""{articuloxml.Codigo}"" 
            cantidad=""{recarga.quantityCredits}"" 
            precio=""{precioUnitario}"" 
            iva=""16"" 
            ieps=""0"" />
</VILLANETT>";

                string usoCfdi = user.Cfdi switch
                {
                    "G01" => "1",  // Adquisición de mercancías
                    "G02" => "2",  // Devoluciones, descuentos o bonificaciones
                    "G03" => "3",  // Gastos en general
                    "I01" => "4",  // Construcciones
                    "I02" => "5",  // Mobiliario y equipo
                    "I03" => "6",  // Equipo de transporte
                    "I04" => "7",  // Cómputo y accesorios
                    "I05" => "8",  // Herramientas
                    "I06" => "9",  // Comunicaciones telefónicas
                    "I07" => "10", // Comunicaciones satelitales
                    "I08" => "11", // Otra maquinaria y equipo
                    "D01" => "12", // Honorarios médicos
                    "D02" => "13", // Gastos médicos
                    "D03" => "14", // Gastos funerales
                    "D04" => "15", // Donativos
                    "D05" => "16", // Intereses reales
                    "D06" => "17", // Aportaciones voluntarias al SAR
                    "D07" => "18", // Primas por seguros
                    "D08" => "19", // Gastos de transporte escolar
                    "D09" => "20", // Depósitos en cuentas
                    "D10" => "21", // Pagos por servicios educativos
                    "P01" => "23", // Sin efectos fiscales
                    _ => "3"       // Default: Gastos en general
                };
                string regimenFiscal = user.TaxRegime switch
                {
                    "601" => "1",  // General de Ley Personas Morales
                    "603" => "2",  // Personas Morales con Fines no Lucrativos
                    "605" => "3",  // Sueldos y Salarios
                    "606" => "4",  // Arrendamiento
                    "608" => "5",  // Demás ingresos
                    "609" => "6",  // Consolidación
                    "610" => "7",  // Residentes en el extranjero
                    "611" => "8",  // Dividendos
                    "612" => "9",  // Personas Físicas con Actividades Empresariales
                    "614" => "10", // Ingresos por intereses
                    "615" => "11", // Obligaciones fiscales
                    "616" => "12", // Sociedades cooperativas
                    "620" => "13", // Incorporación Fiscal
                    "621" => "14", // Actividades Agrícolas
                    "622" => "15", // Opcional para Grupos de Sociedades
                    "623" => "16", // Coordinados
                    "624" => "17", // Hidrocarburos
                    "625" => "18", // Enajenación o Adquisición de Bienes
                    "626" => "19", // Plataformas Tecnológicas
                    _ => "1"       // Por defecto: General de Ley Personas Morales
                };


                var response = await client.GenerarFacturaDirectaAsync(
                    tipopago: 4,
                    xmlarticulos: xmlArticulos,
                    comentario: "Recarga de créditos",
                    rfc: user.TaxId,
                    razonsocial: user.BusinessName,
                    calle: user.Street,
                    numeroexterior: user.ExtNumber,
                    numerointerior: user.IntNumber,
                    colonia: user.Colony,
                    codigopostal: user.PostalCode,
                    email: useremail,
                    usocfdi: usoCfdi,
                    regimenfiscal: regimenFiscal,
                    usuario: "tiendavirtual",
                    password: "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                );

                string resultadoXml = response.Body.GenerarFacturaDirectaResult;

                // Extraer URLs
                var xmlDoc = new System.Xml.XmlDocument();
                xmlDoc.LoadXml(resultadoXml);
                var urlXml = xmlDoc.SelectSingleNode("//xml")?.InnerText;
                var urlPdf = xmlDoc.SelectSingleNode("//pdf")?.InnerText;

                if (string.IsNullOrEmpty(urlXml) || string.IsNullOrEmpty(urlPdf))
                {
                    result.Success = false;
                    result.ErrorMessage = "No se pudieron obtener las URLs de XML o PDF.";
                    return result;
                }

                using (var httpClient = new System.Net.Http.HttpClient())
                {
                    var xmlBytes = await httpClient.GetByteArrayAsync(urlXml);
                    var pdfBytes = await httpClient.GetByteArrayAsync(urlPdf);

                    result.XmlBase64 = Convert.ToBase64String(xmlBytes);
                    result.PdfBase64 = Convert.ToBase64String(pdfBytes);
                }

                result.Success = true;
                return result;
            }
            catch (Exception ex)
            {
                _logger.Error("Error en GenerarFacturaAsync", ex);
                return new FacturaResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }



        public async Task FacturarRecargasPendientes()
        {
            using (var ctx = new Entities())
            {
                var recargas = ctx.CreditRecharge
                    .Where(x => x.Estatus.ToLower() == "exitoso" && (x.FacturaXML == null || x.FacturaPDF == null) && x.Id == 16007)
                    .ToList();

                foreach (var recarga in recargas)
                {
                    var billinginformation = ctx.BillingInformation.Where(x => x.userId == recarga.idUser).FirstOrDefault();
                    if (billinginformation == null)
                        continue;

                    var usuario = ctx.Users.FirstOrDefault(u => u.Id == recarga.idUser);
                    if (usuario == null) continue;

                    var articulo = string.Empty;
                    if (recarga.Chanel == "short_sms")
                    {
                        articulo = "MENSAJES SMS CORTO";
                    }
                    if (recarga.Chanel == "long_sms")
                    {
                        articulo = "MENSAJES SMS LARGO";
                    }

                    var articuloxml = ObtenerArticulos(articulo);

                    var resultado = await GenerarFacturaAsync(recarga.Id, usuario.Id);

                    if (resultado.Success)
                    {
                        recarga.FacturaPDF = resultado.PdfBase64;
                        recarga.FacturaXML = resultado.XmlBase64;
                        recarga.FechaFacturacion = DateTime.Now;

                        ctx.SaveChanges();
                    }
                    else
                    {
                        _logger.Error($"Error facturando recarga {recarga.Id}: {resultado.ErrorMessage}");
                    }
                }
            }
        }

        public ArticuloVillanet ObtenerArticulos(string descripcion)
        {
            var client = new TiendaVirtualSoapClient(
                TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                "https://nuxiba.villanett.com/TiendaVirtual.asmx"
            );

            var response = client.ObtenerArticulosMultipleAsync(
                "", "", descripcion,"" , "", "", "", 0, 0, "0", 1000, 0, "tiendavirtual", "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
            ).Result;

            var resultXmlString = System.Net.WebUtility.HtmlDecode(response.Body.ObtenerArticulosMultipleResult);

            var xmlDoc = new System.Xml.XmlDocument();
            xmlDoc.LoadXml(resultXmlString);

            var articulos = new ArticuloVillanet();
            foreach (System.Xml.XmlNode node in xmlDoc.SelectNodes("//Articulo"))
            {
                articulos = (new ArticuloVillanet
                {
                    Codigo = node.Attributes["codigo"]?.InnerText,
                    Descripcion = node.Attributes["descripcion"]?.InnerText,
                    Categoria = node.Attributes["categoria"]?.InnerText,
                    Precio = node.Attributes["precio"]?.InnerText,
                    IVA = node.Attributes["iva"]?.InnerText
                });
            }

            return articulos;
        }
        public class FacturaResult
        {
            public bool Success { get; set; }
            public string XmlBase64 { get; set; }
            public string PdfBase64 { get; set; }
            public string ErrorMessage { get; set; }
        }

        public class ArticuloVillanet
        {
            public string Codigo { get; set; }
            public string Descripcion { get; set; }
            public string Categoria { get; set; }
            public string Precio { get; set; }
            public string IVA { get; set; }
        }

    }
}
