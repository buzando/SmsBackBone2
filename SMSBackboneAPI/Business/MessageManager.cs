using Contract.Request;
using Contract.Response;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class MessageManager
    {
        //public bool SendMessage(SendTestSmsRequest smsRequestDto)
        //{
        //    var clientacces = new ClientAccess();
        //    if (string.IsNullOrWhiteSpace(smsRequestDto.To) || string.IsNullOrWhiteSpace(smsRequestDto.From))
        //        return false;

        //    if (string.IsNullOrWhiteSpace(smsRequestDto.Message) && smsRequestDto.TemplateId == null)
        //        return false;

        //    using var context = new Entities();
        //    {
        //        clientacces = context.Client_Access.FirstOrDefault(ca => ca.client_id == smsRequestDto.clientID);

        //        if (clientacces == null)
        //            return false;


        //        try
        //        {
        //            var api = new ApiBackBoneManager();


        //            var loginResponse = api.LoginResponse(clientacces.username, clientacces.password);
        //            if (loginResponse == null || loginResponse.Result.token == null)
        //                return false;

        //            var token = loginResponse.Result.token;


        //            var credits = api.GetOwnCredit(token);

        //            string finalMessage = smsRequestDto.Message;
        //            if (string.IsNullOrWhiteSpace(finalMessage) && smsRequestDto.TemplateId.HasValue)
        //            {
        //                var template = context.Template.FirstOrDefault(t => t.Id == smsRequestDto.TemplateId.Value);
        //                if (template == null)
        //                    return false;

        //                finalMessage = template.Message;
        //            }

        //            // 5. Construir payload y enviar
        //            var smsPayload = new
        //            {
        //                from = smsRequestDto.From,
        //                to = smsRequestDto.To,
        //                message = finalMessage
        //            };

        //            var sendResult = api.SendSms(token, smsPayload);

        //            return new SmsDto
        //            {
        //                Success = sendResult.Success,
        //                Message = sendResult.Success ? "Mensaje enviado correctamente." : sendResult.Message
        //            };
        //        }
        //        catch (Exception ex)
        //        {
        //            return new SmsDto
        //            {
        //                Success = false,
        //                Message = $"Error interno: {ex.Message}"
        //            };
        //        }
        //    }
        //}


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
