using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class UserDto
    {
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
        public string SecondaryEmail { get; set; }
        public bool? futurerooms { get; set; }
        public string Client { get; set; }
        public string rol { get; set; }
    }
}
