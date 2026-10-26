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
        public List<RoleResponse> GetRolesByClient(int idCliente)
        {
            using (var ctx = new Entities())
            {
                var roles = ctx.Roles
                    .AsNoTracking()
                    .Include(role => role.RolePermissions)
                        .ThenInclude(rolePermission => rolePermission.Permission)
                    .Where(role =>
                        role.idCliente == null ||
                        role.idCliente == idCliente)
                    .OrderBy(role => role.Role)
                    .ToList();

                return roles.Select(ToResponse).ToList();
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

                var role = new Roles
                {
                    Role = roleName,
                    idCliente = idCliente
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

                if (ctx.Users.Any(user => user.idRole == idRole))
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
    }
}