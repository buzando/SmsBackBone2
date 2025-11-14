using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Modal.Model.Model;
using Newtonsoft.Json;
using SMSBackboneAPI.Service;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

// logs/tiempos
using log4net;
using System;
using System.Diagnostics;
using System.Linq;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomController : ControllerBase
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(RoomController));

        string JwtIssuer = "Issuer";
        string JwtAudience = "Audience";
        private readonly IConfiguration configuration;

        public RoomController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }

        [HttpPost("NewRoom")]
        public async Task<IActionResult> NewRoom(roomsDTO rooms)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] NewRoom start");

                var RoomManager = new Business.roomsManager();
                var responseDto = RoomManager.addroom(rooms);

                sw.Stop();
                if (!responseDto)
                {
                    _log.Warn($"[{rid}] NewRoom badrequest ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    _log.Info($"[{rid}] NewRoom ok ms={sw.ElapsedMilliseconds}");
                    var response = Ok();
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] NewRoom error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("UpdateRoom")]
        public async Task<IActionResult> UpdateRoom(roomsDTO rooms)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] UpdateRoom start");

                var RoomManager = new Business.roomsManager();
                var responseDto = RoomManager.UpdateRoom(rooms);

                sw.Stop();
                if (!responseDto)
                {
                    _log.Warn($"[{rid}] UpdateRoom badrequest ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    _log.Info($"[{rid}] UpdateRoom ok ms={sw.ElapsedMilliseconds}");
                    var response = Ok();
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] UpdateRoom error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpGet("DeleteRoom")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] DeleteRoom start id={id}");

                var RoomManager = new Business.roomsManager();
                var responseDto = RoomManager.DeleteRoom(id);

                sw.Stop();
                if (!responseDto.Ok)
                {
                    _log.Warn($"[{rid}] DeleteRoom badrequest id={id} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    _log.Info($"[{rid}] DeleteRoom ok id={id} ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] DeleteRoom error id={id} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpGet("GetRoomsByClient")]
        public async Task<IActionResult> GetRoomsByClient(int Client)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] GetRoomsByClient start clientId={Client}");

                var RoomManager = new Business.roomsManager();
                var responseDto = RoomManager.GetRoomsByClient(Client);

                sw.Stop();
                if (responseDto == null || !responseDto.Any())
                {
                    _log.Warn($"[{rid}] GetRoomsByClient empty clientId={Client} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    _log.Info($"[{rid}] GetRoomsByClient ok count={responseDto.Count()} clientId={Client} ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] GetRoomsByClient error clientId={Client} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("TransferRoom")]
        public async Task<IActionResult> TransferRoom(acountmanagment rooms)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] TransferRoom start");

                var RoomManager = new Business.roomsManager();
                var responseDto = RoomManager.TransferRoom(rooms);

                sw.Stop();
                if (responseDto == null || !responseDto.Any())
                {
                    _log.Warn($"[{rid}] TransferRoom badrequest ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Transfering Room" });
                }
                else
                {
                    _log.Info($"[{rid}] TransferRoom ok count={responseDto.Count()} ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] TransferRoom error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }
    }
}
