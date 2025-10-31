using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.WebHooks
{
    public class WebhookStatusDto
    {
        public string Id { get; set; }
        public int Status { get; set; }
        public bool IsCharged { get; set; }
        public string? Error { get; set; }
    }

    public class WebhookResponseDto
    {
        public string? Source { get; set; }
        public string? Destination { get; set; }
        public string? Text { get; set; }
        public DateTime Date { get; set; }
        public string? UserRef { get; set; }
    }
}
