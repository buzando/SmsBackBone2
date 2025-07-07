using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class UseResponse
    {
        public decimal CreditsUsed { get; set; }
        public int MessagesSent { get; set; }
        public decimal TotalRecharges { get; set; }

        public LastRechargeInfo LastRecharge { get; set; }

        public List<ChartDataPoint> ChartData { get; set; }
    }

    public class LastRechargeInfo
    {
        public decimal Credits { get; set; }
        public string Date { get; set; }
    }

    public class ChartDataPoint
    {
        public string Date { get; set; }
        public decimal Value { get; set; }
    }

}
