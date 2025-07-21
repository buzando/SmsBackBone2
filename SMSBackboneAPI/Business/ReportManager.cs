using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Modal;

namespace Business
{
    public class ReportManager
    {
        public ReportGlobalResponse GetSmsReport(ReportRequest request, bool Complete = false)
        {
            var results = new ReportGlobalResponse();

            using (var ctx = new Entities())
            {
                var dbConnection = ctx.Database.GetDbConnection();
                using (var connection = new SqlConnection(dbConnection.ConnectionString))
                {
                    using (var command = new SqlCommand("sp_getGlobalReport", connection))
                    {
                        var total = Common.ConfigurationManagerJson("TotalPaginas");
                        command.CommandType = CommandType.StoredProcedure;

                        command.Parameters.AddWithValue("@RoomId", request.RoomId);
                        command.Parameters.AddWithValue("@StartDate", request.StartDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@EndDate", request.EndDate ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@PageNumber", request.Page > 0 ? request.Page : 1);
                        command.Parameters.AddWithValue("@PageSize", total);
                        command.Parameters.AddWithValue("@Export", Complete);

                        connection.Open();

                        using (var reader = command.ExecuteReader())
                        {
                            int totalCount = 0;
                            if (reader.Read())
                            {
                                results.TotalCount = reader.GetInt32(reader.GetOrdinal("TotalCount"));

                                results.TotalXPage = int.Parse(total);
                                results.reportGlobalResponseLists = new List<ReportGlobalResponseList>();

                                if (Complete)
                                {
                                    results.reportGlobalResponseLists.Add(new ReportGlobalResponseList
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

                                while (reader.Read())
                                {
                                    results.reportGlobalResponseLists.Add(new ReportGlobalResponseList
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
            }
            return results;
        }

        public ReportDeliveryResponse GetSmsReportSend(ReportRequest request, bool Complete = false)
        {
            var results = new ReportDeliveryResponse();

            using (var ctx = new Entities())
            {
                var connection = (SqlConnection)ctx.Database.GetDbConnection();

                // Normalizar tipo
                switch (request.ReportType)
                {
                    case "Mensajes entrantes": request.ReportType = "entrantes"; break;
                    case "Mensajes enviados": request.ReportType = "enviados"; break;
                    case "Mensajes no enviados": request.ReportType = "noenviados"; break;
                    case "Mensajes rechazados": request.ReportType = "rechazados"; break;
                }

                var total = Common.ConfigurationManagerJson("TotalPaginas");

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
                    command.Parameters.AddWithValue("@PageNumber", request.Page > 0 ? request.Page : 1);
                    command.Parameters.AddWithValue("@PageSize", total);
                    command.Parameters.AddWithValue("@Export", Complete); // 👈 nuevo parámetro

                    if (connection.State != ConnectionState.Open)
                        connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            results.TotalCount = reader.GetInt32(reader.GetOrdinal("TotalCount"));
                            results.TotalXPage = int.Parse(total);
                        }

                        if (reader.NextResult())
                        {
                            results.ReportDeliveryList = new List<ReportDeliveryList>();

                            if (reader.Read())
                            {
                                if (Complete)
                                {
                                    results.ReportDeliveryList.Add(new ReportDeliveryList
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

                                while (reader.Read())
                                {
                                    results.ReportDeliveryList.Add(new ReportDeliveryList
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
                }
            }

            return results;
        }


        public byte[] ExportReportToFile(ReportExportRequest request, string format, out string fileName)
        {
            fileName = $"Reporte_{request.ReportType ?? "global"}_{DateTime.Now:yyyyMMdd_HHmmss}.{format}";

            var reportdata = new ReportRequest
            {
                CampaignIds = request.CampaignIds,
                EndDate = request.EndDate,
                UserIds = request.UserIds
            ,
                Page = 0,
                ReportType = request.ReportType,
                StartDate = request.StartDate,
                RoomId = request.RoomId ?? 0
            };

            // Obtener datos
            switch (request.ReportType?.ToLower())
            {
                case "global":
                case null:
                    var globalData = GetSmsReport(reportdata, true);
                    return GenerateFileFrom(globalData, format);

                case "mensajes entrantes":
                case "mensajes enviados":
                case "mensajes no enviados":
                case "mensajes rechazados":
                    var deliveryData = GetSmsReportSend(reportdata, true);
                    return GenerateFileFrom(deliveryData, format);

                case "clients":
                    var clientData = new ClientManager().GetClientsAdmin(0);
                    return GenerateFileFrom(clientData.Items, format);

                case "reportesadmin":
                    var data = new ReportsAdminRequest { FechaFin = DateTime.Parse(request.EndDate), FechaInicio = DateTime.Parse(request.StartDate), Page = 0, TipoReporte = int.Parse(request.PageOrigin) };
                    var ReportData = new ClientManager().GetReportsAdmin(data);
                    return GenerateFileFrom(ReportData.Items, format);

                default:
                    throw new Exception("Tipo de reporte no válido.");
            }
        }
        public byte[] GenerateFileFrom(object data, string format)
        {
            if (data is ReportGlobalResponse global)
                data = global.reportGlobalResponseLists;
            else if (data is ReportDeliveryResponse delivery)
                data = delivery.ReportDeliveryList;
            else if (data is ReportsAdminResponse admin)
                data = admin.Items;

            // Validación
            var listObj = (data as IEnumerable<object>)?.ToList();
            if (listObj == null || !listObj.Any())
                throw new Exception("No hay datos para exportar.");

            var type = listObj.First().GetType();

            // Convertir List<object> a List<T> dinámicamente
            var castedList = typeof(Enumerable)
                .GetMethod("Cast")!
                .MakeGenericMethod(type)
                .Invoke(null, new object[] { listObj });

            var toList = typeof(Enumerable)
                .GetMethod("ToList")!
                .MakeGenericMethod(type)
                .Invoke(null, new object[] { castedList });

            // Ejecutar método correcto según formato
            return format switch
            {
                "xlsx" => (byte[])typeof(ReportHelper)
                            .GetMethod("GenerateGenericExcel")!
                            .MakeGenericMethod(type)
                            .Invoke(null, new[] { toList }),
                "csv" => (byte[])typeof(ReportHelper)
                            .GetMethod("GenerateGenericCsv")!
                            .MakeGenericMethod(type)
                            .Invoke(null, new[] { toList }),
                "pdf" => (byte[])typeof(ReportHelper)
                            .GetMethod("GeneratePdfWithMigraDoc")!
                            .MakeGenericMethod(type)
                            .Invoke(null, new[] { toList }),
                _ => throw new Exception("Formato no soportado.")
            };
        }

    }
}
