using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    // Clase Campaign
    public class Campaigns
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Message { get; set; }
        public bool UseTemplate { get; set; }
        public int? TemplateId { get; set; }
        public bool AutoStart { get; set; }
        public bool FlashMessage { get; set; }
        public bool CustomANI { get; set; }
        public bool RecycleRecords { get; set; }
        public byte NumberType { get; set; } // 1 = Corto, 2 = Largo
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public DateTime? StartDate { get; set; }
        public bool ShouldConcatenate { get; set; } = false;
        public bool ShouldShortenUrls { get; set; } = false;

    }

}
