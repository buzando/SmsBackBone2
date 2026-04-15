using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using ClosedXML.Excel;
using MigraDocCore.DocumentObjectModel;
using MigraDocCore.DocumentObjectModel.Tables;
using MigraDocCore.Rendering;

namespace Business
{
    public static class ReportHelper
    {
        private static readonly Dictionary<string, string> SpanishHeaders = new(StringComparer.OrdinalIgnoreCase)
        {
            { "id", "ID" },
            { "NombreCliente", "Nombre del cliente" },
            { "CreationDate", "Fecha de creación" },
            { "RateForShort", "Tarifa SMS corto" },
            { "RateForLong", "Tarifa SMS largo" },
            { "ShortRateType", "Tipo tarifa\nSMS corto" },
            { "LongRateType", "Tipo tarifa\nSMS largo" },
            { "ShortRateQty", "Cantidad tarifa\nSMS corto" },
            { "LongRateQty", "Cantidad tarifa\nSMS largo" },
            { "Estatus", "Estatus" },
            { "FirstName", "Nombre" },
            { "LastName", "Apellidos" },
            { "PhoneNumber", "Teléfono" },
            { "Email", "Correo electrónico" },
            { "Extension", "Extensión" },
            { "RoomName", "Sala" },
            { "TotalCredits", "Créditos totales" },
            { "TotalLongSmsCredits", "Créditos SMS\nlargos" },
            { "TotalShortSmsCredits", "Créditos SMS\ncortos" },
            { "DeactivationDate", "Fecha de baja" }
        };

