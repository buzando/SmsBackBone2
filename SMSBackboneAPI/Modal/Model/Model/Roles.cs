using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Modal.Model;

namespace Modal.Model.Model
{
    [Table("Roles", Schema = "dbo")]
    public class Roles
    {
        [Key]
        public int id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Role { get; set; }

        // Nullable para conservar los roles principales existentes.
        public int? idCliente { get; set; }

        [ForeignKey(nameof(idCliente))]
        public virtual clients Client { get; set; }

        public virtual ICollection<RolePermission> RolePermissions { get; set; }
            = new List<RolePermission>();
    }
}