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
using System.IO.Pipelines;
using System.Web;
using System.Xml.Linq;
using System.Globalization;
using System.Data.SqlTypes;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Net;

namespace Business
{
    public class Villanet
    {
        private static bool IsValidUrl(string u) => Uri.IsWellFormedUriString(u, UriKind.Absolute);
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
  <Articulo codigo=""{articuloxml.Codigo}"" 
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
                    usocfdi: user.Cfdi,
                    regimenfiscal: user.TaxRegime,
                    usuario: "tiendavirtual",
                    password: "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                );

                string resultadoXml = response.Body.GenerarFacturaDirectaResult;

                if (LooksLikeVillanettError(resultadoXml))
                {
                    MarkRechargeFacturaError(idRecarga, resultadoXml);

                    return new FacturaResult
                    {
                        Success = false,
                        ErrorMessage = CleanVillanettMessage(resultadoXml)
                    };
                }

                if (string.IsNullOrWhiteSpace(resultadoXml))
                    throw new ArgumentException("Cadena vacía.");

                var parts = resultadoXml.Split('|')
                                .Select(p => p?.Trim())
                                .Where(p => !string.IsNullOrWhiteSpace(p))
                                .ToArray();
                // Extraer URLs
                if (parts.Length < 2)
                    throw new InvalidOperationException("No se encontraron dos URLs separadas por pipe.");

                // Identificar por query ?tip=
                string xml = string.Empty, pdf = string.Empty;

                foreach (var p in parts)
                {
                    if (!IsValidUrl(p)) continue;

                    var uri = new Uri(p);
                    var qs = HttpUtility.ParseQueryString(uri.Query);
                    var tip = qs.Get("tip");

                    if (tip == "7") xml = p;
                    else if (tip == "8") pdf = p;
                }
                if (string.IsNullOrEmpty(xml) || string.IsNullOrEmpty(pdf))
                {
                    var msg = $"Villanett no devolvió URLs válidas de XML/PDF. Respuesta: {CleanVillanettMessage(resultadoXml)}";
                    MarkRechargeFacturaError(idRecarga, msg);

                    return new FacturaResult
                    {
                        Success = false,
                        ErrorMessage = "No se pudo generar la factura. Verifica tus datos fiscales (RFC/nombre/régimen/uso CFDI) e inténtalo nuevamente."
                    };
                }
                using (var httpClient = new System.Net.Http.HttpClient())
                {
                    var xmlBytes = await httpClient.GetByteArrayAsync(xml);
                    var pdfBytes = await httpClient.GetByteArrayAsync(pdf);

                    result.XmlBase64 = Convert.ToBase64String(xmlBytes);
                    result.PdfBase64 = Convert.ToBase64String(pdfBytes);
                    result.Success = true;

                    var entidadFactura = ParseFacturaResumenFromXml(xmlBytes, recarga.Id, result.XmlBase64, result.PdfBase64);
                    UpsertFacturaResumen(entidadFactura);
                }

