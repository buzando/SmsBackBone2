using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ClientRoomSummaryDTO
    {
        public int id { get; set; }
        public string NombreCliente { get; set; }
        public DateTime CreationDate { get; set; }
        public decimal? RateForShort { get; set; }
        public decimal? RateForLong { get; set; }
        public string Estatus { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }

        public string RoomNames { get; set; }

        public decimal TotalCredits { get; set; }
        public decimal TotalLongSmsCredits { get; set; }
        public decimal TotalShortSmsCredits { get; set; }
    }

}
