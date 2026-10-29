using System;
using System.Collections.Generic;

namespace Contract.Request
{
    public class AssignRoleRequest
    {
        public int UserId { get; set; }
        // RoleId se conserva por compatibilidad con clientes antiguos.
        public int RoleId { get; set; }
        public List<int> RoleIds { get; set; } = new List<int>();
    }
}
