using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class ReportCleanupSettings
    {
        public bool Enabled { get; set; }
        public int IntervalMinutes { get; set; }
        public int MaxAgeHours { get; set; }
    }
}
