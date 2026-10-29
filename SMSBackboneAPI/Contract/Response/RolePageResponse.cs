using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class RolePageResponse
    {
        public List<RoleResponse> Items { get; set; } = new List<RoleResponse>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalRecords { get; set; }
        public int TotalPages { get; set; }
    }
}
