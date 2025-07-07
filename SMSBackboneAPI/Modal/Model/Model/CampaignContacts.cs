using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class CampaignContacts
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Dato { get; set; }
        public string? DatoId { get; set; }
        public string? Misc01 { get; set; }
        public string? Misc02 { get; set; }
    }
}
