using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class ReporteConsumoDTO
    {
        public DateTime Fecha { get; set; }
        public string Cliente { get; set; }
        public string Servicio { get; set; } = "SMS";
        public decimal Monto { get; set; }
        public long Creditos { get; set; }
        public decimal Consumo { get; set; } 
        public decimal Saldo { get; set; }   
    }
}
