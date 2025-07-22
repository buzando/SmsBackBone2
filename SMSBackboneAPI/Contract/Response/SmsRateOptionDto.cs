using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class SmsRateOptionDto
    {
        public string SmsType { get; set; } 
        public string Quantity { get; set; } 
        public decimal DisplayPrice { get; set; }
    }
}
