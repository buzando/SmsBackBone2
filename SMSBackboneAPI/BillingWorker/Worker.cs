using Contract;
using log4net;
using log4net.Config;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Reflection;
using Business;

namespace BillingWorker
{
    public class Worker : BackgroundService
    {
        public IConfigurationRoot Configuration { get; set; }

        private static readonly ILog _logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public Worker(IHostEnvironment env)
        {
            var builder = new ConfigurationBuilder().SetBasePath(env.ContentRootPath).AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            Configuration = builder.Build();
            var logRepository = LogManager.GetRepository(Assembly.GetEntryAssembly());
            var fileInfo = new FileInfo(Path.Combine(env.ContentRootPath, "log4net.config"));
            XmlConfigurator.Configure(logRepository, fileInfo);
            Console.WriteLine("¡Configuración cargada correctamente!");
            _logger.Info("¡Configuración cargada correctamente!");
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.Info($"Iniciando Servicio Descarga IFT...");
            return base.StartAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var minutosEjecucion = int.TryParse(Common.ConfigurationManagerJson("MinutosEjecucion"), out var d) ? d : 10;
            var timer = new PeriodicTimer(TimeSpan.FromMinutes(minutosEjecucion));

            _logger.Info($"[BillingWorker] Intervalo: {minutosEjecucion} minuto(s).");

            while (!stoppingToken.IsCancellationRequested)
            {
                var inicio = DateTime.UtcNow;

                try
                {
                    // 1) Verificar pagos pendientes de OpenPay
                    _logger.Info("[BillingWorker] Verificando cargos OpenPay en progreso / pendientes...");
                    var manager = new UserManager();
                    var verificados = manager.VerifyAllPendingRecharges(); 
                    _logger.Info($"[BillingWorker] Verificación terminada. Cargos revisados: {verificados}.");

              
                    _logger.Info("[BillingWorker] Iniciando facturación de recargas pagadas no facturadas...");
                    await new Villanet().FacturarRecargasPendientes();
                    _logger.Info("[BillingWorker] Facturación completada.");
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.Error("[BillingWorker] Error en el ciclo de trabajo.", ex);
                }
                finally
                {
                    var duracion = DateTime.UtcNow - inicio;
                    _logger.Info($"[BillingWorker] Ciclo terminado en {duracion.TotalSeconds:F1}s. " +
                                 $"Siguiente ejecución en {minutosEjecucion} minuto(s).");
                }

                if (!await timer.WaitForNextTickAsync(stoppingToken)) break;
            }

            _logger.Info("[BillingWorker] Detenido.");
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.Info($"Deteniendo Servicio Descarga Archivos Adjuntos...");
            return base.StopAsync(cancellationToken);
        }
    }
}
