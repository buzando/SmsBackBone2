using log4net;
using log4net.Config;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Contract;
using Business;

namespace WorkerSmsBalanceChec
{
    public class Worker : BackgroundService
    {
        public IConfigurationRoot Configuration { get; set; }

        private static readonly ILog _logger =
            LogManager.GetLogger(MethodBase.GetCurrentMethod()?.DeclaringType);

        public Worker(IHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

            Configuration = builder.Build();

            var logRepository = LogManager.GetRepository(Assembly.GetEntryAssembly());
            var fileInfo = new FileInfo(Path.Combine(env.ContentRootPath, "log4net.config"));

            XmlConfigurator.Configure(logRepository, fileInfo);

            Console.WriteLine("Configuración de Worker SMS Balance Check cargada correctamente.");
            _logger.Info("Configuración de Worker SMS Balance Check cargada correctamente.");
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.Info("==================================================");
            _logger.Info("Iniciando servicio SMS Balance Check Worker...");
            _logger.Info("==================================================");

            return base.StartAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.Info("Worker SMS Balance Check en ejecución.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var minutosEjecucion = int.TryParse(
                    Common.ConfigurationManagerJson("MinutosEjecucion"),
                    out int minutosConfigurados
                )
                    ? minutosConfigurados
                    : 10;

                try
                {
                    _logger.Info("--------------------------------------------------");
                    _logger.Info("Iniciando ciclo de validación de saldos SMS.");

                    var manager = new SmsBalanceCheckManager();

                    var result = await manager.CheckBalancesAsync();

                    _logger.Info(
                        $"Ciclo de validación de saldos SMS finalizado. " +
                        $"ClientesRevisados={result.ClientesRevisados}, " +
                        $"AjustesAplicados={result.AjustesAplicados}, " +
                        $"Errores={result.Errores}"
                    );


                    _logger.Info("Ciclo de validación de saldos SMS finalizado correctamente.");
                    _logger.Info($"Próxima ejecución en {minutosEjecucion} minuto(s).");
                    _logger.Info("--------------------------------------------------");
                }
                catch (OperationCanceledException)
                {
                    _logger.Warn("Ejecución cancelada por solicitud de detención del servicio.");
                }
                catch (Exception ex)
                {
                    _logger.Error("Error durante la ejecución del Worker SMS Balance Check.", ex);
                }

                try
                {
                    await Task.Delay(minutosEjecucion * 60000, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.Warn("Delay cancelado. El servicio SMS Balance Check se está deteniendo.");
                }
            }
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.Info("==================================================");
            _logger.Info("Deteniendo servicio SMS Balance Check Worker...");
            _logger.Info("==================================================");

            return base.StopAsync(cancellationToken);
        }
    }
}