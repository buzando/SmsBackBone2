using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class QuickMessage
    {
        public List<string> To { get; set; } = new();

        public string? From { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsConcatenated { get; set; }

        public bool IsFlash { get; set; }

        public int? UserID { get; set; }

        public int? ClientID { get; set; }
    }
}
