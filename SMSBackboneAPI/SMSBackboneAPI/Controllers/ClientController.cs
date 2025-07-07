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

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.ClientManager();
            var user = userManager.GetClientes();
            if (user != null)
            {
                var response = Ok(user);
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }

        [AllowAnonymous]
        [HttpGet("GetClientsAdmin")]
        public IActionResult GetClientsAdmin()
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.ClientManager();
            var user = userManager.GetClientsAdmin();
            if (user != null)
            {
                var response = Ok(user);
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }
        [AllowAnonymous]
        [HttpPost("AddClient")]
        public IActionResult AddClient([FromBody] ClientRequestDto dto)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();

            try
            {
                var clientManager = new ClientManager();

                bool result;

                if (dto.Id.HasValue)
                {
                    result = clientManager.UpdateClient(dto);
                }
                else
                {
                    result = clientManager.CreateClient(dto);
                }

                if (result)
                    return Ok(new { success = true });
                else
                    return BadRequest(errorResponse);
            }
            catch (Exception ex)
            {
                log.Error("Error en AddClient", ex);
                return StatusCode(500, errorResponse);
            }
        }
        [AllowAnonymous]
        [HttpGet("DeactivateClient")]
        public IActionResult DeactivateClient(int id)
        {
            var response = new GeneralErrorResponseDto();
            try
            {
                var manager = new ClientManager();
                bool result = manager.DeactivateClient(id);
                return result ? Ok(new { success = true }) : BadRequest(response);
            }
            catch (Exception ex)
            {
                log.Error("Error en DeactivateClient", ex);
                return StatusCode(500, response);
            }
        }
        [AllowAnonymous]
        [HttpGet("DeleteClient")]
        public IActionResult DeleteClient(int id)
        {
            try
            {
                var manager = new ClientManager();
                bool result = manager.DeleteClient(id);

                if (result)
                    return Ok(new { success = true });
                else
                    return BadRequest(new { success = false });
            }
            catch (Exception ex)
            {
                log.Error("Error al eliminar cliente", ex);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpPost("RechargeBalance")]
        public IActionResult RechargeBalance([FromBody] RechargeRequest request)
        {
            try
            {
                var manager = new ClientManager();
                var result = manager.RechargeUserDirect(request);

                if (result)
                    return Ok(new { message = "Recarga procesada correctamente." });

                return BadRequest(new { message = "No se pudo procesar la recarga." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("GetRoomsAdmin")]
        public IActionResult GetRoomsAdmin()
        {
            try
            {
                var manager = new ClientManager();
                var result = manager.GetRoomsAdmin();

                if (result.Count() > 0)
                    return Ok(result);

                return BadRequest(new { message = "No se pudo procesar la recarga." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }
        [HttpPost("GetReportsAdmin")]
        public IActionResult GetReportsAdmin(ReportsAdminRequest request)
        {
            try
            {
                var manager = new ClientManager();
                var result = manager.GetReportsAdmin(request);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error en el servidor", detail = ex.Message });
            }
        }

    }
}