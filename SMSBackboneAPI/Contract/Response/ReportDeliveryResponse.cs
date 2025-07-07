using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ReportDeliveryResponse
    {
        public int MessageId { get; set; }
        public string Message { get; set; }
        public string CampaignName { get; set; }
        public int CampaignId { get; set; }   
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string RoomName { get; set; }
        public string PhoneNumber { get; set; }
        public string Status { get; set; }
        public string? ResponseMessage { get; set; }
        public DateTime? SentAt { get; set; }
    }
}
