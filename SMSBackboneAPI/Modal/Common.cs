using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract
{
    public class Common
    {
        /// <summary>
        /// Method for get value from appsettings.
        /// </summary>
        /// <param name="key">Key in appsettings.</param>
        /// <returns>Return value from appsettings.</returns>
        public static string ConfigurationManagerJson(string key)
        {
            var appSetting = new ConfigurationBuilder().SetBasePath(AppDomain.CurrentDomain.BaseDirectory).AddJsonFile("appsettings.json");

            var configuration = appSetting.Build();
            var section = configuration.GetSection(key);
            if (section != null)
            {
                return section.Value;
            }
            return null;
        }
    }
}
