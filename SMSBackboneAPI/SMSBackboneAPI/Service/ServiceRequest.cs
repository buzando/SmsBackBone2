using Azure.Core;
using Newtonsoft.Json;

namespace SMSBackboneAPI.Service
{
    public class ServiceRequest
    {
        public static async Task<T> GetRequest<T>(Stream bodyReader)
        {
            var reader = new StreamReader(bodyReader);
            var json = await reader.ReadToEndAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }
    }
}
