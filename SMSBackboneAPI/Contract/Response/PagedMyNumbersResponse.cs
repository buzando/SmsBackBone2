using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class PagedMyNumbersResponse
    {
        public List<MyNumbersResponse> Items { get; set; }
        public int Total { get; set; }
    }
}
