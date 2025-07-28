using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class LongNumberRequestDTO
    {
        public int Quantity { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string Municipio { get; set; } = string.Empty;
        public int CreditCardId { get; set; }
    }
}
