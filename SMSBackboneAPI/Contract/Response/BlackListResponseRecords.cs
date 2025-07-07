using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class BlackListResponseRecords
    {
        public List<BlackListPhones> BlackListPhones { get; set; }
        public List<CampainsBlackListResponse> Campains { get; set; }
    }
}
