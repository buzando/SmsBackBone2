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
using System;                  // agregado para Guid
using System.Diagnostics;      // agregado para Stopwatch

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CampaignsController : Controller
    {
        private static readonly ILog _log = LogManager.GetLogger(typeof(CampaignsController));

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost("AddTmpContacts")]
        public async Task<IActionResult> AddTmpContacts(CampainContacttpmrequest contacts)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] AddTmpContacts start");

                var templateManager = new TpmCampaignContactsManager();
                var result = templateManager.InsertBatchFromExcel(contacts);

                if (result != null)
                {
                    sw.Stop();
                    _log.Info($"[{rid}] AddTmpContacts ok ms={sw.ElapsedMilliseconds}");
                    return Ok(result);
                }
                else
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] AddTmpContacts result null ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new GeneralErrorResponseDto() { code = "ErrorAddingContactos", description = "Error al cargar registros." });
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] AddTmpContacts error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("CreateCampaign")]
        public async Task<IActionResult> CreateCampaign(CampaignSaveRequest campaigns)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] CreateCampaign start template={campaigns?.SaveAsTemplate} name='{campaigns?.TemplateName ?? ""}'");

                var manager = new CampaignManager();
                var campaign = campaigns.Campaigns;
                campaign.CreatedDate = DateTime.Now;

                var campaignSaved = manager.CreateCampaign(campaign, campaigns.SaveAsTemplate, campaigns.TemplateName);
                if (!campaignSaved)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] CreateCampaign not saved ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { code = "ErrorSavingCampaign", description = "No se pudo guardar la campaña." });
                }

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
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] CreateCampaign contacts not inserted id={campaignId} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { code = "ErrorAddingContactos", description = "Error al cargar registros de contactos." });
                }

                sw.Stop();
                _log.Info($"[{rid}] CreateCampaign ok id={campaignId} ms={sw.ElapsedMilliseconds}");
                return Ok(new { message = "Campaña creada correctamente", id = campaignId });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] CreateCampaign error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpGet("GetCampaignsByRoom")]
        public async Task<IActionResult> GetCampaignsByRoom(int IdRoom)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] GetCampaignsByRoom start room={IdRoom}");

                var manager = new CampaignManager();
                var respuesta = manager.GetCampaignFullResponseByRoom(IdRoom);

                if (respuesta == null)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] GetCampaignsByRoom null response room={IdRoom} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { code = "ErrorGettingCampaigns", description = "Error al traer registros de campañas." });
                }

                sw.Stop();
                _log.Info($"[{rid}] GetCampaignsByRoom ok room={IdRoom} ms={sw.ElapsedMilliseconds}");
                return Ok(respuesta);
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] GetCampaignsByRoom error room={IdRoom} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpGet("StartCampaign")]
        public async Task<IActionResult> StartCampaign(int IdCampaign)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] StartCampaign start id={IdCampaign}");

                var manager = new CampaignManager();
                var start = manager.StartCampaign(IdCampaign);

                sw.Stop();
                if (start)
                {
                    _log.Info($"[{rid}] StartCampaign ok id={IdCampaign} ms={sw.ElapsedMilliseconds}");
                    return Ok(true);
                }
                else
                {
                    _log.Warn($"[{rid}] StartCampaign badrequest id={IdCampaign} ms={sw.ElapsedMilliseconds}");
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] StartCampaign error id={IdCampaign} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("DeleteCampaign")]
        public async Task<IActionResult> DeleteCampaign(List<int> ids)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] DeleteCampaign start count={ids?.Count ?? 0}");

                var manager = new CampaignManager();
                var start = manager.DeleteCampaignsCascade(ids);

                sw.Stop();
                if (start)
                {
                    _log.Info($"[{rid}] DeleteCampaign ok count={ids?.Count ?? 0} ms={sw.ElapsedMilliseconds}");
                    return Ok(true);
                }
                else
                {
                    _log.Warn($"[{rid}] DeleteCampaign badrequest count={ids?.Count ?? 0} ms={sw.ElapsedMilliseconds}");
                    return BadRequest();
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] DeleteCampaign error count={ids?.Count ?? 0} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("EditCampaign")]
        public async Task<IActionResult> EditCampaign(CampaignSaveRequest campaigns)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] EditCampaign start id={campaigns?.Campaigns?.Id}");

                var manager = new CampaignManager();
                var result = manager.EditCampaign(campaigns);

                sw.Stop();
                if (!result)
                {
                    _log.Warn($"[{rid}] EditCampaign not updated id={campaigns?.Campaigns?.Id} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { code = "ErrorUpdatingCampaign", description = "No se pudo actualizar la campaña." });
                }

                _log.Info($"[{rid}] EditCampaign ok id={campaigns?.Campaigns?.Id} ms={sw.ElapsedMilliseconds}");
                return Ok(new { message = "Campaña actualizada correctamente", id = campaigns.Campaigns.Id });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] EditCampaign error id={campaigns?.Campaigns?.Id} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpPost("CloneCampaign")]
        public async Task<IActionResult> CloneCampaign(CloneCampaignRequest request)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] CloneCampaign start");

                var manager = new CampaignManager();
                var result = manager.CloneFullCampaign(request);

                if (result == null)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] CloneCampaign null result ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { code = "ErrorCloningCampaign", description = "No se pudo clonar la campaña." });
                }

                sw.Stop();
                _log.Info($"[{rid}] CloneCampaign ok newId={result.Id} ms={sw.ElapsedMilliseconds}");
                return Ok(new { message = "Campaña clonada correctamente", id = result.Id });
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] CloneCampaign error ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }

        [HttpGet("UpdateDataCampaign")]
        public async Task<IActionResult> UpdateDataCampaign(int IdCampaign)
        {
            var rid = HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");
            var sw = Stopwatch.StartNew();
            try
            {
                _log.Info($"[{rid}] UpdateDataCampaign start id={IdCampaign}");

                var manager = new CampaignManager();
                var respuesta = manager.FullResponseUpdateCampaignInfo(IdCampaign);

                if (respuesta == null)
                {
                    sw.Stop();
                    _log.Warn($"[{rid}] UpdateDataCampaign null response id={IdCampaign} ms={sw.ElapsedMilliseconds}");
                    return BadRequest(new { code = "ErrorGettingCampaigns", description = "Error al traer registros de campañas." });
                }

                sw.Stop();
                _log.Info($"[{rid}] UpdateDataCampaign ok id={IdCampaign} ms={sw.ElapsedMilliseconds}");
                return Ok(respuesta);
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.Error($"[{rid}] UpdateDataCampaign error id={IdCampaign} ms={sw.ElapsedMilliseconds}", ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { code = "ServerError", description = "Ocurrió un error." });
            }
        }
    }
}
