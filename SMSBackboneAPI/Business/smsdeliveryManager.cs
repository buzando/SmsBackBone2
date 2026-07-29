using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Contract;
using Contract.Other;
using Contract.Response;
using log4net;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using Newtonsoft.Json.Linq;

namespace Business
{
    public class smsdeliveryManager
    {
        private static readonly TimeSpan HorarioInicio = new TimeSpan(8, 0, 0);  // 08:00
        private static readonly TimeSpan HorarioFin = new TimeSpan(21, 0, 0);    // 21:00

        private static readonly ILog _logger =
            LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

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

                    if (connection.State != ConnectionState.Open)
                        connection.Open();

                    using (var cmd = new SqlCommand("sp_getPendingContacts", connection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 120;

                        var param = cmd.Parameters.AddWithValue("@CampaignIds", campaignIdsTable);
                        param.SqlDbType = SqlDbType.Structured;
                        param.TypeName = "dbo.IntList";

                        cmd.Parameters.AddWithValue("@TopContacts",
                            string.IsNullOrWhiteSpace(topcontacts)
                                ? (object)DBNull.Value
                                : int.Parse(topcontacts));

                        using (var reader = cmd.ExecuteReader())
                        {
                            int cpOrdinal = TryGetOrdinal(reader, "CP");

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
                                        TemplateId = reader.IsDBNull(reader.GetOrdinal("TemplateId"))
                                            ? null
                                            : reader.GetInt32(reader.GetOrdinal("TemplateId")),
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
                                    Dato = reader.IsDBNull(reader.GetOrdinal("Dato"))
                                        ? null
                                        : reader.GetString(reader.GetOrdinal("Dato")),
                                    DatoId = reader.IsDBNull(reader.GetOrdinal("DatoId"))
                                        ? null
                                        : reader.GetString(reader.GetOrdinal("DatoId")),
                                    Misc01 = reader.IsDBNull(reader.GetOrdinal("Misc01"))
                                        ? null
                                        : reader.GetString(reader.GetOrdinal("Misc01")),
                                    Misc02 = reader.IsDBNull(reader.GetOrdinal("Misc02"))
                                        ? null
                                        : reader.GetString(reader.GetOrdinal("Misc02")),
                                    CP = GetNullableString(reader, cpOrdinal)
                                };

                                campaign.Contacts.Add(contact);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"❌ Error en GetLightCampaigns: {ex.Message}", ex);
            }

            return result;
        }

