using AutoMapper;
using Contract.Response;
using Microsoft.Identity.Client;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Contract.Request;
using System.Numerics;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Modal.Model;


namespace Business
{
    public class RoleManager
    {
        public List<Roles> GetRoles()
        {
            var roles = new List<Roles>();
            try
            {
                using (var ctx = new Entities())
                {
                    roles = ctx.Roles.ToList();
                }
                return roles;
            }
            catch (Exception e)
            {
                return new List<Roles>();
            }
        }
    }
}
