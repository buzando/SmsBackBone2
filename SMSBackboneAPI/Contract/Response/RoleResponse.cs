using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class RoleResponse
    {
        public int Id { get; set; }
        public string Role { get; set; } = string.Empty;
        public int? IdCliente { get; set; }
        public DateTime? CreatedAt { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
    }
}