        public static byte[] GenerateGenericExcel<T>(IEnumerable<T> data)
        {
            var properties = GetReadableProperties<T>();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Reporte");

            // Encabezados
            for (int i = 0; i < properties.Count; i++)
            {
                var prop = properties[i];
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = GetHeaderName(prop.Name);
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.Maroon;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Alignment.WrapText = true;
            }

            // Filas
            int row = 2;
            foreach (var item in data)
            {
                for (int col = 0; col < properties.Count; col++)
                {
                    var prop = properties[col];
                    var value = prop.GetValue(item, null);
                    var cell = worksheet.Cell(row, col + 1);

                    SetExcelCellValue(cell, prop.PropertyType, value);

                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    if (IsNumericType(Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType))
                    {
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    }
                    else
                    {
                        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    }
                }

                row++;
            }

            var range = worksheet.Range(1, 1, Math.Max(row - 1, 1), properties.Count);
            range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            range.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

            worksheet.SheetView.FreezeRows(1);
            worksheet.Rows().AdjustToContents();
            worksheet.Columns().AdjustToContents();

            // Limitar ancho para que sí se partan algunos encabezados
            for (int i = 1; i <= properties.Count; i++)
            {
                if (worksheet.Column(i).Width > 25)
                    worksheet.Column(i).Width = 25;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public static byte[] GenerateGenericCsv<T>(IEnumerable<T> data)
        {
            var properties = GetReadableProperties<T>();
            var sb = new StringBuilder();

            sb.AppendLine(string.Join(",", properties.Select(p => EscapeCsv(GetHeaderName(p.Name)))));

            foreach (var item in data)
            {
                var values = properties.Select(p =>
                {
                    var value = p.GetValue(item, null);
                    return EscapeCsv(FormatValue(p.Name, p.PropertyType, value));
                });

                sb.AppendLine(string.Join(",", values));
            }

            var preamble = Encoding.UTF8.GetPreamble();
            var body = Encoding.UTF8.GetBytes(sb.ToString());
            return preamble.Concat(body).ToArray();
        }

        public static byte[] GeneratePdfWithMigraDoc<T>(IEnumerable<T> data)
        {
            var columnWidths = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase)
{
    { "NombreCliente", 1.5 },
    { "CreationDate", 1.4 },
    { "RateForShort", 1.1 },
    { "RateForLong", 1.1 },
    { "ShortRateType", 1.1 },
    { "LongRateType", 1.1 },
    { "ShortRateQty", 1.2 },
    { "LongRateQty", 1.2 },
    { "Estatus", 1.2 },
    { "FirstName", 1.4 },
    { "LastName", 1.4 },
    { "PhoneNumber", 1.9 },
    { "Email", 3.2 },
    { "Extension", 1.0 },
    { "RoomName", 1.8 },
    { "TotalCredits", 1.3 },
    { "TotalLongSmsCredits", 1.3 },
    { "TotalShortSmsCredits", 1.3 },
    { "DeactivationDate", 1.4 }
};

            var properties = GetReadableProperties<T>();
            var headers = properties.Select(p => GetHeaderName(p.Name)).ToList();

            var doc = new Document();
            doc.Info.Title = "Reporte";

            var section = doc.AddSection();
            section.PageSetup.Orientation = Orientation.Landscape;
            section.PageSetup.TopMargin = Unit.FromCentimeter(1);
            section.PageSetup.BottomMargin = Unit.FromCentimeter(1);
            section.PageSetup.LeftMargin = Unit.FromCentimeter(1);
            section.PageSetup.RightMargin = Unit.FromCentimeter(1);

            var title = section.AddParagraph("Reporte");
            title.Format.Font.Name = "Arial";
            title.Format.Font.Size = 12;
            title.Format.Font.Bold = true;
            title.Format.SpaceAfter = Unit.FromCentimeter(0.4);
            title.Format.Alignment = ParagraphAlignment.Left;

            var table = section.AddTable();
            table.Borders.Width = 0.5;
            table.Borders.Color = Colors.Gray;
            table.Format.Font.Name = "Arial";
            table.Format.Font.Size = 7;
            table.Rows.LeftIndent = 0;


            foreach (var prop in properties)
            {
                double width = columnWidths.TryGetValue(prop.Name, out var customWidth)
                    ? customWidth
                    : 1.4;

                var column = table.AddColumn(Unit.FromCentimeter(width));
                column.Format.Alignment = ParagraphAlignment.Left;
            }

            // Encabezados
            var headerRow = table.AddRow();
            headerRow.HeadingFormat = true;
            headerRow.Shading.Color = Colors.Maroon;
            headerRow.Format.Font.Color = Colors.White;
            headerRow.Format.Font.Bold = true;
            headerRow.Format.Alignment = ParagraphAlignment.Center;
            headerRow.VerticalAlignment = VerticalAlignment.Center;

            for (int i = 0; i < headers.Count; i++)
            {
                var p = headerRow.Cells[i].AddParagraph(headers[i]);
                p.Format.Alignment = ParagraphAlignment.Center;
                p.Format.SpaceBefore = 0;
                p.Format.SpaceAfter = 0;
            }

            // Datos
            foreach (var item in data)
            {
                var row = table.AddRow();
                row.VerticalAlignment = VerticalAlignment.Center;

                for (int i = 0; i < properties.Count; i++)
                {
                    var prop = properties[i];
                    var value = prop.GetValue(item, null);
                    var text = FormatValue(prop.Name, prop.PropertyType, value);

                    var p = row.Cells[i].AddParagraph(text);
                    p.Format.SpaceBefore = 0;
                    p.Format.SpaceAfter = 0;

                    if (prop.Name.Equals("PhoneNumber", StringComparison.OrdinalIgnoreCase) ||
    prop.Name.Equals("Email", StringComparison.OrdinalIgnoreCase))
                    {
                        p.Format.Alignment = ParagraphAlignment.Center;
                    }
                    else if (IsNumericType(Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType))
                    {
                        p.Format.Alignment = ParagraphAlignment.Right;
                    }
                    else
                    {
                        p.Format.Alignment = ParagraphAlignment.Left;
                    }
                }
            }

            var renderer = new PdfDocumentRenderer(true)
            {
                Document = doc
            };
            renderer.RenderDocument();

            using var stream = new MemoryStream();
            renderer.PdfDocument.Save(stream, false);
            return stream.ToArray();
        }

        private static List<PropertyInfo> GetReadableProperties<T>()
        {
            return typeof(T)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.CanRead)
                .Where(p => !p.Name.Equals("id", StringComparison.OrdinalIgnoreCase)) 
                .ToList();
        }

