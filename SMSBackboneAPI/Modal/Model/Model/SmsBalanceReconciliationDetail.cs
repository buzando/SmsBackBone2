using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class SmsBalanceReconciliationDetail
    {
        public int Id { get; set; }

        public int ReconciliationId { get; set; }
        public int RoomId { get; set; }

        public decimal ShortBefore { get; set; }
        public decimal LongBefore { get; set; }

        public decimal ShortDelta { get; set; }
        public decimal LongDelta { get; set; }

        public decimal ShortAfter { get; set; }
        public decimal LongAfter { get; set; }

        public string Reason { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
