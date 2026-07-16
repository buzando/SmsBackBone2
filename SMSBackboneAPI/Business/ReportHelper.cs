using ClosedXML.Excel;
using MigraDocCore.DocumentObjectModel;
using MigraDocCore.DocumentObjectModel.MigraDoc.DocumentObjectModel.Shapes;
using MigraDocCore.DocumentObjectModel.Shapes;
using MigraDocCore.DocumentObjectModel.Tables;
using MigraDocCore.Rendering;
using PdfSharpCore.Utils;
using SixLabors.ImageSharp.PixelFormats;
using SkiaSharp;
using Svg.Skia;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Business
{
    public static class ReportHelper
    {
        private static bool _imageSourceInitialized = false;

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
            { "DeactivationDate", "Fecha de baja" },

            { "Campaign", "Campaña" },
            { "CampaignId", "ID campaña" },
            { "Cost", "Costo" },
            { "Date", "Fecha" },
            { "Message", "Mensaje" },
            { "MessageId", "ID mensaje" },
            { "Phone", "Teléfono" },
            { "ReceivedAt", "Fecha de recepción" },
            { "Room", "Sala" },
            { "Status", "Estatus" },
            { "Type", "Tipo" },
            { "User", "Usuario" },

            { "Fecha", "Fecha" },
            { "Cliente", "Cliente" },
            { "MensajesEnviados", "Mensajes enviados" },
            { "MensajesEnvia", "Mensajes enviados" },
        };

        public static byte[] GenerateGenericExcel<T>(IEnumerable<T> data)
        {
            var properties = GetReadableProperties<T>();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Reporte");

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

        public static byte[] GeneratePdfWithMigraDoc<T>(IEnumerable<T> data, string reportTitle)
        {
            EnsureImageSource();

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
                { "DeactivationDate", 1.4 },

                { "Date", 1.8 },
                { "Phone", 2.0 },
                { "Room", 1.4 },
                { "Campaign", 2.0 },
                { "CampaignId", 1.5 },
                { "User", 3.8 },
                { "MessageId", 1.5 },
                { "Message", 5.2 },
                { "Status", 1.8 },
                { "ReceivedAt", 1.9 },
                { "Cost", 1.3 },
                { "Type", 1.8 },

                { "Fecha", 3.0 },
                { "Cliente", 5.5 },
                { "MensajesEnviados", 4.5 },
                { "MensajesEnvia", 4.5 },
            };

            var properties = GetReadableProperties<T>();
            var headers = properties.Select(p => GetHeaderName(p.Name)).ToList();

            var doc = new Document();
            doc.Info.Title = reportTitle;

            var section = doc.AddSection();
            section.PageSetup.Orientation = Orientation.Landscape;
            section.PageSetup.TopMargin = Unit.FromCentimeter(0.4);
            section.PageSetup.BottomMargin = Unit.FromCentimeter(0.8);
            section.PageSetup.LeftMargin = Unit.FromCentimeter(0.4);
            section.PageSetup.RightMargin = Unit.FromCentimeter(0.4);

            AddReportHeader(section, reportTitle);
            AddRedTopLine(section);

            var table = section.AddTable();
            table.Borders.Width = 0.5;
            table.Borders.Color = Colors.Gray;
            table.Format.Font.Name = "Arial";
            table.Format.Font.Size = 5.8;
            table.Rows.LeftIndent = 0;
            table.LeftPadding = Unit.FromPoint(3);
            table.RightPadding = Unit.FromPoint(3);

            foreach (var prop in properties)
            {
                double width = columnWidths.TryGetValue(prop.Name, out var customWidth)
                    ? customWidth
                    : 2.2;

                var column = table.AddColumn(Unit.FromCentimeter(width));
                column.Format.Alignment = ParagraphAlignment.Left;
            }

            var headerRow = table.AddRow();
            headerRow.HeadingFormat = true;
            headerRow.VerticalAlignment = VerticalAlignment.Center;
            headerRow.HeightRule = RowHeightRule.AtLeast;
            headerRow.Height = Unit.FromCentimeter(0.55);

            for (int i = 0; i < headers.Count; i++)
            {
                var cell = headerRow.Cells[i];

                cell.Shading.Color = Colors.Red;

                cell.Borders.Top.Width = 0.5;
                cell.Borders.Top.Color = Colors.Black;
                cell.Borders.Right.Width = 0.5;
                cell.Borders.Right.Color = Colors.Black;
                cell.Borders.Bottom.Width = 0.5;
                cell.Borders.Bottom.Color = Colors.Black;

                cell.Format.Font.Name = "Arial";
                cell.Format.Font.Color = Colors.White;
                cell.Format.Font.Bold = true;
                cell.Format.Font.Size = 5.8;
                cell.Format.Alignment = ParagraphAlignment.Center;
                cell.VerticalAlignment = VerticalAlignment.Center;

                var paragraph = cell.AddParagraph(headers[i]);
                paragraph.Format.Font.Name = "Arial";
                paragraph.Format.Font.Bold = true;
                paragraph.Format.Font.Size = 5.8;
                paragraph.Format.Alignment = ParagraphAlignment.Center;
                paragraph.Format.SpaceBefore = 0;
                paragraph.Format.SpaceAfter = 0;
            }

            foreach (var item in data)
            {
                var row = table.AddRow();
                row.VerticalAlignment = VerticalAlignment.Center;

                for (int i = 0; i < properties.Count; i++)
                {
                    var prop = properties[i];
                    var value = prop.GetValue(item, null);
                    var text = FormatValue(prop.Name, prop.PropertyType, value);

                    var paragraph = row.Cells[i].AddParagraph(text);
                    paragraph.Format.Font.Name = "Arial";
                    paragraph.Format.Font.Size = 5.8;
                    paragraph.Format.SpaceBefore = 0;
                    paragraph.Format.SpaceAfter = 0;

                    if (prop.Name.Equals("PhoneNumber", StringComparison.OrdinalIgnoreCase) ||
                        prop.Name.Equals("Email", StringComparison.OrdinalIgnoreCase))
                    {
                        paragraph.Format.Alignment = ParagraphAlignment.Center;
                    }
                    else if (IsNumericType(Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType))
                    {
                        paragraph.Format.Alignment = ParagraphAlignment.Right;
                    }
                    else
                    {
                        paragraph.Format.Alignment = ParagraphAlignment.Left;
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

        private static void EnsureImageSource()
        {
            if (_imageSourceInitialized)
                return;

            ImageSource.ImageSourceImpl = new ImageSharpImageSource<Rgba32>();
            _imageSourceInitialized = true;
        }

        private static void AddReportHeader(Section section, string reportTitle)
        {
            var headerTable = section.AddTable();
            headerTable.Borders.Width = 0;

            headerTable.AddColumn(Unit.FromCentimeter(6.0));
            headerTable.AddColumn(Unit.FromCentimeter(16.9));
            headerTable.AddColumn(Unit.FromCentimeter(6.0));

            var row = headerTable.AddRow();
            row.HeightRule = RowHeightRule.Exactly;
            row.Height = Unit.FromCentimeter(1.05);
            row.VerticalAlignment = VerticalAlignment.Center;

            var nuxibaLogoPath = GetPdfImagePath("nuxiba-logo.png");
            var quantumLogoPath = GetPdfImagePath("Quantum_Logo.svg");

            row.Cells[0].Format.Alignment = ParagraphAlignment.Left;
            row.Cells[0].VerticalAlignment = VerticalAlignment.Center;

            row.Cells[1].Format.Alignment = ParagraphAlignment.Center;
            row.Cells[1].VerticalAlignment = VerticalAlignment.Center;

            row.Cells[2].Format.Alignment = ParagraphAlignment.Right;
            row.Cells[2].VerticalAlignment = VerticalAlignment.Center;

            if (File.Exists(nuxibaLogoPath))
            {
                try
                {
                    var logoParagraph = row.Cells[0].AddParagraph();
                    logoParagraph.Format.Alignment = ParagraphAlignment.Left;
                    logoParagraph.Format.SpaceBefore = 0;
                    logoParagraph.Format.SpaceAfter = 0;

                    var logo = logoParagraph.AddImage(ImageSource.FromFile(nuxibaLogoPath));
                    logo.Width = Unit.FromCentimeter(3.5);
                    logo.LockAspectRatio = true;
                }
                catch (Exception ex)
                {
                    var fallback = row.Cells[0].AddParagraph("Nuxiba");
                    fallback.Format.Font.Bold = true;
                    fallback.Format.Font.Color = Colors.Red;

                    Console.WriteLine($"Error cargando logo Nuxiba: {ex.Message}");
                }
            }

            var title = row.Cells[1].AddParagraph(reportTitle);
            title.Format.Font.Name = "Arial";
            title.Format.Font.Size = 15; 
            title.Format.Font.Bold = true;
            title.Format.Alignment = ParagraphAlignment.Center;
            title.Format.SpaceBefore = 0;
            title.Format.SpaceAfter = 0;

            if (File.Exists(quantumLogoPath))
            {
                try
                {
                    var logoParagraph = row.Cells[2].AddParagraph();
                    logoParagraph.Format.Alignment = ParagraphAlignment.Right;
                    logoParagraph.Format.SpaceBefore = Unit.FromCentimeter(0.03);
                    logoParagraph.Format.SpaceAfter = 0;

                    var logo = logoParagraph.AddImage(ImageSource.FromFile(quantumLogoPath));
                    logo.Width = Unit.FromCentimeter(5.0);
                    logo.LockAspectRatio = true;
                }
                catch (Exception ex)
                {
                    var fallback = row.Cells[2].AddParagraph("Quantum");
                    fallback.Format.Font.Bold = true;
                    fallback.Format.Font.Color = Colors.Black;
                    fallback.Format.Alignment = ParagraphAlignment.Right;

                    Console.WriteLine($"Error cargando logo Quantum: {ex.Message}");
                }
            }

            var spacer = section.AddParagraph();
            spacer.Format.SpaceAfter = 0;
        }

        private static void AddRedTopLine(Section section)
        {
            var line = section.AddParagraph();
            line.Format.SpaceBefore = 0;
            line.Format.SpaceAfter = Unit.FromCentimeter(0.04);

            // La línea se dibuja arriba del bloque, más cerca de los logos,
            // sin mover la tabla ni perder encabezados.
            line.Format.Borders.Top.Width = Unit.FromPoint(1.5);
            line.Format.Borders.Top.Color = Color.Parse("0xFF0000");
            line.Format.Borders.Top.Visible = true;
        }

        private static string GetAssetPath(string fileName)
        {
            var candidates = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Assets", fileName),
                Path.Combine(Directory.GetCurrentDirectory(), "Assets", fileName),
                Path.Combine(Directory.GetCurrentDirectory(), "Business", "Assets", fileName),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Assets", fileName),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "Business", "Assets", fileName),
            };

            foreach (var candidate in candidates)
            {
                var fullPath = Path.GetFullPath(candidate);

                if (File.Exists(fullPath))
                    return fullPath;
            }

            return Path.Combine(AppContext.BaseDirectory, "Assets", fileName);
        }

        private static string GetPdfImagePath(string fileName)
        {
            var path = GetAssetPath(fileName);

            if (!File.Exists(path))
                return path;

            var extension = Path.GetExtension(path);

            if (extension.Equals(".svg", StringComparison.OrdinalIgnoreCase))
                return ConvertSvgToTempPng(path);

            return path;
        }

        private static string ConvertSvgToTempPng(string svgPath)
        {
            var svg = new SKSvg();
            var picture = svg.Load(svgPath);

            if (picture == null)
                return svgPath;

            var bounds = picture.CullRect;

            var width = Math.Max(1, (int)Math.Ceiling(bounds.Width));
            var height = Math.Max(1, (int)Math.Ceiling(bounds.Height));

            using var bitmap = new SKBitmap(width, height);
            using var canvas = new SKCanvas(bitmap);

            canvas.Clear(SKColors.Transparent);
            canvas.DrawPicture(picture);
            canvas.Flush();

            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);

            var tempPath = Path.Combine(
                Path.GetTempPath(),
                $"{Path.GetFileNameWithoutExtension(svgPath)}_{Guid.NewGuid():N}.png"
            );

            using var stream = File.OpenWrite(tempPath);
            data.SaveTo(stream);

            return tempPath;
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
                    2 => "Suspendido",
                    _ => "Desconocido"
                };
            }

            if (propertyName.Equals("PhoneNumber", StringComparison.OrdinalIgnoreCase) ||
                propertyName.Equals("Phone", StringComparison.OrdinalIgnoreCase))
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

            if (realType == typeof(decimal) ||
                realType == typeof(double) ||
                realType == typeof(float))
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
                .Select(i => text.Substring(
                    i * chunkSize,
                    Math.Min(chunkSize, text.Length - i * chunkSize)
                ));

            return string.Join("\n", parts);
        }
    }
}