using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public static class StatesMap
    {
        public static readonly Dictionary<string, string> EstadosMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
{
    { "AGS", "Aguascalientes" },
    { "BC", "Baja California" },
    { "BCS", "Baja California Sur" },
    { "CAMP", "Campeche" },
    { "COAH", "Coahuila" },
    { "COL", "Colima" },
    { "CHIS", "Chiapas" },
    { "CHIH", "Chihuahua" },
    { "CDMX", "Ciudad de México" },
    { "DGO", "Durango" },
    { "GTO", "Guanajuato" },
    { "GRO", "Guerrero" },
    { "HGO", "Hidalgo" },
    { "JAL", "Jalisco" },
    { "MEX", "Estado de México" },
    { "MICH", "Michoacán" },
    { "MOR", "Morelos" },
    { "NAY", "Nayarit" },
    { "NL", "Nuevo León" },
    { "OAX", "Oaxaca" },
    { "PUE", "Puebla" },
    { "QRO", "Querétaro" },
    { "QROO", "Quintana Roo" },
    { "SLP", "San Luis Potosí" },
    { "SIN", "Sinaloa" },
    { "SON", "Sonora" },
    { "TAB", "Tabasco" },
    { "TAMPS", "Tamaulipas" },
    { "TLAX", "Tlaxcala" },
    { "VER", "Veracruz" },
    { "YUC", "Yucatán" },
    { "ZAC", "Zacatecas" }
};
        public static string ObtenerNombreCompleto(string abreviatura)
        {
            return EstadosMap.ContainsKey(abreviatura) ? EstadosMap[abreviatura] : abreviatura;
        }
    }
}
