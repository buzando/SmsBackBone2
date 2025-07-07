using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ClientRequestDto
    {
        public int? Id { get; set; } // null si es nuevo
        public string NombreCliente { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string? Extension { get; set; }
        public string Email { get; set; }
        public string RateForShort { get; set; }
        public string RateForLong { get; set; }

        public byte ShortRateType { get; set; } // 0 = estándar, 1 = personalizada
        public byte LongRateType { get; set; }
        public string? ShortRateQty { get; set; }
        public string? LongRateQty { get; set; }

        public List<string> RoomNames { get; set; }
    }
}
