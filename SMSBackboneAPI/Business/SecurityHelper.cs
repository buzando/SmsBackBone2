using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BCrypt.Net;
namespace Business
{
    public static class SecurityHelper
    {
        public static string GenerarPasswordTemporal(out string rawPassword)
        {
            rawPassword = Guid.NewGuid().ToString("N")[..8];
            return BCrypt.Net.BCrypt.HashPassword(rawPassword);
        }

        public static string GenerarPasswordHash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public static bool VerificarPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }
}
