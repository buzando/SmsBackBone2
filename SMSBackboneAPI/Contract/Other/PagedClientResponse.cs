using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract.Response;

namespace Contract.Other
{
    public class PagedClientResponse
    {
        public List<Modal.Model.Model.ClientRoomSummaryDTO> Items { get; set; }
        public int Total { get; set; }
    }
}
