using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class lockDTO
    {
        public int Id { get; set; }
        public string? email { get; set; }
        public DateTime lockoutEndDateUtc { get; set; }
        public bool lockoutEnabled { get; set; }
    }
}
