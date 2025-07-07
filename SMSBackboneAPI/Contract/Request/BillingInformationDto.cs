using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Request
{
    public class BillingInformationDto
    {
        public string Email { get; set; } 
        public string BusinessName { get; set; } 
        public string TaxId { get; set; }
        public string TaxRegime { get; set; } 
        public string Cfdi { get; set; } 
        public string PostalCode { get; set; } 
        public string PersonType { get; set; } 
        public string Street { get; set; } 
        public string ExtNumber { get; set; } 
        public string IntNumber { get; set; } 
        public string Colony { get; set; } 
        public string City { get; set; } 
        public string State { get; set; } 

    }
}
