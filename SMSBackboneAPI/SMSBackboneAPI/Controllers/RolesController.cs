using Business;
using Contract.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using log4net;
using System;
using System.Linq;
using System.Security.Claims;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private static readonly ILog _log =
            LogManager.GetLogger(typeof(RolesController));

        private readonly RoleManager _roleManager = new RoleManager();

        // GET api/Roles/permissions
        [HttpGet("permissions")]
        public IActionResult GetPermissions()
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                var permissions = _roleManager.GetPermissions();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al consultar permisos", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        [HttpGet]
        public IActionResult GetRolesByClient(
         [FromQuery] int page = 1,
         [FromQuery] string search = null)
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                if (!TryGetIdCliente(out var idCliente))
                    return Forbid();

                var roles = _roleManager.GetRolesByClient(idCliente, page, search);
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al consultar roles", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        // GET api/Roles/15
        [HttpGet("{idRole:int}")]
        public IActionResult GetRoleByClient(int idRole)
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                if (!TryGetIdCliente(out var idCliente))
                    return Forbid();

                var role = _roleManager.GetRoleByClient(idRole, idCliente);

                if (role == null)
                    return NotFound(new { message = "No se encontró el rol." });

                return Ok(role);
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al consultar el rol {idRole}", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        // POST api/Roles
        [HttpPost]
        public IActionResult CreateRole([FromBody] SaveRoleRequest request)
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                if (!TryGetIdCliente(out var idCliente))
                    return Forbid();

                var role = _roleManager.CreateRole(idCliente, request);

                return CreatedAtAction(
                    nameof(GetRoleByClient),
                    new { idRole = role.Id },
                    role);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al crear rol", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        // PUT api/Roles/15
        [HttpPut("{idRole:int}")]
        public IActionResult UpdateRole(
            int idRole,
            [FromBody] SaveRoleRequest request)
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                if (!TryGetIdCliente(out var idCliente))
                    return Forbid();

                var role = _roleManager.UpdateRole(idRole, idCliente, request);

                if (role == null)
                    return NotFound(new { message = "No se encontró el rol." });

                return Ok(role);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al actualizar rol {idRole}", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        // DELETE api/Roles/15
        [HttpDelete("{idRole:int}")]
        public IActionResult DeleteRole(int idRole)
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                if (!TryGetIdCliente(out var idCliente))
                    return Forbid();

                var deleted = _roleManager.DeleteRole(idRole, idCliente);

                if (!deleted)
                    return NotFound(new { message = "No se encontró el rol." });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al eliminar rol {idRole}", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        [HttpPut("assignment")]
        public IActionResult AssignRole([FromBody] AssignRoleRequest request)
        {
            var rid = HttpContext.TraceIdentifier;

            try
            {
                if (!TryGetIdCliente(out var idCliente))
                    return Forbid();

                if (request == null || request.UserId <= 0)
                    return BadRequest(new { message = "Selecciona un usuario válido." });

                // Compatibilidad con consumidores anteriores que envían un solo RoleId.
                var roleIds = request.RoleIds != null && request.RoleIds.Count > 0
                    ? request.RoleIds.ToArray()
                    : request.RoleId > 0
                        ? new[] { request.RoleId }
                        : Array.Empty<int>();

                var assigned = _roleManager.AssignRoleToUser(
                    idCliente,
                    request.UserId,
                    roleIds);

                if (!assigned)
                    return NotFound(new { message = "No se encontró el usuario para este cliente." });

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _log.Error($"[{rid}] Error al asignar rol al usuario {request?.UserId}", ex);
                return StatusCode(500, new { message = "Error en el servidor." });
            }
        }

        private bool TryGetIdCliente(out int idCliente)
        {
            // El JWT debe incluir un claim llamado "idCliente".
            var claim = User.FindFirst("idCliente")
                     ?? User.FindFirst("IdCliente");

            return int.TryParse(claim?.Value, out idCliente)
                && idCliente > 0;
        }
    }
}
