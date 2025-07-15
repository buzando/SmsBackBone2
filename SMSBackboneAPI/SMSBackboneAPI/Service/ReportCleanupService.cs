using Contract.Other;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

public class ReportCleanupService : BackgroundService
{
    private readonly string _folderPath;
    private readonly ReportCleanupSettings _settings;

    public ReportCleanupService(IOptions<ReportCleanupSettings> options)
    {
        _settings = options.Value;
        _folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "reports");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled)
        {
            Console.WriteLine("[Cleanup] Servicio deshabilitado por configuración.");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            CleanOldReportFiles();
            await Task.Delay(TimeSpan.FromMinutes(_settings.IntervalMinutes), stoppingToken);
        }
    }

    private void CleanOldReportFiles()
    {
        if (!Directory.Exists(_folderPath))
            return;

        var files = Directory.GetFiles(_folderPath);
        foreach (var file in files)
        {
            try
            {
                var creationTime = System.IO.File.GetCreationTimeUtc(file);
                if (DateTime.UtcNow - creationTime > TimeSpan.FromHours(_settings.MaxAgeHours))
                {
                    System.IO.File.Delete(file);
                    Console.WriteLine($"[Cleanup] Archivo eliminado: {Path.GetFileName(file)}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Cleanup] Error al eliminar archivo {file}: {ex.Message}");
            }
        }
    }
}
