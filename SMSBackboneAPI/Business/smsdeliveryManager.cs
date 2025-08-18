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
using Newtonsoft.Json.Linq;

namespace Business
{
    public class smsdeliveryManager
    {
        private static readonly TimeSpan HorarioInicio = new TimeSpan(7, 0, 0);  // 07:00
        private static readonly TimeSpan HorarioFin = new TimeSpan(21, 0, 0);    // 21:00
        private static readonly ILog _logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public List<LightCampaignResult> GetLightCampaigns(List<int> campaigns)
        {
            var result = new List<LightCampaignResult>();
            var topcontacts = Common.ConfigurationManagerJson("TopContacts");

            var campaignIdsTable = new DataTable();
            campaignIdsTable.Columns.Add("Value", typeof(int));
            foreach (var id in campaigns)
                campaignIdsTable.Rows.Add(id);

            try
            {
                using (var ctx = new Entities())
                {
                    var connection = (SqlConnection)ctx.Database.GetDbConnection();
                    connection.Open();

                    using (var cmd = new SqlCommand("sp_getPendingContacts", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        var param = cmd.Parameters.AddWithValue("@CampaignIds", campaignIdsTable);
                        param.SqlDbType = SqlDbType.Structured;
                        param.TypeName = "dbo.IntList"; 

                        cmd.Parameters.AddWithValue("@TopContacts",
                            string.IsNullOrWhiteSpace(topcontacts) ? (object)DBNull.Value : int.Parse(topcontacts));

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var campaignId = reader.GetInt32(reader.GetOrdinal("CampaignId"));
                                var campaign = result.FirstOrDefault(c => c.CampaignId == campaignId);

                                if (campaign == null)
                                {
                                    campaign = new LightCampaignResult
                                    {
                                        CampaignId = campaignId,
                                        Name = reader.GetString(reader.GetOrdinal("Name")),
                                        Message = reader.GetString(reader.GetOrdinal("Message")),
                                        UseTemplate = reader.GetBoolean(reader.GetOrdinal("UseTemplate")),
                                        TemplateId = reader.IsDBNull(reader.GetOrdinal("TemplateId")) ? null : reader.GetInt32(reader.GetOrdinal("TemplateId")),
                                        FlashMessage = reader.GetBoolean(reader.GetOrdinal("FlashMessage")),
                                        CustomANI = reader.GetBoolean(reader.GetOrdinal("CustomANI")),
                                        NumberType = reader.GetInt32(reader.GetOrdinal("NumberType")),
                                        RoomId = reader.GetInt32(reader.GetOrdinal("RoomId")),
                                        RoomName = reader.GetString(reader.GetOrdinal("RoomName")),
                                        Credits = reader.GetDouble(reader.GetOrdinal("Credits")),
                                        ShortSms = reader.GetDouble(reader.GetOrdinal("short_sms")),
                                        LongSms = reader.GetDouble(reader.GetOrdinal("long_sms")),
                                        ScheduleId = reader.GetInt32(reader.GetOrdinal("ScheduleId")),
                                        StartDateTime = reader.GetDateTime(reader.GetOrdinal("StartDateTime")),
                                        EndDateTime = reader.GetDateTime(reader.GetOrdinal("EndDateTime")),
                                        ClientId = reader.GetInt32(reader.GetOrdinal("ClientId")),
                                        concatenate = reader.GetBoolean(reader.GetOrdinal("concatenate")),
                                        shortenUrls = reader.GetBoolean(reader.GetOrdinal("shortenUrls")),
                                        ShouldConcatenate = reader.GetBoolean(reader.GetOrdinal("ShouldConcatenate")),
                                        ShouldShortenUrls = reader.GetBoolean(reader.GetOrdinal("ShouldShortenUrls")),
                                        Contacts = new List<CampaignContact>()
                                    };

                                    result.Add(campaign);
                                }

                                var contact = new CampaignContact
                                {
                                    Id = reader.GetInt32(reader.GetOrdinal("ContactId")),
                                    CampaignId = campaignId,
                                    PhoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber")),
                                    Dato = reader.IsDBNull(reader.GetOrdinal("Dato")) ? null : reader.GetString(reader.GetOrdinal("Dato")),
                                    DatoId = reader.IsDBNull(reader.GetOrdinal("DatoId")) ? null : reader.GetString(reader.GetOrdinal("DatoId")),
                                    Misc01 = reader.IsDBNull(reader.GetOrdinal("Misc01")) ? null : reader.GetString(reader.GetOrdinal("Misc01")),
                                    Misc02 = reader.IsDBNull(reader.GetOrdinal("Misc02")) ? null : reader.GetString(reader.GetOrdinal("Misc02"))
                                };

                                campaign.Contacts.Add(contact);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"❌ Error en GetLightCampaigns: {ex.Message}");
            }

            return result;
        }





        public async Task<bool> SimulateSmsDispatch(List<int> Campaigns)
        {
            var clientacces = new ClientAccess();
            try
            {
                var campaigns = GetLightCampaigns(Campaigns);
                var rnd = new Random();

                var now = DateTime.Now; 

                var validCampaigns = campaigns
                    .Where(c => c.ScheduleId != 0
                             && c.StartDateTime <= now
                             && c.EndDateTime > now)
                    .ToList();

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
                            using (var ctx = new Entities())
                            {
                                clientacces = ctx.Client_Access.Where(x => x.client_id == campaign.ClientId).FirstOrDefault();
                            }
                            if (clientacces == null)
                            {
                                _logger.Error($"❌ No se encontró acceso para el cliente con ID {campaign.ClientId} en campaña {campaign.CampaignId}.");
                                return;
                            }
                            var loginResult = await new ApiBackBoneManager().LoginResponse(clientacces.username, clientacces.password);
                            if (loginResult == null)
                            {
                                _logger.Error($"❌ Login fallido para la campaña {campaign.Name}");
                                return;
                            }
                            var creditResponse = await new ApiBackBoneManager().GetOwnCredit(loginResult.token);
                            int credit = JObject.Parse(creditResponse)["credit"].Value<int>();
                            if (decimal.TryParse(credit.ToString(), out var apiCredit))
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
                                //bool isShort = campaign.NumberType == 1;
                                //decimal currentBalance = isShort ? Convert.ToDecimal(notif.short_sms) : Convert.ToDecimal(notif.long_sms);

                                //if (currentBalance <= notif.AmountValue)
                                //{
                                //    string tipoSms = isShort ? "SMS cortos" : "SMS largos";
                                //    string mensaje = $"⚠️ La sala {campaign.RoomName} (ID: {campaign.RoomId}) tiene saldo bajo de {tipoSms}: {currentBalance} créditos.";

                                //    var usersToNotify = (from anu in ctx.AmountNotificationUser
                                //                         join user in ctx.Users on anu.UserId equals user.Id
                                //                         where anu.NotificationId == notif.id
                                //                         select user.email).ToList();

                                //    foreach (var email in usersToNotify)
                                //    {
                                //        MailManager.SendEmail(email, $"⚠️ Alerta de saldo bajo en sala {campaign.RoomName}", mensaje);
                                //    }
                                //    return;
                                //}
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

                                    var blacklistids = ctx.blacklistcampains
                                        .Where(x => x.idcampains == campaign.CampaignId)
                                        .Select(x => x.idblacklist)
                                        .ToList();

                                    if (blacklistids != null && blacklistids.Count > 0)
                                    {
                                        bool isBlacklisted = ctx.BlackList
                                            .Any(bl => bl.phone == contact.PhoneNumber && blacklistids.Contains(bl.Id));

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
                                                _logger.Info($"⛔ {contact.PhoneNumber} fuera de horario (local {hora}, estado {estado})");
                                                continue;
                                            }
                                        }
                                    }
                                    var FormatMessage = PersonalizeMessage(campaign.Message, contact);
                                    if (campaign.ShouldShortenUrls || campaign.shortenUrls)
                                    {
                                        FormatMessage = ShortenUrlsIfNeeded(FormatMessage, campaign.ShouldShortenUrls);
                                    }
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
                                        IdBackBone = message.id,
                                        ScheduleId = campaign.ScheduleId,
                                        SentAt = DateTime.Now,
                                        Status = message.status.ToString(),
                                        ResponseMessage = null,
                                        State = estado
                                    });

