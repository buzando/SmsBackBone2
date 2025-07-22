using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class SmsDisplayRate
    {
        [Key]
        public int Id { get; set; }
        public string SmsType { get; set; } 
        public string Quantity { get; set; } 
        public decimal DisplayPrice { get; set; }
    }
}
