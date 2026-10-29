using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Modal.Model.Model
{
    [Table("UserRole", Schema = "dbo")]
    public class UserRole
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
        public DateTime CreatedAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual Users User { get; set; }

        [ForeignKey(nameof(RoleId))]
        public virtual Roles Role { get; set; }
    }
}
