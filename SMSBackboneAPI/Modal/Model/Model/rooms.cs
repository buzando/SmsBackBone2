using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class rooms
    {
        [Key]
        public int id { get; set; } 

        public string name { get; set; } 

        public int calls { get; set; } = 0; 

        public double credits { get; set; } = 0; 

        public string description { get; set; } 

        public double long_sms { get; set; } = 0;

        public double short_sms { get; set; } = 0;
    }
}
