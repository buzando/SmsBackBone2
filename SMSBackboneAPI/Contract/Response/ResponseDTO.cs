using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Contract.Response
{
    public class ResponseDTO
    {
        public UserDto user { get; set; }
        public string token { get; set; }
        public DateTime expiration { get; set; }
    }
}
