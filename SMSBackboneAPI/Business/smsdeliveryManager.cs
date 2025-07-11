using System;
using System.Collections.Generic;
using System.Data;
using System.IO.Pipelines;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract;
using Contract.Other;
using Contract.Response;
using DocumentFormat.OpenXml.Spreadsheet;
using log4net;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using Newtonsoft.Json;

namespace Business
{
    public class smsdeliveryManager
    {
        private static readonly TimeSpan HorarioInicio = new TimeSpan(7, 0, 0);  // 07:00
        private static readonly TimeSpan HorarioFin = new TimeSpan(21, 0, 0);    // 21:00
        private static readonly ILog _logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public List<FullCampaignSpResult> FullResponseCampaignstarted()
        {
            var result = new List<FullCampaignSpResult>();
            var topcampaigns = Common.ConfigurationManagerJson("TopCampaigns");
            var topcontacts = Common.ConfigurationManagerJson("TopContacts");
            _logger.Info($"Inicia Ejecutando SP");
            try
            {
                using (var ctx = new Entities())
                {
                    var connection = ctx.Database.GetDbConnection();
                    if (connection.State != System.Data.ConnectionState.Open)
                        connection.Open();

                    using (var cmd = connection.CreateCommand())
                    {
                        var topcontactsValue = string.IsNullOrWhiteSpace(topcontacts) ? "NULL" : topcontacts;
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandText = "sp_getCampaignsToAutoStart";

                        var paramCampaigns = cmd.CreateParameter();
                        paramCampaigns.ParameterName = "@TopCampaigns";
                        paramCampaigns.Value = int.Parse(topcampaigns);
                        cmd.Parameters.Add(paramCampaigns);

                        var paramContacts = cmd.CreateParameter();
                        paramContacts.ParameterName = "@TopContacts";
                        paramContacts.Value = string.IsNullOrWhiteSpace(topcontacts) ? (object)DBNull.Value : int.Parse(topcontacts);
                        cmd.Parameters.Add(paramContacts);
                        cmd.CommandTimeout = 0;
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var campaign = new FullCampaignSpResult
                                {
                                    CampaignId = reader.GetInt32(reader.GetOrdinal("CampaignId")),
                                    Name = reader.GetString(reader.GetOrdinal("Name")),
                                    Message = reader.GetString(reader.GetOrdinal("Message")),
                                    UseTemplate = reader.GetBoolean(reader.GetOrdinal("UseTemplate")),
                                    TemplateId = reader.IsDBNull(reader.GetOrdinal("TemplateId")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("TemplateId")),
                                    AutoStart = reader.GetBoolean(reader.GetOrdinal("AutoStart")),
                                    FlashMessage = reader.GetBoolean(reader.GetOrdinal("FlashMessage")),
                                    CustomANI = reader.GetBoolean(reader.GetOrdinal("CustomANI")),
                                    RecycleRecords = reader.GetBoolean(reader.GetOrdinal("RecycleRecords")),
                                    NumberType = Convert.ToInt32(reader.GetValue(reader.GetOrdinal("NumberType"))),
                                    CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                                    Username = reader.GetString(reader.GetOrdinal("Username")),
                                    Password = reader.GetString(reader.GetOrdinal("Password")),
                                    RoomId = reader.GetInt32(reader.GetOrdinal("RoomId")),
                                    RoomName = reader.GetString(reader.GetOrdinal("RoomName")),
                                    RateForShort = Convert.ToDecimal(reader.GetValue(reader.GetOrdinal("RateForShort"))),
                                    RateForLong = Convert.ToDecimal(reader.GetValue(reader.GetOrdinal("RateForLong"))),
                                    ScheduleId = reader.GetInt32(reader.GetOrdinal("ScheduleId")),
                                    StartDateTime = reader.GetDateTime(reader.GetOrdinal("StartDateTime")),
                                    EndDateTime = reader.GetDateTime(reader.GetOrdinal("EndDateTime")),
                                    RoomDescription = reader.GetString(reader.GetOrdinal("RoomDescription")),
                                    Credits = Convert.ToDecimal(reader.GetValue(reader.GetOrdinal("Credits"))),
                                    LongSms = Convert.ToDecimal(reader.GetValue(reader.GetOrdinal("Long_Sms"))),
                                    ShortSms = Convert.ToDecimal(reader.GetValue(reader.GetOrdinal("Short_Sms"))),
                                    ContactsJson = reader.GetString(reader.GetOrdinal("ContactsJson")),
                                    SchedulesJson = reader.GetString(reader.GetOrdinal("SchedulesJson")),
                                    RecycleSettingJson = reader.IsDBNull(reader.GetOrdinal("RecycleSettingJson"))
                                        ? null
                                        : reader.GetString(reader.GetOrdinal("RecycleSettingJson")),
                                    BlackListIds = reader.IsDBNull(reader.GetOrdinal("BlackListIds"))
    ? new List<int>()
    : reader.GetString(reader.GetOrdinal("BlackListIds"))
        .Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(id => int.Parse(id))
        .ToList(),
                                };

                                campaign.Contacts = JsonConvert.DeserializeObject<List<CampaignContacts>>(campaign.ContactsJson);
                                campaign.Schedules = JsonConvert.DeserializeObject<List<CampaignSchedules>>(campaign.SchedulesJson);
                                campaign.RecycleSetting = !string.IsNullOrEmpty(campaign.RecycleSettingJson)
                                    ? JsonConvert.DeserializeObject<CampaignRecycleSettings>(campaign.RecycleSettingJson)
                                    : null;
                                _logger.Info($"🔍 Se encontraron {result.Count()} campañas");
                                result.Add(campaign);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"Error ejecutando SP: {ex.Message}");
            }

            return result;
        }


        public async Task<bool> SimulateSmsDispatch()
        {
            try
            {
                var campaigns = FullResponseCampaignstarted();
                var rnd = new Random();

                var validCampaigns = campaigns.Where(c => c.ScheduleId != 0).ToList();

                var throttler = new SemaphoreSlim(
#if DEBUG
                    1
#else
            10
#endif
                );

                var tasks = validCampaigns.Select(async campaign =>
                {
                    await throttler.WaitAsync();
                    try
                    {
                        var test = bool.TryParse(Common.ConfigurationManagerJson("QA"), out bool d) ? d : false;

                        string token = null;
                        if (!test)
                        {
                            var loginResult = await new ApiBackBoneManager().LoginResponse(campaign.Username, campaign.Password);
                            if (loginResult == null)
                            {
                                _logger.Error($"❌ Login fallido para la campaña {campaign.Name}");
                                return;
                            }
                            var creditResponse = await new ApiBackBoneManager().GetOwnCredit(loginResult.token);
                            if (decimal.TryParse(creditResponse, out var apiCredit))
                            {
                                if (apiCredit <= 0)
                                {
                                    _logger.Info($"⚠️ Crédito insuficiente en API para la campaña {campaign.Name}: {apiCredit} créditos.");
                                    return;
                                }
                            }
                            else
                            {
                                _logger.Error($"❌ Error al interpretar el crédito del API para la campaña {campaign.Name}: '{creditResponse}'");
                                return;
                            }
                            token = loginResult.token;
                        }
                        using (var ctx = new Entities())
                        {
                            var notif = ctx.AmountNotification.FirstOrDefault(x => x.IdRoom == campaign.RoomId);
                            if (notif != null)
                            {
                                bool isShort = campaign.NumberType == 1;
                                decimal currentBalance = isShort ? Convert.ToDecimal(notif.short_sms) : Convert.ToDecimal(notif.long_sms);

                                if (currentBalance <= notif.AmountValue)
                                {
                                    string tipoSms = isShort ? "SMS cortos" : "SMS largos";
                                    string mensaje = $"⚠️ La sala {campaign.RoomName} (ID: {campaign.RoomId}) tiene saldo bajo de {tipoSms}: {currentBalance} créditos.";

                                    var usersToNotify = (from anu in ctx.AmountNotificationUser
                                                         join user in ctx.Users on anu.UserId equals user.Id
                                                         where anu.NotificationId == notif.id
                                                         select user.email).ToList();

                                    foreach (var email in usersToNotify)
                                    {
                                        MailManager.SendEmail(email, $"⚠️ Alerta de saldo bajo en sala {campaign.RoomName}", mensaje);
                                    }
                                    return;
                                }
                            }
                            var chuncks = int.TryParse(Common.ConfigurationManagerJson("CantidadDeChunks"), out int c) ? c : 50;
                            var chunks = campaign.Contacts.Chunk(chuncks);

                            foreach (var chunk in chunks)
                            {
                                if (!IsWithinSchedule(campaign.StartDateTime, campaign.EndDateTime))
                                {
                                    _logger.Error($"⏰ Fuera del horario para enviar mensajes de la campaña {campaign.Name}");
                                    break;
                                }
                                var messagesToSend = new List<MessageToSend>();
                                foreach (var contact in chunk)
                                {
                                    var lada = "";
                                    var ladaRecord = new IFTLadas();
                                    string estado = "";
                                    if (campaign.BlackListIds != null && campaign.BlackListIds.Count > 0)
                                    {
                                        bool isBlacklisted = ctx.BlackList
                                            .Any(bl => bl.phone == contact.PhoneNumber && campaign.BlackListIds.Contains(bl.Id));

                                        if (isBlacklisted)
                                        {
                                            // Guardamos el intento con status 6 sin enviar
                                            lada = contact.PhoneNumber.Substring(0, 2);
                                            ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);

                                            if (ladaRecord == null && contact.PhoneNumber.Length >= 3)
                                            {
                                                lada = contact.PhoneNumber.Substring(0, 3);
                                                ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);
                                            }

                                            estado = ladaRecord?.Estado ?? "Desconocido";

                                            ctx.CampaignContactScheduleSend.Add(new CampaignContactScheduleSend
                                            {
                                                CampaignId = campaign.CampaignId,
                                                ContactId = contact.Id,
                                                ScheduleId = campaign.ScheduleId,
                                                SentAt = DateTime.Now,
                                                Status = "6",
                                                ResponseMessage = null,
                                                State = estado
                                            });

                                            continue;
                                        }
                                    }
                                    lada = contact.PhoneNumber.Substring(0, 2);
                                    ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);

                                    if (ladaRecord == null && contact.PhoneNumber.Length >= 3)
                                    {
                                        lada = contact.PhoneNumber.Substring(0, 3);
                                        ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);
                                    }

                                    estado = ladaRecord?.Estado ?? "Desconocido";
                                    if (!string.IsNullOrEmpty(estado))
                                    {
                                        var horaLocal = TimeZoneHelper.GetHoraLocal(estado);
                                        if (horaLocal.HasValue)
                                        {
                                            var hora = horaLocal.Value.TimeOfDay;
                                            if (hora < HorarioInicio || hora > HorarioFin)
                                            {
                                                Console.WriteLine($"⛔ {contact.PhoneNumber} fuera de horario (local {hora}, estado {estado})");
                                                continue;
                                            }
                                        }
                                    }
                                    var FormatMessage = PersonalizeMessage(campaign.Message, contact);
                                    messagesToSend.Add(new MessageToSend
                                    {
                                        phoneNumber = contact.PhoneNumber,
                                        text = FormatMessage,
                                        registryClient = contact.Id.ToString()
                                    });
                                    _logger.Info($"📝 [Preparado] Campaña: {campaign.CampaignId} | ContactoId: {contact.Id} | Tel: {contact.PhoneNumber} | Mensaje: {FormatMessage}");

                                }

                                List<ApiResponse> sendResult;
                                if (!test)
                                {
                                    sendResult = await new ApiBackBoneManager().SendMessagesAsync(messagesToSend, token);
                                    _logger.Info($"✅ [Producción] Se enviaron {sendResult.Count} mensajes reales para la campaña {campaign.Name}:\n" +
                                                 string.Join("\n", sendResult.Select(r =>
                                                     $"📤 ContactoId: {r.registryClient} | Tel: {r.phoneNumber} | Status: {r.status}")));
                                }
                                else
                                {
                                    var rand = new Random();
                                    sendResult = messagesToSend.Select(msg => new ApiResponse
                                    {
                                        phoneNumber = msg.phoneNumber,
                                        status = rand.Next(0, 6), // Simulación: status del 0 al 5
                                        registryClient = msg.registryClient
                                    }).ToList();

                                    _logger.Info($"🧪 [Test] Se simularon {sendResult.Count} mensajes para la campaña {campaign.Name}:\n" +
              string.Join("\n", sendResult.Select(r =>
                  $"🧪 ContactoId: {r.registryClient} | Tel: {r.phoneNumber} | Status: {r.status}")));

                                }
                                double creditosConsumidos = 0;
                                foreach (var message in sendResult)
                                {
                                    var lada = message.phoneNumber.Substring(0, 2);
                                    var ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);

                                    if (ladaRecord == null && message.phoneNumber.Length >= 3)
                                    {
                                        lada = message.phoneNumber.Substring(0, 3);
                                        ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);
                                    }

                                    string estado = ladaRecord?.Estado ?? "Desconocido";


                                    ctx.CampaignContactScheduleSend.Add(new CampaignContactScheduleSend
                                    {
                                        CampaignId = campaign.CampaignId,
                                        ContactId = int.Parse(message.registryClient),
                                        ScheduleId = campaign.ScheduleId,
                                        SentAt = DateTime.Now,
                                        Status = message.status.ToString(),
                                        ResponseMessage = null,
                                        State = estado
                                    });

                                    var room = ctx.Rooms.FirstOrDefault(r => r.id == campaign.RoomId);
                                    if (room != null)
                                    {
                                        if (campaign.NumberType == 1)
                                            room.short_sms = Math.Max(0, room.short_sms - creditosConsumidos); // no bajar de 0
                                        else if (campaign.NumberType == 2)
                                            room.long_sms = Math.Max(0, room.long_sms - creditosConsumidos);
                                    }
                                }
                                ctx.SaveChanges();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Error($"Error en campaña ID {campaign.CampaignId}: {ex.Message}");
                    }
                    finally
                    {
                        throttler.Release();
                    }
                });

