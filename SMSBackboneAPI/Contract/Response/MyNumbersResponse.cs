using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class MyNumbersResponse
    {
        public int Id { get; set; }

        public int IdClient { get; set; }

        public string Number { get; set; }

        public string Type { get; set; }

        public string Service { get; set; }

        public decimal Cost { get; set; }

        public DateTime NextPaymentDate { get; set; }

        public string State { get; set; }

        public string Municipality { get; set; }
        public string Lada { get; set; }
        public string service { get; set; }
        public string? Estatus { get; set; }
    }
}
