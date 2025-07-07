using System;
using System.Collections.Generic;
using System.Linq;
using ClosedXML.Excel;
using Contract.Other;
using Contract.Request;
using Contract.Response;
using DocumentFormat.OpenXml.Office2013.Excel;
using Modal;
using Modal.Model.Model; // Asegúrate que tu contexto y entidad estén aquí

namespace Business
{
    public class TpmCampaignContactsManager
    {
        public ChargeNumbersComplete InsertBatchFromExcel(CampainContacttpmrequest dto)
        {
            var resultado = new ChargeNumbersComplete();

            try
            {
                var archivoBytes = Convert.FromBase64String(dto.Base64File);
                var lista = new List<tpm_CampaignContacts>();

                using (var stream = new MemoryStream(archivoBytes))
                using (var workbook = new XLWorkbook(stream))
                {
                    var hoja = workbook.Worksheet(dto.SheetName);
                    if (hoja == null) return resultado;

                    // Obtener encabezados
                    var headers = hoja.Row(1).Cells().Select((c, i) => new HeaderInfo { Header = c.GetString()?.Trim(), Index = i + 1 }).ToList();
                    var rowCount = hoja.LastRowUsed().RowNumber();

                    for (int fila = 2; fila <= rowCount; fila++)
                    {
                        try
                        {
                            string phoneConcat = ConcatenarColumnas(hoja, fila, headers, dto.PhoneColumns);
                            if (string.IsNullOrWhiteSpace(phoneConcat))
                            {
                                resultado.RegistrosFallidos++;
                                continue;
                            }

                            ObtenerDatosDetallados(hoja, fila, headers, dto.DatoColumns, out string dato, out string datoId, out string misc01);

                            var telefonos = phoneConcat.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                            int telefonosValidos = 0;

                            foreach (var telefono in telefonos)
                            {
                                if (EsTelefonoValido(telefono))
                                {
                                    lista.Add(new tpm_CampaignContacts
                                    {
                                        SessionId = dto.SessionId,
                                        PhoneNumber = telefono,
                                        Dato = dato,
                                        DatoId = datoId,
                                        Misc01 = misc01,
                                        CreatedAt = DateTime.Now,
                                        CreatedBy = dto.CreatedBy
                                    });
                                    telefonosValidos++;
                                }
                                else
                                {
                                    resultado.TelefonosFallidos++;
                                }
                            }

                            if (telefonosValidos > 0)
                                resultado.RegistrosCargados++;
                            else
                                resultado.RegistrosFallidos++;

                            resultado.TelefonosCargados += telefonosValidos;
                        }
                        catch
                        {
                            resultado.RegistrosFallidos++;
                        }
                    }


                }

                using (var ctx = new Entities())
                {
                    ctx.tpm_CampaignContacts.AddRange(lista);
                    ctx.SaveChanges();
                }


                return resultado;
            }
            catch (Exception e)
            {
                // log if needed
                return null;
            }
        }

        private string ConcatenarColumnas(IXLWorksheet hoja, int fila, List<HeaderInfo> headers, List<string> columnas)
        {
            if (columnas == null || columnas.Count == 0) return null;

            var valores = columnas
    .Select(nombre =>
    {
        var header = headers.FirstOrDefault(h => h.Header == nombre);
        return header != null ? hoja.Cell(fila, header.Index).GetString()?.Trim() : null;
    })
    .Where(v => !string.IsNullOrWhiteSpace(v))
    .Distinct();

            return string.Join(" ", valores);
        }

        private void ObtenerDatosDetallados(
    IXLWorksheet hoja,
    int fila,
    List<HeaderInfo> headers,
    List<string> columnas,
    out string dato,
    out string datoId,
    out string misc01)
        {
            dato = string.Empty;
            datoId = string.Empty;
            var otros = new List<string>();

            foreach (var nombre in columnas)
            {
                var header = headers.FirstOrDefault(h => h.Header?.Trim().ToLower() == nombre.Trim().ToLower());
                if (header != null)
                {
                    var valor = hoja.Cell(fila, header.Index).GetString()?.Trim();
                    if (string.IsNullOrWhiteSpace(valor)) continue;

                    var nombreLower = nombre.Trim().ToLower();
                    if (nombreLower == "dato")
                        dato = valor;
                    else if (nombreLower == "id" || nombreLower == "datoid")
                        datoId = valor;
                    else
                        otros.Add($"{nombre}:{valor}");
                }
            }

            misc01 = string.Join(" ", otros);
        }


        public List<tpm_CampaignContacts> GetBySessionId(string sessionId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    return ctx.tpm_CampaignContacts
                             .Where(x => x.SessionId == sessionId)
                             .ToList();
                }
            }
            catch (Exception e)
            {
                return new List<tpm_CampaignContacts>();
            }
        }

        private bool EsTelefonoValido(string numero)
        {
            return !string.IsNullOrWhiteSpace(numero)
                && numero.All(char.IsDigit)
                && numero.Length >= 10
                && numero.Length <= 15;
        }
    }
}
