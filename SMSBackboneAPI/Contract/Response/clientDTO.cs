using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class clientDTO
    {
        public int id { get; set; }
        public string nombrecliente { get; set; }
        public DateTime CreationDate { get; set; }
        public decimal RateForShort { get; set; }
        public decimal RateForLong { get; set; }
        public int Estatus { get; set; }
        public byte ShortRateType { get; set; } 
        public byte LongRateType { get; set; }

        public string? ShortRateQty { get; set; } 
        public string? LongRateQty { get; set; }  
    }
}
