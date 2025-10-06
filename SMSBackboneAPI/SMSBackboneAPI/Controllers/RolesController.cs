using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Modal.Model.Model;
using Newtonsoft.Json;
using SMSBackboneAPI.Service;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

// 👇 logs
using log4net;
using System;
using System.Linq;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(RolesController));

        [AllowAnonymous]
        [HttpGet("GenerateconfirmationEmail")]
        public async Task<IActionResult> GetRoles()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                _log.Info($"[{rid}] GetRoles start");

                var Roles = new RoleManager().GetRoles();

                if (Roles != null && Roles.Any())
                {
                    _log.Info($"[{rid}] GetRoles ok count={Roles.Count()}");
                    return Ok(Roles);
                }
                else
                {
                    _log.Warn($"[{rid}] GetRoles empty");
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] GetRoles error", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error en el servidor" });
            }
        }
    }
}
