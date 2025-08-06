using Azure.Identity;
using Contract.Other;
using Contract.Request;
using Contract.Response;
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
            if (smsRequestDto.To.Count == 0)
                return false;

            if (string.IsNullOrWhiteSpace(smsRequestDto.Message) && smsRequestDto.TemplateId == null)
                return false;

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


                    var credits = api.GetOwnCredit(token).GetAwaiter()
                                .GetResult(); ;
                    int id = JObject.Parse(credits)["credit"].Value<int>();
                    if (id == 0)
                    {
                        return false;
                    }
                    string finalMessage = smsRequestDto.Message;
                    if (string.IsNullOrWhiteSpace(finalMessage) && smsRequestDto.TemplateId.HasValue)
                    {
                        var template = context.Template.FirstOrDefault(t => t.Id == smsRequestDto.TemplateId.Value);
                        if (template == null)
                            return false;

                        finalMessage = template.Message;
                    }

                    var smsPayload = new
                    {
                        from = smsRequestDto.From,
                        to = smsRequestDto.To,
                        message = finalMessage
                    };

                    if (smsRequestDto.To.Count() == 1)
                    {
                        var sendResult = api.SendTestMessage(smsRequestDto.To[0], finalMessage, loginResponse.Result).GetAwaiter()
                                .GetResult();

                        var testmessage = new Modal.Model.Model.TestMessage
                        {
                            CreatedAt = DateTime.Now,
                            FromNumber = smsRequestDto.From,
                            Message = finalMessage,
                            Status = sendResult.status.ToString(),
                            TemplateId = smsRequestDto.TemplateId,
                            ToNumber = smsRequestDto.To[0],
                            UserId = smsRequestDto.UserID,
                            IdBackBone = sendResult.id
                        };

                        context.TestMessage.Add(testmessage);
                        context.SaveChanges();
                    }
                    else
                    {
                        var messageList = smsRequestDto.To.Select(to => new MessageToSend
                        {
                            text = finalMessage,
                            phoneNumber = to,
                            registryClient = ""
                        }).ToList();

                        var sendResults = api.SendMessagesAsync(messageList, loginResponse.Result.token).GetAwaiter()
                                .GetResult(); ; ;

                        foreach (var result in sendResults)
                        {
                            var testMessage = new Modal.Model.Model.TestMessage
                            {
                                CreatedAt = DateTime.Now,
                                FromNumber = smsRequestDto.From,
                                Message = result.text,
                                Status = result.status.ToString(),
                                TemplateId = smsRequestDto.TemplateId,
                                ToNumber = result.phoneNumber,
                                UserId = smsRequestDto.UserID,
                                IdBackBone = result.id
                                
                            };

                            context.TestMessage.Add(testMessage);
                        }

                        context.SaveChanges();
                    }

                        return true;
                }
                catch (Exception ex)
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
    }
}
