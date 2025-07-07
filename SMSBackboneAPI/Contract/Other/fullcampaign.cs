using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract.Response;
using Modal.Model.Model;
namespace Contract.Other
{
    public class fullcampaign
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Message { get; set; }
        public bool UseTemplate { get; set; }
        public int? TemplateId { get; set; }
        public bool AutoStart { get; set; }
        public bool FlashMessage { get; set; }
        public bool CustomANI { get; set; }
        public bool RecycleRecords { get; set; }
        public byte NumberType { get; set; }
        public DateTime CreatedDate { get; set; }
        public int numeroActual { get; set; }
        public int numeroInicial { get; set; }
        public int RespondedRecords { get; set; }
        public int OutOfScheduleRecords { get; set; }
        public int BlockedRecords { get; set; }
        public int RecycleCount { get; set; }
        public int ReceptionRate { get; set; }
        public int NoReceptionRate { get; set; }
        public int WaitRate { get; set; }
        public int DeliveryFailRate { get; set; }
        public int RejectionRate { get; set; }
        public int NoSendRate { get; set; }
        public int ExceptionRate { get; set; }
        public List<CampaignSchedules> Schedules { get; set; } = new();
        public CampaignRecycleSettings? RecycleSetting { get; set; }
        public List<CampaignContacts> Contacts { get; set; } = new();
        public List<CampaignContactScheduleSend> CampaignContactScheduleSendDTO { get; set; }
    }
}
