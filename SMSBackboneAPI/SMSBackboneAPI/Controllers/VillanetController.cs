using Microsoft.AspNetCore.Mvc;
using VillanettWS;
using Business;
using Contract.Request;
using System.Xml.Linq;

// logs/tiempos/linq
using log4net;
using System;
using System.Diagnostics;
using System.Linq;
using System.Collections.Generic;

namespace SMSBackboneAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VillanettController : ControllerBase
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(VillanettController));

        [HttpGet("generarfactura")]
        public async Task<IActionResult> TestFactura([FromQuery] FacturaRequest factura)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] generarfactura start recarga={factura?.IdRecarga} usuario={factura?.IdUsuario}");
                var resultado = await new Villanet().GenerarFacturaAsync(factura.IdRecarga, factura.IdUsuario);
                sw.Stop();
                _log.Info($"[{rid}] generarfactura ok success={resultado.Success} ms={sw.ElapsedMilliseconds}");
                return Ok(new { resultado });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] generarfactura error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, "Error generando factura: " + ex.Message);
            }
        }

        [HttpGet("articulos-villanett")]
        public async Task<IActionResult> ObtenerArticulosVillanett()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] articulos-villanett start");
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var response = await client.ObtenerArticulosMultipleAsync(
                    "", "", "", "", "", "", "", 0, 0, "", 50, 0,
                    "tiendavirtual",
                    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                );

                var result = response.Body.ObtenerArticulosMultipleResult;
                sw.Stop();
                _log.Info($"[{rid}] articulos-villanett ok rawLen={(result?.Length ?? 0)} ms={sw.ElapsedMilliseconds}");

                return Ok(new { success = true, raw = result });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] articulos-villanett error ms={sw.ElapsedMilliseconds}", ex);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("articulosvillanettcantidad")]
        public async Task<IActionResult> ObtenerArticulosVillanettCantidad()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] articulosvillanettcantidad start");
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var response = await client.ObtenerArticulosCantidadAsync(
                    "", "", "", "", "", "", "", // filtros vacíos
                    50, // cantidad a traer
                    0,  // offset
                    "tiendavirtual",
                    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                );

                var result = response.Body.ObtenerArticulosCantidadResult;

                if (string.IsNullOrWhiteSpace(result))
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] articulosvillanettcantidad empty ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = false, message = "No se recibieron artículos." });
                }

                var doc = XDocument.Parse(result);
                var articulos = doc.Descendants("Articulo")
                    .Select(x => new
                    {
                        Codigo = x.Element("CodigoArticulo")?.Value,
                        Descripcion = x.Element("Descripcion")?.Value,
                        Precio = x.Element("Precio")?.Value,
                        Unidad = x.Element("Unidad")?.Value
                    })
                    .ToList();

                sw.Stop();
                _log.Info($"[{rid}] articulosvillanettcantidad ok count={articulos.Count} ms={sw.ElapsedMilliseconds}");
                return Ok(new { success = true, count = articulos.Count, articulos });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] articulosvillanettcantidad error ms={sw.ElapsedMilliseconds}", ex);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("articulosvillanettcliente")]
        public async Task<IActionResult> ObtenerArticulosVillanettPorCliente()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                const int testClientId = 1234;
                _log.Info($"[{rid}] articulosvillanettcliente start pcliente={testClientId}");

                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var response = await client.ObtenerArticulosMultipleClienteAsync(
                    testClientId,
                    "", "", "", "", "", "", "",
                    0, 0, "",
                    100, 0,
                    "tiendavirtual",
                    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                );

                var result = response.Body.ObtenerArticulosMultipleClienteResult;

                if (string.IsNullOrWhiteSpace(result))
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] articulosvillanettcliente empty pcliente={testClientId} ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = false, message = "No se recibieron artículos del cliente." });
                }

                if (!result.TrimStart().StartsWith("<"))
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] articulosvillanettcliente non-xml pcliente={testClientId} ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = false, message = "Resultado inesperado", raw = result });
                }

                var doc = XDocument.Parse(result);
                var articulos = doc.Descendants("Articulo")
                    .Select(x => new
                    {
                        Codigo = x.Element("CodigoArticulo")?.Value,
                        Descripcion = x.Element("Descripcion")?.Value,
                        Precio = x.Element("Precio")?.Value,
                        Unidad = x.Element("Unidad")?.Value
                    })
                    .ToList();

                sw.Stop();
                _log.Info($"[{rid}] articulosvillanettcliente ok pcliente={testClientId} count={articulos.Count} ms={sw.ElapsedMilliseconds}");
                return Ok(new { success = true, count = articulos.Count, articulos });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] articulosvillanettcliente error ms={sw.ElapsedMilliseconds}", ex);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("validarcliente")]
        public async Task<IActionResult> ValidarCliente()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] validarcliente start");
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var response = await client.ValidarClienteAsync(
                    "tiendavirtual", // clienteusuario
                    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv", // clientepassword
                    "tiendavirtual", // usuario
                    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"  // password
                );

                var result = response.Body.ValidarClienteResult;
                sw.Stop();
                _log.Info($"[{rid}] validarcliente ok rawLen={(result?.Length ?? 0)} ms={sw.ElapsedMilliseconds}");

                return Content(result, "text/plain");
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] validarcliente error ms={sw.ElapsedMilliseconds}", ex);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("probar-clientes")]
        public async Task<IActionResult> ProbarClientesRango([FromQuery] int desde = 1, [FromQuery] int hasta = 100)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] probar-clientes start desde={desde} hasta={hasta}");
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var encontrados = new List<int>();

                for (int i = desde; i <= hasta; i++)
                {
                    try
                    {
                        var response = await client.ObtenerArticulosMultipleClienteAsync(
                            i, "", "", "", "", "", "", "",
                            0, 0, "",
                            1, 0,
                            "tiendavirtual",
                            "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                        );

                        var result = response.Body.ObtenerArticulosMultipleClienteResult;

                        if (!string.IsNullOrWhiteSpace(result) && result.TrimStart().StartsWith("<"))
                        {
                            encontrados.Add(i);
                        }
                    }
                    catch
                    {
                        // ignorar errores para seguir probando
                    }
                }

                sw.Stop();
                _log.Info($"[{rid}] probar-clientes ok found={encontrados.Count} ms={sw.ElapsedMilliseconds}");

                return Ok(new
                {
                    success = true,
                    encontrados,
                    message = encontrados.Count > 0
                        ? $"Encontrado(s) cliente(s) válido(s): {string.Join(", ", encontrados)}"
                        : "No se encontró ningún cliente válido en el rango"
                });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] probar-clientes error ms={sw.ElapsedMilliseconds}", ex);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("probar-clientes-detalle")]
        public async Task<IActionResult> ProbarClientesConResultado([FromQuery] int desde = 1, [FromQuery] int hasta = 20)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] probar-clientes-detalle start desde={desde} hasta={hasta}");
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var resultados = new List<object>();

                for (int i = desde; i <= hasta; i++)
                {
                    try
                    {
                        var response = await client.ObtenerArticulosMultipleClienteAsync(
                            i, "", "", "", "", "", "", "",
                            0, 0, "",
                            1, 0,
                            "tiendavirtual",
                            "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
                        );

                        var result = response.Body.ObtenerArticulosMultipleClienteResult;

                        resultados.Add(new
                        {
                            pcliente = i,
                            esXML = result?.TrimStart().StartsWith("<") ?? false,
                            contenido = result
                        });
                    }
                    catch (Exception ex)
                    {
                        resultados.Add(new
                        {
                            pcliente = i,
                            esXML = false,
                            error = ex.Message
                        });
                    }
                }

                sw.Stop();
                _log.Info($"[{rid}] probar-clientes-detalle ok items={resultados.Count} ms={sw.ElapsedMilliseconds}");

                return Ok(new { success = true, resultados });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] probar-clientes-detalle error ms={sw.ElapsedMilliseconds}", ex);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }
}
