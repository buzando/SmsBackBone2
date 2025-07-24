using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class ClientAccess
    {
        public int id { get; set; }
        public int client_id { get; set; }
        public string username { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public DateTime created_at { get; set; }
        public bool status { get; set; } = true;
    }
}