                                    //var room = ctx.Rooms.FirstOrDefault(r => r.id == campaign.RoomId);
                                    //if (room != null)
                                    //{
                                    //    if (message.status == 1 || message.status == 2)
                                    //    {
                                    //        if (campaign.NumberType == 1)
                                    //            room.short_sms = Math.Max(0, room.short_sms - creditosConsumidos); // no bajar de 0
                                    //        else if (campaign.NumberType == 2)
                                    //            room.long_sms = Math.Max(0, room.long_sms - creditosConsumidos);
                                    //    }
                                    //    if (notif != null)
                                    //    {
                                    //        bool isShort = campaign.NumberType == 1;
                                    //        decimal newBalance = isShort ? Convert.ToDecimal(room.short_sms) : Convert.ToDecimal(room.long_sms);

                                    //        if (newBalance <= notif.AmountValue)
                                    //        {
                                    //            string tipoSms = isShort ? "SMS cortos" : "SMS largos";
                                    //            string mensaje = $"⚠️ La sala {campaign.RoomName} (ID: {campaign.RoomId}) tiene saldo bajo de {tipoSms}: {newBalance} créditos.";

                                    //            var usersToNotify = (from anu in ctx.AmountNotificationUser
                                    //                                 join user in ctx.Users on anu.UserId equals user.Id
                                    //                                 where anu.NotificationId == notif.id
                                    //                                 select user.email).ToList();

