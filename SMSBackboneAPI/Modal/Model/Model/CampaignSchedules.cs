using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class CampaignSchedules
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public byte? OperationMode { get; set; } // 1 = Reanudar, 2 = Reciclar
        public int Order { get; set; }
    }

}
