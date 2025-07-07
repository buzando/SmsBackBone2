using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;

namespace Contract.Other
{
    public class FullCampaignSpResult
    {
        public int CampaignId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Message { get; set; }
        public bool UseTemplate { get; set; }
        public int? TemplateId { get; set; }
        public bool AutoStart { get; set; }
        public bool FlashMessage { get; set; }
        public bool CustomANI { get; set; }
        public bool RecycleRecords { get; set; }
        public int NumberType { get; set; }
        public DateTime CreatedDate { get; set; }

        public string? Username { get; set; }
        public string? Password { get; set; }

        public int RoomId { get; set; }
        public string RoomName { get; set; }
        public string RoomDescription { get; set; }  

        public decimal RateForShort { get; set; }
        public decimal RateForLong { get; set; }

        public int ScheduleId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }

        public decimal Credits { get; set; }
        public decimal LongSms { get; set; }
        public decimal ShortSms { get; set; }

        public string ContactsJson { get; set; }
        public string? SchedulesJson { get; set; }
        public string? RecycleSettingJson { get; set; }
        public string? SentContactsJson { get; set; }
        public List<int> BlackListIds { get; set; } = new();
        public List<CampaignContacts> Contacts { get; set; } = new();
        public List<CampaignSchedules> Schedules { get; set; } = new();
        public CampaignRecycleSettings? RecycleSetting { get; set; }
        public List<CampaignContactScheduleSend> SentContacts { get; set; } = new();
    }
}
