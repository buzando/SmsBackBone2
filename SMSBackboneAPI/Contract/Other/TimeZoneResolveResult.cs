using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class TimeZoneResolveResult
    {
        public string ZipCode { get; set; }
        public string State { get; set; }          // CMX, JAL, AGU, etc.
        public string Municipality { get; set; }   // GUADALAJARA, CUAUHTEMOC, etc.
        public string Location { get; set; }       // población/localidad
        public decimal? WinterTimeDifference { get; set; }
        public int? TimeZoneId { get; set; }
        public string TimeZoneName { get; set; }
        public string TimeZoneSource { get; set; } = "Unknown";
        public string Description { get; set; }
    }
}