                await Task.WhenAll(tasks);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error general: {ex.Message}");
                return false;
            }
        }


        private bool IsWithinSchedule(DateTime startDateTime, DateTime endDateTime)
        {
            var now = DateTime.Now;
            return now >= startDateTime && now <= endDateTime;
        }

        public static string PersonalizeMessage(string message, CampaignContacts contact)
        {
            if (string.IsNullOrWhiteSpace(message)) return string.Empty;

            message = message.Replace("{Dato}", contact.Dato ?? "");
            message = message.Replace("{DatoId}", contact.DatoId ?? "");

            if (!string.IsNullOrWhiteSpace(contact.Misc01))
            {
                var pairs = contact.Misc01.Split('|');

                foreach (var pair in pairs)
                {
                    var keyValue = pair.Split(':');
                    if (keyValue.Length == 2)
                    {
                        var key = keyValue[0].Trim();
                        var value = keyValue[1].Trim();
                        message = message.Replace($"{{{key}}}", value);
                    }
                }
            }

            return message;
        }

        public bool HayContactosPendientes()
        {
            try
            {
                var campaignsToCheck = new List<(int ScheduleId, int CampaignId)>();

                using (var ctx = new Entities())
                {
                    var connection = (SqlConnection)ctx.Database.GetDbConnection();
                    connection.Open(); // Asegúrate de abrir

                    using (var getCampaignsCmd = connection.CreateCommand())
                    {
                        getCampaignsCmd.CommandText = @"
                    SELECT s.Id AS ScheduleId, s.CampaignId
                    FROM CampaignSchedules s
                    JOIN Campaigns c ON s.CampaignId = c.Id
                    WHERE 
                        c.AutoStart = 1
                        AND GETDATE() BETWEEN s.StartDateTime AND s.EndDateTime";

                        using (var reader = getCampaignsCmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                campaignsToCheck.Add((
                                    reader.GetInt32(0),
                                    reader.GetInt32(1)
                                ));
                            }
                        }
                    }

                    // Cerramos conexión anterior antes de reutilizar en segundo paso
                    connection.Close();
                }

                // Recorremos schedules
                foreach (var (scheduleId, campaignId) in campaignsToCheck)
                {
                    using (var ctx = new Entities())
                    {
                        var connection = (SqlConnection)ctx.Database.GetDbConnection();
                        connection.Open(); // Necesario

                        using (var cmd = connection.CreateCommand())
                        {
                            cmd.CommandText = @"
                        SELECT COUNT(*)
                        FROM CampaignContacts cc
                        LEFT JOIN CampaignContactScheduleSend scss 
                            ON cc.Id = scss.ContactId AND scss.ScheduleId = @ScheduleId
                        WHERE cc.CampaignId = @CampaignId
                        AND scss.Id IS NULL";

                            cmd.Parameters.Add(new SqlParameter("@ScheduleId", scheduleId));
                            cmd.Parameters.Add(new SqlParameter("@CampaignId", campaignId));

                            var count = (int)(cmd.ExecuteScalar() ?? 0);
                            if (count > 0)
                            {
                                _logger.Info($"📌 Campaña {campaignId} tiene {count} contactos no enviados para ScheduleId {scheduleId}.");
                                return true;
                            }
                        }

                        connection.Close();
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.Error("❌ Error en HayContactosPendientes: " + ex.Message);
                return false;
            }
        }





    }
}
