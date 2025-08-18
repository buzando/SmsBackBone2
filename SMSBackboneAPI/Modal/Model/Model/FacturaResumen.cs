using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class FacturaResumen
    {
        [Key]
        public int Id { get; set; }

        public Guid UUID { get; set; }

        public string? Serie { get; set; }

        public string? Folio { get; set; }


        public DateTime FechaEmision { get; set; }


        public decimal Subtotal { get; set; }

        public decimal? IVA { get; set; }

        public decimal Total { get; set; }


        public string? UrlXml { get; set; }


        public string? UrlPdf { get; set; }

        public string? Origen { get; set; }

        public DateTime FechaRegistro { get; set; }

        public int RechargeId { get; set; }

    }
}
