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
using log4net;
using Modal;
using AutoMapper.Execution;
using Azure.Core;
using DocumentFormat.OpenXml.Office2016.Excel;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampaignsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("AddTmpContacts")]
        public async Task<IActionResult> AddTmpContacts(CampainContacttpmrequest contacts)
        {
            var templateManager = new TpmCampaignContactsManager();
            var result = templateManager.InsertBatchFromExcel(contacts);
            if (result != null)
                return Ok(result);
            else
                return BadRequest(new GeneralErrorResponseDto() { code = "ErrorAddingContactos", description = "Error al cargar registros." });
        }

        [HttpPost("CreateCampaign")]
        public async Task<IActionResult> CreateCampaign(CampaignSaveRequest campaigns)
        {
            var manager = new CampaignManager();
            var campaign = campaigns.Campaigns;
            campaign.CreatedDate = DateTime.Now;

            var campaignSaved = manager.CreateCampaign(campaign, campaigns.SaveAsTemplate, campaigns.TemplateName);
            if (!campaignSaved)
                return BadRequest(new { code = "ErrorSavingCampaign", description = "No se pudo guardar la campaña." });

            int campaignId = campaign.Id;

            // 3. Guardar los horarios
            foreach (var schedule in campaigns.CampaignSchedules)
            {
                schedule.CampaignId = campaignId;
                manager.AddCampaignSchedule(schedule);
            }

            if (campaigns.CampaignRecycleSetting != null)
            {
                campaigns.CampaignRecycleSetting.CampaignId = campaignId;
                manager.AddRecycleSetting(campaigns.CampaignRecycleSetting);
            }

            foreach (var blacklistId in campaigns.BlacklistIds)
            {
                manager.AddBlacklistCampaign(new blacklistcampains
                {
                    idblacklist = blacklistId,
                    idcampains = campaignId
                });
            }

            bool contactosInsertados = manager.InsertBatchFromSession(campaigns.SessionId, campaignId);

            if (!contactosInsertados)
                return BadRequest(new { code = "ErrorAddingContactos", description = "Error al cargar registros de contactos." });

            return Ok(new { message = "Campaña creada correctamente", id = campaignId });

        }


        [HttpGet("GetCampaignsByRoom")]
        public async Task<IActionResult> GetCampaignsByRoom(int IdRoom)
        {
            var manager = new CampaignManager();

            var respuesta = manager.GetCampaignFullResponseByRoom(IdRoom);

            if (respuesta == null)
                return BadRequest(new { code = "ErrorGettingCampaigns", description = "Error al traer registros de campañas." });

            return Ok(respuesta);

        }

        [HttpGet("StartCampaign")]
        public async Task<IActionResult> StartCampaign(int IdCampaign)
        {
            var manager = new CampaignManager();
            var start = manager.StartCampaign(IdCampaign);
            if (start)
            {
                return Ok(true);
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost("DeleteCampaign")]
        public async Task<IActionResult> DeleteCampaign(List<int> ids)
        {
            var manager = new CampaignManager();
            var start = manager.DeleteCampaignsCascade(ids);
            if (start)
            {
                return Ok(true);
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpPost("EditCampaign")]
        public async Task<IActionResult> EditCampaign(CampaignSaveRequest campaigns)
        {
            var manager = new CampaignManager();
            var result = manager.EditCampaign(campaigns);

            if (!result)
                return BadRequest(new { code = "ErrorUpdatingCampaign", description = "No se pudo actualizar la campaña." });

            return Ok(new { message = "Campaña actualizada correctamente", id = campaigns.Campaigns.Id });
        }

        [HttpPost("CloneCampaign")]
        public async Task<IActionResult> CloneCampaign(CloneCampaignRequest request)
        {
            var manager = new CampaignManager();
            var result = manager.CloneFullCampaign(request);

            if (result == null)
                return BadRequest(new { code = "ErrorCloningCampaign", description = "No se pudo clonar la campaña." });

            return Ok(new { message = "Campaña clonada correctamente", id = result.Id });
        }
        [HttpGet("UpdateDataCampaign")]
        public async Task<IActionResult> UpdateDataCampaign(int IdCampaign)
        {
            var manager = new CampaignManager();

            var respuesta = manager.FullResponseUpdateCampaignInfo(IdCampaign);

            if (respuesta == null)
                return BadRequest(new { code = "ErrorGettingCampaigns", description = "Error al traer registros de campañas." });

            return Ok(respuesta);

        }
    }


}
