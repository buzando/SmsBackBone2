using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class UseRequest
    {
        public int RoomId { get; set; }
        public string SmsType { get; set; } // 1 = short, 2 = long
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int>? CampaignIds { get; set; }
        public List<int>? UserIds { get; set; }
    }
}
