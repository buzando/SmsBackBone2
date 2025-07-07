using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Contract.Request;
using Contract.Response;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;

namespace Business
{
    public class CampaignManager
    {
        public bool CreateCampaign(Campaigns campaign, bool SaveAsTemplate, string TemplateName)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    if (SaveAsTemplate && !string.IsNullOrWhiteSpace(TemplateName))
                    {
                        var newTemplate = new Template
                        {
                            Name = TemplateName,
                            Message = campaign.Message,
                            IdRoom = campaign.RoomId,
                            CreationDate = DateTime.Now
                        };

                        ctx.Template.Add(newTemplate);
                        ctx.SaveChanges();

                        campaign.TemplateId = newTemplate.Id;
                        campaign.UseTemplate = true;
                    }

                    ctx.Campaigns.Add(campaign);
                    ctx.SaveChanges();
                }

                return true;
            }
            catch
            {
                return false;
            }
        }


        public bool EditCampaign(CampaignSaveRequest campaigns)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var campaign = campaigns.Campaigns;

                    var existing = ctx.Campaigns.FirstOrDefault(c => c.Id == campaign.Id);
                    if (existing == null) return false;

                    // Guardar plantilla primero (como en CreateCampaign)
                    if (campaigns.SaveAsTemplate && !string.IsNullOrWhiteSpace(campaigns.TemplateName))
                    {
                        var newTemplate = new Template
                        {
                            Name = campaigns.TemplateName,
                            Message = campaign.Message,
                            IdRoom = campaign.RoomId,
                            CreationDate = DateTime.Now
                        };

                        ctx.Template.Add(newTemplate);
                        ctx.SaveChanges();

                        campaign.TemplateId = newTemplate.Id;
                        campaign.UseTemplate = true;

                        existing.TemplateId = newTemplate.Id;
                        existing.UseTemplate = true;
                    }

                    // Solo actualizar propiedades si cambian
                    if (existing.Name != campaign.Name)
                        existing.Name = campaign.Name;

                    if (existing.Message != campaign.Message)
                        existing.Message = campaign.Message;

                    if (existing.AutoStart != campaign.AutoStart)
                        existing.AutoStart = campaign.AutoStart;

                    if (existing.FlashMessage != campaign.FlashMessage)
                        existing.FlashMessage = campaign.FlashMessage;

                    if (existing.CustomANI != campaign.CustomANI)
                        existing.CustomANI = campaign.CustomANI;

                    if (existing.RecycleRecords != campaign.RecycleRecords)
                        existing.RecycleRecords = campaign.RecycleRecords;

                    if (existing.NumberType != campaign.NumberType)
                        existing.NumberType = campaign.NumberType;

                    existing.ModifiedDate = DateTime.Now;

                    // -----------------------------------
                    // HORARIOS - Comentado por validación
                    // -----------------------------------

                    var schedules = ctx.CampaignSchedules.Where(s => s.CampaignId == campaign.Id).ToList();
                    ctx.CampaignSchedules.RemoveRange(schedules);
                    ctx.SaveChanges();

                    foreach (var schedule in campaigns.CampaignSchedules)
                    {
                        schedule.CampaignId = campaign.Id;
                        ctx.CampaignSchedules.Add(schedule);
                    }


                    var existingRecycle = ctx.CampaignRecycleSettings.FirstOrDefault(r => r.CampaignId == campaign.Id);

                    bool isSameRecycle = existingRecycle != null &&
                                         campaigns.CampaignRecycleSetting != null &&
                                         existingRecycle.TypeOfRecords == campaigns.CampaignRecycleSetting.TypeOfRecords &&
                                         existingRecycle.IncludeNotContacted == campaigns.CampaignRecycleSetting.IncludeNotContacted &&
                                         existingRecycle.NumberOfRecycles == campaigns.CampaignRecycleSetting.NumberOfRecycles;

                    if (!isSameRecycle)
                    {
                        if (existingRecycle != null)
                            ctx.CampaignRecycleSettings.Remove(existingRecycle);

                        if (campaigns.CampaignRecycleSetting != null)
                        {
                            campaigns.CampaignRecycleSetting.CampaignId = campaign.Id;
                            ctx.CampaignRecycleSettings.Add(campaigns.CampaignRecycleSetting);
                        }
                    }

                    var existingBlacklists = ctx.blacklistcampains.Where(b => b.idcampains == campaign.Id).ToList();
                    ctx.blacklistcampains.RemoveRange(existingBlacklists);

                    foreach (var id in campaigns.BlacklistIds)
                    {
                        ctx.blacklistcampains.Add(new blacklistcampains
                        {
                            idblacklist = id,
                            idcampains = campaign.Id
                        });
                    }

                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }


        public bool DeleteCampaign(int campaignId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var campaign = ctx.Campaigns.FirstOrDefault(c => c.Id == campaignId);
                    if (campaign == null) return false;

                    ctx.Campaigns.Remove(campaign);
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool AddCampaignContact(CampaignContacts contact)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    ctx.CampaignContacts.Add(contact);
                    ctx.SaveChanges();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool DeleteCampaignContact(int contactId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var contact = ctx.CampaignContacts.FirstOrDefault(c => c.Id == contactId);
                    if (contact == null) return false;

                    ctx.CampaignContacts.Remove(contact);
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool AddRecycleSetting(CampaignRecycleSettings setting)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    ctx.CampaignRecycleSettings.Add(setting);
                    ctx.SaveChanges();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool DeleteRecycleSetting(int settingId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var setting = ctx.CampaignRecycleSettings.FirstOrDefault(r => r.Id == settingId);
                    if (setting == null) return false;

                    ctx.CampaignRecycleSettings.Remove(setting);
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool AddCampaignSchedule(CampaignSchedules schedule)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    ctx.CampaignSchedules.Add(schedule);
                    ctx.SaveChanges();
                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool DeleteCampaignSchedule(int scheduleId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var schedule = ctx.CampaignSchedules.FirstOrDefault(s => s.Id == scheduleId);
                    if (schedule == null) return false;

                    ctx.CampaignSchedules.Remove(schedule);
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool AddBlacklistCampaign(blacklistcampains blacklist)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    ctx.blacklistcampains.Add(blacklist);
                    ctx.SaveChanges();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool DeleteBlacklistCampaign(int blacklistId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var blacklist = ctx.blacklistcampains.FirstOrDefault(b => b.id == blacklistId);
                    if (blacklist == null) return false;

                    ctx.blacklistcampains.Remove(blacklist);
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public bool InsertBatchFromSession(string sessionId, int campaignId)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var contactosTemporales = ctx.tpm_CampaignContacts
                        .Where(c => c.SessionId == sessionId)
                        .ToList();

                    if (!contactosTemporales.Any())
                        return false;


                    var contactosDefinitivos = contactosTemporales.Select(temp => new CampaignContacts
                    {
                        CampaignId = campaignId,
                        PhoneNumber = temp.PhoneNumber,
                        Dato = temp.Dato,
                        DatoId = temp.DatoId,
                        Misc01 = temp.Misc01,
                        Misc02 = temp.Misc02
                    }).ToList();


                    ctx.CampaignContacts.AddRange(contactosDefinitivos);
                    ctx.SaveChanges();

                    return true;
                }
            }
            catch (Exception ex)
            {
                // Aquí puedes loguear el error si usas algún sistema de logging
                return false;
            }
        }

        public List<CampaignFullResponse> FullResponseCampaignByRoom(int idRoom)
        {
            var response = new List<CampaignFullResponse>();
            try
            {
                using (var ctx = new Entities())
                {
                    response = ctx.Campaigns
                        .Where(c => c.RoomId == idRoom)
                        .Select(c => new CampaignFullResponse
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Message = c.Message,
                            UseTemplate = c.UseTemplate,
                            TemplateId = c.TemplateId,
                            AutoStart = c.AutoStart,
                            FlashMessage = c.FlashMessage,
                            CustomANI = c.CustomANI,
                            RecycleRecords = c.RecycleRecords,
                            NumberType = c.NumberType,
                            CreatedDate = c.CreatedDate,
                            StartDate = c.StartDate,

                            Schedules = ctx.CampaignSchedules
                                .Where(s => s.CampaignId == c.Id)
                                .Select(s => new CampaignScheduleDto
                                {
                                    StartDateTime = s.StartDateTime,
                                    EndDateTime = s.EndDateTime,
                                    OperationMode = s.OperationMode,
                                    Order = s.Order
                                }).ToList(),

                            RecycleSetting = ctx.CampaignRecycleSettings
                                .Where(r => r.CampaignId == c.Id)
                                .Select(r => new CampaignRecycleSettingDto
                                {
                                    TypeOfRecords = r.TypeOfRecords,
                                    IncludeNotContacted = r.IncludeNotContacted,
                                    NumberOfRecycles = r.NumberOfRecycles
                                }).FirstOrDefault(),

                            Contacts = ctx.CampaignContacts
                                .Where(cc => cc.CampaignId == c.Id)
                                .Select(cc => new CampaignContactDto
                                {
                                    PhoneNumber = cc.PhoneNumber,
                                    Dato = cc.Dato,
                                    DatoId = cc.DatoId,
                                    Misc01 = cc.Misc01,
                                    Misc02 = cc.Misc02
                                }).ToList(),

                            CampaignContactScheduleSendDTO = ctx.CampaignContactScheduleSend
                                .Where(s => s.CampaignId == c.Id)
                                .Select(s => new CampaignContactScheduleSendDTO
                                {
                                    ContactId = s.ContactId,
                                    ScheduleId = s.ScheduleId,
                                    SentAt = s.SentAt,
                                    Status = s.Status,
                                    ResponseMessage = s.ResponseMessage,
                                    State = s.State
                                }).ToList(),

                        })
                        .ToList();

                    foreach (var c in response)
                    {
                        var contactCount = c.Contacts.Count;
                        var duplicadoCount = c.Schedules.Count(s => s.OperationMode == 2 && s.EndDateTime <= DateTime.Now);

                        c.numeroInicial = duplicadoCount > 1 ? contactCount * duplicadoCount : contactCount;
                        c.RecycleCount = duplicadoCount;

                        c.numeroActual = c.CampaignContactScheduleSendDTO.Count;
                        c.RespondedRecords = c.CampaignContactScheduleSendDTO.Count(x => !string.IsNullOrEmpty(x.ResponseMessage));

                        c.InProcessCount = c.CampaignContactScheduleSendDTO.Count(x => x.Status == "0");
                        c.DeliveredCount = c.CampaignContactScheduleSendDTO.Count(x => x.Status == "1");
                        c.NotDeliveredCount = c.CampaignContactScheduleSendDTO.Count(x => x.Status == "2");
                        c.NotSentCount = c.CampaignContactScheduleSendDTO.Count(x => x.Status == "3");
                        c.FailedCount = c.CampaignContactScheduleSendDTO.Count(x => x.Status == "4");
                        c.ExceptionCount = c.CampaignContactScheduleSendDTO.Count(x => x.Status == "5");
                    }


                }

                return response;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        public List<CampaignFullResponse> GetCampaignFullResponseByRoom(int idRoom)
        {
            var campaigns = new List<CampaignFullResponse>();

            using (var ctx = new Entities())
            {
                var connection = ctx.Database.GetDbConnection();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "sp_GetCampaignsByRoom";
                    command.CommandType = CommandType.StoredProcedure;

                    var param = command.CreateParameter();
                    param.ParameterName = "@RoomId";
                    param.Value = idRoom;
                    command.Parameters.Add(param);

                    if (connection.State != ConnectionState.Open)
                        connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        // Resultset 1: Campaigns
                        while (reader.Read())
                        {
                            var campaign = new CampaignFullResponse
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Name = reader.GetString(reader.GetOrdinal("Name")),
                                Message = reader.IsDBNull(reader.GetOrdinal("Message")) ? null : reader.GetString(reader.GetOrdinal("Message")),
                                UseTemplate = reader.GetBoolean(reader.GetOrdinal("UseTemplate")),
                                TemplateId = reader.IsDBNull(reader.GetOrdinal("TemplateId")) ? null : reader.GetInt32(reader.GetOrdinal("TemplateId")),
                                AutoStart = reader.GetBoolean(reader.GetOrdinal("AutoStart")),
                                FlashMessage = reader.GetBoolean(reader.GetOrdinal("FlashMessage")),
                                CustomANI = reader.GetBoolean(reader.GetOrdinal("CustomANI")),
                                RecycleRecords = reader.GetBoolean(reader.GetOrdinal("RecycleRecords")),
                                NumberType = reader.GetByte(reader.GetOrdinal("NumberType")),
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                                StartDate = reader.IsDBNull(reader.GetOrdinal("StartDate")) ? null : reader.GetDateTime(reader.GetOrdinal("StartDate")),
                                numeroActual = reader.GetInt32(reader.GetOrdinal("numeroActual")),
                                numeroInicial = reader.GetInt32(reader.GetOrdinal("numeroInicial")),
                                RespondedRecords = reader.GetInt32(reader.GetOrdinal("RespondedRecords")),
                                InProcessCount = reader.GetInt32(reader.GetOrdinal("InProcessCount")),
                                DeliveredCount = reader.GetInt32(reader.GetOrdinal("DeliveredCount")),
                                NotDeliveredCount = reader.GetInt32(reader.GetOrdinal("NotDeliveredCount")),
                                NotSentCount = reader.GetInt32(reader.GetOrdinal("NotSentCount")),
                                FailedCount = reader.GetInt32(reader.GetOrdinal("FailedCount")),
                                ExceptionCount = reader.GetInt32(reader.GetOrdinal("ExceptionCount")),
                                BlockedRecords = reader.GetInt32(reader.GetOrdinal("BlockedRecords")),
                                DeliveryFailRate = reader.GetInt32(reader.GetOrdinal("DeliveryFailRate")),
                                Schedules = new List<CampaignScheduleDto>(),
                                Contacts = new List<CampaignContactDto>(),
                                CampaignContactScheduleSendDTO = new List<CampaignContactScheduleSendDTO>()
                            };

                            campaigns.Add(campaign);
                        }

                        // Resultset 2: Schedules
                        reader.NextResult();
                        while (reader.Read())
                        {
                            int campaignId = reader.GetInt32(reader.GetOrdinal("CampaignId"));
                            var schedule = new CampaignScheduleDto
                            {
                                StartDateTime = reader.GetDateTime(reader.GetOrdinal("StartDateTime")),
                                EndDateTime = reader.GetDateTime(reader.GetOrdinal("EndDateTime")),
                                OperationMode = reader.IsDBNull(reader.GetOrdinal("OperationMode")) ? null : reader.GetByte(reader.GetOrdinal("OperationMode")),
                                Order = reader.GetInt32(reader.GetOrdinal("Order"))
                            };

                            var campaign = campaigns.FirstOrDefault(c => c.Id == campaignId);
                            campaign?.Schedules.Add(schedule);
                        }

                        // Resultset 3: RecycleSetting
                        reader.NextResult();
                        while (reader.Read())
                        {
                            int campaignId = reader.GetInt32(reader.GetOrdinal("CampaignId"));
                            var recycle = new CampaignRecycleSettingDto
                            {
                                TypeOfRecords = reader.IsDBNull(reader.GetOrdinal("TypeOfRecords")) ? null : reader.GetString(reader.GetOrdinal("TypeOfRecords")),
                                IncludeNotContacted = reader.GetBoolean(reader.GetOrdinal("IncludeNotContacted")),
                                NumberOfRecycles = reader.GetInt32(reader.GetOrdinal("NumberOfRecycles"))
                            };

                            var campaign = campaigns.FirstOrDefault(c => c.Id == campaignId);
                            if (campaign != null)
                                campaign.RecycleSetting = recycle;
                        }

                        // Resultset 4: Contacts
                        reader.NextResult();
                        while (reader.Read())
                        {
                            int campaignId = reader.GetInt32(reader.GetOrdinal("CampaignId"));
                            var contact = new CampaignContactDto
                            {
                                PhoneNumber = reader.GetString(reader.GetOrdinal("PhoneNumber")),
                                Dato = reader.IsDBNull(reader.GetOrdinal("Dato")) ? null : reader.GetString(reader.GetOrdinal("Dato")),
                                DatoId = reader.IsDBNull(reader.GetOrdinal("DatoId")) ? null : reader.GetString(reader.GetOrdinal("DatoId")),
                                Misc01 = reader.IsDBNull(reader.GetOrdinal("Misc01")) ? null : reader.GetString(reader.GetOrdinal("Misc01")),
                                Misc02 = reader.IsDBNull(reader.GetOrdinal("Misc02")) ? null : reader.GetString(reader.GetOrdinal("Misc02"))
                            };

                            var campaign = campaigns.FirstOrDefault(c => c.Id == campaignId);
                            campaign?.Contacts.Add(contact);
                        }

                        // Resultset 5: CampaignContactScheduleSendDTO
                        reader.NextResult();
                        while (reader.Read())
                        {
                            int campaignId = reader.GetInt32(reader.GetOrdinal("CampaignId"));
                            var sendDto = new CampaignContactScheduleSendDTO
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                CampaignId = campaignId,
                                ContactId = reader.GetInt32(reader.GetOrdinal("ContactId")),
                                ScheduleId = reader.GetInt32(reader.GetOrdinal("ScheduleId")),
                                SentAt = reader.IsDBNull(reader.GetOrdinal("SentAt")) ? null : reader.GetDateTime(reader.GetOrdinal("SentAt")),
                                Status = reader.GetString(reader.GetOrdinal("Status")),
                                ResponseMessage = reader.IsDBNull(reader.GetOrdinal("ResponseMessage")) ? null : reader.GetString(reader.GetOrdinal("ResponseMessage")),
                                State = reader.GetString(reader.GetOrdinal("State"))
                            };

                            var campaign = campaigns.FirstOrDefault(c => c.Id == campaignId);
                            campaign?.CampaignContactScheduleSendDTO.Add(sendDto);
                        }
                    }
                }
            }

            return campaigns;
        }


        public CampaignFullResponse FullResponseUpdateCampaignInfo(int IdCampaign)
        {
            var response = new CampaignFullResponse();
            try
            {
                using (var ctx = new Entities())
                {
                    response = ctx.Campaigns
                        .Where(c => c.Id == IdCampaign)
                        .Select(c => new CampaignFullResponse
                        {
                            Id = c.Id,
                            Name = c.Name,
                            Message = c.Message,
                            UseTemplate = c.UseTemplate,
                            TemplateId = c.TemplateId,
                            AutoStart = c.AutoStart,
                            FlashMessage = c.FlashMessage,
                            CustomANI = c.CustomANI,
                            RecycleRecords = c.RecycleRecords,
                            NumberType = c.NumberType,
                            CreatedDate = c.CreatedDate,
                            StartDate = c.StartDate,

                            Schedules = ctx.CampaignSchedules
                                .Where(s => s.CampaignId == c.Id)
                                .Select(s => new CampaignScheduleDto
                                {
                                    StartDateTime = s.StartDateTime,
                                    EndDateTime = s.EndDateTime,
                                    OperationMode = s.OperationMode,
                                    Order = s.Order
                                }).ToList(),

                            RecycleSetting = ctx.CampaignRecycleSettings
                                .Where(r => r.CampaignId == c.Id)
                                .Select(r => new CampaignRecycleSettingDto
                                {
                                    TypeOfRecords = r.TypeOfRecords,
                                    IncludeNotContacted = r.IncludeNotContacted,
                                    NumberOfRecycles = r.NumberOfRecycles
                                }).FirstOrDefault(),

                            Contacts = ctx.CampaignContacts
                                .Where(cc => cc.CampaignId == c.Id)
                                .Select(cc => new CampaignContactDto
                                {
                                    PhoneNumber = cc.PhoneNumber,
                                    Dato = cc.Dato,
                                    DatoId = cc.DatoId,
                                    Misc01 = cc.Misc01,
                                    Misc02 = cc.Misc02
                                }).ToList(),

                            CampaignContactScheduleSendDTO = ctx.CampaignContactScheduleSend
                                .Where(s => s.CampaignId == c.Id)
                                .Select(s => new CampaignContactScheduleSendDTO
                                {
                                    ContactId = s.ContactId,
                                    ScheduleId = s.ScheduleId,
                                    SentAt = s.SentAt,
                                    Status = s.Status,
                                    ResponseMessage = s.ResponseMessage,
                                    State = s.State
                                }).ToList(),

                        })
                        .FirstOrDefault();


                    var contactCount = response.Contacts.Count;
                    var duplicadoCount = response.Schedules.Count(s => s.OperationMode == 2 && s.EndDateTime <= DateTime.Now);

                    response.numeroInicial = duplicadoCount > 1 ? contactCount * duplicadoCount : contactCount;
                    response.RecycleCount = duplicadoCount;

                    response.numeroActual = response.CampaignContactScheduleSendDTO.Count;
                    response.RespondedRecords = response.CampaignContactScheduleSendDTO.Count(x => !string.IsNullOrEmpty(x.ResponseMessage));

                    response.InProcessCount = response.CampaignContactScheduleSendDTO.Count(x => x.Status == "0");
                    response.DeliveredCount = response.CampaignContactScheduleSendDTO.Count(x => x.Status == "1");
                    response.NotDeliveredCount = response.CampaignContactScheduleSendDTO.Count(x => x.Status == "2");
                    response.NotSentCount = response.CampaignContactScheduleSendDTO.Count(x => x.Status == "3");
                    response.FailedCount = response.CampaignContactScheduleSendDTO.Count(x => x.Status == "4");
                    response.ExceptionCount = response.CampaignContactScheduleSendDTO.Count(x => x.Status == "5");



                }

                return response;
            }
            catch (Exception e)
            {
                return null;
            }
        }


        public bool StartCampaign(int IdCampaign)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var campaign = ctx.Campaigns.Where(x => x.Id == IdCampaign).FirstOrDefault();
                    campaign.AutoStart = campaign.AutoStart ? false : true;
                    if (campaign.AutoStart)
                    {
                        campaign.StartDate = DateTime.Now;
                    }
                    ctx.SaveChanges();
                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool DeleteCampaignsCascade(List<int> campaignIds)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    foreach (var campaignId in campaignIds)
                        {

                    
                        var campaign = ctx.Campaigns.FirstOrDefault(c => c.Id == campaignId);
                        if (campaign == null) continue;

                        var blacklist = ctx.blacklistcampains.Where(b => b.idcampains == campaignId).ToList();
                        ctx.blacklistcampains.RemoveRange(blacklist);
                        ctx.SaveChanges();

                        var sentRecords = ctx.CampaignContactScheduleSend.Where(s => s.CampaignId == campaignId).ToList();
                        ctx.CampaignContactScheduleSend.RemoveRange(sentRecords);
                        ctx.SaveChanges();

                        var contacts = ctx.CampaignContacts.Where(c => c.CampaignId == campaignId).ToList();
                        ctx.CampaignContacts.RemoveRange(contacts);

                        var schedules = ctx.CampaignSchedules.Where(s => s.CampaignId == campaignId).ToList();
                        ctx.CampaignSchedules.RemoveRange(schedules);

                        var recycle = ctx.CampaignRecycleSettings.Where(r => r.CampaignId == campaignId).ToList();
                        ctx.CampaignRecycleSettings.RemoveRange(recycle);


                      

                        ctx.Campaigns.Remove(campaign);
                    }

                    ctx.SaveChanges();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public Campaigns CloneFullCampaign(CloneCampaignRequest campaign)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var original = ctx.Campaigns.FirstOrDefault(c => c.Id == campaign.CampaignIdToClone);
                    if (original == null) return null;

                    // Crear nueva campaña base
                    var clone = new Campaigns
                    {
                        Name = campaign.NewName,
                        Message = original.Message,
                        RoomId = original.RoomId,
                        UseTemplate = original.UseTemplate,
                        TemplateId = original.TemplateId,
                        AutoStart = false, // no debe iniciar al clonarse
                        FlashMessage = original.FlashMessage,
                        CustomANI = original.CustomANI,
                        RecycleRecords = original.RecycleRecords,
                        NumberType = original.NumberType,
                        CreatedDate = DateTime.Now,
                        ModifiedDate = DateTime.Now
                    };

                    ctx.Campaigns.Add(clone);
                    ctx.SaveChanges(); // genera ID

                    int newId = clone.Id;

                    // Clonar horarios
                    foreach (var h in campaign.NewSchedules)
                    {
                        ctx.CampaignSchedules.Add(new CampaignSchedules
                        {
                            CampaignId = newId,
                            StartDateTime = h.StartDateTime,
                            EndDateTime = h.EndDateTime,
                            OperationMode = h.OperationMode,
                            Order = h.Order
                        });
                    }

                    // Clonar configuración de reciclado (si existe)
                    var reciclado = ctx.CampaignRecycleSettings.FirstOrDefault(r => r.CampaignId == campaign.CampaignIdToClone);
                    if (reciclado != null)
                    {
                        ctx.CampaignRecycleSettings.Add(new CampaignRecycleSettings
                        {
                            CampaignId = newId,
                            TypeOfRecords = reciclado.TypeOfRecords,
                            IncludeNotContacted = reciclado.IncludeNotContacted,
                            NumberOfRecycles = reciclado.NumberOfRecycles
                        });
                    }

                    // Clonar listas negras asociadas
                    var blacklists = ctx.blacklistcampains.Where(b => b.idcampains == campaign.CampaignIdToClone).ToList();
                    foreach (var b in blacklists)
                    {
                        ctx.blacklistcampains.Add(new blacklistcampains
                        {
                            idcampains = newId,
                            idblacklist = b.idblacklist
                        });
                    }

                    // Clonar contactos
                    var contactos = ctx.CampaignContacts.Where(c => c.CampaignId == campaign.CampaignIdToClone).ToList();
                    foreach (var c in contactos)
                    {
                        ctx.CampaignContacts.Add(new CampaignContacts
                        {
                            CampaignId = newId,
                            PhoneNumber = c.PhoneNumber,
                            Dato = c.Dato,
                            DatoId = c.DatoId,
                            Misc01 = c.Misc01,
                            Misc02 = c.Misc02
                        });
                    }

                    ctx.SaveChanges();
                    return clone;
                }
            }
            catch
            {
                return null;
            }
        }

    }
}
