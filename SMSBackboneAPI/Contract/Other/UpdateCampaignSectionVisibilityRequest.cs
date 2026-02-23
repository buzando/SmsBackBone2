using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class UpdateCampaignSectionVisibilityRequest
    {
        public int CampaignId { get; set; }
        public string Section { get; set; } 
        public bool Enabled { get; set; }   
    }
}
