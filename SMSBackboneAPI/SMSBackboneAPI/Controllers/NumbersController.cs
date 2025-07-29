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

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NumbersController : ControllerBase
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(ClientController));
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
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.MyNumbersManager();
            var responseDto = UserManager.ProcesarNumerosDids(Numbers);
            if (responseDto != null)
            {


                var response = Ok(responseDto);
                return response;

            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = "responseDto" });

            }

        }

        [HttpPost("ManagerNumbersIndividual")]
        public async Task<IActionResult> ManagerNumbersIndividual(RequestManageNumbersIndividual Numbers)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.MyNumbersManager();
            var responseDto = UserManager.ProcesarNumerosDidsIndividual(Numbers);
            if (responseDto != null)
            {


                var response = Ok(responseDto);
                return response;

            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = "responseDto" });

            }

        }

        [HttpPost("RequestShortNumber")]
        public async Task<IActionResult> RequestNumber(NumberRequestDTO request)
        {
            try
            {
                var manager = new MyNumbersManager();
                var responseDto = manager.ProcesarShortNumberRequest(request);
                log.Info(responseDto);
                if (responseDto.StartsWith("http"))
                {
                    return Ok(responseDto);
                }
                if (!string.IsNullOrEmpty(responseDto))
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = responseDto });
                }
                else
                {
                    var response = Ok(responseDto);
                    return response;
                }
            }
            catch (Exception ex)
            {
                log.Error("Error en RequestShortNumber", ex);
                return StatusCode(500, new { message = "Error interno del servidor." });
            }
        }
        [HttpGet("UpdateRecharge")]
        public async Task<IActionResult> UpdateRecharge(string ID)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.VerifyRechargeStatus(ID);

            if (!responseDto)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }

        }
    }
}
