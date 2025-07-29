using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class NumberRequestDTO
    {
        public string Type { get; set; }
        public int Quantity { get; set; }
        public int CreditCardId { get; set; }
        public string Email { get; set; }
        public string DeviceSessionId { get; set; }
        public bool AutomaticInvoice { get; set; }
        public string? State { get; set; }
        public string? Municipality { get; set; }
        public string? Lada { get; set; }
    }
}
