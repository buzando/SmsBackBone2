using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class RoomsDTO
    {
        [Key]
        public int id { get; set; }
        public int iduser { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public double credits { get; set; }
        public double long_sms { get; set; }
        public double short_sms { get; set; }
        public Int64 calls { get; set; }
        public int idClient { get; set; }
        public string Cliente { get; set; }
    }
}
