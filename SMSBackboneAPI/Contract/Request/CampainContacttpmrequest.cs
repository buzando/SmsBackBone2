using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class CampainContacttpmrequest
    {

        public string Base64File { get; set; }         
        public string SheetName { get; set; }        

        public List<string> PhoneColumns { get; set; }   
        public List<string> DatoColumns { get; set; }   

        public string SessionId { get; set; }           
        public string CreatedBy { get; set; }          

    }
}
