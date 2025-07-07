using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public static class TimeZoneHelper
    {
        public static readonly Dictionary<string, string> TimeZonesByEstado = new(StringComparer.OrdinalIgnoreCase)
{
    { "Aguascalientes", "Central Standard Time (Mexico)" },
    { "Baja California", "Pacific Standard Time" },
    { "Baja California Sur", "Mountain Standard Time (Mexico)" },
    { "Campeche", "Central Standard Time (Mexico)" },
    { "CDMX", "Central Standard Time (Mexico)" },
    { "Ciudad de México", "Central Standard Time (Mexico)" },
    { "Chiapas", "Central Standard Time (Mexico)" },
    { "Chihuahua", "Mountain Standard Time (Mexico)" },
    { "Coahuila", "Central Standard Time (Mexico)" },
    { "Colima", "Central Standard Time (Mexico)" },
    { "Durango", "Mountain Standard Time (Mexico)" },
    { "Guanajuato", "Central Standard Time (Mexico)" },
    { "Guerrero", "Central Standard Time (Mexico)" },
    { "Hidalgo", "Central Standard Time (Mexico)" },
    { "Jalisco", "Central Standard Time (Mexico)" },
    { "México", "Central Standard Time (Mexico)" },
    { "Michoacán", "Central Standard Time (Mexico)" },
    { "Morelos", "Central Standard Time (Mexico)" },
    { "Nayarit", "Mountain Standard Time (Mexico)" },
    { "Nuevo León", "Central Standard Time (Mexico)" },
    { "Oaxaca", "Central Standard Time (Mexico)" },
    { "Puebla", "Central Standard Time (Mexico)" },
    { "Querétaro", "Central Standard Time (Mexico)" },
    { "Quintana Roo", "Eastern Standard Time" },
    { "San Luis Potosí", "Central Standard Time (Mexico)" },
    { "Sinaloa", "Mountain Standard Time (Mexico)" },
    { "Sonora", "US Mountain Standard Time" }, // No DST
    { "Tabasco", "Central Standard Time (Mexico)" },
    { "Tamaulipas", "Central Standard Time (Mexico)" },
    { "Tlaxcala", "Central Standard Time (Mexico)" },
    { "Veracruz", "Central Standard Time (Mexico)" },
    { "Yucatán", "Central Standard Time (Mexico)" },
    { "Zacatecas", "Central Standard Time (Mexico)" }
};


        public static DateTime? GetHoraLocal(string estado)
        {
            if (TimeZonesByEstado.TryGetValue(estado, out var tzId))
            {
                try
                {
                    var tz = TimeZoneInfo.FindSystemTimeZoneById(tzId);
                    return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
                }
                catch (TimeZoneNotFoundException ex)
                {
                    Console.WriteLine($"⛔ Zona horaria no encontrada para '{estado}': {ex.Message}");
                }
                catch (InvalidTimeZoneException ex)
                {
                    Console.WriteLine($"⛔ Zona horaria inválida para '{estado}': {ex.Message}");
                }
            }
            return null;
        }
    }
}
