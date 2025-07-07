using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class GetReport
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public List<string>? Campanas { get; set; }
        public List<string>? Usuarios { get; set; }
        public string Tipo { get; set; }
        public string Formato { get; set; }

    }
}
