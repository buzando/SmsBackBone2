using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class acountmanagment
    {
        public string oldRoom { get; set; }
        public string Channel { get; set; }
        public double transfer { get; set; }
        public string newRoom { get; set; }
        public int idUser { get; set; }
    }
}
