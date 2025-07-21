using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ReportsAdminResponse
    {
        public List<object> Items { get; set; }
        public int Total { get; set; }
        public int Pagination { get; set; }
    }
}
