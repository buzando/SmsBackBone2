using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public  class CampaignContactScheduleSend
    {
        [Key]
        public int Id { get; set; }

        public int CampaignId { get; set; }

        public int ContactId { get; set; }

        public int ScheduleId { get; set; }

        public DateTime? SentAt { get; set; }

        public string? Status { get; set; } = "";

        public string? ResponseMessage { get; set; }

        public string? State { get; set; }

    }
}
