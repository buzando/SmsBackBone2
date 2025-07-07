using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class TemplateCampaign
    {
        [Key]
        public int Id { get; set; }

        // FK a Template
        public int IdTemplate { get; set; }

        // FK a Campaign
        public int IdCampaign { get; set; }

    }
}
