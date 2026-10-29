using Contract.Request;
using Contract.Response;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Business
{
    public class RoleManager
    {
        // Devuelve los permisos activos para construir los checkboxes.
        public List<PermissionResponse> GetPermissions()
        {
            using (var ctx = new Entities())
            {
                return ctx.Permissions
                    .AsNoTracking()
                    .Where(permission => permission.IsActive)
                    .OrderBy(permission => permission.SortOrder)
                    .Select(permission => new PermissionResponse
                    {
                        Code = permission.PermissionCode,
                        Label = permission.PermissionName,
                        ParentCode = permission.ParentPermission == null
                            ? null
                            : permission.ParentPermission.PermissionCode,
                        SortOrder = permission.SortOrder
                    })
                    .ToList();
            }
        }

        // Devuelve roles globales y roles personalizados del cliente.
        public RolePageResponse GetRolesByClient(
     int idCliente,
     int page = 1,
     string search = null)
        {
            const int pageSize = 25;
            page = Math.Max(page, 1);

            using (var ctx = new Entities())
            {
                var query = ctx.Roles
                    .AsNoTracking()
                    .Where(role =>
                        (role.idCliente == null || role.idCliente == idCliente) &&
                        role.Role != null &&
                        role.Role.ToLower() != "mesa" &&
                        role.Role.ToLower() != "root" &&
                        role.Role.ToLower() != "telco");

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var term = search.Trim().ToLower();
                    query = query.Where(role => role.Role.ToLower().Contains(term));
                }

                var totalRecords = query.Count();

                var roles = query
                    .OrderBy(role => role.Role)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(role => role.RolePermissions)
                        .ThenInclude(rolePermission => rolePermission.Permission)
                    .ToList();

                return new RolePageResponse
                {
                    Items = roles.Select(ToResponse).ToList(),
                    Page = page,
                    PageSize = pageSize,
                    TotalRecords = totalRecords,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
                };
            }
        }

        // Consulta un rol personalizado de ese cliente.
        public RoleResponse GetRoleByClient(int idRole, int idCliente)
        {
            using (var ctx = new Entities())
            {
                var role = ctx.Roles
                    .AsNoTracking()
                    .Include(item => item.RolePermissions)
                        .ThenInclude(rolePermission => rolePermission.Permission)
                    .FirstOrDefault(item =>
                        item.id == idRole &&
                        item.idCliente == idCliente);

                return role == null ? null : ToResponse(role);
            }
        }

        public RoleResponse CreateRole(int idCliente, SaveRoleRequest request)
        {
            ValidateRequest(request);

            using (var ctx = new Entities())
            using (var transaction = ctx.Database.BeginTransaction())
            {
                if (!ctx.clients.Any(client => client.id == idCliente))
                    throw new InvalidOperationException("No existe el cliente indicado.");

                var roleName = request.Role.Trim();

                if (ctx.Roles.Any(role =>
                    role.idCliente == idCliente &&
                    role.Role == roleName))
                {
                    throw new InvalidOperationException(
                        "Ya existe un rol con ese nombre para este cliente.");
                }

                var permissionIds = GetPermissionIds(ctx, request.Permissions);

                var requestedPermissionIds = permissionIds
    .Distinct()
    .OrderBy(permissionId => permissionId)
    .ToArray();

                var rolesToCompare = ctx.Roles
                    .AsNoTracking()
                    .Include(existingRole => existingRole.RolePermissions)
                    .Where(existingRole =>
                        (existingRole.idCliente == null ||
                         existingRole.idCliente == idCliente) &&
                        existingRole.Role != null &&
                        existingRole.Role.ToLower() != "mesa" &&
                        existingRole.Role.ToLower() != "root" &&
                        existingRole.Role.ToLower() != "telco")
                    .ToList();

                var samePermissionsExist = rolesToCompare.Any(existingRole =>
                    existingRole.RolePermissions
                        .Select(rolePermission => rolePermission.PermissionId)
                        .OrderBy(permissionId => permissionId)
                        .SequenceEqual(requestedPermissionIds));

                if (samePermissionsExist)
                {
                    throw new InvalidOperationException(
                        "Ya existe un rol con los mismos permisos.");
                }

                var role = new Roles
                {
                    Role = roleName,
                    idCliente = idCliente,
                    CreatedAt = DateTime.UtcNow
                };

                ctx.Roles.Add(role);
                ctx.SaveChanges(); // Obtiene el ID generado para el rol.

                foreach (var permissionId in permissionIds)
                {
                    ctx.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.id,
                        PermissionId = permissionId
                    });
                }

                ctx.SaveChanges();
                transaction.Commit();

                return new RoleResponse
                {
                    Id = role.id,
                    Role = role.Role,
                    IdCliente = role.idCliente,
                    Permissions = request.Permissions.Distinct().ToList()
                };
            }
        }

        public RoleResponse UpdateRole(
            int idRole,
            int idCliente,
            SaveRoleRequest request)
        {
            ValidateRequest(request);

            using (var ctx = new Entities())
            using (var transaction = ctx.Database.BeginTransaction())
            {
                var role = ctx.Roles
                    .Include(item => item.RolePermissions)
                    .FirstOrDefault(item =>
                        item.id == idRole &&
                        item.idCliente == idCliente);

                if (role == null)
                    return null; // No existe para el cliente o es un rol global.

                var roleName = request.Role.Trim();

                if (ctx.Roles.Any(item =>
                    item.id != idRole &&
                    item.idCliente == idCliente &&
                    item.Role == roleName))
                {
                    throw new InvalidOperationException(
                        "Ya existe otro rol con ese nombre para este cliente.");
                }

                var permissionIds = GetPermissionIds(ctx, request.Permissions);

                role.Role = roleName;

                ctx.RolePermissions.RemoveRange(role.RolePermissions);

                foreach (var permissionId in permissionIds)
                {
                    ctx.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.id,
                        PermissionId = permissionId
                    });
                }

                ctx.SaveChanges();
                transaction.Commit();

                return new RoleResponse
                {
                    Id = role.id,
                    Role = role.Role,
                    IdCliente = role.idCliente,
                    CreatedAt = role.CreatedAt,
                    Permissions = request.Permissions.Distinct().ToList()
                };
            }
        }

        public bool DeleteRole(int idRole, int idCliente)
        {
            using (var ctx = new Entities())
            {
                var role = ctx.Roles.FirstOrDefault(item =>
                    item.id == idRole &&
                    item.idCliente == idCliente);

                if (role == null)
                    return false; // No existe para ese cliente o es un rol global.

                if (ctx.Users.Any(user => user.idRole == idRole) ||
                    ctx.UserRoles.Any(link => link.RoleId == idRole))
                {
                    throw new InvalidOperationException(
                        "No se puede eliminar el rol porque tiene usuarios asignados.");
                }

                // La relación Roles–RolePermission debe tener cascade delete.
                ctx.Roles.Remove(role);
                ctx.SaveChanges();

                return true;
            }
        }

        private static RoleResponse ToResponse(Roles role)
        {
            return new RoleResponse
            {
                Id = role.id,
                Role = role.Role,
                IdCliente = role.idCliente,
                CreatedAt = role.CreatedAt,
                Permissions = role.RolePermissions
                    .Where(item =>
                        item.Permission != null &&
                        item.Permission.IsActive)
                    .Select(item => item.Permission.PermissionCode)
                    .Distinct()
                    .ToList()
            };
        }

        private static List<int> GetPermissionIds(
            Entities ctx,
            List<string> requestedCodes)
        {
            var codes = (requestedCodes ?? new List<string>())
                .Where(code => !string.IsNullOrWhiteSpace(code))
                .Select(code => code.Trim())
                .Distinct()
                .ToList();

            if (codes.Count == 0)
                throw new ArgumentException("Selecciona al menos un permiso.");

            var permissions = ctx.Permissions
                .Where(permission =>
                    permission.IsActive &&
                    codes.Contains(permission.PermissionCode))
                .Select(permission => new
                {
                    permission.PermissionId,
                    permission.PermissionCode
                })
                .ToList();

            if (permissions.Count != codes.Count)
                throw new ArgumentException(
                    "Uno o más códigos de permiso no existen o están inactivos.");

            return permissions
                .Select(permission => permission.PermissionId)
                .ToList();
        }

        private static void ValidateRequest(SaveRoleRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.Role))
                throw new ArgumentException("El nombre del rol es obligatorio.");

            if (request.Role.Trim().Length > 50)
                throw new ArgumentException(
                    "El nombre del rol no puede exceder 50 caracteres.");
        }
        public bool AssignRoleToUser(
            int idCliente,
            int userId,
            IEnumerable<int> requestedRoleIds)
        {
            if (idCliente <= 0 || userId <= 0)
                throw new ArgumentException("Los identificadores de cliente y usuario deben ser válidos.");

            var roleIds = (requestedRoleIds ?? Enumerable.Empty<int>())
                .Distinct()
                .ToList();

            if (roleIds.Count == 0 || roleIds.Any(roleId => roleId <= 0))
                throw new ArgumentException("Selecciona al menos un rol válido.");

            using (var ctx = new Entities())
            using (var transaction = ctx.Database.BeginTransaction())
            {
                var user = ctx.Users.FirstOrDefault(item =>
                    item.Id == userId && item.IdCliente == idCliente);

                if (user == null)
                    return false;

                var roles = ctx.Roles
                    .Where(item =>
                    roleIds.Contains(item.id) &&
                    (item.idCliente == null || item.idCliente == idCliente) &&
                    item.Role != null &&
                    item.Role.ToLower() != "mesa" &&
                    item.Role.ToLower() != "root" &&
                    item.Role.ToLower() != "telco")
                    .ToList();

                if (roles.Count != roleIds.Count)
                    throw new ArgumentException("Uno o más roles no existen o no están disponibles para este cliente.");

                var defaultRoles = roles.Where(role => role.idCliente == null).ToList();
                var customRoles = roles.Where(role => role.idCliente != null).ToList();

                // Un rol predeterminado es excluyente; se pueden combinar roles personalizados.
                if (defaultRoles.Count > 1 ||
                    (defaultRoles.Count == 1 && customRoles.Count > 0))
                {
                    throw new ArgumentException(
                        "Selecciona un solo rol predeterminado o uno o más roles personalizados.");
                }

                var currentAssignments = ctx.UserRoles
                    .Where(link => link.UserId == userId)
                    .ToList();
                var requestedRoleIdSet = new HashSet<int>(roleIds);

                ctx.UserRoles.RemoveRange(currentAssignments.Where(link =>
                    !requestedRoleIdSet.Contains(link.RoleId)));

                var currentRoleIdSet = new HashSet<int>(
                    currentAssignments.Select(link => link.RoleId));
                foreach (var roleId in roleIds.Where(roleId =>
                    !currentRoleIdSet.Contains(roleId)))
                {
                    ctx.UserRoles.Add(new UserRole
                    {
                        UserId = userId,
                        RoleId = roleId,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                // Mantiene el campo legado para código que todavía lee users.idRole.
                user.idRole = defaultRoles.Count == 1
                    ? defaultRoles[0].id
                    : roleIds[0];
                ctx.SaveChanges();
                transaction.Commit();
                return true;
            }
        }
    }
}
