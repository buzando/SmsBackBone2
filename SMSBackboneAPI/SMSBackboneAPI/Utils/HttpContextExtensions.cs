using Microsoft.AspNetCore.Http;

namespace SMSBackboneAPI.Utils
{
    public static class HttpContextExtensions
    {
        public static int? GetResolvedClientId(this HttpContext ctx)
        {
            if (ctx?.Items != null &&
                ctx.Items.TryGetValue("ClientId", out var boxed) &&
                boxed is int id)
            {
                return id;
            }
            return null;
        }
    }
}
