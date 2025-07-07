using Modal;
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

namespace Business
{
    public class ClientManager
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserManager));

        public bool AgregarCliente(clientDTO cliente)
        {

            try
            {
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
        public List<clientDTO> GetClientes()
        {
            try
            {
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

        public List<Modal.Model.Model.ClientRoomSummaryDTO> GetClientsAdmin()
        {
            var lista = new List<Modal.Model.Model.ClientRoomSummaryDTO>();
            try
            {
                using (var ctx = new Entities())
                {
                    lista = ctx.Set<Modal.Model.Model.ClientRoomSummaryDTO>().FromSqlRaw("EXEC GetClientRoomSummary").ToList();
                }
                return lista;
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
                            Estatus = 1
                        };

                        ctx.clients.Add(client);
                        ctx.SaveChanges();

                        int clientId = client.id;

                        string rawPassword;
                        string hashedPassword = SecurityHelper.GenerarPasswordTemporal(out rawPassword);
                        // 2. Crear usuario
                        var user = new Users
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
                        transaction.Commit();
                        if (dto.Id == null)
                        {
                            string sitioFront = Common.ConfigurationManagerJson("UrlSitio");
                            string mensaje = MailManager.GenerateMailMessage(dto.Email, rawPassword, sitioFront, "Register");

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
                        client.RateForShort = decimal.Parse(dto.RateForShort);
                        client.RateForLong = decimal.Parse(dto.RateForLong);
                        client.ShortRateType = dto.ShortRateType;
                        client.LongRateType = dto.LongRateType;
                        client.ShortRateQty = dto.ShortRateQty;
                        client.LongRateQty = dto.LongRateQty;

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
                    };

                    ctx.CreditRecharge.Add(recharge);
                    ctx.SaveChanges();

                    foreach (var roomName in credit.Rooms)
                    {
                        var room = (from r in ctx.Rooms
                                    join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                                    where r.name == roomName && rbu.idUser == credit.IdUser
                                    select r).FirstOrDefault();

                        if (room != null)
                        {
                            if (credit.SmsType?.ToLower() == "short")
                            {
                                room.short_sms += credit.Amount;
                                room.credits += credit.Amount;
                            }
                            else if (credit.SmsType?.ToLower() == "long")
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
                                    creditosSmsLargos = r.long_sms
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

        public List<object> GetReportsAdmin(ReportsAdminRequest request)
        {
            // Aquí seleccionas según el tipo de reporte, por ejemplo:
            if (request.TipoReporte == 0)
            {
                return GetReporteFacturacion(request.FechaInicio, request.FechaFin)
                         .Cast<object>().ToList();
            }
            else if (request.TipoReporte == 1)
            {

                return GetReporteConsumoCliente(request.FechaInicio, request.FechaFin)
                         .Cast<object>().ToList();
            }
            else if (request.TipoReporte == 2)
            {
                return GetReporteConsumoSistema(request.FechaInicio, request.FechaFin).Cast<object>().ToList();
            }

            return new List<object>();
        }

        public List<ReporteConsumoDTO> GetReporteConsumoCliente(DateTime fechaInicio, DateTime fechaFin)
        {
            using (var ctx = new Entities())
            {
                var query = from recarga in ctx.CreditRecharge
                            join user in ctx.Users on recarga.idUser equals user.Id
                            join client in ctx.clients on user.IdCliente equals client.id
                            where recarga.RechargeDate >= fechaInicio && recarga.RechargeDate <= fechaFin
                            select new ReporteConsumoDTO
                            {
                                Fecha = recarga.RechargeDate,
                                Cliente = client.nombrecliente,
                                Monto = recarga.quantityMoney,
                                Creditos = recarga.quantityCredits,
                                Consumo = Math.Round(recarga.quantityMoney * 0.25m, 2),
                                Saldo = Math.Round(recarga.quantityMoney * 0.75m, 2)
                            };

                return query.ToList();
            }
        }

        public List<ReporteFacturacionDTO> GetReporteFacturacion(DateTime fechaInicio, DateTime fechaFin)
        {
            using (var ctx = new Entities())
            {
                var query = from recarga in ctx.CreditRecharge
                            join user in ctx.Users on recarga.idUser equals user.Id
                            join cliente in ctx.clients on user.IdCliente equals cliente.id
                            join billing in ctx.BillingInformation on user.Id equals billing.userId into billingGroup
                            from billing in billingGroup.DefaultIfEmpty()
                            where recarga.RechargeDate >= fechaInicio && recarga.RechargeDate <= fechaFin
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

                return query.ToList();
            }
        }

        public List<ReporteConsumoSistemaDto> GetReporteConsumoSistema(DateTime fechaInicio, DateTime fechaFin)
        {
            using (var ctx = new Entities())
            {
                var query = from send in ctx.CampaignContactScheduleSend
                            join campaign in ctx.Campaigns on send.CampaignId equals campaign.Id
                            join roomUser in ctx.roomsbyuser on campaign.RoomId equals roomUser.idRoom
                            join user in ctx.Users on roomUser.idUser equals user.Id
                            join client in ctx.clients on user.IdCliente equals client.id
                            where send.SentAt >= fechaInicio && send.SentAt <= fechaFin
                            group send by new
                            {
                                client.nombrecliente
                            } into g
                            select new ReporteConsumoSistemaDto
                            {
                                Fecha = DateTime.Today, // Fijamos la fecha de hoy
                                Cliente = g.Key.nombrecliente,
                                MensajesEnviados = g.Count(),
                                ConceptoEnvio = "$1,000.00" // Valor fijo temporal
                            };

                return query.ToList();
            }
        }

    }
}
