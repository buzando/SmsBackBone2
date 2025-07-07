using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model
{
    public class clients
    {
        [Key]
        public int id { get; set; }
        public string nombrecliente { get; set; }
        public DateTime CreationDate { get; set; }
        public decimal RateForShort { get; set; }
        public decimal RateForLong { get; set; }
        public byte Estatus { get; set; }
        public byte ShortRateType { get; set; } 
        public byte LongRateType { get; set; }

        public string? ShortRateQty { get; set; } 
        public string? LongRateQty { get; set; } 
        public DateTime? DeactivationDate { get; set; }

    }
}
