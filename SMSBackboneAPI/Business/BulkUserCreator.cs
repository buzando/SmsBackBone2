using System;
using System.Collections.Generic;
using System.IO;
using ClosedXML.Excel;
using Contract.Request; // RegisterUser
using Business;        // ClientManager
using log4net;
using AutoMapper;
using Contract.Response;
using Modal.Model.Model;
using Modal;
using Newtonsoft.Json.Linq;
using System.Transactions;
using Contract;

namespace Business
{
    public class BulkUserCreator
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(BulkUserCreator));

        /// <summary>
        /// Lee un archivo .xlsx y crea usuarios + cliente + room + backbone.
        /// Envía correo tipo "NewClient" con contraseña temporal.
        /// </summary>
        /// <param name="excelPath">Ruta al .xlsx</param>
        /// <param name="sheetName">Nombre de la hoja (opcional). Si es null usa la 1era hoja.</param>
        public static void CreateUsersFromExcel(string excelPath, string sheetName = null)
        {
            if (string.IsNullOrWhiteSpace(excelPath) || !File.Exists(excelPath))
            {
                Console.WriteLine($"❌ No existe el archivo: {excelPath}");
                return;
            }

            Console.WriteLine($"📄 Leyendo: {excelPath}");
            int ok = 0, fail = 0, skip = 0;

            using (var wb = new XLWorkbook(excelPath))
            {
                var ws = string.IsNullOrWhiteSpace(sheetName) ? wb.Worksheet(1) : wb.Worksheet(sheetName);
                if (ws == null)
                {
                    Console.WriteLine($"❌ No encontré la hoja '{sheetName}'.");
                    return;
                }

                // Mapear encabezados (case-insensitive)
                var headerRow = ws.FirstRowUsed();
                var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach (var cell in headerRow.CellsUsed())
                {
                    var name = cell.GetString()?.Trim();
                    if (!string.IsNullOrEmpty(name) && !headers.ContainsKey(name))
                        headers[name] = cell.Address.ColumnNumber;
                }

                int GetCol(string header, bool required)
                {
                    if (headers.TryGetValue(header, out int c)) return c;
                    if (required) throw new Exception($"No se encontró la columna requerida: '{header}'");
                    return -1;
                }

                // Columnas requeridas
                int colClient = GetCol("Client", required: true);
                int colEmail = GetCol("Email", required: true);
                // Columnas opcionales
                int colFirstName = GetCol("FirstName", required: false);
                int colLastName = GetCol("LastName", required: false);
                int colPhone = GetCol("Phone", required: false);

                var row = headerRow.RowBelow();
                while (!row.IsEmpty())
                {
                    try
                    {
                        var client = row.Cell(colClient).GetString().Trim();
                        var email = row.Cell(colEmail).GetString().Trim();
                        var firstName = colFirstName > 0 ? row.Cell(colFirstName).GetString().Trim() : null;
                        var lastName = colLastName > 0 ? row.Cell(colLastName).GetString().Trim() : null;
                        var phone = colPhone > 0 ? row.Cell(colPhone).GetString().Trim() : null;

                        // Reglas mínimas
                        if (string.IsNullOrWhiteSpace(client) || string.IsNullOrWhiteSpace(email))
                        {
                            skip++;
                            Console.WriteLine($"⏭️  Fila {row.RowNumber()}: sin Client/Email, se omite.");
                            row = row.RowBelow();
                            continue;
                        }

                        // Construir request
                        var register = new RegisterUser
                        {
                            client = client,
                            email = email,
                            firstName = firstName,
                            lastName = lastName,
                            phone = phone,
                            // La Password real se genera dentro de RegisterUserAtomicWithTempPassword
                            // Campos de flags si aplican en tu modelo:
                            llamada = false,
                            sms = false,
                            emailConfirmation = email
                        };

                        // Crear usuario con password temporal + correo "NewClient"
                        var (usuario, clientId) = RegisterUserAtomicWithTempPassword(register);

                        if (usuario != null)
                        {
                            ok++;
                            Console.WriteLine($"✅ OK fila {row.RowNumber()}: {email} (cliente '{client}', clientId={clientId})");
                        }
                        else
                        {
                            fail++;
                            Console.WriteLine($"⚠️  Fila {row.RowNumber()}: respuesta nula para {email}");
                        }
                    }
                    catch (Exception ex)
                    {
                        fail++;
                        Console.WriteLine($"❌ Error fila {row.RowNumber()}: {ex.Message}");
                        log.Error($"Error fila {row.RowNumber()}", ex);
                    }

                    row = row.RowBelow();
                }
            }

            Console.WriteLine($"———\n✅ Exitosos: {ok} | ❌ Fallidos: {fail} | ⏭️ Omitidos: {skip}");
        }

        public static (UserDto usuario, int? clientId) RegisterUserAtomicWithTempPassword(RegisterUser register)
        {
            if (register == null) throw new ArgumentNullException(nameof(register));
            if (string.IsNullOrWhiteSpace(register.email) || string.IsNullOrWhiteSpace(register.client))
                throw new ArgumentException("Email y client son obligatorios.");

            // 🔑 Generar contraseña temporal
            var tempPassword = new ClientManager().GenerarPasswordTemporal(8);
            register.Password = tempPassword;

            // Verificar que no exista ya el correo
            var yaExiste = new UserManager().FindEmail(register.email) != null;
            if (yaExiste) throw new InvalidOperationException("DuplicateUserName");

            using (var scope = new TransactionScope(
                TransactionScopeOption.Required,
                new TransactionOptions { IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted },
                TransactionScopeAsyncFlowOption.Enabled))
            {
                var clientMgr = new ClientManager();
                var cliente = clientMgr.ObtenerClienteporNombre(register.client);
                if (cliente == null)
                {
                    var ok = clientMgr.AgregarCliente(new clientDTO { nombrecliente = register.client });
                    if (!ok) throw new Exception("Error al guardar cliente, intente más tarde");
                    cliente = clientMgr.ObtenerClienteporNombre(register.client);
                    if (cliente == null) throw new Exception("Cliente no disponible tras crear");
                }

                UserDto usuarioCreado;
                {
                    var passwordHash = SecurityHelper.GenerarPasswordHash(tempPassword);
                    var entity = new Modal.Model.Model.Users
                    {
                        accessFailedCount = 0,
                        Call = register.llamada,
                        clauseAccepted = false,
                        createDate = DateTime.Now,
                        email = register.email,
                        emailConfirmed = false,
                        firstName = register.firstName,
                        lastName = register.lastName,
                        lastPasswordChangeDate = DateTime.Now,
                        lockoutEnabled = false,
                        passwordHash = passwordHash,
                        phonenumber = register.phone,
                        SMS = register.sms,
                        userName = register.email,
                        lockoutEndDateUtc = null,
                        TwoFactorAuthentication = false,
                        status = true,
                        SecondaryEmail = register.emailConfirmation,
                        futurerooms = false,
                        IdCliente = cliente.id
                    };

                    using (var ctx = new Entities())
                    {
                        var idrole = ctx.Roles.Where(x => x.Role.ToLower() == "administrador")
                                              .Select(x => x.id)
                                              .FirstOrDefault();
                        entity.idRole = idrole;

                        var dup = ctx.Users.Any(u => u.email == entity.email);
                        if (dup) throw new InvalidOperationException("DuplicateUserName");

                        ctx.Users.Add(entity);
                        ctx.SaveChanges();

                        var config = new MapperConfiguration(cfg => cfg.CreateMap<Modal.Model.Model.Users, UserDto>());
                        var mapper = new Mapper(config);
                        usuarioCreado = mapper.Map<UserDto>(entity);
                        usuarioCreado.rol = ctx.Roles.Where(x => x.id == entity.idRole).Select(x => x.Role).FirstOrDefault();
                        usuarioCreado.Client = ctx.clients.Where(x => x.id == entity.IdCliente).Select(x => x.nombrecliente).FirstOrDefault();
                    }
                }

                var roomOk = new roomsManager().addroomByNewUser(usuarioCreado.Id, usuarioCreado.IdCliente);
                if (!roomOk) throw new Exception("Error al crear Room, intente más tarde");

                // Crear usuario también en Backbone
                if (ApiBackBoneManager.UseBackbone())
                {
                    var passwordBB =  new ClientManager().GenerarPasswordTemporalBackBone(16);
                    var adminTokenTask = new ApiBackBoneManager().LoginResponse(
                        Common.ConfigurationManagerJson("USRBACKBONE"),
                        Common.ConfigurationManagerJson("PSSBACKBONE")
                    );
                    var adminToken = adminTokenTask.Result;
                    if (adminToken == null || string.IsNullOrWhiteSpace(adminToken.token))
                        throw new Exception("No se pudo autenticar en Backbone.");

                    var createTask = new ApiBackBoneManager().CreateUser(
                        adminToken.token,
                        usuarioCreado.Client,
                        passwordBB,
                        usuarioCreado.email,
                        3,
                        ""
                    );
                    var userBackboneJson = createTask.GetAwaiter().GetResult();
                    var idBackbone = JObject.Parse(userBackboneJson)["id"].Value<int>();

                    var passEncrypt = ClientAccessManager.Encrypt(passwordBB);
                    using (var ctx = new Entities())
                    {
                        var clientAccess = new ClientAccess
                        {
                            client_id = cliente.id,
                            password = passEncrypt,
                            username = usuarioCreado.Client,
                            status = true,
                            created_at = DateTime.Now,
                            id_backbone = idBackbone
                        };
                        ctx.Client_Access.Add(clientAccess);
                        ctx.SaveChanges();
                    }

                    var addCreditResp = new ApiBackBoneManager()
                        .AddCredit(adminToken.token, idBackbone, 100)
                        .GetAwaiter()
                        .GetResult();
                }
                else
                {
                    log.Info("BACKBONE_ENABLED=false: se omite creación de usuario/credit en Backbone.");
                }

                scope.Complete();

                // 📧 Enviar correo tipo "NewClient" con contraseña temporal
                try
                {
                    string sitioFront = Common.ConfigurationManagerJson("UrlSitio");
                    string mensaje = MailManager.GenerateMailMessage(usuarioCreado.email, tempPassword, sitioFront, "NewClient");
                    MailManager.SendEmail(usuarioCreado.email, "Bienvenido a Red Quantum", mensaje);
                }
                catch (Exception exMail)
                {
                    log.Warn("No se pudo enviar el correo de nueva cuenta.", exMail);
                }

                return (usuarioCreado, cliente.id);
            }
        }

    }
}
