using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class SmsRequestDto
    {
        public string? text { get; set; }
        public string? phoneNumber { get; set; }
        public string? registryClient { get; set; }
    }
}
