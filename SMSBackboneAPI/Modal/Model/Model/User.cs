using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class Users
    {
        [Key]
        public int Id { get; set; }
        public int IdCliente { get; set; }
        public string userName { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public bool status { get; set; }
        public DateTime createDate { get; set; }
        public DateTime lastPasswordChangeDate { get; set; }
        public string email { get; set; }
        public bool emailConfirmed { get; set; }
        public DateTime? lockoutEndDateUtc { get; set; }
        public bool lockoutEnabled { get; set; }
        public int accessFailedCount { get; set; }
        public int idRole { get; set; }
        public bool clauseAccepted { get; set; }
        public string phonenumber { get; set; }
        public bool TwoFactorAuthentication { get; set; }
        public bool SMS { get; set; }
        public bool Call { get; set; }
        public string passwordHash { get; set; }

        [ForeignKey("IdCliente")]
        public virtual clients Client { get; set; }

        public string SecondaryEmail { get; set; }
        public bool? futurerooms { get; set; }
        public int? extension { get; set; }

        //[ForeignKey("IdRole")]
        //public virtual Roles Role { get; set; }

    }
}
