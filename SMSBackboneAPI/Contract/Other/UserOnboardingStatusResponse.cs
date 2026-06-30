using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Other
{
    public class UserOnboardingStatusResponse
    {
        public int idUser { get; set; }
        public string onboardingName { get; set; }
        public bool completed { get; set; }
    }
}
