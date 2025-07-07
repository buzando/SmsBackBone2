using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class BlackList
    {
        public int Id { get; set; }

        public DateTime CreationDate { get; set; }

        public string Name { get; set; } = string.Empty;

        public DateTime? ExpirationDate { get; set; }

        public int idroom { get; set; }
        public string phone { get; set; }


    }
}
