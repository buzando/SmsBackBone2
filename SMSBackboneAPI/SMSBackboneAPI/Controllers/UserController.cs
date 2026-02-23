using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using SMSBackboneAPI.Service;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;
using log4net;
using System.Threading.Tasks;
using System.Security.Policy;
using Openpay.Entities.Request;
using Modal;
using SMSBackboneAPI.Utils;
using System;
using System.Diagnostics;
using System.Linq;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserController));
        private readonly IConfiguration configuration;
        private readonly string JwtIssuer;
        private readonly string JwtAudience;

        public UserController(IConfiguration iConfig)
        {
            this.configuration = iConfig;
            this.JwtIssuer = configuration["JwtIssuer"];
            this.JwtAudience = configuration["JwtAudience"];
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Authenticate(LoginDto Login)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                var emailDom = Login?.email?.Split('@').LastOrDefault();
                log.Info($"[{rid}] Authenticate start emailDomain={emailDom}");

                var userManager = new Business.UserManager();
                var responseDto = userManager.Login(Login.email, Login.password);
                if (responseDto != null)
                {
                    if (!responseDto.emailConfirmed)
                    {
                        sw.Stop();
                        log.Warn($"[{rid}] Authenticate unconfirmed email userId={responseDto.Id} ms={sw.ElapsedMilliseconds}");
                        return BadRequest(new GeneralErrorResponseDto() { code = "UnconfirmedEmail", description = "Confirmation email could not be sent" });
                    }
                    if (!responseDto.status)
                    {
                        sw.Stop();
                        log.Warn($"[{rid}] Authenticate locked user userId={responseDto.Id} ms={sw.ElapsedMilliseconds}");
                        return BadRequest(new GeneralErrorResponseDto() { code = "UserLocked", description = "User locked" });
                    }

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var byteKey = Encoding.UTF8.GetBytes(configuration["SecretKey"]);

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new[]
                        {
                            new Claim(ClaimTypes.NameIdentifier, responseDto.Id.ToString()),
                            new Claim(ClaimTypes.Email, responseDto.email),
                            new Claim(ClaimTypes.Role, responseDto.rol)
                        }),
                        Expires = DateTime.UtcNow.AddDays(30),
                        Issuer = JwtIssuer,
                        Audience = JwtAudience,
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(byteKey), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var jwtToken = tokenHandler.WriteToken(token);
                    var respuesta = new ResponseDTO { user = responseDto, token = jwtToken, expiration = DateTime.Now.AddDays(1) };

                    sw.Stop();
                    log.Info($"[{rid}] Authenticate ok userId={responseDto.Id} ms={sw.ElapsedMilliseconds}");
                    return Ok(respuesta);
                }
                else
                {
                    sw.Stop();
                    log.Warn($"[{rid}] Authenticate bad credentials emailDomain={emailDom} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "BadCredentials", description = "Bad Credentials" });
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] Authenticate error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [AllowAnonymous]
        [HttpPost("LockUser")]
        public async Task<IActionResult> LockUser(lockDTO user)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] LockUser start");
                var userManager = new Business.UserManager();
                var responseDto = userManager.LockUser(user);

                sw.Stop();
                if (responseDto)
                {
                    log.Info($"[{rid}] LockUser ok ms={sw.ElapsedMilliseconds}");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] LockUser badrequest ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "", description = "" });
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] LockUser error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new GeneralErrorResponseDto() { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [AllowAnonymous]
        [HttpGet("GenerateconfirmationEmail")]
        public async Task<IActionResult> GenerateMail(string email, string type)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                var emailDom = email?.Split('@').LastOrDefault();
                log.Info($"[{rid}] GenerateMail start emailDomain={emailDom} type={type}");

                var userManager = new Business.UserManager();
                var user = userManager.FindEmail(email);
                if (user == null)
                {
                    sw.Stop();
                    errorResponse.code = "InvalidUser";
                    errorResponse.description = "No matches found";
                    log.Warn($"[{rid}] GenerateMail invalid user emailDomain={emailDom} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(errorResponse);
                }

                var URL = Common.ConfigurationManagerJson("UrlSitioRecuperacion");
                var typeemail = 0;
                if (type == "confirmation") typeemail = 1;
                if (type == "GenerateMailMessage") typeemail = 2;

                var token = userManager.GeneraToken(user.Id, typeemail);
                string body = MailManager.GenerateMailMessage(user.email, token, URL, "confirmation");
                bool emailResponse = MailManager.SendEmail(user.email, "Confirm your email", body);

                sw.Stop();
                if (emailResponse)
                {
                    log.Info($"[{rid}] GenerateMail ok userId={user.Id} ms={sw.ElapsedMilliseconds}");
                    return Ok(new { success = "success", message = "Confirmation email has been sent" });
                }
                else
                {
                    errorResponse.code = "ConfirmationUnset";
                    errorResponse.description = "Confirmation email could not be sent";
                    log.Warn($"[{rid}] GenerateMail not sent userId={user.Id} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GenerateMail error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [AllowAnonymous]
        [HttpGet("confirmationEmail")]
        public IActionResult ConfirmMail(string email, string token)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                var emailDom = email?.Split('@').LastOrDefault();
                log.Info($"[{rid}] ConfirmMail start emailDomain={emailDom}");

                var userManager = new Business.UserManager();
                var confirmation = userManager.FindEmailToken(email, token);
                var URL = Common.ConfigurationManagerJson("UrlSitio");

                if (!confirmation)
                {
                    log.Warn($"[{rid}] ConfirmMail invalid token emailDomain={emailDom}");
                }
                else
                {
                    log.Info($"[{rid}] ConfirmMail ok emailDomain={emailDom}");
                }
                return Redirect(URL);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] ConfirmMail error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [AllowAnonymous]
        [HttpGet("SendConfirmation")]
        public async Task<IActionResult> sendConfirmationMail(string dato, string tipo, string reason)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                log.Info($"[{rid}] SendConfirmation start tipo={tipo} reason={reason}");

                var userManager = new Business.UserManager();
                var token = await userManager.EnvioCodigo(dato, tipo, reason);

                sw.Stop();
                if (!string.IsNullOrEmpty(token))
                {
                    log.Info($"[{rid}] SendConfirmation ok ms={sw.ElapsedMilliseconds}");
                    return Ok(token);
                }
                else
                {
                    log.Warn($"[{rid}] SendConfirmation badrequest ms={sw.ElapsedMilliseconds}");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] SendConfirmation error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [AllowAnonymous]
        [HttpGet("SaveTwoFactor")]
        public IActionResult SaveTwoFactor(string email)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                var emailDom = email?.Split('@').LastOrDefault();
                log.Info($"[{rid}] SaveTwoFactor start emailDomain={emailDom}");

                var userManager = new Business.UserManager();
                var save = userManager.SaveTwoFactor(email);
                if (save)
                {
                    log.Info($"[{rid}] SaveTwoFactor ok");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] SaveTwoFactor badrequest");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] SaveTwoFactor error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [AllowAnonymous]
        [HttpGet("GetRooms")]
        public IActionResult GetRooms([FromQuery] string email)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                // 1) Si hay X-Client-Id en header, se usa y se ignora el email
                var headerClientId = HttpContext.GetResolvedClientId(); // tu helper de headers
                var userManager = new Business.UserManager();
                IEnumerable<RoomsDTO> rooms;

                if (headerClientId.HasValue)
                {
                    log.Info($"[{rid}] GetRooms by clientId={headerClientId.Value}");
                    rooms = userManager.roomsByUser(headerClientId.Value);
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(email))
                        return BadRequest("Falta email (o mande X-Client-Id en headers).");

                    var emailDom = email.Split('@').LastOrDefault();
                    log.Info($"[{rid}] GetRooms by emailDomain={emailDom}");
                    rooms = userManager.roomsByUser(email);
                }

                var list = rooms?.ToList() ?? new List<RoomsDTO>();
                if (list.Any())
                {
                    log.Info($"[{rid}] GetRooms ok count={list.Count}");
                    return Ok(list);
                }

                log.Warn($"[{rid}] GetRooms empty");
                return BadRequest(new GeneralErrorResponseDto());
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetRooms error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }





        [AllowAnonymous]
        [HttpGet("GetUserByEmail")]
        public IActionResult GetUserByEmail(string email)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            var errorResponse = new GeneralErrorResponseDto();
            try
            {
                var emailDom = email?.Split('@').LastOrDefault();
                log.Info($"[{rid}] GetUserByEmail start emailDomain={emailDom}");

                var userManager = new Business.UserManager();
                var user = userManager.FindEmail(email);
                if (user != null)
                {
                    log.Info($"[{rid}] GetUserByEmail ok userId={user.Id}");
                    return Ok(user);
                }
                else
                {
                    log.Warn($"[{rid}] GetUserByEmail notfound");
                    return BadRequest(errorResponse);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetUserByEmail error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [AllowAnonymous]
        [HttpPost("NewPassword")]
        public async Task<IActionResult> NewPassword(PasswordResetDTO Login)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            try
            {
                log.Info($"[{rid}] NewPassword start emailDomain={Login?.Email?.Split('@').LastOrDefault()}");

                var userManager = new Business.UserManager();
                var changedOk = userManager.NewPassword(Login);
                if (!changedOk)
                {
                    sw.Stop();
                    log.Warn($"[{rid}] NewPassword invalid ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto { code = "Error", description = "Password invalid" });
                }

                var user = userManager.FindEmail(Login.Email);
                if (user == null)
                {
                    sw.Stop();
                    log.Warn($"[{rid}] NewPassword user not found ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto { code = "UserNotFound", description = "User not found" });
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var byteKey = Encoding.UTF8.GetBytes(configuration["SecretKey"]);

                // === Alinear claims con Authenticate ===
                var identity = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.email ?? string.Empty),
            new Claim(ClaimTypes.Role,  user.rol   ?? "User")
        });

                // === Vigencia coherente (30 días, en UTC) ===
                var expiresUtc = DateTime.UtcNow.AddDays(30);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = identity,
                    Expires = expiresUtc,
                    Issuer = JwtIssuer,
                    Audience = JwtAudience,
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(byteKey), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwt = tokenHandler.WriteToken(token); // ¡IMPORTANTE!

                var respuesta = new ResponseDTO
                {
                    user = user,
                    token = jwt,
                    expiration = expiresUtc // mantener coherencia con el JWT (UTC)
                };

                sw.Stop();
                log.Info($"[{rid}] NewPassword ok userId={user.Id} ms={sw.ElapsedMilliseconds}");
                return Ok(respuesta);
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] NewPassword error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new GeneralErrorResponseDto { code = "ServerError", description = "Ocurrió un error." });
            }
        }


        [Authorize]
        [HttpGet("Credit")]
        public async Task<IActionResult> Credit()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] Credit start");

                var autenticate = new AutenticationBearer(configuration).Validate(Request);
                if (autenticate == null)
                {
                    log.Warn($"[{rid}] Credit invalid token");
                    return BadRequest("Token inválido.");
                }
                var userManager = new Business.UserManager();
                var result = userManager.GetCredit(autenticate.userName);

                log.Info($"[{rid}] Credit ok");
                return Ok(result);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] Credit error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [AllowAnonymous]
        [HttpPost("registerAccount")]
        public async Task<IActionResult> RegisterUser(RegisterUser user)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            try
            {
                log.Info($"[{rid}] RegisterUser start client='{user?.client}'");

                // Validaciones superficiales (rápidas)
                if (string.IsNullOrWhiteSpace(user?.email) || string.IsNullOrWhiteSpace(user?.client))
                {
                    sw.Stop();
                    log.Warn($"[{rid}] RegisterUser badrequest missing fields ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto { code = "BadRequest", description = "Email y client son obligatorios." });
                }

                // Lógica atómica en el MANAGER
                var (usuario, clientId) = new Business.ClientManager().RegisterUserAtomic(user);

                // === JWT (mismos claims y expiración coherentes con Authenticate/NewPassword) ===
                var tokenHandler = new JwtSecurityTokenHandler();
                var byteKey = Encoding.UTF8.GetBytes(configuration["SecretKey"]);

                var identity = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.email ?? string.Empty),
            new Claim(ClaimTypes.Role,  usuario.rol   ?? "User")
        });

                var expiresUtc = DateTime.UtcNow.AddDays(30);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = identity,
                    Expires = expiresUtc,
                    Issuer = JwtIssuer,
                    Audience = JwtAudience,
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(byteKey), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwt = tokenHandler.WriteToken(token);

                var respuesta = new ResponseDTO
                {
                    user = usuario,
                    token = jwt,
                    expiration = expiresUtc
                };

                sw.Stop();
                log.Info($"[{rid}] RegisterUser ok userId={usuario.Id} clientId={clientId} ms={sw.ElapsedMilliseconds}");
                return Ok(respuesta);
            }
            catch (InvalidOperationException dup) when (dup.Message == "DuplicateUserName")
            {
                sw.Stop();
                log.Warn($"[{rid}] RegisterUser duplicate email ms={sw.ElapsedMilliseconds}");
                return BadRequest(new GeneralErrorResponseDto { code = "DuplicateUserName", description = "DuplicateUserName" });
            }
            catch (ArgumentException bad)
            {
                sw.Stop();
                log.Warn($"[{rid}] RegisterUser badrequest ms={sw.ElapsedMilliseconds}");
                return BadRequest(new GeneralErrorResponseDto { code = "BadRequest", description = bad.Message });
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] RegisterUser error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }



        [Authorize]
        [HttpGet("GetUsersByClient")]
        public IActionResult GetUsersByClient([FromQuery] int? Client)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                // Primero intentamos obtenerlo desde el header
                var headerClientId = HttpContext.GetResolvedClientId();
                var effectiveClientId = headerClientId ?? Client;

                if (!effectiveClientId.HasValue)
                {
                    log.Warn($"[{rid}] GetUsersByClient: No se proporcionó clientId ni en header ni en query.");
                    return BadRequest("Falta X-Client-Id o clientId en la URL.");
                }

                log.Info($"[{rid}] GetUsersByClient start clientId={effectiveClientId.Value}");

                var userManager = new Business.UserManager();
                var users = userManager.FindUsers(effectiveClientId.Value);

                if (users.Any())
                {
                    log.Info($"[{rid}] GetUsersByClient ok count={users.Count()}");
                    return Ok(users);
                }

                log.Warn($"[{rid}] GetUsersByClient empty for clientId={effectiveClientId.Value}");
                return BadRequest(new GeneralErrorResponseDto());
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetUsersByClient error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }



        [Authorize]
        [HttpGet("DeleteUserByid")]
        public async Task<IActionResult> DeleteUserByid(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] DeleteUserByid start id={id}");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.DeleteUser(id);
                if (!responseDto)
                {
                    log.Warn($"[{rid}] DeleteUserByid badrequest id={id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    log.Info($"[{rid}] DeleteUserByid ok id={id}");
                    return Ok();
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] DeleteUserByid error id={id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("AddUser")]
        public async Task<IActionResult> AddUser(UserAddDTO user)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                // === 1) clientId: header (prioridad) o body (respaldo) ===
                var headerClientId = HttpContext.GetResolvedClientId();
                int? bodyClientId = (user?.IdCliente > 0) ? user.IdCliente : (int?)null;
                var effectiveClientId = headerClientId ?? bodyClientId;

                if (!effectiveClientId.HasValue)
                    return BadRequest("Falta clientId (X-Client-Id o IdCliente).");

                // Forzar clientId efectivo en el DTO
                user.IdCliente = effectiveClientId.Value;

                // Log de origen (útil para auditar MESA vs Cliente)
                var clientSource = headerClientId.HasValue ? "header" : "body";
                log.Info($"[{rid}] AddUser start clientId={user.IdCliente} (src={clientSource}) emailDomain={user?.Email?.Split('@').LastOrDefault()}");

                // === 2) Validaciones básicas ===
                if (string.IsNullOrWhiteSpace(user?.Email) ||
                    string.IsNullOrWhiteSpace(user.FirstName) ||
                    string.IsNullOrWhiteSpace(user.Profile))
                {
                    return BadRequest("Faltan campos obligatorios: FirstName, Email y Profile.");
                }
                if (string.IsNullOrWhiteSpace(user.Password))
                {
                    return BadRequest("Password es requerido para crear usuario.");
                }

                // Normalizaciones defensivas
                user.Rooms = user.Rooms?.Trim() ?? string.Empty; // ManageroomBystring espera string (puede ser "")
                user.ConfirmationEmail = string.IsNullOrWhiteSpace(user.ConfirmationEmail)
                    ? user.Email
                    : user.ConfirmationEmail.Trim();

                // === 3) Reglas de negocio ===
                var existe = new UserManager().FindEmail(user.Email);
                if (existe != null)
                {
                    log.Warn($"[{rid}] AddUser duplicate email '{user.Email}'");
                    return BadRequest(new GeneralErrorResponseDto { code = "DuplicateUserName", description = "DuplicateUserName" });
                }

                // Alta
                var nuevoUserId = new UserManager().AddUserFromManage(user);
                if (nuevoUserId == 0)
                {
                    log.Warn($"[{rid}] AddUser add failed");
                    return BadRequest(new GeneralErrorResponseDto { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });
                }

                // Rooms
                var roomOk = new roomsManager().ManageroomBystring(user.Rooms, nuevoUserId);
                if (!roomOk)
                {
                    log.Warn($"[{rid}] AddUser room assign failed userId={nuevoUserId}");
                    return BadRequest(new GeneralErrorResponseDto { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });
                }

                // Correo de confirmación
                var tokenMail = await new UserManager().EnvioCodigo(user.Email, "EMAIL", "Register");
                if (string.IsNullOrEmpty(tokenMail))
                {
                    log.Warn($"[{rid}] AddUser confirmation unsent userId={nuevoUserId}");
                    return BadRequest(new GeneralErrorResponseDto { code = "ConfirmationUnsent", description = "ConfirmationUnsent" });
                }

                log.Info($"[{rid}] AddUser ok userId={nuevoUserId}");
                return Ok();
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] AddUser error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }


        [Authorize]
        [HttpPost("UpdateUser")]
        public async Task<IActionResult> UpdateUser(UserAddDTO user)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] UpdateUser start id={user?.IdUsuario}");

                var usuario = new UserManager().UpdateUser(user);
                if (usuario)
                {
                    var room = new roomsManager().ManageroomBystring(user.Rooms, user.IdUsuario);

                    if (room)
                    {
                        log.Info($"[{rid}] UpdateUser ok id={user?.IdUsuario}");
                        return Ok();
                    }
                    else
                    {
                        log.Warn($"[{rid}] UpdateUser room assign failed id={user?.IdUsuario}");
                        return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });
                    }
                }
                else
                {
                    log.Warn($"[{rid}] UpdateUser update failed id={user?.IdUsuario}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateUser error id={user?.IdUsuario}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("UpdateLogUser")]
        public async Task<IActionResult> UpdateLogUser(UpdateUser user)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] UpdateLogUser start id={user?.Email}");

                var usuario = new UserManager().UpdateLogUser(user);
                if (usuario)
                {
                    log.Info($"[{rid}] UpdateLogUser ok id={user?.Email}");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] UpdateLogUser failed id={user?.Email}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "UpdateUser", description = "Error al editar usuario intente más tarde" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateLogUser error id={user?.Email}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("FinishRegister")]
        public async Task<IActionResult> FinishRegister(UserFinishRegistrationDTO user)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] FinishRegister start emailDomain={user?.Email?.Split('@').LastOrDefault()}");

                var usuario = new UserManager().UpdateUserRegistration(user);
                if (usuario)
                {
                    var userManager = new Business.UserManager();
                    var responseDto = userManager.FindEmail(user.Email);
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var byteKey = Encoding.UTF8.GetBytes(configuration.GetSection("SecretKey").Value);

                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new Claim[]
                        {
                            new Claim("User", JsonConvert.SerializeObject(responseDto))
                        }),
                        Expires = DateTime.UtcNow.AddDays(1),
                        Issuer = JwtIssuer,
                        Audience = JwtAudience,
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(byteKey), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var respuesta = new ResponseDTO { user = responseDto, token = token.ToString(), expiration = DateTime.Now.AddDays(1) };

                    log.Info($"[{rid}] FinishRegister ok userId={responseDto?.Id}");
                    return Ok(respuesta);
                }
                else
                {
                    log.Warn($"[{rid}] FinishRegister failed");
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] FinishRegister error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetCreditCardsByUser")]
        public async Task<IActionResult> GetCreditCardsByUser(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] GetCreditCardsByUser start userId={id}");

                var UserManager = new Business.CreditsCardsManager();
                var responseDto = UserManager.GetCardsByUser(id);
                if (responseDto == null)
                {
                    log.Warn($"[{rid}] GetCreditCardsByUser notfound userId={id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    log.Info($"[{rid}] GetCreditCardsByUser ok userId={id}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetCreditCardsByUser error userId={id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("AddCreditCard")]
        public async Task<IActionResult> AddCreditCard(CreditCardRequest Creditcard)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] AddCreditCard start userId={Creditcard?.user_id}");

                var UserManager = new Business.CreditsCardsManager();
                var responseDto = UserManager.AddCreditCard(Creditcard);
                if (string.IsNullOrEmpty(responseDto))
                {
                    log.Info($"[{rid}] AddCreditCard ok userId={Creditcard?.user_id}");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] AddCreditCard business-warning '{responseDto}' userId={Creditcard?.user_id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = responseDto });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] AddCreditCard error userId={Creditcard?.user_id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("DefaultCreditCard")]
        public async Task<IActionResult> DefaultCreditCard(DefaultCreditCard Creditcard)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] DefaultCreditCard start cardId={Creditcard?.id}");

                var UserManager = new Business.CreditsCardsManager();
                var responseDto = UserManager.DefaultCreditCard(Creditcard.id);
                if (responseDto)
                {
                    log.Info($"[{rid}] DefaultCreditCard ok cardId={Creditcard?.id}");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] DefaultCreditCard badrequest cardId={Creditcard?.id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = "Error al actualizar tarjeta" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] DefaultCreditCard error cardId={Creditcard?.id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("DeleteCreditCard")]
        public async Task<IActionResult> DeleteCreditCard(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] DeleteCreditCard start cardId={id}");

                var UserManager = new Business.CreditsCardsManager();
                var responseDto = UserManager.DeleteCreditCard(id);
                if (!responseDto)
                {
                    log.Warn($"[{rid}] DeleteCreditCard badrequest cardId={id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });
                }
                else
                {
                    log.Info($"[{rid}] DeleteCreditCard ok cardId={id}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] DeleteCreditCard error cardId={id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetNumbersByUser")]
        public async Task<IActionResult> GetNumbersByUser(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] GetNumbersByUser start userId={id}");

                var UserManager = new Business.MyNumbersManager();
                var responseDto = UserManager.NumbersByUser(id);
                if (responseDto == null)
                {
                    log.Warn($"[{rid}] GetNumbersByUser notfound userId={id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Numbers" });
                }
                else
                {
                    var json = System.Text.Json.JsonSerializer.Serialize(responseDto);
                    log.Info($"[{rid}] GetNumbersByUser ok userId={id}");
                    return Ok(json);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetNumbersByUser error userId={id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetAllNumbers")]
        public async Task<IActionResult> GetAllNumbers()
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] GetAllNumbers start");

                var UserManager = new Business.MyNumbersManager();
                var responseDto = UserManager.NumbersALL();
                if (responseDto.Count() == 0)
                {
                    log.Warn($"[{rid}] GetAllNumbers empty");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Numbers" });
                }
                else
                {
                    var json = System.Text.Json.JsonSerializer.Serialize(responseDto);
                    log.Info($"[{rid}] GetAllNumbers ok count={responseDto.Count()}");
                    return Ok(json);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetAllNumbers error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        #region billingInformatión
        [Authorize]
        [HttpPost("AddBilling")]
        public async Task<IActionResult> AddBillingInformationUser(BillingInformationDto Billing)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] AddBillingInformationUser start");

                var usuario = new UserManager().AddBillingInformation(Billing);
                if (usuario)
                {
                    log.Info($"[{rid}] AddBillingInformationUser ok");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] AddBillingInformationUser badrequest");
                    return BadRequest(new GeneralErrorResponseDto() { code = "AgregarBilling", description = "Error al guardar billing intente más tarde" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] AddBillingInformationUser error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("UpdateBilling")]
        public async Task<IActionResult> UpdateBillingUser(BillingInformationDto Billing)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] UpdateBillingUser start");

                var usuario = new UserManager().UpdateBillingInformation(Billing);
                if (usuario)
                {
                    log.Info($"[{rid}] UpdateBillingUser ok");
                    return Ok();
                }
                else
                {
                    log.Warn($"[{rid}] UpdateBillingUser badrequest");
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateBillingUser error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetBillingByUser")]
        public async Task<IActionResult> GetBillingByUser(string email)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                var emailDom = email?.Split('@').LastOrDefault();
                log.Info($"[{rid}] GetBillingByUser start emailDomain={emailDom}");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.GetBillingInformation(email);
                if (responseDto == null)
                {
                    log.Warn($"[{rid}] GetBillingByUser notfound");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Billing Information ROOM" });
                }
                else
                {
                    log.Info($"[{rid}] GetBillingByUser ok");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetBillingByUser error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }
        #endregion

        #region rechargue
        [Authorize]
        [HttpPost("AddRechageUser")]
        public async Task<IActionResult> AddRechageUser(CreditRechargeRequest credit)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            log.Info($"[{rid}] Comenzando recarga");
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                var UserManager = new Business.UserManager();
                var responseDto = UserManager.RechargeUser(credit);
                log.Info($"[{rid}] AddRechageUser response='{responseDto}'");

                sw.Stop();
                if (responseDto.StartsWith("http"))
                {
                    log.Info($"[{rid}] AddRechageUser ok (url) ms={sw.ElapsedMilliseconds}");
                    return Ok(responseDto);
                }
                if (!string.IsNullOrEmpty(responseDto))
                {
                    log.Warn($"[{rid}] AddRechageUser business-warning '{responseDto}' ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = responseDto });
                }
                else
                {
                    log.Info($"[{rid}] AddRechageUser ok (empty) ms={sw.ElapsedMilliseconds}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] AddRechageUser error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("UpdateRecharge")]
        public async Task<IActionResult> UpdateRecharge(string ID)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] UpdateRecharge start id={ID}");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.VerifyRechargeStatus(ID);

                if (!responseDto)
                {
                    log.Warn($"[{rid}] UpdateRecharge badrequest id={ID}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    log.Info($"[{rid}] UpdateRecharge ok id={ID}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateRecharge error id={ID}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("GetRechargeByUser")]
        public async Task<IActionResult> GetRechargeByUser(Datepickers Date)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] GetRechargeByUser start");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.GetHistoricByUser(Date);
                if (responseDto.Count() == 0)
                {
                    log.Warn($"[{rid}] GetRechargeByUser empty");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    log.Info($"[{rid}] GetRechargeByUser ok count={responseDto.Count()}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetRechargeByUser error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("SaveNotificationRecharge")]
        public async Task<IActionResult> SaveNotificationRecharge(AmountNotificationRequest Notification)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] SaveNotificationRecharge start");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.SaveRechargeSettings(Notification);
                if (!responseDto)
                {
                    log.Warn($"[{rid}] SaveNotificationRecharge badrequest");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    log.Info($"[{rid}] SaveNotificationRecharge ok");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] SaveNotificationRecharge error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetNotificationRecharge")]
        public async Task<IActionResult> GetNotificationRecharge(int Id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] GetNotificationRecharge start userId={Id}");

                var UserManager = new Business.UserManager();
                var responseDto = UserManager.GetRecharge(Id);
                if (responseDto == null)
                {
                    log.Warn($"[{rid}] GetNotificationRecharge notfound userId={Id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    log.Info($"[{rid}] GetNotificationRecharge ok userId={Id}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetNotificationRecharge error userId={Id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }
        #endregion

        #region BlackList
        [Authorize]
        [HttpGet("GetBlackListByUsers")]
        public async Task<IActionResult> GetBlackListByUsers(int id)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] GetBlackListByUsers start userId={id}");

                var BlackListManager = new Business.BlackListManager();
                var responseDto = BlackListManager.GetRecordsByUser(id);
                if (responseDto == null)
                {
                    log.Warn($"[{rid}] GetBlackListByUsers notfound userId={id}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Billing Information ROOM" });
                }
                else
                {
                    log.Info($"[{rid}] GetBlackListByUsers ok userId={id}");
                    return Ok(responseDto);
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetBlackListByUsers error userId={id}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("AddBlackList")]
        public async Task<IActionResult> AddBlackList(BlackListRequest blacklist)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                log.Info($"[{rid}] AddBlackList start hasFile={(string.IsNullOrEmpty(blacklist?.FileBase64) ? "false" : "true")}");

                var BlackListManager = new Business.BlackListManager();
                if (string.IsNullOrEmpty(blacklist.FileBase64))
                {
                    var responsephones = BlackListManager.SavePhoneList(blacklist);
                    if (!responsephones)
                    {
                        log.Warn($"[{rid}] AddBlackList SavePhoneList badrequest");
                        return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                    }
                    else
                    {
                        log.Info($"[{rid}] AddBlackList SavePhoneList ok");
                        return Ok(responsephones);
                    }
                }
                else
                {
                    var responseDto = BlackListManager.ProcessExcelBase64(blacklist);
                    if (!responseDto)
                    {
                        log.Warn($"[{rid}] AddBlackList ProcessExcelBase64 badrequest");
                        return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                    }
                    else
                    {
                        log.Info($"[{rid}] AddBlackList ProcessExcelBase64 ok");
                        return Ok(responseDto);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] AddBlackList error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("UpdateBlackList")]
        public async Task<IActionResult> UpdateBlackList(UpdateBlackList blacklist)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                log.Info($"[{rid}] UpdateBlackList start");

                var BlackListManager = new Business.BlackListManager();
                var response = BlackListManager.UpdateBlacklist(blacklist);
                if (response)
                {
                    log.Info($"[{rid}] UpdateBlackList ok");
                    return Ok(response);
                }
                else
                {
                    log.Warn($"[{rid}] UpdateBlackList badrequest");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateBlackList error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("GetBlackListRecords")]
        public async Task<IActionResult> GetBlackListRecords(BlackListRecords blacklist)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                log.Info($"[{rid}] GetBlackListRecords start");

                var BlackListManager = new Business.BlackListManager();
                var response = BlackListManager.GetRecordsBlackList(blacklist);
                if (response != null)
                {
                    log.Info($"[{rid}] GetBlackListRecords ok");
                    return Ok(response);
                }
                else
                {
                    log.Warn($"[{rid}] GetBlackListRecords notfound");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetBlackListRecords error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("UpdateBlackListRecord")]
        public async Task<IActionResult> UpdateBlackListRecord(BlackListManagment blacklist)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                log.Info($"[{rid}] UpdateBlackListRecord start hasFile={(string.IsNullOrEmpty(blacklist?.FileBase64) ? "false" : "true")}");

                var BlackListManager = new Business.BlackListManager();
                if (string.IsNullOrEmpty(blacklist.FileBase64))
                {
                    var response = BlackListManager.UpdateRecordsBlackList(blacklist);
                    if (response)
                    {
                        log.Info($"[{rid}] UpdateBlackListRecord ok");
                        return Ok(response);
                    }
                    else
                    {
                        log.Warn($"[{rid}] UpdateBlackListRecord badrequest");
                        return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                    }
                }
                else
                {
                    var response = BlackListManager.ProcessExcelUpdateBase64(blacklist);
                    if (response)
                    {
                        log.Info($"[{rid}] UpdateBlackListRecord (excel) ok");
                        return Ok(response);
                    }
                    else
                    {
                        log.Warn($"[{rid}] UpdateBlackListRecord (excel) badrequest");
                        return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateBlackListRecord error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("DeleteBlackList")]
        public async Task<IActionResult> DeleteBlackList(DeleteBlackList blacklist)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                log.Info($"[{rid}] DeleteBlackList start");

                var BlackListManager = new Business.BlackListManager();
                var response = BlackListManager.DeletePhoneList(blacklist);
                if (response)
                {
                    log.Info($"[{rid}] DeleteBlackList ok");
                    return Ok(response);
                }
                else
                {
                    log.Warn($"[{rid}] DeleteBlackList badrequest");
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] DeleteBlackList error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }
        #endregion

        #region templates
        [Authorize]
        [HttpPost("AddTemplate")]
        public IActionResult AddTemplate(AddTemplate addTemplate)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] AddTemplate start roomId={addTemplate?.idroom}");

                var templateManager = new TemplateManager();
                var result = templateManager.CreateTemplate(addTemplate);

                if (result)
                {
                    log.Info($"[{rid}] AddTemplate ok");
                    return Ok(new { message = "Template creado correctamente." });
                }
                else
                {
                    log.Warn($"[{rid}] AddTemplate badrequest");
                    return BadRequest(new GeneralErrorResponseDto() { code = "ErrorCreatingTemplate", description = "Error al crear template." });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] AddTemplate error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetTemplatesByRoom")]
        public IActionResult GetTemplatesByRoom(int idRoom)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetTemplatesByRoom start roomId={idRoom}");

                var templateManager = new TemplateManager();
                var templates = templateManager.GetTemplatesByRoom(idRoom);

                if (templates != null)
                {
                    log.Info($"[{rid}] GetTemplatesByRoom ok");
                    return Ok(templates);
                }
                else
                {
                    log.Warn($"[{rid}] GetTemplatesByRoom notfound");
                    return BadRequest(new GeneralErrorResponseDto() { code = "TemplatesNotFound", description = "No se encontraron plantillas para este Room." });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetTemplatesByRoom error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("UpdateTemplate")]
        public IActionResult UpdateTemplate(UpdateTemplateRequest updateTemplate)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] UpdateTemplate start name='{updateTemplate?.newName}' roomId={updateTemplate?.idRoom}");

                var templateManager = new TemplateManager();
                var result = templateManager.UpdateTemplateByNameAndRoom(updateTemplate);

                if (result)
                {
                    log.Info($"[{rid}] UpdateTemplate ok");
                    return Ok(new { message = "Template actualizado correctamente." });
                }
                else
                {
                    log.Warn($"[{rid}] UpdateTemplate notfound");
                    return BadRequest(new GeneralErrorResponseDto() { code = "TemplateNotFound", description = "No se encontró el template para actualizar." });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] UpdateTemplate error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("DeleteTemplate")]
        public IActionResult DeleteTemplate(TemplateRequest deleteTemplate)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] DeleteTemplate start name='{deleteTemplate?.name}' roomId={deleteTemplate?.idRoom}");

                var templateManager = new TemplateManager();
                var result = templateManager.DeleteTemplateByNameAndRoom(deleteTemplate);

                if (result)
                {
                    log.Info($"[{rid}] DeleteTemplate ok");
                    return Ok(new { message = "Template eliminado correctamente." });
                }
                else
                {
                    log.Warn($"[{rid}] DeleteTemplate notfound");
                    return BadRequest(new GeneralErrorResponseDto() { code = "TemplateNotFound", description = "No se encontró el template para eliminar." });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] DeleteTemplate error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("getcampaignsbytemplate")]
        public IActionResult getcampaignsbytemplate(TemplateRequest Template)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] getcampaignsbytemplate start name='{Template?.name}' roomId={Template?.idRoom}");

                var templateManager = new TemplateManager();
                var result = templateManager.GetCampainsByTemplate(Template);

                if (result != null)
                {
                    log.Info($"[{rid}] getcampaignsbytemplate ok");
                    return Ok(result);
                }
                else
                {
                    log.Warn($"[{rid}] getcampaignsbytemplate notfound");
                    return BadRequest(new GeneralErrorResponseDto() { code = "TemplateNotFound", description = "No se encontró el template para actualizar." });
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] getcampaignsbytemplate error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }
        #endregion

        [Authorize]
        [HttpPost("GetCampaignKPIByRoom")]
        public IActionResult GetCampaignKPIByRoom(CampaignKPIRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetCampaignKPIByRoom start roomId={request?.RoomId}");
                var result = new UserManager().GetCampaignKPIByRoom(request);
                log.Info($"[{rid}] GetCampaignKPIByRoom ok");
                return Ok(result);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetCampaignKPIByRoom error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("GetUseData")]
        public IActionResult GetUseData(UseRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetUseData start roomId={request?.RoomId}");
                var data = new UserManager().GetUsageByRoom(request);
                log.Info($"[{rid}] GetUseData ok");
                return Ok(data);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetUseData error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetCampaignsByRoom")]
        public IActionResult GetCampaignsByRoom(int roomId, int smsType)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetCampaignsByRoom start roomId={roomId} smsType={smsType}");
                var data = new UserManager().GetCampaignsByRoom(roomId, smsType);
                log.Info($"[{rid}] GetCampaignsByRoom ok");
                return Ok(data);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetCampaignsByRoom error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetAllCampaignsByRoom")]
        public IActionResult GetAllCampaignsByRoom(int roomId)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetAllCampaignsByRoom start roomId={roomId}");
                var data = new UserManager().GetallCampaignsByRoom(roomId);
                log.Info($"[{rid}] GetAllCampaignsByRoom ok");
                return Ok(data);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetAllCampaignsByRoom error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetUsersByRoom")]
        public IActionResult GetUsersByRoom(int roomId)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetUsersByRoom start roomId={roomId}");
                var data = new UserManager().GetUsersByRoom(roomId);
                log.Info($"[{rid}] GetUsersByRoom ok");
                return Ok(data);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetUsersByRoom error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("GetReport")]
        public IActionResult GetReport([FromBody] ReportRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetReport start type='{request?.ReportType}'");

                if (string.IsNullOrWhiteSpace(request.ReportType))
                {
                    log.Warn($"[{rid}] GetReport badrequest missing type");
                    return BadRequest("El tipo de reporte es obligatorio.");
                }

                var manager = new ReportManager();

                switch (request.ReportType.ToLower())
                {
                    case "global":
                        log.Info($"[{rid}] GetReport global");
                        return Ok(manager.GetSmsReport(request));
                        break;
                    case "mensajes entrantes":
                    case "mensajes enviados":
                    case "mensajes no enviados":
                    case "mensajes rechazados":
                        log.Info($"[{rid}] GetReport detalle '{request.ReportType}'");
                        return Ok(manager.GetSmsReportSend(request));

                    default:
                        log.Warn($"[{rid}] GetReport invalid type='{request.ReportType}'");
                        return BadRequest("Tipo de reporte no válido. Solo se permiten: global, entrantes, enviados, noenviados, rechazados.");
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetReport error", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpGet("GetConfigurationPss")]
        public IActionResult GetConfigurationPss(int userId)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            try
            {
                log.Info($"[{rid}] GetConfigurationPss start userId={userId}");
                var data = new ClientManager().ObtenerClienteporID(userId);
                if (data != null)
                {
                    log.Info($"[{rid}] GetConfigurationPss ok userId={userId}");
                    return Ok(data);
                }
                else
                {
                    log.Warn($"[{rid}] GetConfigurationPss notfound userId={userId}");
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] GetConfigurationPss error userId={userId}", ex);
                return StatusCode(500, new { message = "Error en el servidor" });
            }
        }

        [Authorize]
        [HttpPost("GenerateInvoice")]
        public async Task<ActionResult<bool>> GenerateInvoice([FromBody] GenerateInvoice invoice)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();

            try
            {
                log.Info($"[{rid}] GenerateInvoice start creditId={invoice?.IdCredit} userId={invoice?.IdUser}");

                var villanet = new Villanet();
                var data = await villanet.GenerarFacturaAsync(invoice.IdCredit, invoice.IdUser);

                sw.Stop();
                if (!data.Success)
                {
                    log.Warn($"[{rid}] GenerateInvoice gateway-fail creditId={invoice?.IdCredit} ms={sw.ElapsedMilliseconds} error = {data.ErrorMessage}");
                    return StatusCode(502, false);
                }

                log.Info($"[{rid}] GenerateInvoice ok creditId={invoice?.IdCredit} ms={sw.ElapsedMilliseconds}");
                return Ok(true);
            }
            catch (Exception ex)
            {
                sw.Stop();
                log.Error($"[{rid}] GenerateInvoice error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(500, false);
            }
        }

        [Authorize]
        [HttpPost("CheckInvoice")]
        public async Task<ActionResult<bool>> CheckInvoice([FromBody] GenerateInvoice invoice)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                log.Info($"[{rid}] CheckInvoice start creditId={invoice?.IdCredit}");

                var villanet = new Villanet();
                var data = villanet.ObtenerFacturaResumenPorRecarga(invoice.IdCredit);

                if (data == null)
                {
                    log.Warn($"[{rid}] CheckInvoice notfound creditId={invoice?.IdCredit}");
                    return StatusCode(502, false);
                }

                log.Info($"[{rid}] CheckInvoice ok creditId={invoice?.IdCredit}");
                return Ok(data);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] CheckInvoice error creditId={invoice?.IdCredit}", ex);
                return StatusCode(500, false);
            }
        }

        [Authorize]
        [HttpPost("DownloadInovice")]
        public async Task<ActionResult<bool>> DownloadInovice([FromBody] GenerateInvoice invoice)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

            try
            {
                log.Info($"[{rid}] DownloadInovice start creditId={invoice?.IdCredit}");

                var villanet = new Villanet();
                var data = villanet.Getbase64xml(invoice.IdCredit);

                if (data == null)
                {
                    log.Warn($"[{rid}] DownloadInovice notfound creditId={invoice?.IdCredit}");
                    return StatusCode(502, false);
                }

                log.Info($"[{rid}] DownloadInovice ok creditId={invoice?.IdCredit}");
                return Ok(data);
            }
            catch (Exception ex)
            {
                log.Error($"[{rid}] DownloadInovice error creditId={invoice?.IdCredit}", ex);
                return StatusCode(500, false);
            }
        }
    }
}
