using Contract.Request;
using Contract.Response;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Business
{
    public class ExternalApiManager
    {
        public List<object> GetRoomsByEmail(string email)
        {
            using (var ctx = new Entities())
            {
                if (string.IsNullOrWhiteSpace(email))
                    return new List<object>();

                var normalizedEmail = email.Trim().ToLower();

                var user = ctx.Users
                    .FirstOrDefault(x =>
                        x.email != null &&
                        x.email.Trim().ToLower() == normalizedEmail &&
                        x.status == true
                    );

                if (user == null)
                    return new List<object>();

                var rooms = (
                    from rbu in ctx.roomsbyuser
                    join r in ctx.Rooms on rbu.idRoom equals r.id
                    where rbu.idUser == user.Id
                    select new
                    {
                        id = r.id,
                        name = r.name,
                        description = r.description,
                        credits = r.credits,
                        short_sms = r.short_sms,
                        long_sms = r.long_sms,
                        calls = r.calls
                    }
                ).ToList<object>();

                return rooms;
            }
        }

        public ExternalApiResponse<ExternalSendSmsResponse> SendSms(ExternalSendSmsRequest request)
        {
            if (request == null)
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "EMPTY_REQUEST",
                    "La petición no puede venir vacía."
                );
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "EMAIL_REQUIRED",
                    "El email es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(request.RoomName))
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "ROOM_REQUIRED",
                    "El nombre de la sala es obligatorio."
                );
            }

            request.SmsType = request.SmsType?.Trim().ToLower();

            if (request.SmsType != "short" && request.SmsType != "long")
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "INVALID_SMS_TYPE",
                    "SmsType inválido. Valores permitidos: short, long."
                );
            }

            if (request.To == null || !request.To.Any())
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "RECIPIENTS_REQUIRED",
                    "Debe incluir al menos un destinatario."
                );
            }

            request.To = request.To
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => CleanPhone(x))
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToList();

            if (!request.To.Any())
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "RECIPIENTS_REQUIRED",
                    "Debe incluir al menos un destinatario válido."
                );
            }

            var invalidPhones = request.To
                .Where(x => x.Length < 10 || x.Length > 12)
                .ToList();

            if (invalidPhones.Any())
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "INVALID_PHONE",
                    "Todos los teléfonos deben contener entre 10 y 12 dígitos."
                );
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "MESSAGE_REQUIRED",
                    "El mensaje es obligatorio."
                );
            }

            var messageText = NormalizeMessage(request.Message);

            var invalidCharacters = GetInvalidCharacters(messageText);

            if (invalidCharacters.Any())
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "INVALID_MESSAGE_CHARACTERS",
                    "El mensaje contiene caracteres no permitidos: " + string.Join(" ", invalidCharacters)
                );
            }

            if (messageText.Length > 160)
            {
                return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                    "MESSAGE_TOO_LONG",
                    "El mensaje no puede exceder los 160 caracteres."
                );
            }

            using (var ctx = new Entities())
            {
                var email = request.Email.Trim().ToLower();
                var roomName = request.RoomName.Trim().ToLower();

                var user = ctx.Users
                    .FirstOrDefault(x =>
                        x.email != null &&
                        x.email.Trim().ToLower() == email &&
                        x.status == true
                    );

                if (user == null)
                {
                    return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                        "USER_NOT_FOUND",
                        "Usuario no encontrado o inactivo."
                    );
                }

                var client = ctx.clients.FirstOrDefault(x => x.id == user.IdCliente);

                if (client == null)
                {
                    return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                        "CLIENT_NOT_FOUND",
                        "Cliente no encontrado."
                    );
                }

                if (client.Estatus != 0)
                {
                    return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                        "CLIENT_INACTIVE",
                        "Cliente inactivo."
                    );
                }

                var room = (
                    from rbu in ctx.roomsbyuser
                    join r in ctx.Rooms on rbu.idRoom equals r.id
                    where rbu.idUser == user.Id
                       && r.name != null
                       && r.name.Trim().ToLower() == roomName
                    select r
                ).FirstOrDefault();

                if (room == null)
                {
                    return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                        "ROOM_NOT_FOUND",
                        "La sala no existe o no está asignada al usuario."
                    );
                }

                var source = "ExternalApi";

                var messagesToSave = request.To.Select(phone => new ExternalSmsMessage
                {
                    IdUser = user.Id,
                    IdRoom = room.id,
                    Email = request.Email.Trim(),
                    RoomName = room.name,
                    SmsType = request.SmsType,
                    PhoneNumber = phone,
                    Message = messageText,
                    IdBackBone = null,
                    Status = "0",
                    ResponseMessage = null,
                    Source = source,
                    CreatedAt = DateTime.Now,
                    SentAt = null,
                    UpdatedAt = null
                }).ToList();

                ctx.ExternalSmsMessage.AddRange(messagesToSave);
                ctx.SaveChanges();

                var internalRequest = new SendTestSmsRequest
                {
                    SmsType = request.SmsType,
                    To = request.To,
                    Message = messageText,
                    TemplateId = null,
                    ClientID = user.IdCliente,
                    UserID = user.Id,
                    Room = room.id
                };

                List<BackboneSendMessageResult> sendResults = null;

                try
                {
                    sendResults = new MessageManager().SendExternalMessage(internalRequest);
                }
                catch
                {
                    foreach (var msg in messagesToSave)
                    {
                        msg.Status = "5";
                        msg.SentAt = null;
                        msg.UpdatedAt = DateTime.Now;
                    }

                    ctx.SaveChanges();

                    return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                        "SMS_PROVIDER_ERROR",
                        "Ocurrió un error al enviar el mensaje."
                    );
                }

                if (sendResults == null || !sendResults.Any())
                {
                    foreach (var msg in messagesToSave)
                    {
                        msg.Status = "5";
                        msg.SentAt = null;
                        msg.UpdatedAt = DateTime.Now;
                    }

                    ctx.SaveChanges();

                    return ExternalApiResponse<ExternalSendSmsResponse>.Fail(
                        "SMS_PROVIDER_EMPTY_RESPONSE",
                        "No se recibió resultado del envío."
                    );
                }

                foreach (var msg in messagesToSave)
                {
                    var sendResult = sendResults.FirstOrDefault(x =>
                        CleanPhone(x.PhoneNumber) == CleanPhone(msg.PhoneNumber)
                    );

                    if (sendResult == null)
                    {
                        msg.Status = "5";
                        msg.SentAt = null;
                        msg.UpdatedAt = DateTime.Now;
                        continue;
                    }

                    var normalizedStatus = NormalizeSmsStatus(sendResult.Status);

                    msg.IdBackBone = sendResult.Id;
                    msg.Status = normalizedStatus;
                    msg.SentAt = DateTime.Now;
                    msg.UpdatedAt = DateTime.Now;
                }

                ctx.SaveChanges();

                return ExternalApiResponse<ExternalSendSmsResponse>.Ok(
                    new ExternalSendSmsResponse
                    {
                        Result = "OK",
                        Messages = messagesToSave.Select(x => new ExternalSmsTrackingResponse
                        {
                            PhoneNumber = x.PhoneNumber,
                            Status = x.Status
                        }).ToList()
                    },
                    "Proceso de envío ejecutado."
                );
            }
        }

        public object GetSmsResults(string email, DateTime startDate, DateTime endDate)
        {
            using (var ctx = new Entities())
            {
                if (string.IsNullOrWhiteSpace(email))
                    return new List<object>();

                var normalizedEmail = email.Trim().ToLower();

                var user = ctx.Users
                    .FirstOrDefault(x =>
                        x.email != null &&
                        x.email.Trim().ToLower() == normalizedEmail &&
                        x.status == true
                    );

                if (user == null)
                    return new List<object>();

                var start = startDate;
                var end = endDate;

                if (endDate.TimeOfDay == TimeSpan.Zero)
                    end = endDate.Date.AddDays(1).AddTicks(-1);

                var rawData = ctx.ExternalSmsMessage
                    .Where(x =>
                        x.IdUser == user.Id &&
                        (
                            (x.SentAt.HasValue && x.SentAt.Value >= start && x.SentAt.Value <= end)
                            ||
                            (!x.SentAt.HasValue && x.CreatedAt >= start && x.CreatedAt <= end)
                        )
                    )
                    .OrderByDescending(x => x.SentAt ?? x.CreatedAt)
                    .Select(x => new
                    {
                        Usuario = x.Email ?? string.Empty,
                        Sala = x.RoomName ?? string.Empty,
                        TipoSms = x.SmsType ?? string.Empty,
                        Telefono = x.PhoneNumber ?? string.Empty,
                        Mensaje = x.Message ?? string.Empty,
                        Estatus = x.Status ?? string.Empty,
                        FechaEnvio = x.SentAt
                    })
                    .ToList();

                var data = rawData
                    .Select(x =>
                    {
                        var estatusNormalizado = NormalizeStatusForOutput(x.Estatus);

                        return new
                        {
                            usuario = x.Usuario.Trim(),
                            sala = x.Sala.Trim(),
                            tipoSms = x.TipoSms.Trim(),
                            telefono = x.Telefono.Trim(),
                            mensaje = x.Mensaje.Trim(),
                            estatus = estatusNormalizado,
                            descripcionEstatus = GetSmsStatusDescription(estatusNormalizado),
                            fechaEnvio = x.FechaEnvio
                        };
                    })
                    .ToList<object>();

                return data;
            }
        }

        private string NormalizeMessage(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return string.Empty;

            return message
                .Replace('\u00A0', ' ')
                .Replace('\u2007', ' ')
                .Replace('\u202F', ' ')
                .Trim();
        }

        private List<string> GetInvalidCharacters(string value)
        {
            var invalidCharacters = new List<string>();

            if (string.IsNullOrEmpty(value))
                return invalidCharacters;

            foreach (var character in value)
            {
                if (!IsAllowedMessageCharacter(character))
                {
                    var text = character.ToString();

                    if (!invalidCharacters.Contains(text))
                        invalidCharacters.Add(text);
                }
            }

            return invalidCharacters;
        }

        private bool IsAllowedMessageCharacter(char character)
        {
            if (
                character >= 'A' && character <= 'Z' ||
                character >= 'a' && character <= 'z' ||
                character >= '0' && character <= '9' ||
                character == 'Ñ' ||
                character == 'ñ' ||
                character == 'Ü' ||
                character == 'ü'
            )
            {
                return true;
            }

            switch (character)
            {
                case ' ':
                case '.':
                case ',':
                case ';':
                case ':':
                case '!':
                case '?':
                case '(':
                case ')':
                case '$':
                case '-':
                case '{':
                case '}':
                case '/':
                case '\\':
                case '\r':
                case '\n':
                    return true;

                default:
                    return false;
            }
        }

        private string NormalizeSmsStatus(int status)
        {
            switch (status)
            {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    return status.ToString();

                default:
                    return "5";
            }
        }

        private string NormalizeStatusForOutput(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return "5";

            var cleanStatus = status.Trim();

            switch (cleanStatus)
            {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                    return cleanStatus;

                case "PENDING":
                case "pending":
                    return "0";

                case "ERROR":
                case "error":
                    return "5";

                default:
                    return "5";
            }
        }

        private string GetSmsStatusDescription(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                return "Sin estatus";

            switch (status.Trim())
            {
                case "0":
                    return "Enviando";

                case "1":
                    return "Entregado";

                case "2":
                    return "No entregado";

                case "3":
                    return "No enviado";

                case "4":
                    return "Fallido";

                case "5":
                    return "Excepción";

                default:
                    return "Estatus desconocido";
            }
        }

        private string CleanPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return string.Empty;

            return new string(phone.Where(char.IsDigit).ToArray());
        }
    }
}