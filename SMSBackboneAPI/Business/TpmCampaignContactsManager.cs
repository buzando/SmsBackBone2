using ClosedXML.Excel;
using Contract.Other;
using Contract.Request;
using Contract.Response;
using DocumentFormat.OpenXml.Office2013.Excel;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Business
{
    public class TpmCampaignContactsManager
    {
        public ChargeNumbersComplete InsertBatchFromExcel(CampainContacttpmrequest dto)
        {
            var resultado = new ChargeNumbersComplete();
            resultado.CpColumn = string.IsNullOrWhiteSpace(dto.CpColumn)
    ? null
    : dto.CpColumn.Trim();
            resultado.CpColumn = dto.CpColumn;
            try
            {
                var archivoBytes = Convert.FromBase64String(dto.Base64File);
                var table = CreateTmpContactsTable();
                const int batchSize = 5000;

                using (var stream = new MemoryStream(archivoBytes))
                using (var workbook = new XLWorkbook(stream))
                {
                    var hoja = workbook.Worksheet(dto.SheetName);
                    if (hoja == null) return resultado;

                    // Obtener encabezados
                    var headers = hoja.Row(1).Cells().Select((c, i) => new HeaderInfo { Header = c.GetString(), Index = i + 1 }).ToList();
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
                            var cpRaw = ObtenerValorColumna(hoja, fila, headers, dto.CpColumn);
                            var cp = NormalizeZipCode(cpRaw);

                            var cpVacio = string.IsNullOrWhiteSpace(cpRaw);
                            var cpInvalido = !cpVacio && string.IsNullOrWhiteSpace(cp);

                            if (cpInvalido || cpVacio)
                            {
                                resultado.CodigosPostalesFallidos++;
                            }
                            var telefonos = phoneConcat.Split('|', StringSplitOptions.RemoveEmptyEntries);
                            int telefonosValidos = 0;

                            foreach (var telefono in telefonos)
                            {
                                if (EsTelefonoValido(telefono))
                                {
                                    table.Rows.Add(
                                        dto.SessionId,
                                        telefono,
                                        dato,
                                        datoId,
                                        misc01,
                                        null, // Misc02
                                        cp,   // CP válido o null
                                        DateTime.Now,
                                        dto.CreatedBy
                                    );

                                    if (!string.IsNullOrWhiteSpace(cp))
                                    {
                                        resultado.CodigosPostalesCargados++;
                                    }

                                    if (table.Rows.Count >= batchSize)
                                    {
                                        BulkInsertTmpContacts(table);
                                        table.Clear();
                                    }

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

                if (table.Rows.Count > 0)
                {
                    BulkInsertTmpContacts(table);
                    table.Clear();
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
        return header != null ? hoja.Cell(fila, header.Index).GetString() : null;
    })
    .Where(v => !string.IsNullOrWhiteSpace(v))
    .Distinct();

            return string.Join("|", valores);
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
            misc01 = string.Empty;

            if (columnas == null || columnas.Count == 0)
                return;

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

            misc01 = string.Join("|", otros);
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

        private string ObtenerValorColumna(
    IXLWorksheet hoja,
    int fila,
    List<HeaderInfo> headers,
    string columna)
        {
            if (string.IsNullOrWhiteSpace(columna))
                return null;

            var header = headers.FirstOrDefault(h =>
                string.Equals(h.Header?.Trim(), columna.Trim(), StringComparison.OrdinalIgnoreCase));

            if (header == null)
                return null;

            return hoja.Cell(fila, header.Index).GetFormattedString()?.Trim();
        }

        private string NormalizeZipCode(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var digits = new string(value.Trim().Where(char.IsDigit).ToArray());

            // Por si Excel trae 01000 como número y lo convierte en 1000
            if (digits.Length == 4)
                digits = digits.PadLeft(5, '0');

            return digits.Length == 5 ? digits : null;
        }

        private DataTable CreateTmpContactsTable()
        {
            var table = new DataTable();

            table.Columns.Add("SessionId", typeof(string));
            table.Columns.Add("PhoneNumber", typeof(string));
            table.Columns.Add("Dato", typeof(string));
            table.Columns.Add("DatoId", typeof(string));
            table.Columns.Add("Misc01", typeof(string));
            table.Columns.Add("Misc02", typeof(string));
            table.Columns.Add("CP", typeof(string));
            table.Columns.Add("CreatedAt", typeof(DateTime));
            table.Columns.Add("CreatedBy", typeof(string));

            return table;
        }

        private void BulkInsertTmpContacts(DataTable table)
        {
            if (table == null || table.Rows.Count == 0)
                return;

            using var ctx = new Entities();

            var connectionString = ctx.Database.GetDbConnection().ConnectionString;

            using var connection = new SqlConnection(connectionString);
            connection.Open();

            using var bulk = new SqlBulkCopy(
    connection,
    SqlBulkCopyOptions.Default,
    null
);

            bulk.DestinationTableName = "dbo.tpm_CampaignContacts";
            bulk.BatchSize = 5000;
            bulk.BulkCopyTimeout = 300;

            bulk.ColumnMappings.Add("SessionId", "SessionId");
            bulk.ColumnMappings.Add("PhoneNumber", "PhoneNumber");
            bulk.ColumnMappings.Add("Dato", "Dato");
            bulk.ColumnMappings.Add("DatoId", "DatoId");
            bulk.ColumnMappings.Add("Misc01", "Misc01");
            bulk.ColumnMappings.Add("Misc02", "Misc02");
            bulk.ColumnMappings.Add("CP", "CP");
            bulk.ColumnMappings.Add("CreatedAt", "CreatedAt");
            bulk.ColumnMappings.Add("CreatedBy", "CreatedBy");

            bulk.WriteToServer(table);
        }
    }
}
