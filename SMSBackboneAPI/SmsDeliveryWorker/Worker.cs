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
using Microsoft.Data.SqlClient;
namespace SmsDeliveryWorker
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
            _logger.Info($"Iniciando Servicio SMS ENVIO RED QUANTUM...");
            return base.StartAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            DateTime lastCheckedTime = DateTime.UtcNow.AddMinutes(-10); // Inicialmente, 10 mins atrás

            while (!stoppingToken.IsCancellationRequested)
            {
                   var minutosEjecucion = int.TryParse(Common.ConfigurationManagerJson("MinutosEjecucion"), out int d) ? d : 10;

                try
                {
                    var manager = new smsdeliveryManager();
                    var topcampaigns = Common.ConfigurationManagerJson("TopCampaigns");
                    var campaignsReady = manager.GetCampaignsReadyToSend(topcampaigns); 

                    if (campaignsReady.Any())
                    {
                        _logger.Info($"📡 Se encontraron {campaignsReady.Count} campañas listas para enviar.");

                            _logger.Info($"🚀 Procesando campañas...");
                            await manager.SimulateSmsDispatch(campaignsReady); 
                        
                    }
                    else
                    {
                        //_logger.Info("⏳ No hay campañas realmente listas para enviar.");
                    }

                }
                catch (Exception ex)
                {
                    _logger.Error("Error durante ejecución del Worker", ex);
                }

                //_logger.Info($"Esperando {minutosEjecucion} minutos para la siguiente verificación...");
                await Task.Delay(minutosEjecucion * 60000, stoppingToken);
            }
        }


        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.Info($"Deteniendo Servicio SMS QuantumRED...");
            return base.StopAsync(cancellationToken);
        }
    }
}
