using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;

namespace Contract.Other
{
    public class LightCampaignResult
    {
        public int CampaignId { get; set; }
        public string Name { get; set; }
        public string Message { get; set; }
        public bool UseTemplate { get; set; }
        public int? TemplateId { get; set; }
        public bool FlashMessage { get; set; }
        public bool CustomANI { get; set; }
        public int NumberType { get; set; }
        public bool concatenate { get; set; }
        public bool shortenUrls { get; set; }
        public bool ShouldConcatenate { get; set; }
        public bool ShouldShortenUrls { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; }
        public double Credits { get; set; }
        public double ShortSms { get; set; }
        public double LongSms { get; set; }

        public int ScheduleId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int ClientId { get; set; }

        public List<CampaignContact> Contacts { get; set; } = new();
    }

    public class CampaignContact
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string PhoneNumber { get; set; }
        public string Dato { get; set; }
        public string DatoId { get; set; }
        public string Misc01 { get; set; }
        public string Misc02 { get; set; }
    }
}
