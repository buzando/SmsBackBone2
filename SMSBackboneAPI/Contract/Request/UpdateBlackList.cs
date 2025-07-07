using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic;

namespace Contract.Request
{
    public class UpdateBlackList
    {
        public string oldname { get; set; }
        public string newname { get; set; }
        public DateTime? expiration { get; set; }
        public int idRoom { get; set; }
    }
}
