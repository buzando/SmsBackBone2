using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class DeleteBlackList
    {
        public List<string> names { get; set; }
        public int idroom { get; set; }
    }
}
