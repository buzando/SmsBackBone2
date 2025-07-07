using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class PasswordResetDTO
    {
        public string NewPassword { get; set; }
        public string Email { get; set; }
        public bool TwoFactorAuthentication { get; set; }
    }
}
