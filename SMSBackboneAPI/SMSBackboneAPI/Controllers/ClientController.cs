using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using SMSBackboneAPI.Service;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;
using log4net;
using System.Threading.Tasks;
using System.Security.Policy;
using Azure.Core;

// 👇 agregados para logs/tiempos
using System;
using System.Diagnostics;
using System.Linq;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClientController : ControllerBase
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(ClientController));
        string JwtIssuer = "Issuer";
        string JwtAudience = "Audience";
        private IConfiguration configuration;

        public ClientController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }

        [AllowAnonymous]
        [HttpGet("GetClients")]
        public IActionResult GetClients()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                log.Info($"[{rid}] GetClients start");

                var userManager = new Business.ClientManager();
                var user = userManager.GetClientes();

                sw.Stop();
                if (user != null)
                {
                    log.Info($"[{rid}] GetClients ok count={user.Count()} ms={sw.ElapsedMilliseconds}");
                    return Ok(user);
                }
                else
                {
                    log.Warn($"[{rid}] GetClients null result ms={sw.ElapsedMilliseconds}");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GetClients error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, errorResponse);
            }
        }

        [AllowAnonymous]
        [HttpPost("GetClientsAdmin")]
        public IActionResult GetClientsAdmin(ClientFilterRequest client)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                log.Info($"[{rid}] GetClientsAdmin start");

                var userManager = new Business.ClientManager();
                var user = userManager.GetClientsAdmin(client);

                sw.Stop();
                if (user != null)
                {
                    log.Info($"[{rid}] GetClientsAdmin ok count={user} ms={sw.ElapsedMilliseconds}");
                    return Ok(user);
                }
                else
                {
                    log.Warn($"[{rid}] GetClientsAdmin null result ms={sw.ElapsedMilliseconds}");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GetClientsAdmin error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, errorResponse);
            }
        }

        [AllowAnonymous]
        [HttpPost("AddClient")]
        public IActionResult AddClient([FromBody] ClientRequestDto dto)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                log.Info($"[{rid}] AddClient start hasId={(dto?.Id.HasValue ?? false)}");

                var clientManager = new ClientManager();

                bool result;
                string passwordtmp = string.Empty; // lo dejas como lo tenías

                if (dto.Id.HasValue)
                {
                    result = clientManager.UpdateClient(dto);
                }
                else
                {
                    result = clientManager.CreateClient(dto);
                }

                sw.Stop();
                if (result)
                {
                    log.Info($"[{rid}] AddClient ok ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = true });
                }
                else
                {
                    log.Warn($"[{rid}] AddClient not saved ms={sw.ElapsedMilliseconds}");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] AddClient error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, errorResponse);
            }
        }

        [AllowAnonymous]
        [HttpGet("DeactivateClient")]
        public IActionResult DeactivateClient(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            var response = new GeneralErrorResponseDto();
            try
            {
                log.Info($"[{rid}] DeactivateClient start id={id}");

                var manager = new ClientManager();
                bool result = manager.DeactivateClient(id);

                sw.Stop();
                if (result)
                {
                    log.Info($"[{rid}] DeactivateClient ok id={id} ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = true });
                }
                else
                {
                    log.Warn($"[{rid}] DeactivateClient badrequest id={id} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(response);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] DeactivateClient error id={id} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, response);
            }
        }

        [AllowAnonymous]
        [HttpGet("DeleteClient")]
        public IActionResult DeleteClient(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                log.Info($"[{rid}] DeleteClient start id={id}");

                var manager = new ClientManager();
                bool result = manager.DeleteClient(id);

                sw.Stop();
                if (result)
                {
                    log.Info($"[{rid}] DeleteClient ok id={id} ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = true });
                }
                else
                {
                    log.Warn($"[{rid}] DeleteClient badrequest id={id} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { success = false });
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] DeleteClient error id={id} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("RechargeBalance")]
        public IActionResult RechargeBalance([FromBody] RechargeRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                log.Info($"[{rid}] RechargeBalance start clientId={request?.ClientId} roomId={request?.Rooms}");

                var manager = new ClientManager();
                var result = manager.RechargeUserDirect(request);

                sw.Stop();
                if (result)
                {
                    log.Info($"[{rid}] RechargeBalance ok ms={sw.ElapsedMilliseconds}");
                    return Ok(new { message = "Recarga procesada correctamente." });
                }

                log.Warn($"[{rid}] RechargeBalance badrequest ms={sw.ElapsedMilliseconds}");
                return BadRequest(new { message = "No se pudo procesar la recarga." });
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] RechargeBalance error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("GetRoomsAdmin")]
        public IActionResult GetRoomsAdmin()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                log.Info($"[{rid}] GetRoomsAdmin start");

                var manager = new ClientManager();
                var result = manager.GetRoomsAdmin();

                sw.Stop();
                if (result.Count() > 0)
                {
                    log.Info($"[{rid}] GetRoomsAdmin ok count={result.Count()} ms={sw.ElapsedMilliseconds}");
                    return Ok(result);
                }

                log.Warn($"[{rid}] GetRoomsAdmin empty ms={sw.ElapsedMilliseconds}");
                return BadRequest(new { message = "No se pudo procesar la recarga." });
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GetRoomsAdmin error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }

        [HttpPost("GetReportsAdmin")]
        public IActionResult GetReportsAdmin(ReportsAdminRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                log.Info($"[{rid}] GetReportsAdmin start");

                var manager = new ClientManager();
                var result = manager.GetReportsAdmin(request);

                sw.Stop();
                log.Info($"[{rid}] GetReportsAdmin ok ms={sw.ElapsedMilliseconds}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GetReportsAdmin error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }

        [HttpGet("GetClientRate")]
        public IActionResult GetClientRate(int clientId)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                log.Info($"[{rid}] GetClientRate start clientId={clientId}");

                var rate = new ClientManager().ObtenerClienteporID(clientId);

                sw.Stop();
                if (rate == null)
                {
                    log.Warn($"[{rid}] GetClientRate not found clientId={clientId} ms={sw.ElapsedMilliseconds}");
                    return BadRequest();
                }
                else
                {
                    log.Info($"[{rid}] GetClientRate ok clientId={clientId} ms={sw.ElapsedMilliseconds}");
                    return Ok(rate);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GetClientRate error clientId={clientId} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }

        [HttpGet("GetConfigurationCost")]
        public IActionResult GetConfigurationCost()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                log.Info($"[{rid}] GetConfigurationCost start");

                var rate = new ClientManager().GetSmsRateOptions();

                sw.Stop();
                if (rate == null)
                {
                    log.Warn($"[{rid}] GetConfigurationCost not found ms={sw.ElapsedMilliseconds}");
                    return BadRequest();
                }
                else
                {
                    log.Info($"[{rid}] GetConfigurationCost ok ms={sw.ElapsedMilliseconds}");
                    return Ok(rate);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GetConfigurationCost error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }
    }
}
