using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ReportGlobalResponse
    {
      public List<ReportGlobalResponseList> reportGlobalResponseLists {  get; set; }
        public int TotalCount { get; set; }
        public int TotalXPage { get; set; }
    }

    public class ReportGlobalResponseList
    {
        public DateTime Date { get; set; }
        public string Phone { get; set; }
        public string Room { get; set; }
        public string Campaign { get; set; }
        public int CampaignId { get; set; }
        public string User { get; set; }
        public int MessageId { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public DateTime ReceivedAt { get; set; }
        public string Cost { get; set; }
        public string Type { get; set; }
    }

}
