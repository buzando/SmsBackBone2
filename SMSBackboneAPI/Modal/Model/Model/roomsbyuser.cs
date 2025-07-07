using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class roomsbyuser
    {
        [Key]
        public int id { get; set; }

        [ForeignKey(nameof(users))]
        public int idUser { get; set; }
        public virtual Users users { get; set; }

        [ForeignKey(nameof(Rooms))]
        public int idRoom { get; set; }
        public virtual rooms Rooms { get; set; }
    }
}
