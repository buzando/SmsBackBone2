// SmsEstatusWorker/Worker.cs
using System;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Contract;                         // para Common.ConfigurationManagerJson
using log4net;
using log4net.Config;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace SmsEstatusWorker
{
    public class Worker : BackgroundService
    {
        private readonly IHostEnvironment _env;
        public IConfigurationRoot Configuration { get; }

        private static readonly ILog _logger =
            LogManager.GetLogger(MethodBase.GetCurrentMethod()!.DeclaringType);

        public Worker(IHostEnvironment env)
        {
            _env = env;

            // Carga de appsettings.json
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            Configuration = builder.Build();

            // log4net
            var logRepository = LogManager.GetRepository(Assembly.GetEntryAssembly());
            var logCfg = Path.Combine(env.ContentRootPath, "log4net.config");
            if (File.Exists(logCfg))
            {
                XmlConfigurator.Configure(logRepository, new FileInfo(logCfg));
            }

            Console.WriteLine("✅ Configuración del SmsEstatusWorker cargada.");
            _logger.Info("✅ Configuración del SmsEstatusWorker cargada.");
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.Info("▶️ Iniciando servicio de verificación de estatus...");
            return base.StartAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // intervalo en minutos (default 5)
            int intervalo = int.TryParse(Common.ConfigurationManagerJson("MinutosEjecucion"), out var m)
                ? m : 5;

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var manager = new Business.smsdeliveryManager();

                    // ⚠️ Este método NO envía SMS, solo actualiza estatus.
                    var actualizados = await manager.UpdateSmsStatusesByClient();

                    if (actualizados)
                        _logger.Info($"🔄 Estatus actualizados: {actualizados} registro(s).");
                    else
                        _logger.Info("⏳ No se encontraron mensajes pendientes por actualizar.");

                    var actualizadostest = await manager.UpdateTestSmsStatusesByClient();

                    if (actualizadostest)
                        _logger.Info($"🔄 Estatus actualizados: {actualizados} registro(s).");
                    else
                        _logger.Info("⏳ No se encontraron mensajes pendientes por actualizar.");
                }
                catch (Exception ex)
                {
                    _logger.Error("❌ Error en ciclo de verificación de estatus.", ex);
                }

                await Task.Delay(TimeSpan.FromMinutes(intervalo), stoppingToken);
            }
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.Info("⏹ Deteniendo servicio de verificación de estatus...");
            return base.StopAsync(cancellationToken);
        }
    }
}
