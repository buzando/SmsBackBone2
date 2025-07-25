﻿using Modal;
using Modal.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract.Response;
using AutoMapper;
using Modal.Model.Model;
using log4net;
using Microsoft.EntityFrameworkCore;
using DocumentFormat.OpenXml.InkML;
using Contract.Request;
using Contract;
using Contract.Other;
using ClosedXML.Parser;
using DocumentFormat.OpenXml.Drawing.Spreadsheet;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.Data.SqlClient;
using System.Data;
using Newtonsoft.Json.Linq;

namespace Business
{
    public class ClientManager
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserManager));

        public bool AgregarCliente(clientDTO cliente)
        {

            try
            {
                cliente.CreationDate = DateTime.Now;
                cliente.RateForShort = 0.3m;
                cliente.RateForLong = 0.15m;
                cliente.ShortRateQty = "1";
                cliente.LongRateQty = "1";
                cliente.ShortRateType = 0;
                cliente.LongRateType = 0;
                cliente.TmpPassword = true;
                var config = new MapperConfiguration(cfg =>

  cfg.CreateMap<clientDTO, clients>()
                ); var mapper = new Mapper(config);

                var clientmodel = mapper.Map<clients>(cliente);


                using (var ctx = new Entities())
                {
                    ctx.clients.Add(clientmodel);
                    ctx.SaveChanges();
                }
                return true;
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                return false;
            }
        }

        public clientDTO ObtenerClienteporNombre(string cliente)
        {
            try
            {
                var clientereturn = new clientDTO();
                using (var ctx = new Entities())
                {
                    var clientdto = ctx.clients.Where(x => x.nombrecliente.ToLower() == cliente.ToLower()).FirstOrDefault();

                    var config = new MapperConfiguration(cfg =>

        cfg.CreateMap<clients, clientDTO>()

    ); var mapper = new Mapper(config);

                    clientereturn = mapper.Map<clientDTO>(clientdto);
                }
                return clientereturn;
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                return null;
            }
        }

        public clientDTO ObtenerClienteporID(int id)
        {
            try
            {
                var clientereturn = new clientDTO();
                using (var ctx = new Entities())
                {
                    var clientdto = ctx.clients.Where(x => x.id == id).FirstOrDefault();

                    var config = new MapperConfiguration(cfg =>

        cfg.CreateMap<clients, clientDTO>()

    ); var mapper = new Mapper(config);

                    clientereturn = mapper.Map<clientDTO>(clientdto);
                }
                return clientereturn;
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                return null;
            }
        }
        public List<SmsRateOptionDto> GetSmsRateOptions()
        {
            using (var ctx = new Entities())
            {
                return ctx.SmsDisplayRate
                    .Where(x => x.DisplayPrice != null)
                    .Select(x => new SmsRateOptionDto
                    {
                        SmsType = x.SmsType,
                        Quantity = x.Quantity,
                        DisplayPrice = x.DisplayPrice
                    }).ToList();
            }
        }
        public List<clientDTO> GetClientes()
        {
            try
            {
                var total = Common.ConfigurationManagerJson("TotalPaginas");
                using (var ctx = new Entities())
                {
                    var clientes = ctx.clients.ToList();

                    var config = new MapperConfiguration(cfg =>
                        cfg.CreateMap<clients, clientDTO>()
                    );
                    var mapper = new Mapper(config);

                    var listaDto = clientes.Select(c => mapper.Map<clientDTO>(c)).ToList();

                    return listaDto;
                }
            }
            catch (Exception e)
            {
                log.Error(e.Message);
                return new List<clientDTO>();
            }
        }

        public PagedClientResponse GetClientsAdmin(ClientFilterRequest client)
        {
            try
            {

                var result = new PagedClientResponse();
                var connectionString = Common.ConfigurationManagerJson("ConnectionStrings:Conexion");
                var pageSize = int.Parse(Common.ConfigurationManagerJson("TotalPaginas"));

                using (var connection = new SqlConnection(connectionString))
                {
                    using (var command = new SqlCommand("GetClientRoomSummary", connection))
                    {
                        command.CommandType = CommandType.StoredProcedure;
                        command.Parameters.AddWithValue("@Page", client.Page);
                        command.Parameters.AddWithValue("@PageSize", pageSize);
                        command.Parameters.AddWithValue("@SearchTerm", (object?)client.SearchTerm ?? DBNull.Value);
                        command.Parameters.AddWithValue("@ClienteIds", client.ClienteIds?.Any() == true ? string.Join(",", client.ClienteIds) : DBNull.Value);
                        command.Parameters.AddWithValue("@Estatus", client.Estatus?.Any() == true ? string.Join(",", client.Estatus) : DBNull.Value);

                        connection.Open();
                        using (var reader = command.ExecuteReader())
                        {
                            result.Items = new List<Modal.Model.Model.ClientRoomSummaryDTO>();

                            while (reader.Read())
                            {
                                var dto = new Modal.Model.Model.ClientRoomSummaryDTO
                                {
                                    id = reader.GetInt32(reader.GetOrdinal("id")),
                                    NombreCliente = reader.GetString(reader.GetOrdinal("nombreCliente")),
                                    CreationDate = reader.GetDateTime(reader.GetOrdinal("CreationDate")),
                                    RateForShort = reader.GetDecimal(reader.GetOrdinal("RateForShort")),
                                    RateForLong = reader.GetDecimal(reader.GetOrdinal("RateForLong")),
                                    ShortRateType = reader.IsDBNull(reader.GetOrdinal("ShortRateType")) ? (byte?)null : reader.GetByte(reader.GetOrdinal("ShortRateType")),
                                    LongRateType = reader.IsDBNull(reader.GetOrdinal("LongRateType")) ? (byte?)null : reader.GetByte(reader.GetOrdinal("LongRateType")),
                                    ShortRateQty = reader.GetString(reader.GetOrdinal("ShortRateQty")),
                                    LongRateQty = reader.GetString(reader.GetOrdinal("LongRateQty")),
                                    Estatus = reader.IsDBNull(reader.GetOrdinal("Estatus")) ? (byte?)null : reader.GetByte(reader.GetOrdinal("Estatus")),
                                    FirstName = reader.GetString(reader.GetOrdinal("firstName")),
                                    LastName = reader.GetString(reader.GetOrdinal("lastName")),
                                    PhoneNumber = reader.GetString(reader.GetOrdinal("phoneNumber")),
                                    Email = reader.GetString(reader.GetOrdinal("email")),
                                    Extension = reader.IsDBNull(reader.GetOrdinal("extension"))
    ? (int?)null
    : reader.GetInt32(reader.GetOrdinal("extension")),
                                    RoomName = reader.GetString(reader.GetOrdinal("RoomName")) ?? "",
                                    TotalCredits = reader.GetDouble(reader.GetOrdinal("TotalCredits")),
                                    TotalLongSmsCredits = reader.GetDouble(reader.GetOrdinal("TotalLongSmsCredits")),
                                    TotalShortSmsCredits = reader.GetDouble(reader.GetOrdinal("TotalShortSmsCredits")),
                                    DeactivationDate = reader.IsDBNull(reader.GetOrdinal("DeactivationDate")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("DeactivationDate"))
                                };

                                result.Items.Add(dto);
                            }

                            if (reader.NextResult() && reader.Read())
                            {
                                result.Total = reader.GetInt32(0);
                            }
                        }
                    }
                }

                return result;

            }
            catch (Exception e)
            {

                return null;
            }
        }




        public bool CreateClient(ClientRequestDto dto)
        {
            using (var ctx = new Entities())
            {
                using (var transaction = ctx.Database.BeginTransaction())
                {
                    try
                    {
                        // 1. Crear cliente
                        var client = new clients
                        {
                            nombrecliente = dto.NombreCliente,
                            CreationDate = DateTime.Now,
                            RateForShort = decimal.Parse(dto.RateForShort),
                            RateForLong = decimal.Parse(dto.RateForLong),
                            ShortRateType = dto.ShortRateType,
                            LongRateType = dto.LongRateType,
                            ShortRateQty = dto.ShortRateQty,
                            LongRateQty = dto.LongRateQty,
                            Estatus = 0,
                            TmpPassword = true
                        };

                        ctx.clients.Add(client);
                        ctx.SaveChanges();

                        int clientId = client.id;

                        string rawPassword = GenerarPasswordTemporal(8); ;
                        string hashedPassword = SecurityHelper.GenerarPasswordHash(rawPassword);
                        // 2. Crear usuario
                        var user = new Modal.Model.Model.Users
                        {
                            firstName = dto.FirstName,
                            lastName = dto.LastName,
                            phonenumber = dto.PhoneNumber,
                            extension = int.TryParse(dto.Extension, out int ext) ? ext : (int?)null,
                            email = dto.Email,
                            userName = dto.Email,
                            SecondaryEmail = dto.Email,
                            passwordHash = hashedPassword,
                            IdCliente = clientId,
                            idRole = ctx.Roles.Where(x => x.Role.ToLower() == "administrador").Select(x => x.id).FirstOrDefault(),
                            accessFailedCount = 0,
                            lockoutEnabled = false,
                            lockoutEndDateUtc = null,
                            TwoFactorAuthentication = false,
                            futurerooms = false,
                            lastPasswordChangeDate = DateTime.Now,
                            createDate = DateTime.Now,
                            emailConfirmed = false,
                            clauseAccepted = false,
                            status = true,
                            SMS = false,
                            Call = false
                        };
                        ctx.Users.Add(user);
                        ctx.SaveChanges();

                        int userId = user.Id;

                        if (dto.RoomNames == null)
                        {
                            dto.RoomNames = new List<string> { "Default" };
                        }
                        // 3. Crear rooms y asociarlas
                        foreach (var roomName in dto.RoomNames)
                        {
                            var room = new rooms
                            {
                                name = roomName,
                                calls = 0,
                                credits = 0,
                                description = $"Room de {roomName}",
                                long_sms = 0,
                                short_sms = 0
                            };

                            ctx.Rooms.Add(room);
                            ctx.SaveChanges();

                            var roomByUser = new roomsbyuser
                            {
                                idRoom = room.id,
                                idUser = userId
                            };

                            ctx.roomsbyuser.Add(roomByUser);
                            ctx.SaveChanges();
                        }

                        if (dto.Id == null)
                        {


                            var password = GenerarPasswordTemporalBackBone(16);

                            var admintoken = new ApiBackBoneManager().LoginResponse(Common.ConfigurationManagerJson("USRBACKBONE"), Common.ConfigurationManagerJson("PSSBACKBONE"));
                            var userbackbone = new ApiBackBoneManager()
                                .CreateUser(admintoken.Result.token, dto.NombreCliente, password, dto.Email, 3, "")
                                .GetAwaiter()
                                .GetResult();
                            int id = JObject.Parse(userbackbone)["id"].Value<int>();
                            var passencrypt = ClientAccessManager.Encrypt(password);

                            var clientacces = new ClientAccess
                            {
                                client_id = client.id,
                                password = passencrypt,
                                username = dto.NombreCliente,
                                status = true,
                                created_at = DateTime.Now,
                                id_backbone = id
                            };
                            ctx.Client_Access.Add(clientacces);
                            ctx.SaveChanges();
                            transaction.Commit();

                            string sitioFront = Common.ConfigurationManagerJson("UrlSitio");
                            string mensaje = MailManager.GenerateMailMessage(dto.Email, rawPassword, sitioFront, "NewClient");

                            MailManager.SendEmail(dto.Email, "Bienvenido a Red Quantum", mensaje);
                        }
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        log.Error("Error al crear cliente completo: " + ex.Message, ex);
                        return false;
                    }
                }



            }
        }
        public string GenerarPasswordTemporal(int length = 8)
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public string GenerarPasswordTemporalBackBone(int length = 8)
        {
            if (length < 4)
                throw new ArgumentException("El password debe tener al menos 4 caracteres.");

            const string lowercase = "abcdefghijklmnopqrstuvwxyz";
            const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string digits = "0123456789";
            const string specials = "!@#$%^&*";
            const string all = lowercase + uppercase + digits + specials;

            var random = new Random();

            // Garantizamos al menos un carácter de cada tipo
            var passwordChars = new List<char>
    {
        lowercase[random.Next(lowercase.Length)],
        uppercase[random.Next(uppercase.Length)],
        digits[random.Next(digits.Length)],
        specials[random.Next(specials.Length)]
    };

            // Rellenamos el resto con caracteres aleatorios de todo el conjunto
            for (int i = passwordChars.Count; i < length; i++)
            {
                passwordChars.Add(all[random.Next(all.Length)]);
            }

            // Mezclamos el resultado para evitar patrones predecibles
            return new string(passwordChars.OrderBy(_ => random.Next()).ToArray());
        }


        public bool UpdateClient(ClientRequestDto dto)
        {
            using (var ctx = new Entities())
            {
                using (var transaction = ctx.Database.BeginTransaction())
                {
                    try
                    {
                        // 1. Buscar cliente
                        var client = ctx.clients.FirstOrDefault(c => c.id == dto.Id);
                        if (client == null) return false;

                        client.nombrecliente = dto.NombreCliente;
                        if (dto.RateForShort != "NaN")
                        {

                            client.RateForShort = decimal.Parse(dto.RateForShort);
                            client.ShortRateType = dto.ShortRateType;
                            client.ShortRateQty = dto.ShortRateQty;
                        }
                        if (dto.RateForLong != "NaN")
                        {

                            client.RateForLong = decimal.Parse(dto.RateForLong);
                            client.LongRateType = dto.LongRateType;

                            client.LongRateQty = dto.LongRateQty;
                        }
                       
                      
           

                        ctx.SaveChanges();

                        // 2. Buscar usuario relacionado
                        var user = ctx.Users.FirstOrDefault(u => u.IdCliente == client.id);
                        if (user != null)
                        {
                            user.firstName = dto.FirstName;
                            user.lastName = dto.LastName;
                            user.phonenumber = dto.PhoneNumber;
                            user.extension = int.TryParse(dto.Extension, out int ext) ? ext : (int?)null;
                            user.email = dto.Email;
                            user.userName = dto.Email;
                            user.SecondaryEmail = dto.Email;

                            ctx.SaveChanges();
                        }

                        // 3. Eliminar rooms anteriores
                        //if (user != null)
                        //{
                        //    var currentRoomLinks = ctx.roomsbyuser.Where(rb => rb.idUser == user.Id).ToList();
                        //    ctx.roomsbyuser.RemoveRange(currentRoomLinks);

                        //    var currentRooms = currentRoomLinks
                        //        .Select(rb => rb.idRoom)
                        //        .ToList();

                        //    var roomsToDelete = ctx.Rooms.Where(r => currentRooms.Contains(r.id)).ToList();
                        //    ctx.Rooms.RemoveRange(roomsToDelete);
                        //}

                        ctx.SaveChanges();

                        // 4. Agregar nuevas rooms y relaciones
                        //if (user != null)
                        //{
                        //    foreach (var roomName in dto.RoomNames)
                        //    {
                        //        var room = new rooms
                        //        {
                        //            name = roomName,
                        //            calls = 0,
                        //            credits = 0,
                        //            description = $"Room de {roomName}",
                        //            long_sms = 0,
                        //            short_sms = 0
                        //        };

                        //        ctx.Rooms.Add(room);
                        //        ctx.SaveChanges();

                        //        var roomByUser = new roomsbyuser
                        //        {
                        //            idRoom = room.id,
                        //            idUser = user.Id
                        //        };

                        //        ctx.roomsbyuser.Add(roomByUser);
                        //        ctx.SaveChanges();
                        //    }
                        //}

                        transaction.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        log.Error("Error al actualizar cliente: " + ex.Message, ex);
                        return false;
                    }
                }
            }
        }
        public bool DeactivateClient(int id)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var client = ctx.clients.FirstOrDefault(c => c.id == id);
                    if (client == null)
                        return false;

                    if (client.Estatus == 1)
                    {

                        client.Estatus = 0;
                        client.DeactivationDate = DateTime.Now;
                    }
                    else
                    {
                        client.Estatus = 1;
                        client.DeactivationDate = DateTime.Now;
                    }
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                log.Error("Error al desactivar cliente: " + ex.Message, ex);
                return false;
            }
        }

        public bool DeleteClient(int id)
        {
            using (var ctx = new Entities())
            {
                try
                {
                    var client = ctx.clients.FirstOrDefault(c => c.id == id);
                    if (client == null) return false;

                    client.Estatus = 2; // Estado de eliminado
                    ctx.SaveChanges();

                    return true;
                }
                catch (Exception ex)
                {
                    log.Error("Error al eliminar cliente en ClientManager", ex);
                    return false;
                }
            }
        }

        public bool RechargeUserDirect(RechargeRequest credit)
        {
            log.Info("Iniciando recarga directa...");

            try
            {
                using (var ctx = new Entities())
                {
                    if (credit.SmsType.ToLower() == "largo")
                    {
                        credit.SmsType = "long_sms";
                    }
                    if (credit.SmsType.ToLower() == "corto")
                    {
                        credit.SmsType = "short_sms";
                    }
                    foreach (var item in credit.Rooms)
                    {
                        var roomId = (from c in ctx.clients
                                      join u in ctx.Users on c.id equals u.IdCliente
                                      join ru in ctx.roomsbyuser on u.Id equals ru.idUser
                                      join r in ctx.Rooms on ru.idRoom equals r.id
                                      where r.name == item && c.id == credit.ClientId
                                      select r.id).FirstOrDefault();

                        var recharge = new CreditRecharge
                        {
                            Chanel = credit.SmsType,
                            idCreditCard = null,
                            quantityCredits = credit.Amount,
                            quantityMoney = credit.Total,
                            RechargeDate = credit.BillingDate,
                            idUser = credit.IdUser,
                            AutomaticInvoice = false,
                            Estatus = credit.PaymentType,
                            idRoom = roomId
                        };

                        ctx.CreditRecharge.Add(recharge);
                        ctx.SaveChanges();
                    }

                    foreach (var roomName in credit.Rooms)
                    {
                        var room = (from r in ctx.Rooms
                                    join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                                    where r.name == roomName && rbu.idUser == credit.IdUser
                                    select r).FirstOrDefault();

                        if (room != null)
                        {
                            if (credit.SmsType?.ToLower() == "short_sms")
                            {
                                room.short_sms += credit.Amount;
                                room.credits += credit.Amount;
                            }
                            else if (credit.SmsType?.ToLower() == "long_sms")
                            {
                                room.long_sms += credit.Amount;
                                room.credits += credit.Amount;
                            }
                        }
                    }

                    ctx.SaveChanges();

                    return true;
                }
            }
            catch (Exception ex)
            {
                log.Error("Error en RechargeUserDirect", ex);
                return false;
            }
        }

        public List<RoomAdminResponse> GetRoomsAdmin()
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var query = from r in ctx.Rooms
                                join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                                join u in ctx.Users on rbu.idUser equals u.Id
                                join c in ctx.clients on u.IdCliente equals c.id
                                select new RoomAdminResponse
                                {
                                    fechaAlta = c.CreationDate,
                                    nombrecliente = c.nombrecliente,
                                    nombreSala = r.name,
                                    creditosGlobales = r.credits,
                                    creditosSmsCortos = r.short_sms,
                                    creditosSmsLargos = r.long_sms,

                                    CanBeDeleted = !ctx.Campaigns.Any(cam => cam.RoomId == r.id)
                                };

                    return query.ToList();
                }
            }
            catch (Exception ex)
            {
                log.Error("Error en GetRoomsAdmin", ex);
                return new List<RoomAdminResponse>();
            }
        }

        public ReportsAdminResponse GetReportsAdmin(ReportsAdminRequest request)
        {
            var pageSize = int.Parse(Common.ConfigurationManagerJson("TotalPaginas"));

            if (request.TipoReporte == 0)
            {
                var (items, total) = GetReporteFacturacion(request.FechaInicio, request.FechaFin, request.ClientIds, request.Page, pageSize);
                return new ReportsAdminResponse
                {
                    Items = items.Cast<object>().ToList(),
                    Total = total,
                    Pagination = pageSize
                };
            }
            else if (request.TipoReporte == 1)
            {
                var (items, total) = GetReporteConsumoCliente(request.FechaInicio, request.FechaFin, request.ClientIds, request.Page, pageSize);
                return new ReportsAdminResponse
                {
                    Items = items.Cast<object>().ToList(),
                    Total = total,
                    Pagination = pageSize
                };
            }
            else if (request.TipoReporte == 2)
            {
                var (items, total) = GetReporteConsumoSistema(request.FechaInicio, request.FechaFin, request.ClientIds, request.Page, pageSize);
                return new ReportsAdminResponse
                {
                    Items = items.Cast<object>().ToList(),
                    Total = total,
                    Pagination = pageSize
                };
            }

            return new ReportsAdminResponse
            {
                Items = new List<object>(),
                Total = 0
            };
        }


        public (List<ReporteConsumoDTO> Items, int Total) GetReporteConsumoCliente(DateTime fechaInicio, DateTime fechaFin, List<int> clientIds, int page, int pageSize)
        {
            using (var ctx = new Entities())
            {
                var query = from recarga in ctx.CreditRecharge
                            join user in ctx.Users on recarga.idUser equals user.Id
                            join client in ctx.clients on user.IdCliente equals client.id
                            where recarga.RechargeDate >= fechaInicio && recarga.RechargeDate <= fechaFin
                                  && (!clientIds.Any() || clientIds.Contains(client.id))
                            select new ReporteConsumoDTO
                            {
                                Fecha = recarga.RechargeDate,
                                Cliente = client.nombrecliente,
                                Monto = recarga.quantityMoney,
                                Creditos = recarga.quantityCredits,
                                Consumo = Math.Round(recarga.quantityMoney * 0.25m, 2),
                                Saldo = Math.Round(recarga.quantityMoney * 0.75m, 2)
                            };

                int total = query.Count();
                var items = (page <= 0)
                    ? query.OrderByDescending(x => x.Fecha).ToList()
                    : query.OrderByDescending(x => x.Fecha)
                           .Skip((page - 1) * pageSize)
                           .Take(pageSize)
                           .ToList();

                return (items, total);
            }
        }



        public (List<ReporteFacturacionDTO> Items, int Total) GetReporteFacturacion(DateTime fechaInicio, DateTime fechaFin, List<int> clientIds, int page, int pageSize)
        {
            using (var ctx = new Entities())
            {
                var query = from recarga in ctx.CreditRecharge
                            join user in ctx.Users on recarga.idUser equals user.Id
                            join cliente in ctx.clients on user.IdCliente equals cliente.id
                            join billing in ctx.BillingInformation on user.Id equals billing.userId into billingGroup
                            from billing in billingGroup.DefaultIfEmpty()
                            where recarga.RechargeDate >= fechaInicio && recarga.RechargeDate <= fechaFin
                                  && (clientIds == null || clientIds.Contains(cliente.id))
                            select new ReporteFacturacionDTO
                            {
                                FechaFacturacion = DateTime.Now,
                                Cliente = cliente.nombrecliente,
                                Concepto = "SMS",
                                RazonSocial = billing.BusinessName ?? "Sin razón social",
                                FechaRecarga = recarga.RechargeDate,
                                FolioFactura = 123,
                                Subtotal = recarga.quantityMoney,
                                IVA = Math.Round(recarga.quantityMoney * 0.16m, 2),
                                Total = Math.Round(recarga.quantityMoney * 1.16m, 2)
                            };

                int total = query.Count();
                var items = (page <= 0)
                    ? query.OrderByDescending(x => x.FechaRecarga).ToList()
                    : query.OrderByDescending(x => x.FechaRecarga)
                           .Skip((page - 1) * pageSize)
                           .Take(pageSize)
                           .ToList();

                return (items, total);
            }
        }


        public (List<ReporteConsumoSistemaDto> Items, int Total) GetReporteConsumoSistema(DateTime fechaInicio, DateTime fechaFin, List<int> clientIds, int page, int pageSize)
        {
            using (var ctx = new Entities())
            {
                var grouped = from send in ctx.CampaignContactScheduleSend
                              join campaign in ctx.Campaigns on send.CampaignId equals campaign.Id
                              join roomUser in ctx.roomsbyuser on campaign.RoomId equals roomUser.idRoom
                              join user in ctx.Users on roomUser.idUser equals user.Id
                              join client in ctx.clients on user.IdCliente equals client.id
                              where send.SentAt >= fechaInicio && send.SentAt <= fechaFin
                                    && (!clientIds.Any() || clientIds.Contains(client.id))
                              group send by client.nombrecliente into g
                              select new ReporteConsumoSistemaDto
                              {
                                  Fecha = DateTime.Today,
                                  Cliente = g.Key,
                                  MensajesEnviados = g.Count(),
                              };

                int total = grouped.Count();
                var items = (page <= 0)
                    ? grouped.OrderByDescending(x => x.MensajesEnviados).ToList()
                    : grouped.OrderByDescending(x => x.MensajesEnviados)
                             .Skip((page - 1) * pageSize)
                             .Take(pageSize)
                             .ToList();

                return (items, total);
            }
        }



    }
}
