using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;

namespace Contract.Response
{
    public class CampaignKPIResponse
    {
        public int ActiveCampaigns { get; set; }
        public int SentToday { get; set; }
        public int AveragePerDay { get; set; }
        public decimal CreditConsumption { get; set; }

        public List<CampaignFullResponse> Campaigns { get; set; }

        public int DeliveredCount { get; set; }
        public int RespondedRecords { get; set; }
        public int NotDeliveredCount { get; set; }
        public int WaitingCount { get; set; }
        public int FailedCount { get; set; }
        public int RejectedCount { get; set; }
        public int NotSentCount { get; set; }
        public int ExceptionCount { get; set; }
        public int TotalStatusCount { get; set; }

        public int ReceptionRate { get; set; }
    }


}
