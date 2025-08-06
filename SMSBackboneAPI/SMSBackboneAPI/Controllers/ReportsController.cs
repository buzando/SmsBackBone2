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
    [Authorize]
    public class ReportsController : ControllerBase
    {
        [HttpPost("GetReports")]
        public async Task<IActionResult> GetReports(ReportExportRequest report)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            try
            {
                var reportManager = new ReportManager();
                string fileName;
                var fileBytes = reportManager.ExportReportToFile(report, report.Format, out fileName);

                var folder = Common.ConfigurationManagerJson("ReactFolder");

                if (!Directory.Exists(folder))
                    Directory.CreateDirectory(folder);

                var filePath = Path.Combine(folder, fileName);
                System.IO.File.WriteAllBytes(filePath, fileBytes);

                var url = $"/reports/{fileName}";
                return Ok(new { success = true, downloadUrl = url, fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
