using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class BlackListResponse
    {
        public int id { get; set; }
        public DateTime CreationDate { get; set; }

        public DateTime? ExpirationDate { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public bool HasActiveCampaign { get; set; } 

    }
}
