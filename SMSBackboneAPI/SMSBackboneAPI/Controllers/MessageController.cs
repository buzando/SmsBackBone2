using Contract.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SMSBackboneAPI.Service;
using Contract.WebHooks;
using Microsoft.AspNetCore.Authorization;

// 👇 agregados para logs/tiempos
using log4net;
using System;
using System.Diagnostics;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MessageController : ControllerBase
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(MessageController));
        private readonly IConfiguration configuration;

        public MessageController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage(SendTestSmsRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] SendMessage start dest={request?.To} len={request?.Message?.Length}");

                //var autenticate = new AutenticationBearer(configuration).Validate(Request);
                //if (autenticate == null)
                //{
                //    _log.Warn($"[{rid}] SendMessage invalid token");
                //    return BadRequest("Token inválido.");
                //}

                var messageManager = new Business.MessageManager();
                var result = messageManager.SendMessage(request);

                sw.Stop();
                _log.Info($"[{rid}] SendMessage ok ms={sw.ElapsedMilliseconds}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] SendMessage error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error en el servidor" });
            }
        }

        [HttpPost("SendMessageQuick")]
        public async Task<IActionResult> SendMessageQuick(SendTestSmsRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] SendMessageQuick start dest={request?.To} len={request?.Message?.Length}");

                //var autenticate = new AutenticationBearer(configuration).Validate(Request);
                //if (autenticate == null)
                //{
                //    _log.Warn($"[{rid}] SendMessageQuick invalid token");
                //    return BadRequest("Token inválido.");
                //}

                var messageManager = new Business.MessageManager();
                var result = messageManager.SendMessage(request);

                sw.Stop();
                _log.Info($"[{rid}] SendMessageQuick ok ms={sw.ElapsedMilliseconds}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] SendMessageQuick error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error en el servidor" });
            }
        }

        [HttpPost("List")]
        public async Task<IActionResult> List()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] List start");

                var autenticate = new AutenticationBearer(configuration).Validate(Request);
                if (autenticate == null)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] List invalid token ms={sw.ElapsedMilliseconds}");
                    return BadRequest("Token inválido.");
                }

                var smsRequest = await ServiceRequest.GetRequest<List<SmsRequestDto>>(Request.Body);
                if (smsRequest == null)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] List null/invalid request ms={sw.ElapsedMilliseconds}");
                    return BadRequest("Sin request valido.");
                }

                var messageManager = new Business.MessageManager();
                var result = messageManager.SendListMessage(smsRequest);

                sw.Stop();
                _log.Info($"[{rid}] List ok items={smsRequest.Count} ms={sw.ElapsedMilliseconds}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] List error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error en el servidor" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> Message(string id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] Message start id={id}");

                var autenticate = new AutenticationBearer(configuration).Validate(Request);
                if (autenticate == null)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] Message invalid token id={id} ms={sw.ElapsedMilliseconds}");
                    return BadRequest("Token inválido.");
                }

                var messageManager = new Business.MessageManager();
                var result = messageManager.GetMessage(id);

                sw.Stop();
                _log.Info($"[{rid}] Message ok id={id} ms={sw.ElapsedMilliseconds}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] Message error id={id} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error en el servidor" });
            }
        }

        [HttpPost("Webhook/Status")]
        public async Task<IActionResult> ReceiveStatusWebhook([FromBody] WebhookStatusDto status)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] Webhook/Status id={status?.Id} st={status?.Status} charged={status?.IsCharged} err={status?.Error}");

                // Aquí puedes guardar en base de datos si quieres

                sw.Stop();
                _log.Info($"[{rid}] Webhook/Status ok ms={sw.ElapsedMilliseconds}");
                return Ok(new { received = true });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] Webhook/Status error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { received = false, message = "Error en el servidor" });
            }
        }

        [HttpPost("Webhook/Response")]
        public async Task<IActionResult> ReceiveResponseWebhook([FromBody] WebhookResponseDto response)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] Webhook/Response from={response?.Source} to={response?.Destination} len={response?.Text?.Length}");

                // Guardar o procesar el mensaje recibido

                sw.Stop();
                _log.Info($"[{rid}] Webhook/Response ok ms={sw.ElapsedMilliseconds}");
                return Ok(new { received = true });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] Webhook/Response error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { received = false, message = "Error en el servidor" });
            }
        }
    }
}
