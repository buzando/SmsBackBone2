using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public  class UserAddDTO
    {
        public string FirstName { get; set; } 
        public string Email { get; set; }
        public string ConfirmationEmail { get; set; }
        public string PhoneNumber { get; set; }
        public string Profile { get; set; }
        public string Rooms { get; set; }
        public bool? FutureRooms { get; set; }
        public int IdCliente { get; set; }
        public int IdUsuario { get; set; }
        public string Password { get; set; }

    }
}
