using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    [Table("RolePermission", Schema = "dbo")]
    public class RolePermission
    {
        [Key]
        public int RoleId { get; set; }

        public int PermissionId { get; set; }

        public DateTime CreatedAt { get; set; }

        [ForeignKey(nameof(RoleId))]
        public virtual Roles Role { get; set; }

        [ForeignKey(nameof(PermissionId))]
        public virtual Permissions Permission { get; set; }
    }
}
