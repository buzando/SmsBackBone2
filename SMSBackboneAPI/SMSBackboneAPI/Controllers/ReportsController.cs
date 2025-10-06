using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

using Business;
using Contract;
using Contract.Request;
using Contract.Response;

using log4net;
using System;
using System.Diagnostics;
using System.IO;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(ReportsController));

        [HttpPost("GetReports")]
        public async Task<IActionResult> GetReports(ReportExportRequest report)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var swTotal = Stopwatch.StartNew();

            try
            {
                _log.Info($"[{rid}] GetReports start format={report?.Format} type={report?.ReportType}");

                // 1) Generación del archivo (en memoria)
                var swBuild = Stopwatch.StartNew();
                var reportManager = new ReportManager();

                string fileName;
                byte[] fileBytes = reportManager.ExportReportToFile(report, report.Format, out fileName);
                swBuild.Stop();

                if (fileBytes == null || fileBytes.Length == 0 || string.IsNullOrWhiteSpace(fileName))
                {
                    swTotal.Stop();
                    _log.Warn($"[{rid}] GetReports empty result bytes={(fileBytes?.Length ?? 0)} file='{fileName}' msBuild={swBuild.ElapsedMilliseconds} msTotal={swTotal.ElapsedMilliseconds}");
                    return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "No se generó contenido para el reporte." });
                }

                // 2) Ruta de salida (carpeta pública que sirves con UseStaticFiles)
                var folder = Common.ConfigurationManagerJson("ReactFolder");
                if (string.IsNullOrWhiteSpace(folder))
                {
                    swTotal.Stop();
                    _log.Error($"[{rid}] GetReports ReactFolder vacío o nulo msBuild={swBuild.ElapsedMilliseconds} msTotal={swTotal.ElapsedMilliseconds}");
                    return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Carpeta de salida no configurada (ReactFolder)." });
                }

                if (!Directory.Exists(folder))
                {
                    Directory.CreateDirectory(folder);
                    _log.Info($"[{rid}] GetReports creó carpeta '{folder}'");
                }

                // 3) Escritura a disco
                var swWrite = Stopwatch.StartNew();
                var filePath = Path.Combine(folder, fileName);
                System.IO.File.WriteAllBytes(filePath, fileBytes);
                swWrite.Stop();

                // 4) Construir respuesta (asegúrate de que /reports esté mapeado a esa carpeta)
                var url = $"/reports/{fileName}";

                swTotal.Stop();

                // Métricas y umbrales (puedes moverlos a appsettings)
                long bytes = fileBytes.Length;
                double mb = bytes / (1024d * 1024d);

                const int WARN_BUILD_MS = 5_000;   // construcción lenta
                const int WARN_WRITE_MS = 2_000;   // escritura lenta
                const double WARN_SIZE_MB = 50.0;  // archivo grande

                string msg = $"[{rid}] GetReports ok bytes={bytes} (~{mb:F1} MB) file='{fileName}' path='{filePath}' url='{url}' " +
                             $"msBuild={swBuild.ElapsedMilliseconds} msWrite={swWrite.ElapsedMilliseconds} msTotal={swTotal.ElapsedMilliseconds}";

                if (swBuild.ElapsedMilliseconds > WARN_BUILD_MS ||
                    swWrite.ElapsedMilliseconds > WARN_WRITE_MS ||
                    mb > WARN_SIZE_MB)
                {
                    _log.Warn(msg);
                }
                else
                {
                    _log.Info(msg);
                }

                return Ok(new { success = true, downloadUrl = url, fileName });
            }
            catch (Exception ex)
            {
                swTotal.Stop();
                _log.Error($"[{rid}] GetReports error msTotal={swTotal.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = ex.Message });
            }
        }
    }
}
