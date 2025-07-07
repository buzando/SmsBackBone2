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

namespace IFTWorkerService
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
            while (!stoppingToken.IsCancellationRequested)
            {
                var minutosEjecucion = int.TryParse(Common.ConfigurationManagerJson("MinutosEjecucion"), out int d) ? d : 10;
                _logger.Info("¡Cargando Archivo!");

                //Agregamos la clase para ser ejecutada:
                var PathCSV = Common.ConfigurationManagerJson("CarpetaCSV");
                var files = Directory.GetFiles(PathCSV, "*.csv");
                foreach (var file in files)
                {
                    var objRespuestas = new IFTManager().LoadFromCsv(file);
                    if (objRespuestas)
                        _logger.Info("");
                    else
                        _logger.Error($"");

                    File.Delete(file);
                }

                _logger.Info($"Esperando {minutosEjecucion} minutos para la nueva ejecución del servicio Descarga Archivos Adjuntos...");

                await Task.Delay(minutosEjecucion * 60000, stoppingToken);
            }
        }
        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.Info($"Deteniendo Servicio Descarga Archivos Adjuntos...");
            return base.StopAsync(cancellationToken);
        }
    }
}
