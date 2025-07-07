using ClosedXML.Excel;
using Contract.Request;
using Contract.Response;
using DocumentFormat.OpenXml.Vml;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class MyNumbersManager
    {
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

    }
}
