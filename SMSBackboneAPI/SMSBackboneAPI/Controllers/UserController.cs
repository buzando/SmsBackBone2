using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserController));
        string JwtIssuer = "Issuer";
        string JwtAudience = "Audience";
        private IConfiguration configuration;
        public UserController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }


        [HttpPost("Login")]
        public async Task<IActionResult> Authenticate(LoginDto Login)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var userManager = new Business.UserManager();
            var responseDto = userManager.Login(Login.email, Login.password);
            if (responseDto != null)
            {
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
                // var response = Ok(tokenHandler.WriteToken(token));
                if (!responseDto.emailConfirmed)
                {


                    return BadRequest(new GeneralErrorResponseDto() { code = "UnconfirmedEmail", description = "Confirmation email could not be sent" });
                }
                if (!responseDto.status)
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "UserLocked", description = "User locked" });

                }
                var response = Ok(respuesta);

                return response;
            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "BadCredentials", description = "Bad Credentials" });

            }
        }

        [HttpPost("LockUser")]
        public async Task<IActionResult> LockUser(lockDTO user)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var userManager = new Business.UserManager();
            var responseDto = userManager.LockUser(user);
            if (responseDto)
            {

                var response = Ok();

                return response;
            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "", description = "" });

            }
        }

        [AllowAnonymous]
        [HttpGet("GenerateconfirmationEmail")]
        public async Task<IActionResult> GenerateMail(string email, string type)//string email,[FromBody] string urlCallback)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();
            //if (_context.Users == null)
            //{
            //    return NoContent();
            //}

            //var user = await _userManager.FindByIdAsync(Convert.ToString(id));
            //var valid = _emailServices.ValidateEmail(email);
            //if (valid == null)
            //{
            //    return BadRequest(valid);
            //}

            var userManager = new Business.UserManager();

            var user = userManager.FindEmail(email);
            if (user == null)
            {
                errorResponse.code = "InvalidUser";
                errorResponse.description = "No matches found";
                return BadRequest(errorResponse);
            }

            var URL = Common.ConfigurationManagerJson("UrlSitioRecuperacion");
            var typeemail = 0;
            if (type == "confirmation")
            {
                typeemail = 1;
            }
            if (type == "GenerateMailMessage")
            {
                typeemail = 2;
            }
            var token = userManager.GeneraToken(user.Id, typeemail);
            //var confirmationLink = $"{urlCallback}?email={email}&token={token}"; 
            string body = MailManager.GenerateMailMessage(user.email, token, URL, "confirmation");
            bool emailResponse = MailManager.SendEmail(user.email, "Confirm your email", body);


            if (emailResponse)
            {
                return Ok(new { success = "success", message = "Confirmation email has been sent" });
            }
            else
            {
                errorResponse.code = "ConfirmationUnset";
                errorResponse.description = "Confirmation email could not be sent";
                return BadRequest(errorResponse);
            }
        }

        [AllowAnonymous]
        [HttpGet("confirmationEmail")]
        public IActionResult ConfirmMail(string email, string token)//string email,[FromBody] string urlCallback)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.UserManager();

            var confirmation = userManager.FindEmailToken(email, token);
            var URL = Common.ConfigurationManagerJson("UrlSitio");
            if (!confirmation)
            {
                //Response.Redirect(URL);

            }
            else
            {
                //Response.Redirect(URL);

            }
            return Redirect(URL);
        }

        [AllowAnonymous]
        [HttpGet("SendConfirmation")]
        public async Task<IActionResult> sendConfirmationMail(string dato, string tipo, string reason)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.UserManager();
            var token = await userManager.EnvioCodigo(dato, tipo, reason);
            if (!string.IsNullOrEmpty(token))
            {
                var response = Ok(token);
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }

        [AllowAnonymous]
        [HttpGet("SaveTwoFactor")]
        public IActionResult SaveTwoFactor(string email)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.UserManager();
            var save = userManager.SaveTwoFactor(email);
            if (save)
            {
                var response = Ok();
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }

        [AllowAnonymous]
        [HttpGet("GetRooms")]
        public IActionResult Roomsbyuser(string email)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.UserManager();
            var listrooms = userManager.roomsByUser(email);
            if (listrooms.Count() > 0)
            {
                var response = Ok(listrooms);
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }

        [AllowAnonymous]
        [HttpGet("GetUserByEmail")]
        public IActionResult GetUserByEmail(string email)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.UserManager();
            var user = userManager.FindEmail(email);
            if (user != null)
            {
                var response = Ok(user);
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }

        [HttpPost("NewPassword")]
        public async Task<IActionResult> NewPassword(PasswordResetDTO Login)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var userManager = new Business.UserManager();
            var responseDto = userManager.NewPassword(Login);
            if (!responseDto)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Password invalid" });



            }
            else
            {
                var user = userManager.FindEmail(Login.Email);
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
                var respuesta = new ResponseDTO { user = user, token = token.ToString(), expiration = DateTime.Now.AddDays(1) };
                var response = Ok(respuesta);
                return response;
            }
        }


        [HttpGet("Credit")]
        public async Task<IActionResult> Credit()
        {
            var autenticate = new AutenticationBearer(configuration).Validate(Request);
            if (autenticate == null)
            {
                return BadRequest("Token inválido.");
            }
            var userManager = new Business.UserManager();
            var result = userManager.GetCredit(autenticate.userName);
            return Ok(result);
        }


        [HttpPost("registerAccount")]
        public async Task<IActionResult> RegisterUser(RegisterUser user)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            log.Info("Buscando correo electronico en la plataforma");
            var existe = new UserManager().FindEmail(user.email);
            if (existe != null)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "DuplicateUserName", description = "DuplicateUserName" });

            }
            var clientManager = new Business.ClientManager();
            log.Info("Buscando Cliente por nombre");
            var responseDto = clientManager.ObtenerClienteporNombre(user.client);
            if (responseDto == null)
            {
                var newclient = new clientDTO { nombrecliente = user.client };
                log.Info("Agregando cliente");
                var add = clientManager.AgregarCliente(newclient);
                if (add)
                {
                    log.Info("Añadiendo usuario del registro");
                    var usuario = new UserManager().AddUserFromRegister(user);
                    if (usuario != null)
                    {
                        var room = new roomsManager().addroomByNewUser(usuario.Id, usuario.IdCliente);
                        if (room)
                        {
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
                            var respuesta = new ResponseDTO { user = usuario, token = token.ToString(), expiration = DateTime.Now.AddDays(1) };
                            return Ok(respuesta);
                        }
                        else
                        {
                            return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                        }
                    }
                    else
                    {
                        return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                    }
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                }
            }
            else
            {
                var usuario = new UserManager().AddUserFromRegister(user);
                if (usuario != null)
                {
                    var room = new roomsManager().addroomByNewUser(usuario.Id, usuario.IdCliente);
                    if (room)
                    {
                        //var token = new UserManager().EnvioCodigo(user.email, "EMAIL");
                        //if (string.IsNullOrEmpty(token))
                        //{
                        //    return BadRequest(new GeneralErrorResponseDto() { code = "ConfirmationUnsent", description = "ConfirmationUnsent" });

                        //}
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
                        var respuesta = new ResponseDTO { user = usuario, token = token.ToString(), expiration = DateTime.Now.AddDays(1) };
                        return Ok(respuesta);
                        return Ok(usuario);
                    }
                    else
                    {
                        return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                    }
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                }

            }
        }

        [AllowAnonymous]
        [HttpGet("GetUsersByClient")]
        public IActionResult GetUsersByClient(int Client)
        {
            GeneralErrorResponseDto errorResponse = new GeneralErrorResponseDto();


            var userManager = new Business.UserManager();
            var users = userManager.FindUsers(Client);
            if (users.Count() > 0)
            {
                var response = Ok(users);
                return response;
            }
            else
            {
                var response = BadRequest(errorResponse);
                return response;
            }

        }


        [HttpGet("DeleteUserByid")]
        public async Task<IActionResult> DeleteUserByid(int id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.DeleteUser(id);
            if (!responseDto)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok();
                return response;
            }
        }

        [HttpPost("AddUser")]
        public async Task<IActionResult> AddUser(UserAddDTO user)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}

            var existe = new UserManager().FindEmail(user.Email);
            if (existe != null)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "DuplicateUserName", description = "DuplicateUserName" });

            }

            var usuario = new UserManager().AddUserFromManage(user);
            if (usuario != 0)
            {

                var room = new roomsManager().ManageroomBystring(user.Rooms, usuario);

                if (room)
                {
                    var enviomail = await new UserManager().EnvioCodigo(user.Email, "EMAIL", "Register");
                    if (string.IsNullOrEmpty(enviomail))
                    {
                        return BadRequest(new GeneralErrorResponseDto() { code = "ConfirmationUnsent", description = "ConfirmationUnsent" });

                    }

                    return Ok();
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                }
            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

            }


        }

        [HttpPost("UpdateUser")]
        public async Task<IActionResult> UpdateUser(UserAddDTO user)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}

            var usuario = new UserManager().UpdateUser(user);
            if (usuario)
            {

                var room = new roomsManager().ManageroomBystring(user.Rooms, user.IdUsuario);

                if (room)
                {

                    return Ok();
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

                }
            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

            }


        }

        [HttpPost("UpdateLogUser")]
        public async Task<IActionResult> UpdateLogUser(UpdateUser user)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}

            var usuario = new UserManager().UpdateLogUser(user);
            if (usuario)
            {



                return Ok();


            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "UpdateUser", description = "Error al editar usuario intente más tarde" });

            }


        }

        [HttpPost("FinishRegister")]
        public async Task<IActionResult> FinishRegister(UserFinishRegistrationDTO user)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}

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

                var response = Ok(respuesta);

                return response;

            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

            }


        }

        [HttpGet("GetCreditCardsByUser")]
        public async Task<IActionResult> GetCreditCardsByUser(int id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.CreditsCardsManager();
            var responseDto = UserManager.GetCardsByUser(id);
            if (responseDto == null)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

        [HttpPost("AddCreditCard")]
        public async Task<IActionResult> AddCreditCard(CreditCardRequest Creditcard)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.CreditsCardsManager();
            var responseDto = UserManager.AddCreditCard(Creditcard);
            if (string.IsNullOrEmpty(responseDto))
            {


                var response = Ok();
                return response;

            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = responseDto });

            }

        }

        [HttpPost("DefaultCreditCard")]
        public async Task<IActionResult> DefaultCreditCard(DefaultCreditCard Creditcard)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.CreditsCardsManager();
            var responseDto = UserManager.DefaultCreditCard(Creditcard.id);
            if (responseDto)
            {


                var response = Ok();
                return response;

            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Repedito", description = "Error al actualizar tarjeta" });

            }

        }

        [HttpGet("DeleteCreditCard")]
        public async Task<IActionResult> DeleteCreditCard(int id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.CreditsCardsManager();
            var responseDto = UserManager.DeleteCreditCard(id);
            if (!responseDto)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

        [HttpGet("GetNumbersByUser")]
        public async Task<IActionResult> GetNumbersByUser(int id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.MyNumbersManager();
            var responseDto = UserManager.NumbersByUser(id);
            if (responseDto.Count() == 0)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Numbers" });



            }
            else
            {
                var json = System.Text.Json.JsonSerializer.Serialize(responseDto);

                var response = Ok(json);
                return response;
            }
        }


        [HttpGet("GetAllNumbers")]
        public async Task<IActionResult> GetAllNumbers()
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.MyNumbersManager();
            var responseDto = UserManager.NumbersALL();
            if (responseDto.Count() == 0)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Numbers" });

            }
            else
            {
                var json = System.Text.Json.JsonSerializer.Serialize(responseDto);
                var response = Ok(json);
                return response;
            }
        }

        #region billingInformatión

        [HttpPost("AddBilling")]
        public async Task<IActionResult> AddBillingInformationUser(BillingInformationDto Billing)
        {

            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];

            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}


            var usuario = new UserManager().AddBillingInformation(Billing);
            if (usuario)
            {

                return Ok();


            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "AgregarBilling", description = "Error al guardar billing intente más tarde" });

            }


        }

        [HttpPost("UpdateBilling")]
        public async Task<IActionResult> UpdateBillingUser(BillingInformationDto Billing)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}

            var usuario = new UserManager().UpdateBillingInformation(Billing);
            if (usuario)
            {


                return Ok();

            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "agregarusuario", description = "Error al guardar usuario intente más tarde" });

            }


        }

        [HttpGet("GetBillingByUser")]
        public async Task<IActionResult> GetBillingByUser(string email)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.GetBillingInformation(email);
            if (responseDto == null)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Billing Information ROOM" });



            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }
        #endregion

        #region Notification


        #endregion

        #region rechargue
        [HttpPost("AddRechageUser")]
        public async Task<IActionResult> AddRechageUser(CreditRechargeRequest credit)
        {
            log.Info("Comenzando recarga");
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.RechargeUser(credit);
            log.Info(responseDto);
            if (responseDto.StartsWith("http"))
            {
               return Ok(responseDto);
            }
            if (!string.IsNullOrEmpty(responseDto))
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = responseDto });
            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }

        }

        [HttpGet("UpdateRecharge")]
        public async Task<IActionResult> UpdateRecharge(string ID)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.VerifyRechargeStatus(ID);

            if (!responseDto)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }

        }

        [HttpPost("GetRechargeByUser")]
        public async Task<IActionResult> GetRechargeByUser(Datepickers Date)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.GetHistoricByUser(Date);
            if (responseDto.Count() == 0)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }

        }

        [HttpPost("SaveNotificationRecharge")]
        public async Task<IActionResult> SaveNotificationRecharge(AmountNotificationRequest Notification)
         {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.SaveRechargeSettings(Notification);
            if (!responseDto)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

        [HttpGet("GetNotificationRecharge")]
        public async Task<IActionResult> GetNotificationRecharge(int Id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            var UserManager = new Business.UserManager();
            var responseDto = UserManager.GetRecharge(Id);
            if (responseDto == null)
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

        #endregion

        #region BlackList
        [HttpGet("GetBlackListByUsers")]
        public async Task<IActionResult> GetBlackListByUsers(int id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var BlackListManager = new Business.BlackListManager();
            var responseDto = BlackListManager.GetRecordsByUser(id);
            if (responseDto == null)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Getting Billing Information ROOM" });



            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

        [HttpPost("AddBlackList")]
        public async Task<IActionResult> AddBlackList(BlackListRequest blacklist)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var BlackListManager = new Business.BlackListManager();
            if (string.IsNullOrEmpty(blacklist.FileBase64))
            {
                var responsephones = BlackListManager.SavePhoneList(blacklist);
                if (!responsephones)
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    var response = Ok(responsephones);
                    return response;
                }
            }
            else
            {
                var responseDto = BlackListManager.ProcessExcelBase64(blacklist);
                if (!responseDto)
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });
                }
                else
                {
                    var response = Ok(responseDto);
                    return response;
                }
            }


        }

        [HttpPost("UpdateBlackList")]
        public async Task<IActionResult> UpdateBlackList(UpdateBlackList blacklist)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var BlackListManager = new Business.BlackListManager();
            var response = BlackListManager.UpdateBlacklist(blacklist);
            if (response)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });

            }


        }
        [HttpPost("GetBlackListRecords")]
        public async Task<IActionResult> GetBlackListRecords(BlackListRecords blacklist)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var BlackListManager = new Business.BlackListManager();
            var response = BlackListManager.GetRecordsBlackList(blacklist);
            if (response != null)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });

            }


        }
        [HttpPost("UpdateBlackListRecord")]
        public async Task<IActionResult> UpdateBlackListRecord(BlackListManagment blacklist)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var BlackListManager = new Business.BlackListManager();
            if (string.IsNullOrEmpty(blacklist.FileBase64))
            {
                var response = BlackListManager.UpdateRecordsBlackList(blacklist);
                if (response)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });

                }
            }
            else
            {
                var response = BlackListManager.ProcessExcelUpdateBase64(blacklist);
                if (response)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });


                }

            }


        }

        [HttpPost("DeleteBlackList")]
        public async Task<IActionResult> DeleteBlackList(DeleteBlackList blacklist)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var BlackListManager = new Business.BlackListManager();

                var response = BlackListManager.DeletePhoneList(blacklist);
                if (response)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Adding Recharge" });

                }



        }

        #endregion

        #region templates

        [HttpPost("AddTemplate")]
        public IActionResult AddTemplate(AddTemplate addTemplate)
        {
            var templateManager = new TemplateManager();
            var result = templateManager.CreateTemplate(addTemplate);

            if (result)
                return Ok(new { message = "Template creado correctamente." });
            else
                return BadRequest(new GeneralErrorResponseDto() { code = "ErrorCreatingTemplate", description = "Error al crear template." });
        }
        [HttpGet("GetTemplatesByRoom")]
        public IActionResult GetTemplatesByRoom(int idRoom)
        {
            var templateManager = new TemplateManager();
            var templates = templateManager.GetTemplatesByRoom(idRoom);

            if (templates != null)
                return Ok(templates);
            else
                return BadRequest(new GeneralErrorResponseDto() { code = "TemplatesNotFound", description = "No se encontraron plantillas para este Room." });
        }
        [HttpPost("UpdateTemplate")]
        public IActionResult UpdateTemplate(UpdateTemplateRequest updateTemplate)
        {
            var templateManager = new TemplateManager();
            var result = templateManager.UpdateTemplateByNameAndRoom(updateTemplate);

            if (result)
                return Ok(new { message = "Template actualizado correctamente." });
            else
                return BadRequest(new GeneralErrorResponseDto() { code = "TemplateNotFound", description = "No se encontró el template para actualizar." });
        }
        [HttpPost("DeleteTemplate")]
        public IActionResult DeleteTemplate(TemplateRequest deleteTemplate)
        {
            var templateManager = new TemplateManager();
            var result = templateManager.DeleteTemplateByNameAndRoom(deleteTemplate);

            if (result)
                return Ok(new { message = "Template eliminado correctamente." });
            else
                return BadRequest(new GeneralErrorResponseDto() { code = "TemplateNotFound", description = "No se encontró el template para eliminar." });
        }
        [HttpPost("getcampaignsbytemplate")]
        public IActionResult getcampaignsbytemplate(TemplateRequest Template)
        {
            var templateManager = new TemplateManager();
            var result = templateManager.GetCampainsByTemplate(Template);

            if (result != null)
                return Ok(result);
            else
                return BadRequest(new GeneralErrorResponseDto() { code = "TemplateNotFound", description = "No se encontró el template para actualizar." });
        }
        #endregion

        [HttpPost("GetCampaignKPIByRoom")]
        public IActionResult GetCampaignKPIByRoom(CampaignKPIRequest request)
        {
            var result = new UserManager().GetCampaignKPIByRoom(request);
            return Ok(result);
        }
        [HttpPost("GetUseData")]
        public IActionResult GetUseData(UseRequest request)
        {
            var data = new UserManager().GetUsageByRoom(request);
            return Ok(data);
        }

        [HttpGet("GetCampaignsByRoom")]
        public IActionResult GetCampaignsByRoom(int roomId, int smsType)
        {
            var data = new UserManager().GetCampaignsByRoom(roomId, smsType);
            return Ok(data);
        }
        [HttpGet("GetAllCampaignsByRoom")]
        public IActionResult GetAllCampaignsByRoom(int roomId)
        {
            var data = new UserManager().GetallCampaignsByRoom(roomId);
            return Ok(data);
        }

        [HttpGet("GetUsersByRoom")]
        public IActionResult GetUsersByRoom(int roomId)
        {
            var data = new UserManager().GetUsersByRoom(roomId);
            return Ok(data);
        }
        [HttpPost("GetReport")]
        public IActionResult GetReport([FromBody] ReportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ReportType))
                return BadRequest("El tipo de reporte es obligatorio.");

            var manager = new UserManager();

            switch (request.ReportType.ToLower())
            {
                case "global":
                    return Ok(manager.GetSmsReport(request));
                    break;
                case "mensajes entrantes":
                case "mensajes enviados":
                case "mensajes no enviados":
                case "mensajes rechazados":
                    return Ok(manager.GetSmsReportSend(request));

                default:
                    return BadRequest("Tipo de reporte no válido. Solo se permiten: global, entrantes, enviados, noenviados, rechazados.");
            }
        }


    }
}
