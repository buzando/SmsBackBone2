using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        [ForeignKey("CreditCard")]
        public int? CreditCardId { get; set; }

        [MaxLength(1000)]
        public string NotificationEmails { get; set; }

        public bool SentSuccessfully { get; set; } = false;

        public DateTime? SentAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Nuevos campos para facturación y pago
        [MaxLength(20)]
        public string PaymentStatus { get; set; }

        [MaxLength(100)]
        public string PaymentTransactionId { get; set; }

        public bool AutoInvoice { get; set; } = false;

        [MaxLength(255)]
        public string InvoiceXml { get; set; }

        [MaxLength(255)]
        public string InvoicePdf { get; set; }

        public DateTime? InvoiceDate { get; set; }

        public decimal TotalAmount { get; set; }
    }

}
