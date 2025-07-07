using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class CreditRechargeRequest
    {
        public int IdCreditCard { get; set; }

        public int IdUser { get; set; }
        public string Chanel { get; set; }

        public long QuantityCredits { get; set; }

        public decimal QuantityMoney { get; set; }
        public bool AutomaticInvoice { get; set; }
        public string room { get; set; }
 

    }
}
