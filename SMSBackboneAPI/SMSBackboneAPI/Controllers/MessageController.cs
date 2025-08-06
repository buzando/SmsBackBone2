using Contract.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SMSBackboneAPI.Service;
using Contract.WebHooks;
using Microsoft.AspNetCore.Authorization;
namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private IConfiguration configuration;
        public MessageController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage(SendTestSmsRequest request)
        {
            //var autenticate = new AutenticationBearer(configuration).Validate(Request);
            //if (autenticate == null)
            //{
            //    return BadRequest("Token inválido.");
            //}

            var messageManager = new Business.MessageManager();
            var result = messageManager.SendMessage(request);
            return Ok(result);
        }

        [HttpPost("SendMessageQuick")]
        public async Task<IActionResult> SendMessageQuick(SendTestSmsRequest request)
        {
            //var autenticate = new AutenticationBearer(configuration).Validate(Request);
            //if (autenticate == null)
            //{
            //    return BadRequest("Token inválido.");
            //}

            var messageManager = new Business.MessageManager();
            var result = messageManager.SendMessage(request);
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

        [HttpPost("Webhook/Status")]
        public async Task<IActionResult> ReceiveStatusWebhook([FromBody] WebhookStatusDto status)
        {
            Console.WriteLine($"[WEBHOOK STATUS] ID: {status.Id}, Status: {status.Status}, Charged: {status.IsCharged}, Error: {status.Error}");

            // Aquí puedes guardar en base de datos si quieres
            return Ok(new { received = true });
        }

        [HttpPost("Webhook/Response")]
        public async Task<IActionResult> ReceiveResponseWebhook([FromBody] WebhookResponseDto response)
        {
            Console.WriteLine($"[WEBHOOK RESPONSE] From: {response.Source}, To: {response.Destination}, Msg: {response.Text}");

            // Guardar o procesar el mensaje recibido
            return Ok(new { received = true });
        }
    }
}
