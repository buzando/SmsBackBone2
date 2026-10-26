using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Modal.Model.Model
{
    [Table("Permissions", Schema = "dbo")]
    public class Permissions
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PermissionId { get; set; }

        [Required]
        [Column(TypeName = "varchar(100)")]
        [MaxLength(100)]
        public string PermissionCode { get; set; }

        [Required]
        [MaxLength(150)]
        public string PermissionName { get; set; }

        public int? ParentPermissionId { get; set; }

        public short SortOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }

        [ForeignKey(nameof(ParentPermissionId))]
        public virtual Permissions ParentPermission { get; set; }

        public virtual ICollection<Permissions> Children { get; set; }
            = new List<Permissions>();

        public virtual ICollection<RolePermission> RolePermissions { get; set; }
            = new List<RolePermission>();
    }
}