        public async Task<bool> SimulateSmsDispatch(List<int> Campaigns)
        {
            var clientacces = new ClientAccess();

            try
            {
                var campaigns = GetLightCampaigns(Campaigns);

                campaigns = campaigns
                    .GroupBy(c => c.CampaignId)
                    .Select(g => g.First())
                    .ToList();

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
                                clientacces = ctx.Client_Access
                                    .FirstOrDefault(x => x.client_id == campaign.ClientId);
                            }

                            if (clientacces == null)
                            {
                                _logger.Error($"❌ No se encontró acceso para el cliente con ID {campaign.ClientId} en campaña {campaign.CampaignId}.");
                                return;
                            }

                            var pssw = ClientAccessManager.Decrypt(clientacces.password);
                            var loginResult = await new ApiBackBoneManager().LoginResponse(clientacces.username, pssw);

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
                            var actualrooms = ctx.Rooms.FirstOrDefault(x => x.id == campaign.RoomId);

                            if (notif != null && actualrooms != null)
                            {
                                bool isShort = campaign.NumberType == 1;

                                decimal currentBalance = isShort
                                    ? Convert.ToDecimal(actualrooms.short_sms)
                                    : Convert.ToDecimal(actualrooms.long_sms);

                                if (currentBalance <= notif.AmountValue)
                                {
                                    string tipoSms = isShort ? "SMS cortos" : "SMS largos";
                                    string mensaje = $"⚠️ La sala {campaign.RoomName} tiene saldo bajo de {tipoSms}: {currentBalance} créditos.";

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

                            var sentIds = new HashSet<int>(
                                ctx.CampaignContactScheduleSend
                                   .Where(s => s.CampaignId == campaign.CampaignId
                                            && s.ScheduleId == campaign.ScheduleId)
                                   .Select(s => s.ContactId)
                                   .ToList()
                            );

                            var blacklistids = ctx.blacklistcampains
                                .Where(x => x.idcampains == campaign.CampaignId)
                                .Select(x => x.idblacklist)
                                .ToList();

                            var blacklistedPhones = new HashSet<string>(StringComparer.Ordinal);

                            if (blacklistids != null && blacklistids.Count > 0)
                            {
                                blacklistedPhones = new HashSet<string>(
                                    ctx.BlackList
                                        .Where(bl => blacklistids.Contains(bl.Id))
                                        .Select(bl => bl.phone)
                                        .ToList(),
                                    StringComparer.Ordinal
                                );
                            }

                            var chuncks = int.TryParse(Common.ConfigurationManagerJson("CantidadDeChunks"), out int c)
                                ? c
                                : 50;

                            campaign.Contacts = campaign.Contacts
                                .GroupBy(x => x.Id)
                                .Select(g => g.First())
                                .ToList();

                            campaign.Contacts = campaign.Contacts
                                .GroupBy(x => x.PhoneNumber)
                                .Select(g => g.First())
                                .ToList();

                            var timeZoneCache = new Dictionary<string, TimeZoneResolveResult>();

                            _logger.Info(
                                $"🚀 Iniciando envío campaña {campaign.CampaignId} - {campaign.Name}. " +
                                $"Contactos cargados en memoria: {campaign.Contacts.Count}. " +
                                $"ScheduleId: {campaign.ScheduleId}. QA: {test}"
                            );

                            var chunks = campaign.Contacts.Chunk(chuncks);

                            foreach (var chunk in chunks)
                            {
                                if (!IsWithinSchedule(campaign.StartDateTime, campaign.EndDateTime))
                                {
                                    _logger.Error($"⏰ Fuera del horario para enviar mensajes de la campaña {campaign.Name}");
                                    break;
                                }

                                var messagesToSend = new List<MessageToSend>();
                                var preparedContactIds = new HashSet<int>();

                                var timeZoneByRegistryClient = new Dictionary<string, TimeZoneResolveResult>();

                                int skippedAlreadySent = 0;
                                int skippedDuplicatedInChunk = 0;
                                int skippedNoTimezone = 0;
                                int skippedOutOfSchedule = 0;
                                int blacklistedCount = 0;

                                foreach (var contact in chunk)
                                {
                                    if (sentIds.Contains(contact.Id))
                                    {
                                        skippedAlreadySent++;
                                        continue;
                                    }

                                    if (!preparedContactIds.Add(contact.Id))
                                    {
                                        skippedDuplicatedInChunk++;
                                        continue;
                                    }

                                    string estado = "Desconocido";

                                    if (blacklistedPhones.Count > 0 &&
                                        blacklistedPhones.Contains(contact.PhoneNumber))
                                    {
                                        var zipCode = GetZipCodeFromContact(contact);
                                        var timeZoneResult = ResolveContactTimeZoneCached(
                                            ctx,
                                            timeZoneCache,
                                            zipCode,
                                            contact.PhoneNumber
                                        );

                                        estado = timeZoneResult.State ?? "Desconocido";

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

                                        sentIds.Add(contact.Id);
                                        blacklistedCount++;
                                        continue;
                                    }

                                    var contactZipCode = GetZipCodeFromContact(contact);

                                    var contactTimeZone = ResolveContactTimeZoneCached(
                                        ctx,
                                        timeZoneCache,
                                        contactZipCode,
                                        contact.PhoneNumber
                                    );

                                    if (contactTimeZone.TimeZoneSource == "Unknown" ||
                                        !contactTimeZone.WinterTimeDifference.HasValue)
                                    {
                                        skippedNoTimezone++;
                                        continue;
                                    }

                                    estado = contactTimeZone.State ?? "Desconocido";

                                    var horaLocal = DateTime.UtcNow.AddHours((double)contactTimeZone.WinterTimeDifference.Value);
                                    var hora = horaLocal.TimeOfDay;

                                    if (!IsWithinContactLocalAllowedTime(contactTimeZone, out var horaLocalContacto))
                                    {
                                        skippedOutOfSchedule++;

                                        _logger.Info(
                                            $"⛔ Fuera de horario local. " +
                                            $"Campaña={campaign.CampaignId} | " +
                                            $"ContactoId={contact.Id} | " +
                                            $"Tel={contact.PhoneNumber} | " +
                                            $"CP={contactZipCode ?? "NULL"} | " +
                                            $"Estado={estado} | " +
                                            $"Zona={contactTimeZone.TimeZoneName} | " +
                                            $"OffsetUTC={contactTimeZone.WinterTimeDifference} | " +
                                            $"HoraLocal={horaLocalContacto:yyyy-MM-dd HH:mm:ss} | " +
                                            $"HorarioPermitido={HorarioInicio:hh\\:mm}-{HorarioFin:hh\\:mm}"
                                        );

                                        continue;
                                    }
                                    var FormatMessage = PersonalizeMessage(campaign.Message, contact);

                                    if (campaign.ShouldShortenUrls || campaign.shortenUrls)
                                    {
                                        FormatMessage = ShortenUrlsIfNeeded(FormatMessage, campaign.ShouldShortenUrls);
                                    }

                                    string senderType = campaign.NumberType == 1 ? "shortcode" : "longcode";

                                    int encoding = (campaign.NumberType == 1 && campaign.FlashMessage) ? 1 : 0;

                                    if (campaign.FlashMessage)
                                    {
                                        encoding = 5;
                                    }

                                    var registryClient = contact.Id.ToString();

                                    messagesToSend.Add(new MessageToSend
                                    {
                                        phoneNumber = contact.PhoneNumber,
                                        text = FormatMessage,
                                        registryClient = registryClient,
                                        encoding = encoding,
                                        senderType = senderType
                                    });

                                    timeZoneByRegistryClient[registryClient] = contactTimeZone;
                                }

                                _logger.Info(
                                    $"📦 Chunk campaña {campaign.CampaignId}: " +
                                    $"preparados={messagesToSend.Count}, " +
                                    $"yaEnviados={skippedAlreadySent}, " +
                                    $"duplicadosChunk={skippedDuplicatedInChunk}, " +
                                    $"blacklist={blacklistedCount}, " +
                                    $"sinZona={skippedNoTimezone}, " +
                                    $"fueraHorario={skippedOutOfSchedule}"
                                );

                                if (messagesToSend.Count == 0)
                                {
                                    ctx.SaveChanges();
                                    continue;
                                }

                                List<ApiResponse> sendResult;

                                if (!test)
                                {
                                    sendResult = await new ApiBackBoneManager().SendMessagesAsync(messagesToSend, token);

                                    _logger.Info(
                                        $"✅ [Producción] Campaña {campaign.CampaignId}: enviados reales={sendResult.Count}"
                                    );
                                }
                                else
                                {
                                    var rand = new Random();

                                    sendResult = messagesToSend.Select(msg => new ApiResponse
                                    {
                                        phoneNumber = msg.phoneNumber,
                                        status = rand.Next(0, 6),
                                        registryClient = msg.registryClient
                                    }).ToList();

                                    _logger.Info(
                                        $"🧪 [Test] Campaña {campaign.CampaignId}: simulados={sendResult.Count}"
                                    );
                                }

                                double creditosConsumidos = 0;

                                foreach (var message in sendResult)
                                {
                                    timeZoneByRegistryClient.TryGetValue(message.registryClient, out var timeZoneResult);

                                    string estado = timeZoneResult?.State ?? "Desconocido";

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

                                    if (actualrooms != null)
                                    {
                                        if (message.status == 1 || message.status == 2)
                                        {
                                            if (campaign.NumberType == 1)
                                                actualrooms.short_sms = Math.Max(0, actualrooms.short_sms - creditosConsumidos);
                                            else if (campaign.NumberType == 2)
                                                actualrooms.long_sms = Math.Max(0, actualrooms.long_sms - creditosConsumidos);
                                        }

                                        if (notif != null)
                                        {
                                            bool isShort = campaign.NumberType == 1;

                                            decimal newBalance = isShort
                                                ? Convert.ToDecimal(actualrooms.short_sms)
                                                : Convert.ToDecimal(actualrooms.long_sms);

                                            if (newBalance <= notif.AmountValue)
                                            {
                                                string tipoSms = isShort ? "SMS cortos" : "SMS largos";
                                                string mensaje = $"⚠️ La sala {campaign.RoomName} (ID: {campaign.RoomId}) tiene saldo bajo de {tipoSms}: {newBalance} créditos.";

                                                var usersToNotify = (from anu in ctx.AmountNotificationUser
                                                                     join user in ctx.Users on anu.UserId equals user.Id
                                                                     where anu.NotificationId == notif.id
                                                                     select user.email).ToList();

                                                foreach (var email in usersToNotify)
                                                {
                                                    MailManager.SendEmail(email, $"⚠️ Alerta de saldo bajo en sala {campaign.RoomName}", mensaje);
                                                }
                                            }
                                        }
                                    }

                                    sentIds.Add(int.Parse(message.registryClient));
                                }

                                ctx.SaveChanges();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.Error($"❌ Error en campaña ID {campaign.CampaignId}: {ex.Message}", ex);
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
                _logger.Error($"❌ Error general en SimulateSmsDispatch: {ex.Message}", ex);
                return false;
            }
        }

        private bool IsWithinSchedule(DateTime startDateTime, DateTime endDateTime)
        {
            var now = DateTime.Now;
            return now >= startDateTime && now <= endDateTime;
        }

        public static string PersonalizeMessage(string message, CampaignContact contact)
        {
            if (string.IsNullOrWhiteSpace(message))
                return string.Empty;

            message = message.Replace("{{Dato}}", contact.Dato ?? "");
            message = message.Replace("{{DatoId}}", contact.DatoId ?? "");

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

                        message = message.Replace($"{{{key}}}", value + " ");
                    }
                }
            }

