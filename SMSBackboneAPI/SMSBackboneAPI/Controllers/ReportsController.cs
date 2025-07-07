using Microsoft.AspNetCore.Mvc;
using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Modal.Model.Model;
using Newtonsoft.Json;
using SMSBackboneAPI.Service;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;
namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ReportsController : ControllerBase
    {
        [AllowAnonymous]
        [HttpPost("DownloadReports")]
        public async Task<IActionResult> DownloadReports(GetReport Reporte)
        {
            return Ok();
        }
    }
}
