using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class UploadSummaryResponse
    {
        public int Success { get; set; }          
        public int Failed { get; set; }            
        public int Total { get; set; }             
        public string? FileName { get; set; }       

        public UploadErrorBreakdown Errors { get; set; } = new UploadErrorBreakdown();
    }

    public class UploadErrorBreakdown
    {
        public int MinLength { get; set; }        
        public int SpecialChars { get; set; }      
        public int Alphanumeric { get; set; }
        public int Duplicated { get; set; }
    }
}
