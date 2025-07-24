using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class SendTestSmsRequest
    {
        public string From { get; set; } 
        public string To { get; set; }   
        public string? Message { get; set; } 
        public int? TemplateId { get; set; }
        public int clientID { get; set; }
    }
}
