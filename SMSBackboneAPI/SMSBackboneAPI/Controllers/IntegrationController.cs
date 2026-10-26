using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Business;

namespace QuantumApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class IntegrationController : ControllerBase
    {
        private readonly ILogger<IntegrationController> _logger;

        public IntegrationController(ILogger<IntegrationController> logger)
        {
            _logger = logger;
        }

        [HttpGet("Rooms")]
        public IActionResult GetRooms([FromQuery] string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                {
                    return BadRequest(
                        ExternalApiResponse<object>.Fail(
                            "EMAIL_REQUIRED",
                            "El email es obligatorio."
                        )
                    );
                }

                var rooms = new ExternalApiManager().GetRoomsByEmail(email);

                return Ok(
                    ExternalApiResponse<object>.Ok(rooms)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en ExternalApi/Rooms");

                return StatusCode(500,
                    ExternalApiResponse<object>.Fail(
                        "SERVER_ERROR",
                        "Error interno del servidor."
                    )
                );
            }
        }

        [HttpPost("Sms/Send")]
        public IActionResult SendSms([FromBody] ExternalSendSmsRequest request)
        {
            try
            {
                var result = new ExternalApiManager().SendSms(request);

                if (!result.Success)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en ExternalApi/Sms/Send");

                return StatusCode(500,
                    ExternalApiResponse<object>.Fail(
                        "SERVER_ERROR",
                        "Error interno del servidor."
                    )
                );
            }
        }
        [HttpGet("Sms/Results")]
        public IActionResult GetSmsResults(
            [FromQuery] string email,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate
        )
        {
            var result = new ExternalApiManager().GetSmsResults(email, startDate, endDate);

            return Ok(
                ExternalApiResponse<object>.Ok(result)
            );
        }
    }
}