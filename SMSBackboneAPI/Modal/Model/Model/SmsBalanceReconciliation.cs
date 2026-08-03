using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class SmsBalanceReconciliation
    {
        public int Id { get; set; }

        public int ClientId { get; set; }
        public int AccessId { get; set; }
        public DateTime FechaRevision { get; set; }

        public decimal BackboneCredit { get; set; }

        public decimal PortalShortBefore { get; set; }
        public decimal PortalLongBefore { get; set; }
        public decimal PortalTotalBefore { get; set; }

        public decimal PortalShortAfter { get; set; }
        public decimal PortalLongAfter { get; set; }
        public decimal PortalTotalAfter { get; set; }

        public decimal Diferencia { get; set; }

        public int SmsJustificados { get; set; }
        public decimal AjusteAdministrativo { get; set; }

        public string Status { get; set; }
        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
