using Azure.Identity;
using Contract.Other;
using Contract.Request;
using Contract.Response;
using Contract.WebHooks;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class MessageManager
    {
        public bool SendMessage(SendTestSmsRequest smsRequestDto)
        {
            var clientacces = new ClientAccess();

            if (smsRequestDto.To == null || smsRequestDto.To.Count == 0)
                return false;

            if (string.IsNullOrWhiteSpace(smsRequestDto.Message) && smsRequestDto.TemplateId == null)
                return false;

            // Validar SmsType
            var isShort = string.Equals(smsRequestDto.SmsType, "short", StringComparison.OrdinalIgnoreCase);
            var senderType = isShort ? "shortcode" : "longcode";
            var encoding = (isShort && smsRequestDto.Flash) ? 1 : 0; // igual que en campañas :contentReference[oaicite:1]{index=1}

            using var context = new Entities();
            {
                clientacces = context.Client_Access.FirstOrDefault(ca => ca.client_id == smsRequestDto.ClientID);
                if (clientacces == null)
                    return false;

                try
                {
                    var api = new ApiBackBoneManager();

                    var pssw = ClientAccessManager.Decrypt(clientacces.password);
                    var loginResponse = api.LoginResponse(clientacces.username, pssw);
                    if (loginResponse == null || loginResponse.Result.token == null)
                        return false;

                    var token = loginResponse.Result.token;

                    var credits = api.GetOwnCredit(token).GetAwaiter().GetResult();
                    int id = JObject.Parse(credits)["credit"].Value<int>();
                    if (id == 0)
                        return false;

                    string finalMessage = smsRequestDto.Message;
                    if (string.IsNullOrWhiteSpace(finalMessage) && smsRequestDto.TemplateId.HasValue)
                    {
                        var template = context.Template.FirstOrDefault(t => t.Id == smsRequestDto.TemplateId.Value);
                        if (template == null)
                            return false;

                        finalMessage = template.Message;
                    }

                    var messagesToSend = smsRequestDto.To.Select(to => new MessageToSend
                    {
                        text = finalMessage,
                        phoneNumber = to,
                        registryClient = "",   
                        encoding = encoding,    
                        senderType = senderType 
                    }).ToList();

                    // Enviar (un destinatario o varios usan el mismo camino)
                    var sendResults = api.SendMessagesAsync(messagesToSend, token).GetAwaiter().GetResult();

                    // Registrar en TestMessage
                    foreach (var result in sendResults)
                    {
                        var testMessage = new Modal.Model.Model.TestMessage
                        {
                            CreatedAt = DateTime.Now,
                            // Antes venía From del front; ahora guardamos el tipo seleccionado
                            FromNumber = senderType,
                            Message = finalMessage,
                            Status = result.status.ToString(),
                            TemplateId = smsRequestDto.TemplateId,
                            ToNumber = result.phoneNumber,
                            UserId = smsRequestDto.UserID,
                            IdBackBone = result.id
                        };

                        context.TestMessage.Add(testMessage);
                    }

                    context.SaveChanges();
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }
            }
        }



        public List<SmsDto> SendListMessage(List<SmsRequestDto> smsRequestDto)
        {
            //Proceso lista SMS
            var list = new List<SmsDto>();

            foreach (var sms in smsRequestDto)
            {
                list.Add(new SmsDto
                {
                    id = "1",
                    phoneNumber = sms.phoneNumber,
                    text = sms.text,
                    registryClient = sms.registryClient,
                    status = 0
                });
            }

            return list;

        }

        public SmsDto GetMessage(string id)
        {
            //Proceso SMS

            return new SmsDto
            {
                id = "1",
                phoneNumber = "5541021548",
                text = "Hola Mundo",
                registryClient = "0001",
                status = 0
            };

        }

        public async Task<bool> ProcessStatusAsync(WebhookStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Id))
                return false;

            using var ctx = new Entities();

            var send = await ctx.CampaignContactScheduleSend
                                .FirstOrDefaultAsync(s => s.IdBackBone == dto.Id);

            if (send == null)
            {
                var test = await ctx.TestMessage.FirstOrDefaultAsync(t => t.IdBackBone == dto.Id);
                if (test != null)
                {
                    test.Status = dto.Status.ToString(); // tu TestMessage usa string; déjalo igual
                    await ctx.SaveChangesAsync();
                    return true;
                }
                return false;
            }

            send.Status = dto.Status.ToString();                 
     

            if (dto.IsCharged)
            {
                var campaign = await ctx.Campaigns.FirstOrDefaultAsync(c => c.Id == send.CampaignId);
                if (campaign != null)
                {
                    var room = await ctx.Rooms.FirstOrDefaultAsync(r => r.id == campaign.RoomId);
                    if (room != null)
                    {
                        if (campaign.NumberType == 1)
                            room.short_sms = Math.Max(0, room.short_sms - 1);
                        else if (campaign.NumberType == 2)
                            room.long_sms = Math.Max(0, room.long_sms - 1);
                    }
                }
            }

            await ctx.SaveChangesAsync();
            return true;
        }
        public async Task<bool> ProcessResponseAsync(WebhookResponseDto dto)
        {
            if (dto == null)
                return false;

            using var ctx = new Entities();

            var send = await ctx.CampaignContactScheduleSend
                                .FirstOrDefaultAsync(s => s.IdBackBone == dto.UserRef);

            if (send == null)
            {
                var test = await ctx.TestMessage.FirstOrDefaultAsync(t => t.IdBackBone == dto.UserRef);
                if (test != null)
                {
                    test.ResponseMessage = dto.Text; 
                    await ctx.SaveChangesAsync();
                    return true;
                }
                return false;
            }

            send.ResponseMessage = dto.Text;
            await ctx.SaveChangesAsync();

            return true;
        }

    }
}
