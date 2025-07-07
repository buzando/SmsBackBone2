using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class RegisterUser
    {
        public string client { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string phone { get; set; }
        public string extension { get; set; }
        public string email { get; set; }
        public string emailConfirmation { get; set; }
        public bool sms { get; set; }
        public bool llamada { get; set; }
        public string Password { get; set; }
    }
}
