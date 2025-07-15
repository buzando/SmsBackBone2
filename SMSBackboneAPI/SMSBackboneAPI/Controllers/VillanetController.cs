using Microsoft.AspNetCore.Mvc;
using VillanettWS;
using Business;
using Contract.Request;
using log4net;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VillanetController : Controller
    {
        private static readonly ILog _logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        public IActionResult Index()
        {
            return View();
        }
        [ApiController]
        [Route("api/[controller]")]
        public class VillanettTestController : ControllerBase
        {
            private readonly ILogger<VillanettTestController> _logger;

            public VillanettTestController(ILogger<VillanettTestController> logger)
            {
                _logger = logger;
            }

            [HttpGet("generarfactura")]
            public async Task<IActionResult> TestFactura(FacturaRequest factura)
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
                        "", // filtroCategoria
                        "", // filtroEtiqueta
                        "", // filtroDescripcion
                        "", // filtroDimension
                        "", // filtroDivision
                        "", // filtroGrupo
                        "", // filtroSubGrupo
                        0,  // filtroConFotos (0 = no filtra)
                        0,  // filtroConExistencia (0 = no filtra)
                        "", // ordenamiento
                        50, // cantidad (máximo de artículos a traer)
                        0,  // inicial (offset)
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
        }

    }
}
