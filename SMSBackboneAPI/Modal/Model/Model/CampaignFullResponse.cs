using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class CampaignFullResponse
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
        public DateTime? StartDate { get; set; }
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
        public int InProcessCount { get; set; }       // Status == "0"
        public int DeliveredCount { get; set; }       // Status == "1"
        public int NotDeliveredCount { get; set; }    // Status == "2"
        public int NotSentCount { get; set; }         // Status == "3"
        public int FailedCount { get; set; }          // Status == "4"
        public int ExceptionCount { get; set; }       // Status == "5"
        public List<CampaignScheduleDto> Schedules { get; set; } = new();
        public CampaignRecycleSettingDto? RecycleSetting { get; set; }
        public List<CampaignContactDto> Contacts { get; set; } = new();
        public List<CampaignContactScheduleSendDTO> CampaignContactScheduleSendDTO { get; set; }
    }
    public class CampaignScheduleDto
    {
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public byte? OperationMode { get; set; }
        public int Order { get; set; }
    }

    public class CampaignRecycleSettingDto
    {
        public string? TypeOfRecords { get; set; }
        public bool IncludeNotContacted { get; set; }
        public int NumberOfRecycles { get; set; }
    }

    public class CampaignContactDto
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Dato { get; set; }
        public string? DatoId { get; set; }
        public string? Misc01 { get; set; }
        public string? Misc02 { get; set; }
    }
    public class CampaignContactScheduleSendDTO
    {
        [Key]
        public int Id { get; set; }

        public int CampaignId { get; set; }

        public int ContactId { get; set; }

        public int ScheduleId { get; set; }

        public DateTime? SentAt { get; set; }

        public string Status { get; set; } = "";

        public string? ResponseMessage { get; set; }

        public string State { get; set; }

    }
}
