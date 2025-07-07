using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class AmountNotification
    {
        [Key]
        public int id { get; set; }

        public bool? short_sms { get; set; }
        public bool? long_sms { get; set; }
        public bool? call { get; set; }

        [Column("AmountNotification", TypeName = "decimal(10,2)")]
        public decimal AmountValue { get; set; }

        public bool? AutoRecharge { get; set; }

        public decimal? AutoRechargeAmountNotification { get; set; }
        public decimal? AutoRechargeAmount { get; set; }

        public int? IdCreditCard { get; set; }

        public int? IdRoom { get; set; }
    }
}
