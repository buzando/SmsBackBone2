using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class SmsDto
    {
        public string? id { get; set; }
        public string? text { get; set; }
        public string? phoneNumber { get; set; }
        public int? status { get; set; }
        public string? registryClient { get; set; }
    }
}
