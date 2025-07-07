using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class ReporteConsumoSistemaDto
    {
        public DateTime Fecha { get; set; }
        public string Cliente { get; set; }
        public int MensajesEnviados { get; set; }
        public string ConceptoEnvio { get; set; }
    }
}
