using AutoMapper;
using Contract.Response;
using Microsoft.Identity.Client;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Contract.Request;
using System.Numerics;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Modal.Model;
using log4net;
using Openpay;
using Openpay.Entities;
using Openpay.Entities.Request;
using Contract;
using Contract.Other;
using DocumentFormat.OpenXml.Spreadsheet;
using Azure.Core.Pipeline;
using DocumentFormat.OpenXml.Office2010.PowerPoint;
using DocumentFormat.OpenXml.Math;
using BCrypt;
using Microsoft.Data.SqlClient;
using System.Data;
using Azure;
namespace Business
{
    public class UserManager
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserManager));

        public UserDto Login(string user, string password)
        {
            var userdto = new UserDto();
            /*Petición a base de datos*/
            using (var context = new Entities())
            {
                var userdb = context.Users.FirstOrDefault(p => p.email == user && p.passwordHash == password);

                var config = new MapperConfiguration(cfg =>

    cfg.CreateMap<Modal.Model.Model.Users, UserDto>()

); var mapper = new Mapper(config);

                userdto = mapper.Map<UserDto>(userdb);
                userdto.rol = context.Roles.Where(x => x.id == userdb.idRole).Select(x => x.Role).FirstOrDefault();

            }

            //UserDto result = new UserDto
            //{
            //    userName = user,
            //    email = "user@correo.com",
            //    accessFailedCount = 0,
            //    lockoutEnabled = false,
            //    rol = 0,
            //    status = true
            //};
            return userdto;
        }

        public UserDto FindEmail(string email)
        {
            var client = string.Empty;
            try
            {

                var userdto = new UserDto();
                /*Petición a base de datos*/
                using (var context = new Entities())
                {
                    var userdb = context.Users.FirstOrDefault(p => p.email == email);

                    var config = new MapperConfiguration(cfg =>

        cfg.CreateMap<Modal.Model.Model.Users, UserDto>()

    ); var mapper = new Mapper(config);

                    userdto = mapper.Map<UserDto>(userdb);
                    userdto.Client = context.clients.Where(x => x.id == userdb.IdCliente).Select(x => x.nombrecliente).FirstOrDefault();
                    userdto.rol = context.Roles.Where(x => x.id == userdb.idRole).Select(x => x.Role).FirstOrDefault();

                }

                //UserDto result = new UserDto
                //{
                //    userName = user,
                //    email = "user@correo.com",
                //    accessFailedCount = 0,
                //    lockoutEnabled = false,
                //    rol = 0,
                //    status = true
                //};

                return userdto;
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                return null;
            }
        }

        public List<UserAdministrationDTO> FindUsers(int Client)
        {
            var userDtoList = new List<UserAdministrationDTO>();
            try
            {

                using (var ctx = new Entities())
                {
                    userDtoList = ctx.roomsbyuser
    .Join(ctx.Users,
          rb => rb.idUser, // Clave foránea en roomsbyuser
          u => u.Id,       // Clave primaria en users
          (rb, u) => new { rb, u }) // Combina roomsbyuser y users
    .Join(ctx.clients,
          combined => combined.u.IdCliente, // Clave foránea en users
          c => c.id,                        // Clave primaria en clients
          (combined, c) => new { combined.rb, combined.u, c }) // Combina users con clients
    .Join(ctx.Roles,
          combined => combined.u.idRole,   // Clave foránea en users
          r => r.id,                       // Clave primaria en Roles
          (combined, r) => new { combined.rb, combined.u, combined.c, r }) // Combina con Roles
    .Where(x => x.c.id == Client) // Filtra por id del cliente aquí
    .GroupBy(x => new
    {
        x.u.Id,
        x.u.firstName,
        x.u.email,
        x.u.status,
        x.u.idRole,
        x.r.Role,
        x.u.phonenumber,
        x.c.nombrecliente
    })
    .Select(group => new UserAdministrationDTO
    {
        id = group.Key.Id,
        name = group.Key.firstName,
        email = group.Key.email,
        idRole = group.Key.idRole,
        Role = group.Key.Role,
        Rooms = string.Join(", ", group.Select(g => g.rb.Rooms.name)),
        PhoneNumber = group.Key.phonenumber,
        Client = group.Key.nombrecliente
    })
    .ToList();
                }

                userDtoList = userDtoList.Where(x => x.Role != "Root" && x.Role != "Telco").ToList();

                return userDtoList;
            }
            catch (Exception e)
            {
                return userDtoList;
            }
        }

        public bool LockUser(lockDTO user)
        {
            var userdto = new UserDto();
            user.lockoutEndDateUtc = DateTime.Now.AddMinutes(30);
            /*Petición a base de datos*/
            using (var context = new Entities())
            {
                var userdb = context.Users.FirstOrDefault(p => p.Id == user.Id);

                userdb.lockoutEnabled = user.lockoutEnabled;
                userdb.lockoutEndDateUtc = user.lockoutEndDateUtc;
                context.SaveChanges();

            }

            return true;
        }
        public bool FindEmailToken(string email, string token)
        {
            using (var ctx = new Entities())
            {
                var user = ctx.Users.Where(x => x.email == email).FirstOrDefault();
                if (user == null)
                {
                    return false;
                }
                else
                {
                    var tokenexists = ctx.UserAccounRecovery.Where(x => x.iduser == user.Id && x.token == token && x.Expiration >= DateTime.Now).FirstOrDefault();
                    if (tokenexists == null)
                    {
                        return false;
                    }
                    else
                    {
                        user.emailConfirmed = true;
                        ctx.SaveChanges();
                    }

                }
                return true;
            }
        }
        public string GeneraToken(int iduser, int tipo)
        {
            var token = string.Empty;
            try
            {

                Guid miGuid = Guid.NewGuid();

                token = miGuid.ToString().Replace("-", string.Empty);

                using (var ctx = new Entities())
                {
                    var recovery = new UserAccounRecovery { Expiration = DateTime.Now.AddDays(1), iduser = iduser, token = token, type = tipo };
                    ctx.UserAccounRecovery.Add(recovery);
                    ctx.SaveChanges();
                }

            }
            catch (Exception)
            {
                token = string.Empty;
            }
            return token;
        }

        public async Task<string> EnvioCodigo(string dato, string tipo, string type)
        {

            var token = string.Empty;
            try
            {

                if (tipo == "EMAIL")
                {
                    Random random = new Random();
                    int randomNumber = random.Next(100000, 1000000);

                    token = randomNumber.ToString();

                    var body = MailManager.GenerateMailMessage(dato, token, "", type);
                    bool emailResponse = MailManager.SendEmail(dato, "Confirm your email", body);

                }
                if (tipo == "SMS")
                {

                    Random random = new Random();
                    int randomNumber = random.Next(100000, 1000000);

                    token = randomNumber.ToString();
                    var usuario = Common.ConfigurationManagerJson("USRAUTENTIFICATION");
                    var PSS = Common.ConfigurationManagerJson("PSSAUTENTIFICATION");
                    var tokensesion = await new ApiBackBoneManager().LoginResponse(usuario, PSS);

                    var envio = await new ApiBackBoneManager().SendCode(dato, token, tokensesion);
                }
            }
            catch (Exception e)
            {
                token = string.Empty;
            }
            return token;
        }

        public bool SaveTwoFactor(string email)
        {
            var userdto = new UserDto();
            /*Petición a base de datos*/
            using (var context = new Entities())
            {
                var userdb = context.Users.FirstOrDefault(p => p.email == email);
                if (userdb != null)
                {

                    userdb.TwoFactorAuthentication = true;
                    context.SaveChanges();
                }
                else
                {
                    return false;
                }

            }

            //UserDto result = new UserDto
            //{
            //    userName = user,
            //    email = "user@correo.com",
            //    accessFailedCount = 0,
            //    lockoutEnabled = false,
            //    rol = 0,
            //    status = true
            //};
            return true;
        }

        public List<RoomsDTO> roomsByUser(string email)
        {
            var rooms = new List<RoomsDTO>();
            try
            {

                using (var ctx = new Entities())
                {
                    rooms = ctx.roomsbyuser
    .Join(ctx.Users,
          rb => rb.idUser, // Clave foránea en roomsbyuser
          u => u.Id,       // Clave primaria en users
          (rb, u) => new { rb, u }) // Combina roomsbyuser y users
    .Where(combined => combined.u.email == email) // Filtra por el email aquí
    .Join(ctx.clients,
          combined => combined.u.IdCliente, // Clave foránea en users
          c => c.id,                        // Clave primaria en clients
          (combined, c) => new RoomsDTO
          {
              id = combined.rb.Rooms.id,                   // ID de roomsbyuser
              iduser = combined.u.Id,               // ID del usuario
              name = combined.rb.Rooms.name,        // Nombre de la sala
              description = combined.rb.Rooms.description, // Descripción de la sala
              credits = combined.rb.Rooms.credits,  // Créditos de la sala
              long_sms = combined.rb.Rooms.long_sms,// SMS largos
              calls = combined.rb.Rooms.calls,      // Llamadas
              idClient = combined.u.IdCliente,      // ID del cliente
              Cliente = c.nombrecliente,             // Nombre del cliente
              short_sms = combined.rb.Rooms.short_sms
          })
    .ToList();
                    rooms = rooms
    .GroupBy(x => x.name) // Agrupa por nombre
    .Select(g => g.First()) // Toma el primer elemento de cada grupo
    .ToList();
                }

                return rooms;
            }
            catch (Exception e)
            {
                return rooms;
            }
        }

        public bool NewPassword(PasswordResetDTO pass)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var user = ctx.Users.Where(x => x.email == pass.Email).FirstOrDefault();
                    if (user != null)
                    {
                        user.passwordHash = pass.NewPassword;
                        user.TwoFactorAuthentication = pass.TwoFactorAuthentication;
                        ctx.SaveChanges();
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }

            }
            catch (Exception e)
            {
                return false;
            }
        }

        public CreditDto GetCredit(string userName)
        {
            //Realizar petición a base de datos.
            return new CreditDto
            {
                Credit = 0
            };
        }

        public bool NewPassword(string user, string password)
        {
            try
            {

                using (var ctx = new Entities())
                {
                    var usuario = ctx.Users.Where(x => x.email == user).FirstOrDefault();
                    usuario.passwordHash = password;
                    usuario.lastPasswordChangeDate = DateTime.Now;
                    ctx.SaveChanges();
                }
                return true;

            }
            catch (Exception e)
            {
                return false;
            }
        }

        public UserDto AddUserFromRegister(RegisterUser register)
        {
            try
            {

                var user = new Modal.Model.Model.Users
                {
                    accessFailedCount = 0,
                    Call = register.llamada,
                    clauseAccepted = false,
                    createDate = DateTime.Now,
                    email = register.email,
                    emailConfirmed = false,
                    firstName = register.firstName,
                    lastName = register.lastName,
                    lastPasswordChangeDate = DateTime.Now,
                    lockoutEnabled = false,
                    passwordHash = register.Password,
                    phonenumber = register.phone,
                    SMS = register.sms,
                    userName = register.email,
                    lockoutEndDateUtc = null,
                    TwoFactorAuthentication = false,
                    status = true,
                    SecondaryEmail = register.emailConfirmation,
                    futurerooms = false
                };
                var cliente = new ClientManager().ObtenerClienteporNombre(register.client);
                if (cliente != null)
                {

                    user.IdCliente = cliente.id;
                    using (var ctx = new Entities())
                    {
                        var idrole = ctx.Roles.Where(x => x.Role.ToLower() == "administrador").Select(x => x.id).FirstOrDefault();
                        user.idRole = idrole;
                        ctx.Users.Add(user);
                        ctx.SaveChanges();
                    }
                    var config = new MapperConfiguration(cfg =>

    cfg.CreateMap<Modal.Model.Model.Users, UserDto>()

); var mapper = new Mapper(config);

                    var userdto = mapper.Map<UserDto>(user);
                    return userdto;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                return null;
            }
        }

        public int AddUserFromManage(UserAddDTO register)
        {
            try
            {
                var user = new Modal.Model.Model.Users
                {
                    accessFailedCount = 0,
                    Call = false,
                    clauseAccepted = false,
                    createDate = DateTime.Now,
                    email = register.Email,
                    emailConfirmed = false,
                    firstName = register.FirstName,
                    lastName = "",
                    lastPasswordChangeDate = DateTime.Now,
                    lockoutEnabled = false,
                    passwordHash = register.Password,
                    phonenumber = register.PhoneNumber,
                    SMS = false,
                    userName = register.Email,
                    lockoutEndDateUtc = null,
                    TwoFactorAuthentication = false,
                    status = true,
                    IdCliente = register.IdCliente,
                    futurerooms = register.FutureRooms,
                    SecondaryEmail = register.ConfirmationEmail
                };



                using (var ctx = new Entities())
                {
                    user.idRole = ctx.Roles.Where(x => x.Role == register.Profile.ToLower()).Select(x => x.id).FirstOrDefault();
                    ctx.Users.Add(user);
                    ctx.SaveChanges();
                }

                return user.Id;

            }
            catch (Exception e)
            {
                return 0;
            }
        }

        public bool UpdateUser(UserAddDTO register)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var usuarer = ctx.Users.Where(u => u.Id == register.IdUsuario).FirstOrDefault();
                    usuarer.firstName = register.FirstName;
                    usuarer.phonenumber = register.PhoneNumber;
                    usuarer.idRole = ctx.Roles.Where(x => x.Role == register.Profile.ToLower()).Select(x => x.id).FirstOrDefault();


                    ctx.SaveChanges();
                }

                return true;

            }
            catch (Exception e)
            {
                return false;
            }
        }
        public bool UpdateUserRegistration(UserFinishRegistrationDTO register)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var usuarer = ctx.Users.Where(u => u.email == register.Email).FirstOrDefault();
                    usuarer.firstName = register.FirstName;
                    usuarer.phonenumber = register.Phonenumber;
                    usuarer.lastName = register.LastName;
                    usuarer.emailConfirmed = true;

                    ctx.SaveChanges();
                }

                return true;

            }
            catch (Exception e)
            {
                return false;
            }
        }
        public bool UpdateLogUser(UpdateUser update)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var usuarer = ctx.Users.Where(u => u.email == update.Email).FirstOrDefault();
                    usuarer.firstName = update.FirstName;
                    usuarer.phonenumber = update.PhoneNumber;
                    if (!string.IsNullOrEmpty(update.Password))
                    {

                        usuarer.passwordHash = update.Password;
                    }
                    usuarer.lastName = update.LastName;
                    usuarer.lastPasswordChangeDate = DateTime.Now;

                    ctx.SaveChanges();
                }

                return true;

            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool DeleteUser(int id)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var roomforeign = ctx.roomsbyuser.Where(x => x.idUser == id).ToList();
                    ctx.roomsbyuser.RemoveRange(roomforeign);
                    ctx.SaveChanges();

                    var tokens = ctx.UserAccounRecovery.Where(x => x.iduser == id).ToList();
                    ctx.UserAccounRecovery.RemoveRange(tokens);
                    ctx.SaveChanges();

                    var users = ctx.Users.Where(x => x.Id == id).FirstOrDefault();
                    ctx.Users.Remove(users);
                    ctx.SaveChanges();

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        #region billing

        public bool AddBillingInformation(BillingInformationDto billing)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var iduser = ctx.Users.Where(x => x.email == billing.Email).FirstOrDefault();
                    var exist = ctx.BillingInformation.Where(x => x.User.email == billing.Email).FirstOrDefault();
                    if (exist == null)
                    {

                        var newbilling = new BillingInformation
                        {
                            userId = iduser.Id,
                            BusinessName = billing.BusinessName,
                            Cfdi = billing.Cfdi,
                            PostalCode = billing.PostalCode,
                            TaxId = billing.TaxId,
                            TaxRegime = billing.TaxRegime,
                            PersonType = billing.PersonType,
                            Street = billing.Street,
                            ExtNumber = billing.ExtNumber,
                            IntNumber = billing.IntNumber,
                            Colony = billing.Colony,
                            City = billing.City,
                            State = billing.State,
                            CreatedAt = DateTime.Now
                        };
                        ctx.BillingInformation.Add(newbilling);
                    }
                    else
                    {
                        exist.TaxRegime = billing.TaxRegime;
                        exist.TaxId = billing.TaxId;
                        exist.BusinessName = billing.BusinessName;
                        exist.Cfdi = billing.Cfdi;
                        exist.PostalCode = billing.PostalCode;
                        exist.PersonType = billing.PersonType;
                        exist.Street = billing.Street;
                        exist.ExtNumber = billing.ExtNumber;
                        exist.IntNumber = billing.IntNumber;
                        exist.Colony = billing.Colony;
                        exist.City = billing.City;
                        exist.State = billing.State;
                        exist.UpdatedAt = DateTime.Now;
                    }

                    ctx.SaveChanges();
                    return true;
                }
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool UpdateBillingInformation(BillingInformationDto billing)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var BillingInformation = ctx.BillingInformation.Where(u => u.User.email == billing.Email).FirstOrDefault();
                    BillingInformation.TaxRegime = billing.TaxRegime;
                    BillingInformation.TaxId = billing.TaxId;
                    BillingInformation.BusinessName = billing.BusinessName;
                    BillingInformation.Cfdi = billing.Cfdi;
                    BillingInformation.PostalCode = billing.PostalCode;
                    BillingInformation.PersonType = billing.PersonType;
                    BillingInformation.Street = billing.Street;
                    BillingInformation.ExtNumber = billing.ExtNumber;
                    BillingInformation.IntNumber = billing.IntNumber;
                    BillingInformation.Colony = billing.Colony;
                    BillingInformation.City = billing.City;
                    BillingInformation.State = billing.State;
                    BillingInformation.UpdatedAt = DateTime.Now;

                    ctx.SaveChanges();
                }

                return true;

            }
            catch (Exception e)
            {
                return false;
            }
        }

        public BillingInformationDto GetBillingInformation(string Email)
        {
            var billing = new BillingInformationDto();
            try
            {
                using (var ctx = new Entities())
                {
                    billing = ctx.BillingInformation.Select(x => new BillingInformationDto
                    {
                        Email = x.User.email,
                        BusinessName = x.BusinessName,
                        Cfdi = x.Cfdi,
                        PostalCode = x.PostalCode,
                        TaxId = x.TaxId,
                        TaxRegime = x.TaxRegime,
                        PersonType = x.PersonType,
                        Street = x.Street,
                        ExtNumber = x.ExtNumber,
                        IntNumber = x.IntNumber,
                        Colony = x.Colony,
                        City = x.City,
                        State = x.State
                    }).FirstOrDefault();
                }
                return billing;
            }
            catch (Exception e)
            {
                return null;
            }
        }
        #endregion

        #region recharge
        public string RechargeUser(CreditRechargeRequest credit)
        {
            log.Info("Comenzando proceso");
            var tarjeta = new creditcards();
            var usuario = new Modal.Model.Model.Users();
            try
            {
                using (var ctx = new Entities())
                {
                    tarjeta = ctx.creditcards.Where(x => x.Id == credit.IdCreditCard).FirstOrDefault();
                    usuario = ctx.Users.Where(x => x.Id == credit.IdUser).FirstOrDefault();
                }


                var creditrecharge = new CreditRecharge
                {
                    Chanel = credit.Chanel,
                    idCreditCard = credit.IdCreditCard,
                    quantityCredits = credit.QuantityCredits,
                    quantityMoney = credit.QuantityMoney,
                    RechargeDate = DateTime.Now,
                    idUser = credit.IdUser,
                    AutomaticInvoice = credit.AutomaticInvoice
                };
                //aqui va el openpay

                // === Openpay ===

                var apiKey = Common.ConfigurationManagerJson("APIKEY"); // Tu API Key sandbox
                var merchantId = Common.ConfigurationManagerJson("MERCHANTID"); // Tu merchant ID
                var openpay = new OpenpayAPI(apiKey, merchantId);

                var cardRequest = new Openpay.Entities.Card
                {
                    CardNumber = $"{tarjeta.card_number}",
                    HolderName = $"{tarjeta.card_name}",
                    ExpirationMonth = $"{tarjeta.expiration_month}",
                    ExpirationYear = $"{tarjeta.expiration_year.ToString().Substring(2)}",
                    Cvv2 = $"{tarjeta.CVV}",
                    DeviceSessionId = "kR1v4EXgk0kpbv2e4HkQWg9oBytTR84f"
                };
                var card = new Card();
                try
                {
                    card = openpay.CardService.Create(cardRequest);

                }
                catch (Exception e)
                {
                    using (var ctx = new Entities())
                    {
                        creditrecharge.Estatus = "Error";
                        creditrecharge.EstatusError = e.Message;
                        ctx.CreditRecharge.Add(creditrecharge);

                        ctx.SaveChanges();


                    }
                    return "Error";
                }


                var boolproduction = Common.ConfigurationManagerJson("OPENPAYPRODUCTION");
                var prodution = bool.Parse(boolproduction);
                openpay.Production = prodution;

                var chargeRequest = new ChargeRequest
                {
                    Method = "card",
                    SourceId = card.Id,
                    Amount = credit.QuantityMoney,
                    Description = "Recarga de créditos",
                    Currency = "MXN",
                    DeviceSessionId = "kR1v4EXgk0kpbv2e4HkQWg9oBytTR84f",
                    Use3DSecure = true,
                    RedirectUrl = Common.ConfigurationManagerJson("OPENPAY_REDIRECT_URL"),
                    Customer = new Openpay.Entities.Customer
                    {
                        Name = usuario.firstName,
                        LastName = usuario.lastName,
                        Email = usuario.email,
                        PhoneNumber = usuario.phonenumber,
                        Address = new Openpay.Entities.Address
                        {
                            Line1 = $"{tarjeta.street} {tarjeta.interior_number}",
                            PostalCode = "57800",
                            State = "Mexico",
                            City = "Mexico",
                            CountryCode = "MX",
                        }
                    }
                };

                var charge = new Charge();

                try
                {

                    charge = openpay.ChargeService.Create(chargeRequest);

                }
                catch (Exception e)
                {
                    using (var ctx = new Entities())
                    {
                        creditrecharge.Estatus = "Error";
                        creditrecharge.EstatusError = e.Message;
                        ctx.CreditRecharge.Add(creditrecharge);

                        ctx.SaveChanges();

                    }
                    return "Error";
                }
                creditrecharge.Estatus = charge.Status;
                switch (charge.Status.ToLower())
                {
                    case "completed":
                        creditrecharge.Estatus = "Exitoso";
                        break;
                    case "in_progress":
                        creditrecharge.Estatus = "En progreso";
                        break;
                    case "failed":
                        creditrecharge.Estatus = "Fallida";
                        break;
                    case "cancelled":
                        creditrecharge.Estatus = "Cancelada";
                        break;
                    case "charge_pending":
                        creditrecharge.Estatus = "Cargo Pendiente";
                        break;
                    default:
                        break;
                }
                //creditrecharge.transactionId = charge.Id;

                using (var ctx = new Entities())
                {
                    ctx.CreditRecharge.Add(creditrecharge);

                    ctx.SaveChanges();

                    var openpayRecord = new CreditRechargeOpenPay
                    {
                        IdCreditRecharge = creditrecharge.Id,
                        ChargeId = charge.Id,
                        idopenpay = charge.Id,
                        BankAuthorization = charge.Authorization,
                        Amount = charge.Amount,
                        Status = charge.Status,
                        CreationDate = charge.CreationDate.HasValue ? charge.CreationDate.Value : DateTime.Now,
                        CardId = charge.Card?.Id,
                        CustomerId = charge.Customer?.Id,
                        Conciliated = charge.Conciliated,
                        Description = charge.Description
                    };

                    ctx.CreditRechargeOpenPay.Add(openpayRecord);
                    ctx.SaveChanges();

                    var room = (from r in ctx.Rooms
                                join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                                where r.name == credit.room && rbu.idUser == credit.IdUser
                                select r).FirstOrDefault();

                    if (room != null)
                    {
                        if (credit.Chanel.ToLower() == "short_sms")
                        {
                            room.short_sms = room.short_sms + credit.QuantityCredits;
                            room.credits = room.credits + credit.QuantityCredits;
                        }
                        else
                        {
                            room.long_sms = room.long_sms + credit.QuantityCredits;
                            room.credits = room.credits + credit.QuantityCredits;

                        }
                        ctx.SaveChanges();
                    }
                }
                return charge.PaymentMethod.Url;
            }
            catch (Exception e)
            {
                log.Error(e.ToString());
                return e.ToString();

            }
        }

        public bool VerifyRechargeStatus(string idRecharge)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    // Busca el registro en tu base local
                    var openpayRecord = ctx.CreditRechargeOpenPay.FirstOrDefault(x => x.IdCreditRecharge.ToString() == idRecharge);
                    if (openpayRecord == null)
                    {
                        log.Warn($"No se encontró recarga con ID {idRecharge}");
                        return false;
                    }

                    var creditRecharge = ctx.CreditRecharge.FirstOrDefault(x => x.Id == openpayRecord.IdCreditRecharge);
                    if (creditRecharge == null)
                    {
                        log.Warn($"No se encontró el registro base de CreditRecharge para ID {idRecharge}");
                        return false;
                    }

                    // Configuración Openpay
                    var apiKey = Common.ConfigurationManagerJson("APIKEY");
                    var merchantId = Common.ConfigurationManagerJson("MERCHANTID");
                    var boolProduction = Common.ConfigurationManagerJson("OPENPAYPRODUCTION");
                    var production = bool.Parse(boolProduction);

                    var openpay = new OpenpayAPI(apiKey, merchantId)
                    {
                        Production = production
                    };

                    // Consulta el charge en Openpay
                    var chargeService = openpay.ChargeService;
                    var charge = chargeService.Get(openpayRecord.CustomerId, openpayRecord.ChargeId);

                    if (charge != null)
                    {
                        // Actualiza los estatus locales según Openpay
                        creditRecharge.Estatus = charge.Status;
                        openpayRecord.Status = charge.Status;
                        openpayRecord.Conciliated = charge.Conciliated;
                        openpayRecord.Description = charge.Description;
                        openpayRecord.Amount = charge.Amount;
                        openpayRecord.CreationDate = charge.CreationDate.HasValue ? charge.CreationDate.Value : DateTime.Now;

                        ctx.SaveChanges();
                        log.Info($"Actualizado el estatus de recarga {idRecharge} a '{charge.Status}' correctamente.");
                        return true;
                    }
                    else
                    {
                        log.Warn($"No se encontró el charge en Openpay para ChargeId {openpayRecord.ChargeId}");
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error($"Error al verificar el estatus de recarga {idRecharge}: {ex.Message}");
                return false;
            }
        }


        public List<CreditHystoric> GetHistoricByUser(Datepickers credit)
        {
            var historic = new List<CreditHystoric>();
            try
            {

                using (var ctx = new Entities())
                {
                    historic = (from cr in ctx.CreditRecharge
                                join u in ctx.Users on cr.idUser equals u.Id
                                join c in ctx.clients on u.IdCliente equals c.id
                                join cc in ctx.creditcards on cr.idCreditCard equals cc.Id
                                where cr.RechargeDate >= credit.FechaInicio && cr.RechargeDate <= credit.FechaFin && credit.IdUser == credit.IdUser // 🔥 Filtro agregado
                                select new CreditHystoric
                                {
                                    id = cr.Id,
                                    Client = c.nombrecliente,
                                    quantityMoney = cr.quantityMoney,
                                    RechargeDate = cr.RechargeDate,
                                    Estatus = cr.Estatus,
                                    PaymentMethod = $"{cc.Type} •••• {cc.card_number.Substring(cc.card_number.Length - 4)} - {cc.card_name}"
                                }).ToList();

                }
                return historic;
            }
            catch (Exception e)
            {
                return new List<CreditHystoric>();
            }
        }

        public bool SaveRechargeSettings(AmountNotificationRequest Amount)
        {
            var recharge = new AmountNotification();
            try
            {
                using (var ctx = new Entities())
                {
                    var existe = ctx.AmountNotification.Where(x => x.IdRoom == Amount.IdRoom).FirstOrDefault();
                    if (existe == null)
                    {
                        recharge.AmountValue = Amount.AmountValue ?? 0;
                        recharge.short_sms = Amount.ShortSms;
                        recharge.long_sms = Amount.LongSms;
                        recharge.call = Amount.Call;
                        recharge.AutoRecharge = Amount.AutoRecharge;
                        recharge.AutoRechargeAmountNotification = Amount.AutoRechargeAmountNotification;
                        recharge.AutoRechargeAmount = Amount.AutoRechargeAmount;
                        recharge.IdRoom = Amount.IdRoom;
                        recharge.IdCreditCard = Amount.IdCreditCard;
                        ctx.AmountNotification.Add(recharge);
                        ctx.SaveChanges();
                        foreach (var item in Amount.Users)
                        {
                            var byuser = new AmountNotificationUser();
                            byuser.NotificationId = recharge.id;
                            byuser.UserId = ctx.Users.Where(x => x.email == item).Select(x => x.Id).FirstOrDefault();
                            ctx.AmountNotificationUser.Add(byuser);
                        }

                    }
                    else
                    {
                        existe.AmountValue = Amount.AmountValue ?? 0;
                        existe.short_sms = Amount.ShortSms;
                        existe.long_sms = Amount.LongSms;
                        existe.call = Amount.Call;
                        existe.AutoRecharge = Amount.AutoRecharge;
                        existe.AutoRechargeAmountNotification = Amount.AutoRechargeAmountNotification;
                        existe.AutoRechargeAmount = Amount.AutoRechargeAmount;
                        existe.IdRoom = Amount.IdRoom;
                        existe.IdCreditCard = Amount.IdCreditCard;
                        ctx.SaveChanges();
                        foreach (var item in Amount.Users)
                        {
                            var byuser = new AmountNotificationUser();
                            byuser.NotificationId = existe.id;
                            byuser.UserId = ctx.Users.Where(x => x.email == item).Select(x => x.Id).FirstOrDefault();

                            var existeuser = ctx.AmountNotificationUser.Where(x => x.NotificationId == recharge.id && x.UserId == byuser.Id).FirstOrDefault();
                            if (existeuser == null)
                            {

                                ctx.AmountNotificationUser.Add(byuser);
                            }
                            ctx.SaveChanges();
                        }
                    }
                }

                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public AmountNotificationRequest GetRecharge(int IDRoom)
        {
            var recharge = new AmountNotificationRequest();
            try
            {

                using (var ctx = new Entities())
                {
                    recharge = ctx.AmountNotification.Where(x => x.IdRoom == IDRoom).Select(x => new AmountNotificationRequest
                    {
                        IdRoom = x.IdRoom,
                        AmountValue = x.AmountValue,
                        AutoRecharge = x.AutoRecharge,
                        AutoRechargeAmount = x.AutoRechargeAmount,
                        AutoRechargeAmountNotification = x.AutoRechargeAmountNotification,
                        Call = x.call,
                        IdCreditCard = x.IdCreditCard,
                        LongSms = x.long_sms,
                        ShortSms = x.short_sms,
                        Id = x.id
                    }).FirstOrDefault();
                    if (recharge != null)
                    {

                        recharge.Users = ctx.AmountNotificationUser.Where(x => x.Id == recharge.Id).Select(x => x.UserId.ToString()).ToList();
                    }
                }
                return recharge;
            }
            catch (Exception e)
            {
                return null;
            }
        }
        #endregion

        public CampaignKPIResponse GetCampaignKPIByRoom(CampaignKPIRequest request)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var today = DateTime.Today;

                    string smsTypeString = request.SmsType == 1 ? "short" :
                                           request.SmsType == 2 ? "long" : null;

                    var campaigns = ctx.CampaignFullResponse
                        .FromSqlRaw("EXEC sp_GetCampaignsByRoom @RoomId = {0}, @SmsType = {1}", request.RoomId, smsTypeString)
                        .ToList();

                    var campaignIds = campaigns.Select(c => c.Id).ToList();
                    int activeCampaigns = campaignIds.Count;

                    int sentToday = ctx.CampaignContactScheduleSend
                        .Count(s => campaignIds.Contains(s.CampaignId) && s.SentAt.HasValue && s.SentAt.Value.Date == today);

                    int totalSent = ctx.CampaignContactScheduleSend
                        .Count(s => campaignIds.Contains(s.CampaignId));

                    DateTime? firstSentDate = ctx.CampaignContactScheduleSend
                        .Where(s => campaignIds.Contains(s.CampaignId) && s.SentAt.HasValue)
                        .Select(s => s.SentAt.Value.Date)
                        .OrderBy(d => d)
                        .FirstOrDefault();

                    int daysSinceFirstSend = firstSentDate.HasValue
                        ? (DateTime.Today - firstSentDate.Value).Days + 1
                        : 0;

                    int averagePerDay = daysSinceFirstSend > 0
                        ? (int)Math.Round((double)totalSent / daysSinceFirstSend)
                        : 0;

                    var userIds = ctx.roomsbyuser
                        .Where(r => r.idRoom == request.RoomId)
                        .Select(r => r.idUser)
                        .Distinct()
                        .ToList();

                    decimal creditConsumption = 0;
                    var smsChannel = request.SmsType == 1 ? "short_sms" :
                                     request.SmsType == 2 ? "long_sms" : null;

                    if (smsChannel != null)
                    {
                        decimal totalRecharge = ctx.CreditRecharge
                            .Where(cr => userIds.Contains(cr.idUser) && cr.Chanel == smsChannel)
                            .Sum(cr => (decimal?)cr.quantityCredits) ?? 0;

                        var roomIds = ctx.roomsbyuser
                            .Where(r => userIds.Contains(r.idUser))
                            .Select(r => r.idRoom)
                            .Distinct()
                            .ToList();

                        decimal remainingCredits = smsChannel == "short_sms"
                            ? ctx.Rooms.Where(r => roomIds.Contains(r.id)).Sum(r => (decimal?)r.short_sms) ?? 0
                            : ctx.Rooms.Where(r => roomIds.Contains(r.id)).Sum(r => (decimal?)r.long_sms) ?? 0;

                        creditConsumption = totalRecharge - remainingCredits;
                    }

                    // 🎯 Sumar métricas para las gráficas
                    int delivered = campaigns.Sum(c => c.DeliveredCount);
                    int responded = campaigns.Sum(c => c.RespondedRecords);
                    int notDelivered = campaigns.Sum(c => c.NotDeliveredCount);
                    int waiting = campaigns.Sum(c => c.InProcessCount);
                    int failed = campaigns.Sum(c => c.FailedCount);
                    int rejected = campaigns.Sum(c => c.BlockedRecords);
                    int notSent = campaigns.Sum(c => c.NotSentCount);
                    int exception = campaigns.Sum(c => c.ExceptionCount);

                    int total = delivered + responded + notDelivered + waiting + failed + rejected + notSent + exception;
                    int receptionRate = total > 0 ? (int)Math.Round((double)responded * 100 / total) : 0;

                    return new CampaignKPIResponse
                    {
                        ActiveCampaigns = activeCampaigns,
                        SentToday = sentToday,
                        AveragePerDay = averagePerDay,
                        CreditConsumption = creditConsumption,
                        Campaigns = campaigns,

                        DeliveredCount = delivered,
                        RespondedRecords = responded,
                        NotDeliveredCount = notDelivered,
                        WaitingCount = waiting,
                        FailedCount = failed,
                        RejectedCount = rejected,
                        NotSentCount = notSent,
                        ExceptionCount = exception,
                        TotalStatusCount = total,
                        ReceptionRate = receptionRate
                    };
                }
            }
            catch
            {
                return new CampaignKPIResponse();
            }
        }
        public UseResponse GetUsageByRoom(UseRequest request)
        {
            using (var ctx = new Entities())
            {
                int numberType = request.SmsType == "corto" ? 1 :
                                 request.SmsType == "largo" ? 2 : 0;

                string smsChannel = request.SmsType == "corto" ? "short_sms" :
                                    request.SmsType == "largo" ? "long_sms" : null;

                // Usuarios del room
                var userIds = ctx.roomsbyuser
                    .Where(r => r.idRoom == request.RoomId)
                    .Select(r => r.idUser)
                    .Distinct()
                    .ToList();

                // Si el filtro trae usuarios específicos, se usa ese
                if (request.UserIds != null && request.UserIds.Any())
                {
                    userIds = userIds.Where(u => request.UserIds.Contains(u)).ToList();
                }

                // Campañas del room según el tipo de número
                var campaignIds = ctx.Campaigns
                    .Where(c => c.RoomId == request.RoomId && c.NumberType == numberType)
                    .Select(c => c.Id)
                    .ToList();

                // Si el filtro trae campañas específicas, se usa ese
                if (request.CampaignIds != null && request.CampaignIds.Any())
                {
                    campaignIds = campaignIds.Where(c => request.CampaignIds.Contains(c)).ToList();
                }

                // Mensajes enviados con filtros
                var sentQuery = ctx.CampaignContactScheduleSend
                    .Where(s => campaignIds.Contains(s.CampaignId) && s.SentAt.HasValue);

                if (request.StartDate.HasValue)
                    sentQuery = sentQuery.Where(s => s.SentAt >= request.StartDate.Value);

                if (request.EndDate.HasValue)
                    sentQuery = sentQuery.Where(s => s.SentAt <= request.EndDate.Value);

                int messagesSent = sentQuery.Count();
                decimal creditsUsed = messagesSent;

                // Recargas con filtros
                var rechargeQuery = ctx.CreditRecharge
                    .Where(cr => userIds.Contains(cr.idUser) && cr.Chanel == smsChannel);

                if (request.StartDate.HasValue)
                    rechargeQuery = rechargeQuery.Where(cr => cr.RechargeDate >= request.StartDate.Value);

                if (request.EndDate.HasValue)
                    rechargeQuery = rechargeQuery.Where(cr => cr.RechargeDate <= request.EndDate.Value);

                decimal totalRecharges = rechargeQuery.Sum(cr => (decimal?)cr.quantityCredits) ?? 0;

                var lastRecharge = rechargeQuery
                    .OrderByDescending(cr => cr.RechargeDate)
                    .FirstOrDefault();

                var lastRechargeInfo = lastRecharge != null
                    ? new LastRechargeInfo
                    {
                        Credits = lastRecharge.quantityCredits,
                        Date = lastRecharge.RechargeDate.ToString("yyyy-MM-dd HH:mm:ss")
                    }
                    : null;

                var twentyDaysAgo = DateTime.Now.Date.AddDays(-19);

                var dailyCounts = sentQuery
                    .Where(s => s.SentAt.Value.Date >= twentyDaysAgo)
                    .GroupBy(s => s.SentAt.Value.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Count = g.Count()
                    })
                    .ToList();

                int totalSentLast20Days = dailyCounts.Sum(d => d.Count);

                // Generar los 20 días para que incluso si no hay datos un día, el gráfico lo incluya
                var chartData = Enumerable.Range(0, 20)
                    .Select(i => twentyDaysAgo.AddDays(i))
                    .Select(date =>
                    {
                        var dayData = dailyCounts.FirstOrDefault(d => d.Date == date);
                        var count = dayData?.Count ?? 0;
                        var percent = totalSentLast20Days > 0
                            ? Math.Round((decimal)count / totalSentLast20Days * 100, 2)
                            : 0;

                        return new ChartDataPoint
                        {
                            Date = date.ToString("yyyy-MM-dd"),
                            Value = percent
                        };
                    })
                    .ToList();



                return new UseResponse
                {
                    CreditsUsed = creditsUsed,
                    MessagesSent = messagesSent,
                    TotalRecharges = totalRecharges,
                    LastRecharge = lastRechargeInfo,
                    ChartData = chartData
                };
            }
        }


        public List<CampaignItemResponse> GetCampaignsByRoom(int roomId, int smsType)
        {
            using (var ctx = new Entities())
            {
                return ctx.Campaigns
                    .Where(c => c.RoomId == roomId && c.NumberType == smsType)
                    .Select(c => new CampaignItemResponse
                    {
                        Id = c.Id,
                        Name = c.Name
                    })
                    .ToList();
            }
        }
        public List<CampaignItemResponse> GetallCampaignsByRoom(int roomId)
        {
            using (var ctx = new Entities())
            {
                return ctx.Campaigns
                    .Where(c => c.RoomId == roomId)
                    .Select(c => new CampaignItemResponse
                    {
                        Id = c.Id,
                        Name = c.Name
                    })
                    .ToList();
            }
        }


        public List<UserItemResponse> GetUsersByRoom(int roomId)
        {
            using (var ctx = new Entities())
            {
                return (from ru in ctx.roomsbyuser
                        join u in ctx.Users on ru.idUser equals u.Id
                        where ru.idRoom == roomId
                        select new UserItemResponse
                        {
                            Id = u.Id,
                            Name = u.firstName
                        }).ToList();
            }
        }
        public List<ReportGlobalResponse> GetSmsReport(ReportRequest request)
        {
            var results = new List<ReportGlobalResponse>();

            using (var ctx = new Entities())
            {
                var dbConnection = ctx.Database.GetDbConnection();
                using (var connection = new SqlConnection(dbConnection.ConnectionString))
                {
                    using (var command = new SqlCommand("sp_getGlobalReport", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;

                        command.Parameters.AddWithValue("@RoomId", request.RoomId);
                        command.Parameters.AddWithValue("@StartDate", request.StartDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@EndDate", request.EndDate ?? (object)DBNull.Value);

                        connection.Open();

                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                results.Add(new ReportGlobalResponse
                                {
                                    Date = reader.GetDateTime(reader.GetOrdinal("Date")),
                                    Phone = reader.GetString(reader.GetOrdinal("Phone")),
                                    Room = reader.GetString(reader.GetOrdinal("Room")),
                                    Campaign = reader.GetString(reader.GetOrdinal("Campaign")),
                                    CampaignId = reader.GetInt32(reader.GetOrdinal("CampaignId")),
                                    User = reader.GetString(reader.GetOrdinal("User")), 
                                    MessageId = reader.GetInt32(reader.GetOrdinal("MessageId")),
                                    Message = reader.GetString(reader.GetOrdinal("Message")),
                                    Status = reader.GetString(reader.GetOrdinal("Status")),
                                    ReceivedAt = reader.GetDateTime(reader.GetOrdinal("ReceivedAt")), 
                                    Cost = reader.GetString(reader.GetOrdinal("Cost")), 
                                    Type = reader.GetString(reader.GetOrdinal("Type")),
                                });
                            }
                        }
                    }
                }
            }

            return results;
        }

        public List<ReportDeliveryResponse> GetSmsReportSend(ReportRequest request)
        {
            var results = new List<ReportDeliveryResponse>();

            using (var ctx = new Entities())
            {
                var connection = (SqlConnection)ctx.Database.GetDbConnection();
                if (request.ReportType == "Mensajes entrantes")
                {
                    request.ReportType = "entrantes";
                }
                if (request.ReportType == "Mensajes enviados")
                {
                    request.ReportType = "enviados";
                }
                if (request.ReportType == "Mensajes no enviados")
                {
                    request.ReportType = "noenviados";
                }
                if (request.ReportType == "Mensajes rechazados")
                {
                    request.ReportType = "rechazados";
                }
                using (var command = new SqlCommand("sp_getSmsDeliveryReport", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@StartDate", request.StartDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@EndDate", request.EndDate ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@RoomId", request.RoomId);
                    command.Parameters.AddWithValue("@ReportType", request.ReportType ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@UserIds",
       (request.UserIds == null || request.UserIds.Count == 0) ? (object)DBNull.Value : string.Join(",", request.UserIds));

                    command.Parameters.AddWithValue("@CampaignIds",
                        (request.CampaignIds == null || request.CampaignIds.Count == 0) ? (object)DBNull.Value : string.Join(",", request.CampaignIds));

                    if (connection.State != ConnectionState.Open)
                        connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        if (!reader.HasRows)
                        {
                            Console.WriteLine("No rows returned from sp_getSmsDeliveryReport");
                        }
                        while (reader.Read())
                        {
                            results.Add(new ReportDeliveryResponse
                            {
                                MessageId = reader.GetInt32(reader.GetOrdinal("MessageId")),
                                Message = reader.GetString(reader.GetOrdinal("Message")),
                                CampaignName = reader.GetString(reader.GetOrdinal("CampaignName")),
                                CampaignId = reader.GetInt32(reader.GetOrdinal("CampaignId")),
                                UserName = reader.GetString(reader.GetOrdinal("UserName")),
                                RoomName = reader.GetString(reader.GetOrdinal("RoomName")),
                                PhoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber")),
                                Status = reader.GetString(reader.GetOrdinal("Status")),
                                ResponseMessage = reader.IsDBNull(reader.GetOrdinal("ResponseMessage")) ? null : reader.GetString(reader.GetOrdinal("ResponseMessage")),
                                SentAt = reader.IsDBNull(reader.GetOrdinal("SentAt")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("SentAt")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                            });
                        }
                    }
                }
            }

            return results;
        }



    }
}
