using Contract.Request;
using Contract.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class MessageManager
    {
        public SmsDto SendMessage(SmsRequestDto smsRequestDto)
        {
            //Proceso SMS

            return new SmsDto
            {
                id = "1",
                phoneNumber = smsRequestDto.phoneNumber,
                text = smsRequestDto.text,
                registryClient = smsRequestDto.registryClient,
                status = 0
            };

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
