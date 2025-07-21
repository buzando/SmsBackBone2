using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VillanettWS;
using Modal.Model.Model;
using Modal;
using log4net;

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

                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var totalConIVA = recarga.quantityMoney;
                var subtotal = Math.Round(totalConIVA / 1.16m, 2);
                var iva = Math.Round(totalConIVA - subtotal, 2);

                string xmlArticulos = $@"
<articulos>
  <articulo>
    <claveProducto>43223204</claveProducto>
    <descripcion>Servicio profesional</descripcion>
    <cantidad>1</cantidad>
    <unidad>E48</unidad>
    <precioUnitario>{subtotal}</precioUnitario>
    <importe>{subtotal}</importe>
    <impuestos>
      <impuesto>
        <tipo>002</tipo>
        <tasa>0.160000</tasa>
        <importe>{iva}</importe>
      </impuesto>
    </impuestos>
  </articulo>
</articulos>";

                var response = await client.GenerarFacturaDirectaAsync(
                    tipopago: 1,
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
                    usocfdi: user.Cfdi,
                    regimenfiscal: user.TaxRegime,
                    usuario: "tiendavirtual",
                    password: "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                );

                string resultadoXml = response.Body.GenerarFacturaDirectaResult;

                // Extraer URLs de XML
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

                // Descargar y convertir a base64
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
                    .Where(x => x.Estatus.ToLower() == "exitoso" && (x.FacturaXML == null || x.FacturaPDF == null))
                    .ToList();

                foreach (var recarga in recargas)
                {
                    var billinginformation = ctx.BillingInformation.Where(x => x.userId == recarga.idUser).FirstOrDefault();
                    if (billinginformation == null)
                        continue;

                    var usuario = ctx.Users.FirstOrDefault(u => u.Id == recarga.idUser);
                    if (usuario == null) continue;

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


        public class FacturaResult
        {
            public bool Success { get; set; }
            public string XmlBase64 { get; set; }
            public string PdfBase64 { get; set; }
            public string ErrorMessage { get; set; }
        }
    }
}
