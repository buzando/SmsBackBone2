using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ShortNumberRequestDTO
    {
        public int Quantity { get; set; }
        public int CreditCardId { get; set; }
        public string Email { get; set; }
    }
}
