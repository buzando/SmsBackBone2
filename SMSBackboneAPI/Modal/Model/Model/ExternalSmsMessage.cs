using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class ExternalSmsMessage
    {
        public long Id { get; set; }

        public int IdUser { get; set; }
        public int IdRoom { get; set; }

        public string Email { get; set; }
        public string RoomName { get; set; }

        public string SmsType { get; set; }
        public string PhoneNumber { get; set; }
        public string Message { get; set; }

        public string IdBackBone { get; set; }
        public string Status { get; set; }
        public string ResponseMessage { get; set; }

        public string Source { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
