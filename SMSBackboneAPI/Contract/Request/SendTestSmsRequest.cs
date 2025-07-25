using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class SendTestSmsRequest
    {
        public string? From { get; set; } 
        public List<string> To { get; set; }   
        public string? Message { get; set; } 
        public int? TemplateId { get; set; }
        public int ClientID { get; set; }
        public int UserID { get; set; }
        public bool Concatenate { get; set; }
        public bool Flash { get; set; }
    }
}
