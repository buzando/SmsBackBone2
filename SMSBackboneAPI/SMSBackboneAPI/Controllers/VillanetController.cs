using Microsoft.AspNetCore.Mvc;
using VillanettWS;
using Business;
using Contract.Request;
using System.Xml.Linq;

namespace SMSBackboneAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VillanettController : ControllerBase
    {
        private readonly ILogger<VillanettController> _logger;

        public VillanettController(ILogger<VillanettController> logger)
        {
            _logger = logger;
        }

        [HttpGet("generarfactura")]
        public async Task<IActionResult> TestFactura([FromQuery] FacturaRequest factura)
        {
            try
            {
                var resultado = await new Villanet().GenerarFacturaAsync(factura.IdRecarga, factura.IdUsuario);
                return Ok(new { resultado });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando factura");
                return StatusCode(500, "Error generando factura: " + ex.Message);
            }
        }

        [HttpGet("articulos-villanett")]
        public async Task<IActionResult> ObtenerArticulosVillanett()
        {
            try
            {
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

                return Ok(new
                {
                    success = true,
                    raw = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet("articulosvillanettcantidad")]
        public async Task<IActionResult> ObtenerArticulosVillanettCantidad()
        {
            try
            {
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var response = await client.ObtenerArticulosCantidadAsync(
                    "", "", "", "", "", "", "", // filtros vacíos
                    50, // cantidad a traer
                    0,  // offset
                    "tiendavirtual", // usuario
                    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv" // contraseña
                );

                var result = response.Body.ObtenerArticulosCantidadResult;

                if (string.IsNullOrWhiteSpace(result))
                    return Ok(new { success = false, message = "No se recibieron artículos." });

                // Parseo XML a objetos legibles
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

                return Ok(new
                {
                    success = true,
                    count = articulos.Count,
                    articulos
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
        [HttpGet("articulosvillanettcliente")]
        public async Task<IActionResult> ObtenerArticulosVillanettPorCliente()
        {
            try
            {
                var client = new TiendaVirtualSoapClient(
                    TiendaVirtualSoapClient.EndpointConfiguration.TiendaVirtualSoap,
                    "https://nuxiba.villanett.com/TiendaVirtual.asmx"
                );

                var response = await client.ObtenerArticulosMultipleClienteAsync(
    1234, // <- ID del cliente
    "", "", "", "", "", "", "", // filtros vacíos
    0, 0, "",                   // conFotos, conExistencia, ordenamiento
    100, 0,                     // cantidad, offset
    "tiendavirtual",
    "Bkeg3fnwrO2vVcqEhMb43E7OvvKjPv41aDSvvrcboekM18vAf14KJn4nqufvvE3xvrTvLrHwxv4vvvCMCv"
);


                var result = response.Body.ObtenerArticulosMultipleClienteResult;

                if (string.IsNullOrWhiteSpace(result))
                    return Ok(new { success = false, message = "No se recibieron artículos del cliente." });

                // Ver si es XML o solo texto plano raro
                if (!result.TrimStart().StartsWith("<"))
                {
                    return Ok(new { success = false, message = "Resultado inesperado", raw = result });
                }

                // Parsear XML
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

                return Ok(new
                {
                    success = true,
                    count = articulos.Count,
                    articulos
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
        [HttpGet("validarcliente")]
        public async Task<IActionResult> ValidarCliente()
        {
            try
            {
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

                return Content(result, "text/plain");
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }


        [HttpGet("probar-clientes")]
        public async Task<IActionResult> ProbarClientesRango([FromQuery] int desde = 1, [FromQuery] int hasta = 100)
        {
            try
            {
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
                            1, 0, // solo uno por prueba
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
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("probar-clientes-detalle")]
        public async Task<IActionResult> ProbarClientesConResultado([FromQuery] int desde = 1, [FromQuery] int hasta = 20)
        {
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

            return Ok(new
            {
                success = true,
                resultados
            });
        }


    }
}
