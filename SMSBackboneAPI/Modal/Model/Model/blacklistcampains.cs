using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class blacklistcampains
    {
        [Key]
        public int id { get; set; }
        public int idblacklist { get; set; }
        public int idcampains { get; set; }
    }
}
