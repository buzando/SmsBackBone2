using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class IFTLadas
    {
        [Key]
        public int Id { get; set; }
        public string ClaveLada { get; set; }
        public string Estado { get; set; }
        public string Municipio { get; set; }
    }
}
