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
    }
}
