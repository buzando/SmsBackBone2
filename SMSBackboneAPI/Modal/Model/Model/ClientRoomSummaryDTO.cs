using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class ClientRoomSummaryDTO
    {
        public int id { get; set; }
        public string NombreCliente { get; set; }
        public DateTime CreationDate { get; set; }
        public decimal? RateForShort { get; set; }
        public decimal? RateForLong { get; set; }
        public byte? ShortRateType { get; set; }
        public byte? LongRateType { get; set; }
        public string? ShortRateQty { get; set; }
        public string? LongRateQty { get; set; }
        public byte? Estatus { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public int? Extension { get; set; }

        public string? RoomName { get; set; }
        public double TotalCredits { get; set; }
        public double TotalLongSmsCredits { get; set; }
        public double TotalShortSmsCredits { get; set; }
        public DateTime? DeactivationDate { get; set; }
    }

}
