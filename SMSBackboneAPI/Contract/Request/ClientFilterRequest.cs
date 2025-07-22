using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ClientFilterRequest
    {
        public int Page { get; set; }
        public string? ClienteIds { get; set; }
        public string? Estatus { get; set; }
        public string? SearchTerm { get; set; }
    }
}