            message = message
                .Replace('\u00A0', ' ')
                .Replace('\u2007', ' ')
                .Replace('\u202F', ' ');

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

                    if (connection.State != ConnectionState.Open)
                        connection.Open();

                    using (var cmd = connection.CreateCommand())
                    {
                        cmd.CommandText = "sp_getCampaignsReadyToSend";
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 120;
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
                _logger.Error("❌ Error en GetCampaignsReadyToSend: " + ex.Message, ex);
                return new List<int>();
            }
        }

        private string ShortenUrlsIfNeeded(string message, bool shouldShorten)
        {
            if (!shouldShorten || string.IsNullOrWhiteSpace(message))
                return message;

            var urlRegex = new System.Text.RegularExpressions.Regex(
                @"\b(?:https?://|www\.)\S+\b",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );

            var urls = urlRegex
                .Matches(message)
                .Cast<System.Text.RegularExpressions.Match>()
                .Select(m => m.Value)
                .Distinct();

            foreach (var url in urls)
            {
                var shortened = ShortenUrl(url);
                message = message.Replace(url, shortened);
            }

            return message;
        }

        private string ShortenUrl(string url)
        {
            return $"https://corta.link/{Guid.NewGuid().ToString().Substring(0, 6)}";
        }

        public async Task<bool> UpdateSmsStatusesByClient()
        {
            try
            {
                using var ctx = new Entities();

                var clientsWithPending = (
                    from s in ctx.CampaignContactScheduleSend
                    join c in ctx.Campaigns on s.CampaignId equals c.Id
                    join r in ctx.Rooms on c.RoomId equals r.id
                    join ru in ctx.roomsbyuser on r.id equals ru.idRoom
                    join u in ctx.Users on ru.idUser equals u.Id
                    join cli in ctx.clients on u.IdCliente equals cli.id
                    where s.Status == "0"
                          && s.IdBackBone != null
                          && s.IdBackBone != ""
                    select cli.id
                )
                .Distinct()
                .ToList();

                if (!clientsWithPending.Any())
                {
                    _logger.Info("✅ No hay mensajes pendientes por cliente.");
                    return true;
                }

                foreach (var clientId in clientsWithPending)
                {
                    var access = ctx.Client_Access.FirstOrDefault(a => a.client_id == clientId);

                    if (access == null)
                    {
                        _logger.Warn($"⚠️ Cliente {clientId} no tiene credenciales Backbone.");
                        continue;
                    }

                    var pssw = ClientAccessManager.Decrypt(access.password);
                    var login = await new ApiBackBoneManager().LoginResponse(access.username, pssw);

                    if (login == null)
                    {
                        _logger.Error($"❌ No se pudo autenticar el cliente {clientId} en Backbone.");
                        continue;
                    }

                    var pending = (
                        from s in ctx.CampaignContactScheduleSend
                        join c in ctx.Campaigns on s.CampaignId equals c.Id
                        join r in ctx.Rooms on c.RoomId equals r.id
                        join ru in ctx.roomsbyuser on r.id equals ru.idRoom
                        join u in ctx.Users on ru.idUser equals u.Id
                        join cli in ctx.clients on u.IdCliente equals cli.id
                        where cli.id == clientId
                              && s.Status == "0"
                              && s.IdBackBone != null
                              && s.IdBackBone != ""
                        select new
                        {
                            s.Id,
                            s.IdBackBone,
                            s.SentAt,
                            CampaignId = c.Id,
                            RoomId = r.id,
                            NumberType = c.NumberType
                        }
                    )
                    .AsNoTracking()
                    .ToList();

                    pending = pending
                        .GroupBy(x => x.Id)
                        .Select(g => g.First())
                        .ToList();

                    if (!pending.Any())
                        continue;

                    _logger.Info($"🔄 Cliente {clientId} - {pending.Count} mensajes pendientes para verificar.");

                    var api = new ApiBackBoneManager();

                    foreach (var msg in pending)
                    {
                        try
                        {
                            var st = await api.GetMessageStatusAsync(login.token, msg.IdBackBone);

                            if (st == null)
                                continue;

                            var record = ctx.CampaignContactScheduleSend
                                .FirstOrDefault(x => x.Id == msg.Id);

                            if (record == null)
                                continue;

                            var oldStatus = record.Status;
                            var newStatus = st.status.ToString();

                            // Siempre actualiza estatus
                            record.Status = newStatus;

                            DescontarCreditoRoom(
                                ctx,
                                msg.RoomId,
                                msg.NumberType,
                                oldStatus,
                                newStatus,
                                msg.IdBackBone,
                                msg.Id,
                                "CampaignContactScheduleSend"
                            );
                        }
                        catch (Exception ex)
                        {
                            _logger.Error($"❌ Error verificando estado para mensaje {msg.IdBackBone}: {ex.Message}", ex);
                        }
                    }

                    await ctx.SaveChangesAsync();
                    _logger.Info($"✅ Cliente {clientId} actualizado correctamente.");
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.Error($"❌ Error general en UpdateSmsStatusesByClient: {ex.Message}", ex);
                return false;
            }
        }

        public async Task<bool> UpdateTestSmsStatusesByClient()
        {
            try
            {
                using var ctx = new Entities();

                var clientsWithPending = (
                    from t in ctx.TestMessage
                    join u in ctx.Users on t.UserId equals u.Id
                    join cli in ctx.clients on u.IdCliente equals cli.id
                    where t.Status == "0" && t.IdBackBone != null && t.IdBackBone != ""
                    select cli.id
                )
                .Distinct()
                .ToList();

                if (!clientsWithPending.Any())
                {
                    _logger.Info("✅ No hay TestMessage pendientes por cliente.");
                    return true;
                }

                foreach (var clientId in clientsWithPending)
                {
                    var access = ctx.Client_Access.FirstOrDefault(a => a.client_id == clientId);

                    if (access == null)
                    {
                        _logger.Warn($"⚠️ Cliente {clientId} no tiene credenciales Backbone para TestMessage.");
                        continue;
                    }

                    var pssw = ClientAccessManager.Decrypt(access.password);
                    var login = await new ApiBackBoneManager().LoginResponse(access.username, pssw);

                    if (login == null)
                    {
                        _logger.Error($"❌ No se pudo autenticar el cliente {clientId} en Backbone (TestMessage).");
                        continue;
                    }

                    var pending = (
                        from t in ctx.TestMessage
                        join u in ctx.Users on t.UserId equals u.Id
                        join cli in ctx.clients on u.IdCliente equals cli.id
                        where cli.id == clientId
                              && t.Status == "0"
                              && t.IdBackBone != null
                              && t.IdBackBone != ""
                        select new { t.Id, t.IdBackBone }
                    )
                    .AsNoTracking()
                    .ToList();

                    if (!pending.Any())
                        continue;

                    _logger.Info($"🔄 (TestMessage) Cliente {clientId} - {pending.Count} mensajes pendientes para verificar.");

                    var api = new ApiBackBoneManager();

                    foreach (var msg in pending)
                    {
                        try
                        {
                            var st = await api.GetMessageStatusAsync(login.token, msg.IdBackBone);

                            if (st == null)
                                continue;

                            var record = ctx.TestMessage.FirstOrDefault(x => x.Id == msg.Id);

                            if (record != null)
                            {
                                record.Status = st.status.ToString();
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.Error($"❌ Error verificando estado (TestMessage) {msg.IdBackBone}: {ex.Message}", ex);
                        }
                    }

                    await ctx.SaveChangesAsync();
                    _logger.Info($"✅ (TestMessage) Cliente {clientId} actualizado correctamente.");
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.Error($"❌ Error general en UpdateTestSmsStatusesByClient: {ex.Message}", ex);
                return false;
            }
        }

        private void DescontarCreditoRoom(
     Entities ctx,
     int roomId,
     int numberType,
     string oldStatus,
     string newStatus,
     string backboneId,
     int messageId,
     string origen)
        {
            var yaEraCobrable = oldStatus == "1" || oldStatus == "2";
            var ahoraEsCobrable = newStatus == "1" || newStatus == "2";

            if (yaEraCobrable || !ahoraEsCobrable)
                return;

            var room = ctx.Rooms.FirstOrDefault(x => x.id == roomId);

            if (room == null)
            {
                _logger.Warn(
                    $"⚠️ No se encontró RoomId={roomId} para descontar crédito. " +
                    $"Origen={origen}, MessageId={messageId}, BackboneId={backboneId}"
                );
                return;
            }

            const double creditosConsumidos = 1;

            if (numberType == 1)
            {
                var saldoAnterior = room.short_sms;
                room.short_sms = Math.Max(0, room.short_sms - creditosConsumidos);

                _logger.Info(
                    $"💰 Crédito corto descontado. " +
                    $"Origen={origen}, MessageId={messageId}, BackboneId={backboneId}, " +
                    $"RoomId={roomId}, StatusAnterior={oldStatus}, StatusNuevo={newStatus}, " +
                    $"SaldoAnterior={saldoAnterior}, SaldoNuevo={room.short_sms}"
                );
            }
            else if (numberType == 2)
            {
                var saldoAnterior = room.long_sms;
                room.long_sms = Math.Max(0, room.long_sms - creditosConsumidos);

                _logger.Info(
                    $"💰 Crédito largo descontado. " +
                    $"Origen={origen}, MessageId={messageId}, BackboneId={backboneId}, " +
                    $"RoomId={roomId}, StatusAnterior={oldStatus}, StatusNuevo={newStatus}, " +
                    $"SaldoAnterior={saldoAnterior}, SaldoNuevo={room.long_sms}"
                );
            }
            else
            {
                _logger.Warn(
                    $"⚠️ NumberType no reconocido para descontar crédito. " +
                    $"Origen={origen}, MessageId={messageId}, BackboneId={backboneId}, " +
                    $"RoomId={roomId}, NumberType={numberType}"
                );
            }
        }


        private string GetZipCodeFromContact(CampaignContact contact)
        {
            return NormalizeZipCode(contact.CP);
        }

        private string NormalizeZipCode(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var digits = new string(value.Trim().Where(char.IsDigit).ToArray());

            if (digits.Length == 4)
                digits = digits.PadLeft(5, '0');

            return digits.Length == 5 ? digits : null;
        }

        private TimeZoneResolveResult ResolveContactTimeZoneCached(
            Entities ctx,
            Dictionary<string, TimeZoneResolveResult> cache,
            string zipCode,
            string phone)
        {
            var normalizedZipCode = NormalizeZipCode(zipCode);

            string key;

            if (!string.IsNullOrWhiteSpace(normalizedZipCode))
            {
                key = $"CP:{normalizedZipCode}";
            }
            else
            {
                key = $"PHONE:{phone}";
            }

            if (cache.TryGetValue(key, out var cached))
                return cached;

            var result = ResolveContactTimeZone(ctx, normalizedZipCode, phone);

            cache[key] = result;

            return result;
        }

        private TimeZoneResolveResult ResolveContactTimeZone(Entities ctx, string zipCode, string phone)
        {
            var connection = (SqlConnection)ctx.Database.GetDbConnection();

            if (connection.State != ConnectionState.Open)
                connection.Open();

            using (var cmd = new SqlCommand("dbo.spResolveContactTimeZone", connection))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 60;

                cmd.Parameters.AddWithValue("@ZipCode",
                    string.IsNullOrWhiteSpace(zipCode)
                        ? (object)DBNull.Value
                        : zipCode.Trim());

                cmd.Parameters.AddWithValue("@Phone",
                    string.IsNullOrWhiteSpace(phone)
                        ? (object)DBNull.Value
                        : phone.Trim());

                using (var reader = cmd.ExecuteReader())
                {
                    if (!reader.Read())
                    {
                        return new TimeZoneResolveResult
                        {
                            TimeZoneSource = "Unknown"
                        };
                    }

                    return new TimeZoneResolveResult
                    {
                        ZipCode = reader["ZipCode"] == DBNull.Value ? null : reader["ZipCode"].ToString(),
                        State = reader["State"] == DBNull.Value ? null : reader["State"].ToString(),
                        Municipality = reader["Municipality"] == DBNull.Value ? null : reader["Municipality"].ToString(),
                        Location = reader["Location"] == DBNull.Value ? null : reader["Location"].ToString(),
                        Description = reader["Description"] == DBNull.Value ? null : reader["Description"].ToString(),

                        WinterTimeDifference = reader["WinterTimeDifference"] == DBNull.Value
                            ? null
                            : Convert.ToDecimal(reader["WinterTimeDifference"]),

                        TimeZoneId = reader["tz_id"] == DBNull.Value
                            ? null
                            : Convert.ToInt32(reader["tz_id"]),

                        TimeZoneName = reader["tz_name"] == DBNull.Value
                            ? null
                            : reader["tz_name"].ToString(),

                        TimeZoneSource = reader["TimeZoneSource"] == DBNull.Value
                            ? "Unknown"
                            : reader["TimeZoneSource"].ToString()
                    };
                }
            }
        }

        private int TryGetOrdinal(SqlDataReader reader, string columnName)
        {
            try
            {
                return reader.GetOrdinal(columnName);
            }
            catch
            {
                return -1;
            }
        }

        private string GetNullableString(SqlDataReader reader, int ordinal)
        {
            if (ordinal < 0)
                return null;

            if (reader.IsDBNull(ordinal))
                return null;

            return reader.GetString(ordinal);
        }
        private bool IsWithinContactLocalAllowedTime(TimeZoneResolveResult timeZoneResult, out DateTime horaLocal)
        {
            horaLocal = DateTime.MinValue;

            if (timeZoneResult == null || !timeZoneResult.WinterTimeDifference.HasValue)
                return false;

            // WinterTimeDifference debe ser offset contra UTC.
            // Ejemplo:
            // CDMX UTC-6 => DateTime.UtcNow.AddHours(-6)
            // Zona 2 horas adelante de CDMX => UTC-4
            horaLocal = DateTime.UtcNow.AddHours((double)timeZoneResult.WinterTimeDifference.Value);

            var hora = horaLocal.TimeOfDay;

            return hora >= HorarioInicio && hora <= HorarioFin;
        }
    }
}