using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ReportsAdminRequest
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int TipoReporte { get; set; }
        public int Page {  get; set; }
        public List<int>? ClientIds { get; set; }
    }
}
