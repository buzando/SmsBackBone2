using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ExternalSendSmsRequest
    {
        public string Email { get; set; }
        public string RoomName { get; set; }
        public string SmsType { get; set; } // short | long
        public List<string> To { get; set; }
        public string Message { get; set; }
    }

}
