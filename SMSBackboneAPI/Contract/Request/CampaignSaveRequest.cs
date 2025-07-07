using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;

namespace Contract.Request
{
    public class CampaignSaveRequest
    {
        public Campaigns Campaigns { get; set; } = new();
        public List<CampaignSchedules> CampaignSchedules { get; set; } = new();
        public CampaignRecycleSettings? CampaignRecycleSetting { get; set; }
        public List<int> BlacklistIds { get; set; } = new();
        public string SessionId { get; set; } = string.Empty;
        public bool SaveAsTemplate { get; set; } = false;
        public string? TemplateName { get; set; }
    }
}
