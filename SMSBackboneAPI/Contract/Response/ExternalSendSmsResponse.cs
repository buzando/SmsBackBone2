using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ExternalSendSmsResponse
    {
        public string Result { get; set; }
        public List<ExternalSmsTrackingResponse> Messages { get; set; }
    }

    public class ExternalSmsTrackingResponse
    {
        public long ExternalMessageId { get; set; }
        public string PhoneNumber { get; set; }
        public string Status { get; set; }
        public string IdBackBone { get; set; }
    }
}