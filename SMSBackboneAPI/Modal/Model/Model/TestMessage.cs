using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modal.Model.Model
{
    public class TestMessage
    {
        [Key]
        public int Id { get; set; }

        public string ToNumber { get; set; } = string.Empty;

        public string? FromNumber { get; set; }  

        public string? Message { get; set; }    

        public int? TemplateId { get; set; }     

        public int UserId { get; set; }

        public string Status { get; set; } = string.Empty;

        public string? ResponseMessage { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string? IdBackBone { get; set; }
    }
}
