using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class MyNumbers
    {
        [Key]
        public int Id { get; set; } 

        public int? idClient { get; set; } 

        public string Number { get; set; } 

        public string Type { get; set; } 

        public string Service { get; set; }

        public decimal Cost { get; set; }

        public DateTime? NextPaymentDate { get; set; } 

        public string State { get; set; } 

        public string Municipality { get; set; }
        public string? Estatus { get; set; }
        public string Lada { get; set; } 
        [ForeignKey("idClient")]
        public virtual clients? Clients { get; set; }
    }
}
