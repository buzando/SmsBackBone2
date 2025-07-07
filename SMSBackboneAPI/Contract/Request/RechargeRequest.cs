using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class RechargeRequest
    {
        public int IdUser { get; set; }
        public int ClientId { get; set; }
        public string SmsType { get; set; } 
        public List<string> Rooms { get; set; } 
        public decimal Rate { get; set; }
        public int Amount { get; set; }
        public decimal Total { get; set; } 
        public string PaymentType { get; set; } 
        public DateTime BillingDate { get; set; } 

    }
}
