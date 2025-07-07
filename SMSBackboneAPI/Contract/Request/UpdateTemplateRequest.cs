using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class UpdateTemplateRequest
    {
        public string oldName { get; set; }
        public int idRoom { get; set; }
        public string newName { get; set; }
        public string newMessage { get; set; }

    }
}
