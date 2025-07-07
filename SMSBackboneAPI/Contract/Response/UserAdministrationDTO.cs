using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class UserAdministrationDTO
    {
        public int id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string Rooms { get; set; }
        public int idRole { get; set; }
        public string Role { get; set; }
        public string PhoneNumber { get; set; }
        public string Client { get; set; }
    }
}
