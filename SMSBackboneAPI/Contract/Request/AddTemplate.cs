using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class AddTemplate
    {
        public string Name { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int idroom { get; set; }
        public DateTime CreationDate { get; set; } = DateTime.Now;
    }
}
