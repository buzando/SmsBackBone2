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

// 👇 agregados para logs/tiempos
using System;
using System.Diagnostics;
using System.Linq;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NumbersController : ControllerBase
    {
        // FIX: antes estaba typeof(ClientController)
        private static readonly ILog _log = LogManager.GetLogger(typeof(NumbersController));

        string JwtIssuer = "Issuer";
        string JwtAudience = "Audience";
        private IConfiguration configuration;

        public NumbersController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }

        [HttpPost("ManagerNumbers")]
        public async Task<IActionResult> ManagerNumbers(ManageNumerosDidsRequest Numbers)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                _log.Info($"[{rid}] ManagerNumbers start");

                var UserManager = new Business.MyNumbersManager();
                var responseDto = UserManager.ProcesarNumerosDids(Numbers);

                sw.Stop();
                if (responseDto != null)
                {
                    _log.Info($"[{rid}] ManagerNumbers ok ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
                else
                {
                    _log.Warn($"[{rid}] ManagerNumbers null response ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = "responseDto" });
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] ManagerNumbers error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("ManagerNumbersIndividual")]
        public async Task<IActionResult> ManagerNumbersIndividual(RequestManageNumbersIndividual Numbers)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                _log.Info($"[{rid}] ManagerNumbersIndividual start");

                var UserManager = new Business.MyNumbersManager();
                var responseDto = UserManager.ProcesarNumerosDidsIndividual(Numbers);

                sw.Stop();
                if (responseDto != null)
                {
                    _log.Info($"[{rid}] ManagerNumbersIndividual ok ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
                else
                {
                    _log.Warn($"[{rid}] ManagerNumbersIndividual null response ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = "responseDto" });
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] ManagerNumbersIndividual error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("RequestShortNumber")]
        public async Task<IActionResult> RequestNumber(NumberRequestDTO request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] RequestShortNumber start clientId={request?.CreditCardId} roomId={request?.CreditCardId}");

                var manager = new MyNumbersManager();
                var responseDto = manager.ProcesarShortNumberRequest(request);

                // ya logueabas el resultado; lo mantenemos
                _log.Info($"[{rid}] RequestShortNumber response='{responseDto}'");

                sw.Stop();
                if (responseDto.StartsWith("http"))
                {
                    _log.Info($"[{rid}] RequestShortNumber ok (url) ms={sw.ElapsedMilliseconds}");
                    return Ok(responseDto);
                }
                if (!string.IsNullOrEmpty(responseDto))
                {
                    _log.Warn($"[{rid}] RequestShortNumber business-warning '{responseDto}' ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = responseDto });
                }
                else
                {
                    _log.Info($"[{rid}] RequestShortNumber ok (empty) ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] RequestShortNumber error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error interno del servidor." });
            }
        }

        [HttpGet("UpdateRecharge")]
        public async Task<IActionResult> UpdateRecharge(string ID)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                _log.Info($"[{rid}] UpdateRecharge start id={ID}");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.VerifyRechargeStatus(ID);

                sw.Stop();
                if (!responseDto)
                {
                    _log.Warn($"[{rid}] UpdateRecharge badrequest id={ID} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    _log.Info($"[{rid}] UpdateRecharge ok id={ID} ms={sw.ElapsedMilliseconds}");
                    var response = Ok(responseDto);
                    return response;
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] UpdateRecharge error id={ID} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }
    }
}
