using Contract.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SMSBackboneAPI.Service;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private IConfiguration configuration;
        public MessageController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }

        [HttpPost]
        public async Task<IActionResult> Send()
        {
            var autenticate = new AutenticationBearer(configuration).Validate(Request);
            if (autenticate == null)
            {
                return BadRequest("Token inválido.");
            }

            var smsRequest = await ServiceRequest.GetRequest<SmsRequestDto>(Request.Body);
            if (smsRequest == null)
            {
                return BadRequest("Sin request valido.");
            }

            var messageManager = new Business.MessageManager();
            var result = messageManager.SendMessage(smsRequest);
            return Ok(result);
        }

        [HttpPost("List")]
        public async Task<IActionResult> List()
        {
            var autenticate = new AutenticationBearer(configuration).Validate(Request);
            if (autenticate == null)
            {
                return BadRequest("Token inválido.");
            }

            var smsRequest = await ServiceRequest.GetRequest<List<SmsRequestDto>>(Request.Body);
            if (smsRequest == null)
            {
                return BadRequest("Sin request valido.");
            }

            var messageManager = new Business.MessageManager();
            var result = messageManager.SendListMessage(smsRequest);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> Message(string id)
        {
            var autenticate = new AutenticationBearer(configuration).Validate(Request);
            if (autenticate == null)
            {
                return BadRequest("Token inválido.");
            }

            var messageManager = new Business.MessageManager();
            var result = messageManager.GetMessage(id);
            return Ok(result);
        }
    }
}
