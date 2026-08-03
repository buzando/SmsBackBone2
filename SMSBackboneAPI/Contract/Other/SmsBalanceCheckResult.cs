using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class SmsBalanceCheckResult
    {
        public int ClientesRevisados { get; set; }

        public int ConciliacionesOk { get; set; }

        public int ConciliacionesOmitidas { get; set; }

        public int AjustesAplicados { get; set; }

        public int AjustesSms { get; set; }

        public int AjustesAdministrativos { get; set; }

        public int ForzadosCero { get; set; }

        public int Errores { get; set; }
    }
}