                                    //            foreach (var email in usersToNotify)
                                    //            {
                                    //                MailManager.SendEmail(email, $"⚠️ Alerta de saldo bajo en sala {campaign.RoomName}", mensaje);
                                    //            }
                                    //        }
                                    //    }

                                    //}
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

        public static string PersonalizeMessage(string message, Contract.Other.CampaignContact contact)
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

        public List<int> GetCampaignsReadyToSend(string top = "10")
        {
            var campaigns = new List<int>();

            try
            {
                using (var ctx = new Entities())
                {
                    var connection = (SqlConnection)ctx.Database.GetDbConnection();
                    connection.Open();

                    using (var cmd = connection.CreateCommand())
                    {
                        cmd.CommandText = "sp_getCampaignsReadyToSend";
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.Parameters.AddWithValue("@top", top);

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                campaigns.Add(reader.GetInt32(0));
                            }
                        }
                    }

                    connection.Close();
                }

                return campaigns;
            }
            catch (Exception ex)
            {
                _logger.Error("❌ Error en GetCampaignsReadyToSend: " + ex.Message);
                return new List<int>();
            }
        }

        private string ShortenUrlsIfNeeded(string message, bool shouldShorten)
        {
            if (!shouldShorten || string.IsNullOrWhiteSpace(message)) return message;

            var urlRegex = new System.Text.RegularExpressions.Regex(@"\b(?:https?://|www\.)\S+\b", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            var urls = urlRegex.Matches(message).Cast<System.Text.RegularExpressions.Match>().Select(m => m.Value).Distinct();

            foreach (var url in urls)
            {
                var shortened = ShortenUrl(url);
                message = message.Replace(url, shortened);
            }

            return message;
        }

        private string ShortenUrl(string url)
        {
            // Por ahora puedes simularlo así, o llamar una API real tipo Bitly/TinyURL
            return $"https://corta.link/{Guid.NewGuid().ToString().Substring(0, 6)}";
        }


    }
}
