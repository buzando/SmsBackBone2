using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;
namespace Modal.Model.Model
{
    public class CreditRecharge
    {
        [Key]
        public int Id { get; set; }

        public int? idCreditCard { get; set; }
        //public virtual creditcards CreditCard { get; set; }

        public int idUser { get; set; }
        //public virtual Users User { get; set; }

        public string Chanel { get; set; }

        public long quantityCredits { get; set; }

        public decimal quantityMoney { get; set; }

        public DateTime RechargeDate { get; set; }

        public string Estatus { get; set; }
        public bool AutomaticInvoice { get; set; }

        public string? EstatusError { get; set; }
        public string? Invoice { get; set; }
    }
}
