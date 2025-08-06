using ClosedXML.Excel;
using Contract;
using Contract.Request;
using Contract.Response;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using DocumentFormat.OpenXml.Vml;
using log4net;
using Modal;
using Modal.Model.Model;
using Openpay;
using Openpay.Entities;
using Openpay.Entities.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class MyNumbersManager
    {
                private static readonly ILog log = LogManager.GetLogger(typeof(UserManager));

        public List<MyNumbersResponse> NumbersByUser(int id)
        {
            var numbres = new List<MyNumbersResponse>();

            try
            {
                using (var ctx = new Entities())
                {
                    numbres = ctx.MyNumbers.Where(x => x.Clients.id == id).Select(x => new MyNumbersResponse
                    {
                        Cost = x.Cost,
                        Id = x.Id,
                        IdClient = x.idClient ?? 0,
                        Lada = x.Lada
                    ,
                        Municipality = x.Municipality,
                        NextPaymentDate = x.NextPaymentDate ?? DateTime.Now,
                        Number = x.Number,
                        Service = x.Service,
                        State = x.State,
                        Type = x.Type
                    }).ToList();
                }
                return numbres;

            }
            catch (Exception e)
            {
                return new List<MyNumbersResponse>();
            }
        }

        public List<MyNumbersResponse> NumbersALL()
        {
            var numbres = new List<MyNumbersResponse>();

            try
            {
                using (var ctx = new Entities())
                {
                    numbres = ctx.MyNumbers.Select(x => new MyNumbersResponse
                    {
                        Cost = x.Cost,
                        Id = x.Id,
                        IdClient = x.idClient ?? 0,
                        Lada = x.Lada,
                        Municipality = x.Municipality,
                        NextPaymentDate = x.NextPaymentDate ?? DateTime.Now,
                        Number = x.Number,
                        Service = x.Service,
                        State = x.State,
                        Type = x.Type,
                        service = x.Service,
                        Estatus = x.Estatus,
                    }).ToList();
                }
                return numbres;

            }
            catch (Exception e)
            {
                return new List<MyNumbersResponse>();
            }
        }

        public UploadSummaryResponse ProcesarNumerosDids(ManageNumerosDidsRequest request)
        {
            int total = 0;
            var summary = new UploadSummaryResponse
            {
                FileName = request.FileName ?? "", // Agrega esta propiedad a tu DTO si no está
                Errors = new UploadErrorBreakdown()
            };
            try
            {
                using (var ctx = new Entities())
                {
                    var numeros = new List<string>();
                    if (!string.IsNullOrEmpty(request.FileBase64))
                    {
                        var bytes = Convert.FromBase64String(request.FileBase64);
                        using (var ms = new MemoryStream(bytes))
                        using (var workbook = new XLWorkbook(ms))
                        {
                            var hoja = workbook.Worksheet(1); // o usa el nombre si lo necesitas
                            int fila = 2;

                            while (true)
                            {
                                var celda = hoja.Cell($"A{fila}").GetString()?.Trim();
                                if (string.IsNullOrEmpty(celda))
                                    break;

                                numeros.Add(celda);
                                fila++;
                            }
                        }
                    }

                    else
                    {
                        numeros = request.Phones.Select(p => p.Trim()).ToList();
                    }

                    // 2. Procesar cada número
                    foreach (var numero in numeros)
                    {
                        total++;
                        bool isValid = true;

                        if (numero.Length < 10)
                        {
                            summary.Failed++;
                            summary.Errors.MinLength++;
                            isValid = false;
                        }
                        else if (!numero.All(char.IsLetterOrDigit))
                        {
                            if (numero.Any(c => !char.IsLetterOrDigit(c)))
                            {
                                summary.Failed++;
                                summary.Errors.SpecialChars++;
                                isValid = false;
                            }
                        }
                        else if (numero.Any(char.IsLetter))
                        {
                            summary.Failed++;
                            summary.Errors.Alphanumeric++;
                            isValid = false;
                        }

                        if (!isValid)
                            continue;

                        bool wasProcessed = false;

                        var existente = ctx.MyNumbers.FirstOrDefault(x => x.Number == numero);

                        if (request.Operation.ToLower() == "agregar")
                        {
                            if (existente != null)
                            {
                                summary.Errors.Duplicated++;
                                continue;
                            }
                            if (existente == null)
                            {
                                string lada = numero.Length >= 2 ? numero.Substring(0, 2) : "";
                                var ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);

                                if (ladaRecord == null && numero.Length >= 3)
                                {
                                    lada = numero.Substring(0, 3);
                                    ladaRecord = ctx.IFTLadas.FirstOrDefault(l => l.ClaveLada == lada);
                                }

                                string estado = ladaRecord?.Estado ?? "Desconocido";
                                string municipio = ladaRecord?.Municipio ?? "Desconocido";

                                var nuevo = new MyNumbers
                                {
                                    Number = numero,
                                    idClient = request.ClientId,
                                    Estatus = "no asignado",
                                    Municipality = municipio,
                                    State = estado,
                                    Lada = lada,
                                    Type = request.Channel,
                                    Service = "SMS",
                                    Cost = 0.1M,
                                    NextPaymentDate = DateTime.Now,
                                };

                                ctx.MyNumbers.Add(nuevo);
                                wasProcessed = true;
                            }
                        }
                        else if (request.Operation.ToLower() == "dardebaja" && existente != null)
                        {
                            existente.Estatus = "baja";
                            wasProcessed = true;
                        }
                        if (request.Operation.ToLower() == "eliminar")
                        {
                            if (existente != null)
                            {
                                ctx.MyNumbers.Remove(existente);
                                wasProcessed = true;
                            }
                            else
                            {
                                summary.Failed++;
                            }
                        }

                        if (wasProcessed)
                            summary.Success++;
                    }



                    summary.Total = total;
                    if (request.Operation.ToLower() == "agregar")
                    {
                        summary.Failed = summary.Errors.MinLength +
                                         summary.Errors.SpecialChars +
                                         summary.Errors.Alphanumeric +
                                         summary.Errors.Duplicated;
                    }
                    ctx.SaveChanges();
                    return summary;
                }
            }
            catch (Exception ex)
            {
                // Aquí puedes agregar logger si tienes
                return null;
            }
        }

        public bool ProcesarNumerosDidsIndividual(RequestManageNumbersIndividual number)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    if (number.operation == "delete")
                    {
                        var numero = ctx.MyNumbers.Where(x => x.Id == number.id).FirstOrDefault();
                        if (numero != null)
                        {
                            ctx.MyNumbers.Remove(numero);
                        }
                    }
                    if (number.operation == "deactivate")
                    {
                        var numero = ctx.MyNumbers.Where(x => x.Id == number.id).FirstOrDefault();
                        if (numero != null)
                        {
                            numero.Estatus = "baja";
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
        public string ProcesarShortNumberRequest(NumberRequestDTO request)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var setupCost = 0.0m;
                    var monthlyCost = 0.0m;
                    var emails = Common.ConfigurationManagerJson("EmailReceivers");
                    if (request.Type == "long")
                    {
                        setupCost = decimal.Parse(Common.ConfigurationManagerJson("LongNumberSetupCost"));
                        monthlyCost = decimal.Parse(Common.ConfigurationManagerJson("LongNumberMonthlyCost"));
                    }
                    else
                    {
                        setupCost = decimal.Parse(Common.ConfigurationManagerJson("ShortNumberSetupCost"));
                        monthlyCost = decimal.Parse(Common.ConfigurationManagerJson("ShortNumberMonthlyCost"));
                    }


                    var user = ctx.Users.FirstOrDefault(u => u.email == request.Email);
                    if (user == null) return "";

                    var client = ctx.clients.FirstOrDefault(c => c.id == user.IdCliente);
                    if (client == null) return "";

                    var clientName = client.nombrecliente;
                    var creditCard = ctx.creditcards.FirstOrDefault(c => c.Id == request.CreditCardId);
                    if (creditCard == null) return "";

                    // Total a cobrar
                    var totalAmount = setupCost * (request.Quantity + monthlyCost);

                    var apiKey = Common.ConfigurationManagerJson("APIKEY"); 
                    var merchantId = Common.ConfigurationManagerJson("MERCHANTID");
                    var openpay = new OpenpayAPI(apiKey, merchantId);

                    var boolproduction = Common.ConfigurationManagerJson("OPENPAYPRODUCTION");
                    var prodution = bool.Parse(boolproduction);
                    openpay.Production = prodution;


                    var chargeRequest = new ChargeRequest
                    {
                        Method = "card",
                        SourceId = creditCard.token_id,
                        Amount = totalAmount,
                        Description = "Recarga de créditos",
                        Currency = "MXN",
                        DeviceSessionId = request.DeviceSessionId,
                        Use3DSecure = true,
                        RedirectUrl = Common.ConfigurationManagerJson("OPENPAY_REDIRECT_URL_MyNumbers"),
                    };

                    var charge = new Charge();
                    try
                    {

                        charge = openpay.ChargeService.Create(creditCard.token_id_customer, chargeRequest);

                    }
                    catch (Exception e)
                    {

                        return "";
                    }


                    if (request.Type == "long")
                    {
                        var entity = new LongNumberRequest
                        {
                            Quantity = request.Quantity,
                            SetupCost = setupCost,
                            MonthlyCost = monthlyCost,
                            CreditCardId = request.CreditCardId,
                            NotificationEmails = string.Join(",", emails),
                            SentSuccessfully = false,
                            CreatedAt = DateTime.Now,
                            PaymentStatus = "En espera",
                            AutoInvoice = request.AutomaticInvoice,
                            PaymentTransactionId = charge.Id,
                            SentAt = DateTime.Now,
                            TotalAmount = totalAmount,
                            Lada = request.Lada,
                            Municipality = request.Municipality,
                            State = request.State
                        };


                        ctx.LongNumberRequest.Add(entity);
                        ctx.SaveChanges();
                    }
                    else
                    {
                        var entity = new ShortNumberRequest
                        {
                            Quantity = request.Quantity,
                            SetupCost = setupCost,
                            MonthlyCost = monthlyCost,
                            CreditCardId = request.CreditCardId,
                            NotificationEmails = string.Join(",", emails),
                            SentSuccessfully = false,
                            CreatedAt = DateTime.Now,
                            PaymentStatus = "En espera",
                            AutoInvoice = request.AutomaticInvoice,
                            PaymentTransactionId = charge.Id,
                            SentAt = DateTime.Now,
                            TotalAmount = totalAmount,
                        };


                        ctx.ShortNumberRequest.Add(entity);
                        ctx.SaveChanges();
                    }
                   
                    return charge.PaymentMethod.Url;
                }
            }
            catch (Exception ex)
            {
                return "";
            }
        }
        public bool VerifyRechargeStatus(string idRecharge)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    // Buscar en Short y Long usando PaymentTransactionId
                    var shortReq = ctx.ShortNumberRequest.FirstOrDefault(x => x.PaymentTransactionId == idRecharge);
                    var longReq = ctx.LongNumberRequest.FirstOrDefault(x => x.PaymentTransactionId == idRecharge);

                    if (shortReq == null && longReq == null)
                    {
                        log.Warn($"No se encontró recarga con ID {idRecharge} en ShortNumberRequest ni LongNumberRequest");
                        return false;
                    }

                    dynamic rechargeReq;
                    string tipo;

                    if (shortReq != null)
                    {
                        rechargeReq = shortReq;
                        tipo = "short";
                    }
                    else
                    {
                        rechargeReq = longReq;
                        tipo = "long";
                    }

                    // OpenPay setup
                    var apiKey = Common.ConfigurationManagerJson("APIKEY");
                    var merchantId = Common.ConfigurationManagerJson("MERCHANTID");
                    var production = bool.Parse(Common.ConfigurationManagerJson("OPENPAYPRODUCTION"));
                    var openpay = new OpenpayAPI(apiKey, merchantId) { Production = production };

                    // Obtener el cargo
                    var charge = openpay.ChargeService.Get(rechargeReq.CustomerId, rechargeReq.ChargeId);
                    if (charge == null)
                    {
                        log.Warn($"No se encontró el cargo en OpenPay para PaymentTransactionId {idRecharge}");
                        return false;
                    }

                    string previousStatus = rechargeReq.Estatus;

                    // Asignar estatus
                    switch (charge.Status.ToLower())
                    {
                        case "completed":
                            rechargeReq.Estatus = "Exitoso";
                            break;
                        case "in_progress":
                            rechargeReq.Estatus = "En progreso";
                            break;
                        case "failed":
                            rechargeReq.Estatus = "Fallida";
                            rechargeReq.EstatusError = charge.ErrorMessage;
                            break;
                        case "cancelled":
                            rechargeReq.Estatus = "Cancelada";
                            break;
                        case "charge_pending":
                            rechargeReq.Estatus = "Cargo Pendiente";
                            break;
                        default:
                            rechargeReq.Estatus = "Recarga fallida";
                            rechargeReq.EstatusError = charge.ErrorMessage;
                            break;
                    }

                    rechargeReq.Status = charge.Status;
                    rechargeReq.Amount = charge.Amount;
                    rechargeReq.FechaActualizacion = DateTime.Now;

                    // Si fue exitosa y aún no se había aplicado
                    if (rechargeReq.Estatus == "Exitoso" && previousStatus != "Exitoso")
                    {
                        int creditCardId = rechargeReq.CreditCardId;  // Esto ya no es dynamic

                        var info = (from card in ctx.creditcards
                                    join user in ctx.Users on card.user_id equals user.Id
                                    join client in ctx.clients on user.IdCliente equals client.id
                                    where card.Id == creditCardId
                                    select new
                                    {
                                        NombreCliente = client.nombrecliente,
                                        CorreoUsuario = user.email
                                    }).FirstOrDefault();
                        // Obtener correo de settings
                        var emailDestino = rechargeReq.NotificationEmails;

                        var asuntolong = "Se pidieron la cantidad de ";

                        //SendRechargeEmail("Administrador", emailDestino, rechargeReq, "exitoso");
                    }


                    ctx.SaveChanges();
                    return true;
                }
            }
            catch (Exception ex)
            {
                log.Error($"Error al verificar recarga {idRecharge}: {ex.Message}");
                return false;
            }
        }



    }
}
