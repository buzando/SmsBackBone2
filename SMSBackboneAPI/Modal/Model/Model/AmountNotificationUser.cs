using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class AmountNotificationUser
    {
        [Key]
        public int Id { get; set; }

        // Relación con User
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual Users  User { get; set; } // Suponiendo que existe una clase User

        // Relación con AmountNotification
        public int NotificationId { get; set; }
        [ForeignKey("NotificationId")]
        public virtual AmountNotification AmountNotification { get; set; }
    }
}
