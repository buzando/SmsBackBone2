using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public  class BackboneSendMessageResult
    {
        public string Id { get; set; }
        public string PhoneNumber { get; set; }
        public int Status { get; set; }
        public string RegistryClient { get; set; }
        public string Text { get; set; }
    }
}
