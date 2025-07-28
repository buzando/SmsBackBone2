using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class ShortNumberRequest
    {
        [Key]
        public int Id { get; set; }

        public int Quantity { get; set; }

        public decimal SetupCost { get; set; }

        public decimal MonthlyCost { get; set; }

        public int CreditCardId { get; set; }

        [MaxLength(1000)]
        public string SentToEmails { get; set; }

        public bool WasSentSuccessfully { get; set; }

        public DateTime RequestDate { get; set; }
    }
}
