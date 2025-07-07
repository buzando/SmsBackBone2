using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ManageNumerosDidsRequest
    {

        public string Name { get; set; } = string.Empty;

        public DateTime? ExpirationDate { get; set; }
        public string FileName { get; set; } = string.Empty;

        public List<string> Phones { get; set; } = new();

        public string FileBase64 { get; set; } = string.Empty;

        public int? ClientId { get; set; }

        public string Channel { get; set; } = string.Empty; 

        public string Operation { get; set; } = string.Empty; 

        public bool IsShared { get; set; }
    }

}
