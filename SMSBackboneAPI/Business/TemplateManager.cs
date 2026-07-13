using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract.Request;
using Modal;
using Modal.Model.Model;

namespace Business
{
    public class TemplateManager
    {
        public bool CreateTemplate(AddTemplate Addtemplate)
        {
            try
            {
                if (Addtemplate == null)
                    return false;

                if (string.IsNullOrWhiteSpace(Addtemplate.Name))
                    return false;

                using (var ctx = new Entities())
                {
                    var templateName = Addtemplate.Name.Trim().ToLower();

                    var clientIds = (
                        from ru in ctx.roomsbyuser
                        join u in ctx.Users on ru.idUser equals u.Id
                        where ru.idRoom == Addtemplate.idroom
                        select u.IdCliente
                    )
                    .Distinct()
                    .ToList();

                    if (!clientIds.Any())
                        return false;


                    var existsTemplate = (
                        from t in ctx.Template
                        join ru in ctx.roomsbyuser on t.IdRoom equals ru.idRoom
                        join u in ctx.Users on ru.idUser equals u.Id
                        where clientIds.Contains(u.IdCliente)
                           && t.Name.Trim().ToLower() == templateName
                        select t.Id
                    ).Any();

                    if (existsTemplate)
                        return false;

                    var template = new Modal.Model.Model.Template
                    {
                        Name = Addtemplate.Name.Trim(),
                        Message = Addtemplate.Message,
                        CreationDate = DateTime.Now,
                        IdRoom = Addtemplate.idroom
                    };

                    ctx.Template.Add(template);
                    ctx.SaveChanges();

                    return true;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }
        public List<Modal.Model.Model.Template> GetTemplatesByRoom(int idRoom)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    return ctx.Template
                              .Where(t => t.IdRoom == idRoom)
                              .ToList();
                }
            }
            catch (Exception)
            {
                return null;
                throw;
            }
        }

        public bool DeleteTemplateByNameAndRoom(TemplateRequest templaterequest)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var template = ctx.Template
                                       .FirstOrDefault(t => t.Name == templaterequest.name && t.IdRoom == templaterequest.idRoom);

                    if (template == null) return false;

                    ctx.Template.Remove(template);
                    ctx.SaveChanges();
                    return true;
                }
            }
            catch (Exception)
            {
                return false;
                throw;
            }
        }
        public bool UpdateTemplateByNameAndRoom(UpdateTemplateRequest templaterequest)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var template = ctx.Template
                        .FirstOrDefault(t =>
                            t.Name == templaterequest.oldName &&
                            t.IdRoom == templaterequest.idRoom);

                    if (template == null)
                        return false;

                    var now = DateTime.Now;

                    var hasNonFinishedCampaign = (
                        from c in ctx.Campaigns
                        join s in ctx.CampaignSchedules on c.Id equals s.CampaignId
                        where c.TemplateId == template.Id
                           && s.EndDateTime >= now
                        select c.Id
                    ).Any();

                    if (hasNonFinishedCampaign)
                        return false;

                    template.Name = templaterequest.newName;
                    template.Message = templaterequest.newMessage;

                    ctx.SaveChanges();
                    return true;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }
        public List<string> GetCampainsByTemplate(TemplateRequest templaterequest)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var template = ctx.Template
                                      .FirstOrDefault(t => t.Name == templaterequest.name && t.IdRoom == templaterequest.idRoom);

                    if (template == null)
                        return new List<string>();

                    var campaigns = (from c in ctx.Campaigns
                                     where c.TemplateId == template.Id
                                     select c.Name).ToList();


                    return campaigns;
                }
            }
            catch (Exception)
            {
                return null;
            }
        }

    }
}
