using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class BlackListManagment
    {
        public string Operation { get; set; } = string.Empty; 
        public string Name { get; set; } = string.Empty;
        public int IdRoom { get; set; } 
        public string SheetName { get; set; } = string.Empty; 
        public string ColumnPhone { get; set; } = string.Empty;
        public string ColumnData { get; set; } = string.Empty;
        public bool OmitHeaders { get; set; } 
        public string FilterType { get; set; } = string.Empty; 
        public string FileBase64 { get; set; } = string.Empty; 
        public List<string> Phones { get; set; } = new();
        public string eliminationname { get; set; }
    }

}
