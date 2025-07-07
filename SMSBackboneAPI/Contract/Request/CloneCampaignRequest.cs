using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;

namespace Contract.Request
{
    public class CloneCampaignRequest
    {
        public int CampaignIdToClone { get; set; }
        public string NewName { get; set; }
        public List<CampaignSchedules> NewSchedules { get; set; }
    }
}
