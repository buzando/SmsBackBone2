using Contract.Request;
using Contract.Response;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace SMSBackboneAPI.Service
{
    public class AutenticationBearer
    {
        static string Issuer = "Issuer";
        static string Audience = "Audience";

        private static IConfiguration Configuration;
        public AutenticationBearer(IConfiguration iConfig)
        {
            Configuration = iConfig;
        }

        /// <summary>
        /// Método para validar el request.
        /// </summary>
        /// <param name="request">Request enviado por cliente.</param>
        /// <returns>Si es correcto regresa DTO y si es incorrecto regresa un NULL.</returns>
        public UserDto Validate(HttpRequest request)
        {

            var currentToken = Autenticate(request);

            if (!string.IsNullOrEmpty(currentToken))
            {
                if (ValidateCurrentTokens(currentToken))
                {
                    return GetDtoFromToken(currentToken);
                }
            }

            return null;
        }

        /// <summary>
        /// Método encargado de obtener el token del request.
        /// </summary>
        /// <param name="request">Request enviado por el cliente.</param>
        /// <returns>Regresa token.</returns>
        internal static string Autenticate(HttpRequest request)
        {
            string authHeader = request.Headers["Authorization"];
            if (authHeader != null && authHeader.StartsWith("Bearer"))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }
            return null;
        }

        /// <summary>
        /// Resuelve el token para obtener DTO.
        /// </summary>
        /// <param name="token">Token obtenido desde Request.</param>
        /// <returns>Regresa DTO tipo Usuario.</returns>
        private static UserDto GetDtoFromToken(string token)
        {
            var tokenHandlers = new JwtSecurityTokenHandler();
            var securityToken = tokenHandlers.ReadToken(token) as JwtSecurityToken;
            var userJson = securityToken.Claims.FirstOrDefault(claim => claim.Type == "User").Value;
            var userDto = JsonConvert.DeserializeObject<UserDto>(userJson);
            return userDto;
        }

        /// <summary>
        /// Resuelve si el token es correcto y aun no ha expirado.
        /// </summary>
        /// <param name="token">Token a resolver.</param>
        /// <returns>Regresa true o false.</returns>
        public static bool ValidateCurrentTokens(string token)
        {
            var mySecret = Configuration.GetSection("SecretKey").Value;
            var mySecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(mySecret));
            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = Issuer,
                    ValidAudience = Audience,
                    ClockSkew = TimeSpan.Zero,
                    ValidateLifetime = true,
                    IssuerSigningKey = mySecurityKey
                }, out SecurityToken validatedToken);
            }
            catch
            {
                return false;
            }
            return true;
        }
    }
}
