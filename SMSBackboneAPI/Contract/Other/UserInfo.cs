using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class UserInfo
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public int Rol { get; set; }
        public bool Status { get; set; }
        public int AccessFailedCount { get; set; }
        public bool LockoutEnabled { get; set; }
    }
}
