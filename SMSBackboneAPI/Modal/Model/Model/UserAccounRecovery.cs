using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class UserAccounRecovery
    {
        [Key]
        public int id { get; set; }
        public int iduser { get; set; }
        public string token { get; set; }
        public DateTime Expiration { get; set; }

        public int type { get; set; } 
    }
}
