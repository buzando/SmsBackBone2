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

                var template = new Modal.Model.Model.Template
                {
                    Name = Addtemplate.Name,
                    Message = Addtemplate.Message,
                    CreationDate = DateTime.Now,
                    IdRoom = Addtemplate.idroom
                };
                using (var ctx = new Entities())
                {
                    ctx.Template.Add(template);
                    ctx.SaveChanges();
                }
                return true;


            }
            catch (Exception e)
            {
                return false; ;

                throw;
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
                                       .FirstOrDefault(t => t.Name == templaterequest.oldName && t.IdRoom == templaterequest.idRoom);

                    if (template == null) return false;

                    template.Name = templaterequest.newName;
                    template.Message = templaterequest.newMessage;
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