        private static string GetHeaderName(string propertyName)
        {
            return SpanishHeaders.TryGetValue(propertyName, out var translated)
                ? translated
                : propertyName;
        }

        private static string FormatValue(string propertyName, Type propertyType, object value)
        {
            if (value == null)
                return string.Empty;

            var realType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

            if (realType == typeof(DateTime))
            {
                var date = (DateTime)value;

                // Si trae hora en ceros, mostrar solo fecha
                if (date.TimeOfDay == TimeSpan.Zero)
                    return date.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);

                return date.ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
            }

            if (realType == typeof(decimal))
                return ((decimal)value).ToString("N2", CultureInfo.InvariantCulture);

            if (realType == typeof(double))
                return ((double)value).ToString("N2", CultureInfo.InvariantCulture);

            if (realType == typeof(float))
                return ((float)value).ToString("N2", CultureInfo.InvariantCulture);

            if (realType == typeof(byte) && propertyName.Equals("Estatus", StringComparison.OrdinalIgnoreCase))
            {
                var status = Convert.ToByte(value);

                return status switch
                {
                    1 => "Activo",
                    0 => "Inactivo",
                    2 => "Suspendido", // opcional si lo usas
                    _ => "Desconocido"
                };
            }
            if (propertyName.Equals("PhoneNumber", StringComparison.OrdinalIgnoreCase))
            {
                var phone = value.ToString() ?? string.Empty;

                if (phone.Length == 10 && phone.All(char.IsDigit))
                    return $"{phone.Substring(0, 3)}\u00A0{phone.Substring(3, 3)}\u00A0{phone.Substring(6, 4)}";

                return phone.Replace(" ", "\u00A0");
            }

            if (propertyName.Equals("Email", StringComparison.OrdinalIgnoreCase))
            {
                var email = value.ToString() ?? string.Empty;
                return email.Replace(" ", "\u00A0");
            }
            if (propertyName.Equals("NombreCliente", StringComparison.OrdinalIgnoreCase))
            {
                var nombre = value.ToString() ?? string.Empty;
                return InsertLineBreaks(nombre, 7);
            }
            return value.ToString() ?? string.Empty;
        }

        private static void SetExcelCellValue(IXLCell cell, Type propertyType, object value)
        {
            if (value == null)
            {
                cell.Value = string.Empty;
                return;
            }

            var realType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

            if (realType == typeof(DateTime))
            {
                var date = (DateTime)value;

                if (date.TimeOfDay == TimeSpan.Zero)
                {
                    cell.Value = date;
                    cell.Style.DateFormat.Format = "dd/MM/yyyy";
                }
                else
                {
                    cell.Value = date;
                    cell.Style.DateFormat.Format = "dd/MM/yyyy HH:mm";
                }

                return;
            }

            if (realType == typeof(decimal) || realType == typeof(double) || realType == typeof(float))
            {
                cell.Value = Convert.ToDecimal(value);
                cell.Style.NumberFormat.Format = "#,##0.00";
                return;
            }

            if (realType == typeof(byte) && value != null)
            {
                if (cell.Address.ColumnNumber > 0)
                {
                    cell.Value = FormatValue(string.Empty, propertyType, value);
                    return;
                }
            }

            cell.Value = FormatValue(string.Empty, propertyType, value);
        }

        private static string EscapeCsv(string value)
        {
            value ??= string.Empty;
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        private static bool IsNumericType(Type type)
        {
            return type == typeof(byte)
                || type == typeof(short)
                || type == typeof(int)
                || type == typeof(long)
                || type == typeof(float)
                || type == typeof(double)
                || type == typeof(decimal);
        }

        private static string InsertLineBreaks(string text, int chunkSize = 7)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            text = text.Trim();

            var parts = Enumerable.Range(0, (int)Math.Ceiling(text.Length / (double)chunkSize))
                .Select(i => text.Substring(i * chunkSize, Math.Min(chunkSize, text.Length - i * chunkSize)));

            return string.Join("\n", parts);
        }
    }
}