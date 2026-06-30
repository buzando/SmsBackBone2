using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class UserOnboarding
    {
        public int id { get; set; }
        public int idUser { get; set; }

        public bool roomSelector { get; set; }
        public bool homeActions { get; set; }
        public bool campaigns { get; set; }
        public bool blacklist { get; set; }
        public bool paymentSettings { get; set; }
        public bool userAdministration { get; set; }

        public DateTime? createDate { get; set; }
        public DateTime? updateDate { get; set; }
    }
}
