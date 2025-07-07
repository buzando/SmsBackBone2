using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class CreditRechargeOpenPay
    {
        public int Id { get; set; }
        public string idopenpay { get; set; }
        public int? IdCreditRecharge { get; set; } // puede ser null
        public string ChargeId { get; set; } = string.Empty;
        public string? BankAuthorization { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public string? CardId { get; set; }
        public string? CustomerId { get; set; }
        public bool Conciliated { get; set; }
        public string? Description { get; set; }
    }

}
