using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class ReporteFacturacionDTO
    {
        public DateTime FechaFacturacion { get; set; }
        public string Cliente { get; set; }
        public string Concepto { get; set; }
        public string RazonSocial { get; set; }
        public DateTime FechaRecarga { get; set; }
        public int FolioFactura { get; set; }
        public decimal Subtotal { get; set; }
        public decimal IVA { get; set; }
        public decimal Total { get; set; }
    }
}
