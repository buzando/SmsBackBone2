using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ChargeNumbersComplete
    {
        public int RegistrosCargados { get; set; }
        public int RegistrosFallidos { get; set; }
        public int TelefonosCargados { get; set; }
        public int TelefonosFallidos { get; set; }
    }
}
