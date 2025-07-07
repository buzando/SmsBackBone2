using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class AmountNotificationRequest
    {
        public bool? ShortSms { get; set; }
        public bool? LongSms { get; set; }
        public bool? Call { get; set; }

        [Column("AmountNotification", TypeName = "decimal(10,2)")]
        public decimal? AmountValue { get; set; }

        public bool? AutoRecharge { get; set; }

        public decimal? AutoRechargeAmountNotification { get; set; }
        public decimal? AutoRechargeAmount { get; set; }

        public int? IdCreditCard { get; set; }
        public List<string> Users { get; set; }
        public int? IdRoom { get; set; }
        public int? Id { get; set; }
    }
}
