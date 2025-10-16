using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class RoomAdminResponse
    {
        public int IdRoom { get; set; }
        public DateTime? fechaAlta { get; set; }
        public string nombrecliente { get; set; }
        public string nombreSala { get; set; }
        public double creditosGlobales { get; set; }
        public double creditosSmsCortos { get; set; }
        public double creditosSmsLargos { get; set; }
        public bool CanBeDeleted { get; set; }
    }
}
