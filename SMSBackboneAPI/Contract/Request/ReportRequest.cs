﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class ReportRequest
    {
        public string ReportType { get; set; } 
        public string? SubType { get; set; } 
        public int RoomId { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public List<int>? CampaignIds { get; set; }
        public List<int>? UserIds { get; set; }
        public int Page { get; set; }
    }
}