                if (true)
                {
                    using (var ctx = new Entities())
                    {
                        var recargafinal = ctx.CreditRecharge.Where(x => x.Id == idRecarga).FirstOrDefault();
                        recargafinal.FacturaXML = result.XmlBase64;
                        recargafinal.FacturaPDF = result.PdfBase64;
                        recargafinal.RechargeDate = DateTime.Now;
                        ctx.SaveChanges();
                    }
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

        public FacturaResumen ObtenerFacturaResumenPorRecarga(int rechargeId)
        {
            using (var ctx = new Entities())
            {
                return ctx.FacturaResumen
                          .AsNoTracking()
                          .FirstOrDefault(fr => fr.RechargeId == rechargeId);
            }
        }
        public FacturaResumen ObtenerFacturaResumenPorUuid(Guid uuid)
        {
            using (var ctx = new Entities())
            {
                return ctx.FacturaResumen
                          .AsNoTracking()
                          .FirstOrDefault(fr => fr.UUID == uuid);
            }
        }

        public string Getbase64xml(int idrechargue)
        {
            using (var ctx = new Entities())
            {
                return ctx.CreditRecharge
                          .Where(fr => fr.Id == idrechargue)
                                                    .Select(x => x.FacturaXML)
                          .FirstOrDefault();
            }
        }


        public async Task FacturarRecargasPendientes()
        {
            var recargas = new List<CreditRecharge>();
            var usuario = new Modal.Model.Model.Users();
            using (var ctx = new Entities())
            {
                recargas = ctx.CreditRecharge
                    .Where(x => x.Estatus.ToLower() == "exitoso" && (x.FacturaXML == null || x.FacturaPDF == null) && x.AutomaticInvoice == true)
                    .ToList();
            }
            foreach (var recarga in recargas)
            {
                using (var ctx = new Entities())
                {

                    var billinginformation = ctx.BillingInformation.Where(x => x.userId == recarga.idUser).FirstOrDefault();
                    if (billinginformation == null)
                        continue;

                    usuario = ctx.Users.FirstOrDefault(u => u.Id == recarga.idUser);
                    if (usuario == null) continue;
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

                var resultado = await GenerarFacturaAsync(recarga.Id, usuario.Id);

                if (resultado.Success)
                {
                    using (var ctx = new Entities())
                    {
                        var recargadocumentos = ctx.CreditRecharge.Where(x => x.Id == recarga.Id).FirstOrDefault();
                        recargadocumentos.FacturaPDF = resultado.PdfBase64;
                        recargadocumentos.FacturaXML = resultado.XmlBase64;
                        recargadocumentos.FechaFacturacion = DateTime.Now;

                        ctx.SaveChanges();
                    }

                }
                else
                {
                    _logger.Error($"Error facturando recarga {recarga.Id}: {resultado.ErrorMessage}");
                }
            }

        }
        private static byte[] FromBase64Clean(string base64)
        {
            if (string.IsNullOrWhiteSpace(base64)) return Array.Empty<byte[]>().FirstOrDefault();

            // elimina prefijos tipo data:...;base64,
            var idx = base64.IndexOf("base64,", StringComparison.OrdinalIgnoreCase);
            if (idx >= 0) base64 = base64.Substring(idx + "base64,".Length);

            return Convert.FromBase64String(base64);
        }

        private FacturaResumen ParseFacturaResumenFromXml(byte[] xmlBytes, int rechargeId, string urlXml, string urlPdf)
        {
            var xmlText = System.Text.Encoding.UTF8.GetString(xmlBytes);
            var doc = XDocument.Parse(xmlText);

            // Toma por local-name para funcionar con CFDI 3.3 o 4.0
            var comprobante = doc.Descendants().FirstOrDefault(e => e.Name.LocalName == "Comprobante")
                             ?? throw new InvalidOperationException("No se encontró el nodo Comprobante en el CFDI.");
            var tfd = doc.Descendants().FirstOrDefault(e => e.Name.LocalName == "TimbreFiscalDigital")
                      ?? throw new InvalidOperationException("No se encontró TimbreFiscalDigital en el CFDI.");

            string uuidStr = (string)tfd.Attribute("UUID")
                           ?? throw new InvalidOperationException("El CFDI no contiene UUID.");

            // Atributos del Comprobante
            string serie = (string)comprobante.Attribute("Serie");
            string folio = (string)comprobante.Attribute("Folio");
            string fechaStr = (string)comprobante.Attribute("Fecha")
                           ?? (string)comprobante.Attribute("Fecha") /* fallback innecesario, pero deja claro */;

            // Números con InvariantCulture
            decimal subtotal = ParseDec((string)comprobante.Attribute("SubTotal"));
            decimal total = ParseDec((string)comprobante.Attribute("Total"));

            // IVA: toma TotalImpuestosTrasladados o suma de Traslado/Importe
            decimal? iva = null;
            var impuestos = doc.Descendants().FirstOrDefault(e => e.Name.LocalName == "Impuestos");
            if (impuestos != null)
            {
                var totTras = (string)impuestos.Attribute("TotalImpuestosTrasladados");
                if (!string.IsNullOrWhiteSpace(totTras))
                {
                    iva = ParseDec(totTras);
                }
                else
                {
                    var sum = impuestos.Descendants().Where(e => e.Name.LocalName == "Traslado")
                                  .Select(x => ParseDec((string)x.Attribute("Importe")))
                                  .Sum();
                    // si no hay traslados, sum = 0
                    iva = sum;
                }
            }


            var fecha = ParseFechaOrDefault(fechaStr, useUtcNow: true);

            var entity = new FacturaResumen
            {
                UUID = Guid.Parse(uuidStr),
                Serie = serie,
                Folio = folio,
                FechaEmision = fecha,
                Subtotal = subtotal,
                IVA = iva,
                Total = total,
                UrlXml = urlXml,
                UrlPdf = urlPdf,
                Origen = "Villanett",
                FechaRegistro = DateTime.UtcNow,
                RechargeId = rechargeId
            };
            return entity;

            static decimal ParseDec(string? s)
                => decimal.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out var d) ? d : 0m;
        }
        private DateTime ParseFechaOrDefault(string? fechaStr, bool useUtcNow = true)
        {
            // 1) Con offset/UTC si viene, o asume UTC si no viene zona
            if (!string.IsNullOrWhiteSpace(fechaStr))
            {
                if (DateTimeOffset.TryParse(
                        fechaStr,
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                        out var dto))
                {
                    return TrimToSeconds(dto.UtcDateTime);
                }

                // 2) Intento exacto ISO sin milisegundos (ej: 2025-08-13T12:04:14)
                if (DateTime.TryParseExact(
                        fechaStr,
                        "yyyy-MM-dd'T'HH:mm:ss",
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                        out var exact))
                {
                    return TrimToSeconds(DateTime.SpecifyKind(exact, DateTimeKind.Utc));
                }

                // 3) Último intento “libre” asumiendo UTC
                if (DateTime.TryParse(
                        fechaStr,
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                        out var parsed))
                {
                    return TrimToSeconds(parsed.ToUniversalTime());
                }

                // 4) Log y fallback
                _logger.Warn($"Fecha CFDI inválida ('{fechaStr}'). Se usará {(useUtcNow ? "DateTime.UtcNow" : "DateTime.Now")}.");
            }

            return TrimToSeconds(useUtcNow ? DateTime.UtcNow : DateTime.Now);

            static DateTime TrimToSeconds(DateTime dt)
                => dt.AddTicks(-(dt.Ticks % TimeSpan.TicksPerSecond)); // DATETIME2(0) sin milisegundos
        }

        private void UpsertFacturaResumen(FacturaResumen factura)
        {
            using (var ctx = new Entities())
            {
                // Busca por clave única (UUID)
                var existing = ctx.FacturaResumen.FirstOrDefault(x => x.UUID == factura.UUID);
                if (existing == null)
                {
                    ctx.FacturaResumen.Add(factura);
                }
                else
                {
                    // Actualiza campos volátiles si ya existía
                    existing.Serie = factura.Serie;
                    existing.Folio = factura.Folio;
                    existing.FechaEmision = factura.FechaEmision;
                    existing.Subtotal = factura.Subtotal;
                    existing.IVA = factura.IVA;
                    existing.Total = factura.Total;
                    existing.UrlXml = factura.UrlXml;
                    existing.UrlPdf = factura.UrlPdf;
                    existing.Origen = factura.Origen;
                    existing.RechargeId = factura.RechargeId;
                    existing.FechaRegistro = factura.FechaRegistro;
                }
                ctx.SaveChanges();
            }
        }
        public ArticuloVillanet ObtenerArticulos(string descripcion)
        {
            var client = new TiendaVirtualSoapClient(
                TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                "https://nuxiba.villanett.com/TiendaVirtual.asmx"
            );

            var response = client.ObtenerArticulosMultipleAsync(
                "", "", descripcion, "", "", "", "", 0, 0, "0", 1000, 0, "tiendavirtual", "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
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


        private static bool LooksLikeVillanettError(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return true;

            // Muchas veces viene como HTML con <br /> y "código CFDIxxxx"
            var lowered = raw.ToLowerInvariant();

            if (lowered.Contains("no se pudo completar")) return true;
            if (lowered.Contains("código cfdi") || lowered.Contains("codigo cfdi")) return true;
            if (lowered.Contains("cfdi4") || lowered.Contains("cfdi")) // fallback
            {
                // si no hay ninguna URL, lo tratamos como error
                if (!ContainsAnyUrl(raw)) return true;
            }

            // Si no hay URLs y trae pipes, casi seguro es error con cadena original
            if (!ContainsAnyUrl(raw) && raw.Contains("|")) return true;

            return false;
        }

        private static bool ContainsAnyUrl(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return false;
            // detecta http/https en cualquier parte
            return Regex.IsMatch(raw, @"https?://[^\s|<>]+", RegexOptions.IgnoreCase);
        }

        private static string CleanVillanettMessage(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                return "Error desconocido al generar factura.";

            // Decodifica entidades HTML: c&#243;digo -> código
            var decoded = WebUtility.HtmlDecode(raw);

            // Quita tags HTML
            decoded = Regex.Replace(decoded, "<.*?>", string.Empty);

            // Tomar solo el mensaje antes del primer pipe
            var pipeIndex = decoded.IndexOf('|');
            if (pipeIndex > 0)
            {
                decoded = decoded.Substring(0, pipeIndex);
            }

            // Normaliza espacios
            decoded = decoded.Replace("\r", " ").Replace("\n", " ");
            decoded = Regex.Replace(decoded, @"\s{2,}", " ").Trim();

            return decoded;
        }


        private static string ExtractCfdiCode(string cleanMessage)
        {
            if (string.IsNullOrWhiteSpace(cleanMessage)) return null;

            // Ej: "código CFDI40145:" o "codigo CFDI40145:"
            var m = Regex.Match(cleanMessage, @"CFDI\d{5}", RegexOptions.IgnoreCase);
            return m.Success ? m.Value.ToUpperInvariant() : null;
        }

        private void MarkRechargeFacturaError(int idRecarga, string rawVillanettResult)
        {
            var clean = CleanVillanettMessage(rawVillanettResult);
            var code = ExtractCfdiCode(clean);
            _logger.Error(clean);
            using (var ctx = new Entities())
            {
                var r = ctx.CreditRecharge.FirstOrDefault(x => x.Id == idRecarga);
                if (r == null) return;

                r.EstatusError = clean;                 
                r.FechaFacturacion = DateTime.Now;     


                ctx.SaveChanges();
            }
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
