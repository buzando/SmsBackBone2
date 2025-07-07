using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class CreditHystoric
    {
        public int id { get; set; }
        public decimal quantityMoney { get; set; }
        public string Client { get; set; }
        public DateTime RechargeDate { get; set; }
        public string PaymentMethod { get; set; }
        public string Estatus { get; set; }

    }
}
