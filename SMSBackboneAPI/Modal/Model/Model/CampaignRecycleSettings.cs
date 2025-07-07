using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class CampaignRecycleSettings
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string? TypeOfRecords { get; set; } // 'Todos' o 'Rechazados'
        public bool IncludeNotContacted { get; set; }
        public int NumberOfRecycles { get; set; }
    }
}
