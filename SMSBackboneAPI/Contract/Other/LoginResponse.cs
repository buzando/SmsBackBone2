using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class LoginResponse
    {
        public UserInfo user { get; set; }
        public string token { get; set; }
        public string expiration { get; set; }
    }
}
