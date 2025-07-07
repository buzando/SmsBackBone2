using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class BlackListRequest
    {

        public string Name { get; set; } = string.Empty;

        public DateTime? ExpirationDate { get; set; }

        public int IdRoom { get; set; }

        public List<string> Phones { get; set; }

        public string FileBase64 { get; set; } = string.Empty;

    }
}
