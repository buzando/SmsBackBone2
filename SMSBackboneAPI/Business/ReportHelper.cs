using System;
using System.Collections.Generic;
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
        public static byte[] GenerateGenericExcel<T>(IEnumerable<T> data)
        {
            var headers = typeof(T)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Select(p => p.Name)
                .ToList();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Reporte");

                // Escribir encabezados
                for (int i = 0; i < headers.Count; i++)
                {
                    worksheet.Cell(1, i + 1).Value = headers[i];
                    worksheet.Cell(1, i + 1).Style.Font.Bold = true;
                }

                // Escribir filas
                int row = 2;
                foreach (var item in data)
                {
                    for (int col = 0; col < headers.Count; col++)
                    {
                        var prop = typeof(T).GetProperty(headers[col], BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                        var value = prop?.GetValue(item, null);
                        worksheet.Cell(row, col + 1).Value = value?.ToString() ?? "";
                    }
                    row++;
                }

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        public static byte[] GenerateGenericCsv<T>(IEnumerable<T> data)
        {
            var headers = typeof(T)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Select(p => p.Name)
                .ToList();

            var sb = new StringBuilder();
            sb.AppendLine(string.Join(",", headers));

            foreach (var item in data)
            {
                var itemType = item.GetType();
                var values = headers.Select(h =>
                {
                    var prop = itemType.GetProperty(h, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                    var valObj = prop?.GetValue(item, null);
                    var val = valObj?.ToString() ?? "";
                    return $"\"{val.Replace("\"", "\"\"")}\"";
                });

                sb.AppendLine(string.Join(",", values));
            }



            var preamble = Encoding.UTF8.GetPreamble();
            var body = Encoding.UTF8.GetBytes(sb.ToString());
            return preamble.Concat(body).ToArray();
        }

        public static byte[] GeneratePdfWithMigraDoc<T>(IEnumerable<T> data)
        {
            var headers = typeof(T).GetProperties()
                .Select(p => p.Name)
                .ToList();

            var doc = new Document();
            var section = doc.AddSection();
            section.PageSetup.Orientation = Orientation.Landscape;

            // Alineación arriba-izquierda
            section.PageSetup.TopMargin = Unit.FromCentimeter(1);
            section.PageSetup.LeftMargin = Unit.FromCentimeter(1);

            var table = section.AddTable();
            table.Borders.Width = 0.75;
            table.Borders.Color = Colors.Gray;
            table.Format.Font.Name = "Arial";
            table.Format.Font.Size = 8; // Más pequeño para que quepa más
            table.Format.Alignment = ParagraphAlignment.Left;

            // Ajuste de columnas dinámico
            double columnWidth = 27.0 / headers.Count; // en cm
            foreach (var _ in headers)
            {
                var column = table.AddColumn(Unit.FromCentimeter(columnWidth));
                column.Format.Alignment = ParagraphAlignment.Left;
            }


            // Header row with custom style
            var headerRow = table.AddRow();
            headerRow.Shading.Color = Colors.Maroon;
            headerRow.Format.Font.Color = Colors.White;
            headerRow.HeadingFormat = true;
            headerRow.Format.Font.Bold = true;

            for (int i = 0; i < headers.Count; i++)
            {
                headerRow.Cells[i].AddParagraph(headers[i]);
                headerRow.Cells[i].Format.Alignment = ParagraphAlignment.Center;
                headerRow.Cells[i].VerticalAlignment = VerticalAlignment.Center;
            }

            // Add data rows
            foreach (var item in data)
            {
                var row = table.AddRow();
                var props = item.GetType().GetProperties();

                for (int i = 0; i < headers.Count; i++)
                {
                    var value = props[i].GetValue(item)?.ToString() ?? string.Empty;
                    row.Cells[i].AddParagraph(value);
                    row.Cells[i].Format.Alignment = ParagraphAlignment.Center;
                    row.Cells[i].VerticalAlignment = VerticalAlignment.Center;
                }
            }

            // Render PDF
            var renderer = new PdfDocumentRenderer();
            renderer.Document = doc;
            renderer.RenderDocument();

            using var stream = new MemoryStream();
            renderer.PdfDocument.Save(stream, false);
            return stream.ToArray();
        }

    }
}
