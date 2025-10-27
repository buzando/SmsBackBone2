using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace SMSBackboneAPI.Filters
{
    public class ResolveClientIdFilter : IActionFilter
    {
        private readonly ILogger<ResolveClientIdFilter> _logger;
        public ResolveClientIdFilter(ILogger<ResolveClientIdFilter> logger) => _logger = logger;

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var http = context.HttpContext;
            int? clientId = null;

            if (http.Request.Headers.TryGetValue("X-Client-Id", out var v) &&
                int.TryParse(v.ToString(), out var parsed))
            {
                clientId = parsed;
            }

            http.Items["ClientId"] = clientId;
            _logger.LogInformation("ResolveClientIdFilter: clientId={ClientId}, path={Path}",
                clientId, http.Request?.Path.Value);
        }

        public void OnActionExecuted(ActionExecutedContext context) { }
    }
}
