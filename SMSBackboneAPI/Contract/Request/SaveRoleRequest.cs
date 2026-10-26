using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class SaveRoleRequest
    {
        public string Role { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new List<string>();
    }
}
