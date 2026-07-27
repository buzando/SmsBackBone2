using Business;
using ClosedXML.Excel;
using Contract;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model;
using Modal.Model.Model;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Text;

internal class Program
{
    private const int AdminRoleId = 3;
    private const string TemporaryPassword = "ContraseñaTmp1";
    private const string GenericPhoneNumber = "0000000000";

    // Si tu Excel tiene encabezados, déjalo en 2.
    // Si NO tiene encabezados y la primera fila ya trae cliente, cámbialo a 1.
    private const int FirstDataRow = 2;

    // =========================
    // SETTINGS PARA PRUEBA
    // =========================

    private const string DbConnection =
     @"Server=192.168.1.5;Database=SMS_WEB_API;User Id=sa;Password=nuxiba;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;";

    private const string UrlSitioRecuperacion =
        "https://localhost:7054/api/User/confirmationEmail";

    private const string UrlSitio =
        "https://quantum.nuxibacloud.com/quantum";

    private const string BackBoneUrl =
        "https://smsbackbone.nuxiba.com/api/";

    private const string UsrBackbone =
        "Admin";

    private const string PssBackbone =
        "123.abc";
    private const string BackboneStatusWebhookUrl =
    "https://quantum.nuxibacloud.com/QuantumApi/api/Message/Webhook/Status";
    // Si está en "0", NO crea usuario Backbone ni client_access.
    // Para crear Backbone, pon el valor que use tu ApiBackBoneManager.UseBackbone().
    // Normalmente podría ser "1" o "true", según cómo esté hecho el helper.
    private const string BackboneEnabled =
        "1";

    private const string UsrAutentification =
        "Nuxiba_Notificaciones";

    private const string PssAutentification =
        "Ghy78Tk-9";

    private const string ApiKey =
        "sk_e20e5b1bcc214ad4a973a6c022a8abbf";

    private const string MerchantId =
        "mbtsjmu4vcemvuwumxzb";

    private const string OpenPayProduction =
        "true";

    private const string OpenPayRedirectUrl =
        "http://localhost:55578/Quantum/AccountRecharge";

    private const string OpenPayRedirectUrlMyNumbers =
        "http://localhost:55578/Quantum/MyNumbers";

    private const string TotalPaginas =
        "50";

    private const string EmailReceivers =
        "hector.trejo@nuxiba.com";

    private const string ShortNumberSetupCost =
        "5";

    private const string ShortNumberMonthlyCost =
        "10";

    private const string LongNumberSetupCost =
        "10";

    private const string LongNumberMonthlyCost =
        "1";

    private const string ReactFolder =
        @"D:\work\SmsBackBone2\SMSBackboneAPI\smsbackbonefront\public\Download";

    private const string JwtIssuer =
        "https://localhost:7054";

    private const string JwtAudience =
        "https://localhost:7054";

    private const string SecretKey =
        "x8D!3Lr@2Kv#Pq9tY7b$Zr!cA5NmWjQe";

    private const string MaxCampaignsPerRoom =
        "200";

    private const string EmailFrom =
        "smsquantum@nuxiba.info";

    private const string EmailPassword =
        "Qu@ntum!Nux1b42026*";

    private const string EmailHost =
        "smtp.ionos.com";

    private const int EmailPort =
        587;

    private const bool EmailEnableSsl =
        true;

    private const string EmailBannerPath =
        @"C:\temp\banner.png";

    private const string EmailBannerUrl =
        "https://quantum.nuxibacloud.com/QuantumAPI/img/banner.png";

    private const bool UseExistingBackboneUserForRecovery = true;
    private const int ExistingBackboneIdForRecovery = 1071;
    private const string ExistingBackboneUsernameForRecovery = "H_Prueba_Carol_Quantum_001";
    private static void Main()
    {
        Console.WriteLine("Pon la ruta de tu archivo");
        var excelPath = Console.ReadLine();

        Console.OutputEncoding = Encoding.UTF8;

        EnsureRuntimeAppSettings();


        var notifyEmail = EmailReceivers;

        Console.WriteLine("=== Alta masiva de clientes ===");
        Console.WriteLine($"Excel: {excelPath}");
        Console.WriteLine($"Correo resumen: {notifyEmail}");
        Console.WriteLine();

        if (!File.Exists(excelPath))
        {
            Console.WriteLine($"❌ No existe el archivo: {excelPath}");
            return;
        }

        var ok = Import(excelPath, notifyEmail);

        Console.WriteLine();
        Console.WriteLine(ok
            ? "✅ Proceso terminado correctamente."
            : "⚠️ Proceso terminado con errores o advertencias. Revisa el correo/log.");
    }

    private static bool Import(string excelPath, string notifyEmail)
    {
        var created = new List<string>();
        var warnings = new List<string>();
        var errors = new List<string>();

        try
        {
            var rows = ReadExcel(excelPath);

            if (!rows.Any())
            {
                errors.Add("El Excel no tiene filas para procesar.");
                SendOnboardingSummaryEmail(notifyEmail, created, warnings, errors);
                return false;
            }

            Console.WriteLine($"Filas detectadas: {rows.Count}");
            Console.WriteLine();

            foreach (var row in rows)
            {
                Console.WriteLine($"Procesando fila {row.ExcelRowNumber}: {row.ClientName}");

                var missing = ValidateClientOnboardingRow(row);

                if (missing.Any())
                {
                    var msg = $"Fila {row.ExcelRowNumber}: faltan {string.Join(", ", missing)}";
                    errors.Add(msg);
                    Console.WriteLine($"❌ {msg}");
                    continue;
                }

                using var ctx = new Entities();
                using var tx = ctx.Database.BeginTransaction();

                try
                {
                    var clientName = row.ClientName.Trim();
                    var email = row.Email.Trim();

                    var existingClient = ctx.clients
                        .FirstOrDefault(x => x.nombrecliente == clientName);

                    if (existingClient != null)
                    {
                        var msg = $"Fila {row.ExcelRowNumber}: cliente ya existía y se omitió: {clientName}";
                        warnings.Add(msg);
                        Console.WriteLine($"⚠️ {msg}");
                        tx.Rollback();
                        continue;
                    }

                    var existingUser = ctx.Users
                        .FirstOrDefault(x => x.email == email || x.userName == email);

                    if (existingUser != null)
                    {
                        var msg = $"Fila {row.ExcelRowNumber}: usuario ya existía y se omitió: {email}";
                        warnings.Add(msg);
                        Console.WriteLine($"⚠️ {msg}");
                        tx.Rollback();
                        continue;
                    }

                    var backboneUsername = BuildBackboneUsername(clientName);

                    var existingBackbone = ctx.Client_Access
                        .FirstOrDefault(x => x.username == backboneUsername);

                    if (existingBackbone != null)
                    {
                        var msg = $"Fila {row.ExcelRowNumber}: usuario Backbone ya existía y se omitió: {backboneUsername}";
                        warnings.Add(msg);
                        Console.WriteLine($"⚠️ {msg}");
                        tx.Rollback();
                        continue;
                    }

                    var client = new clients
                    {
                        nombrecliente = clientName,
                        CreationDate = DateTime.Now,
                        RateForShort = row.RateForShort.Value,
                        RateForLong = row.RateForLong.Value,
                        Estatus = 1,
                        ShortRateType = 1,
                        LongRateType = 1,
                        ShortRateQty = null,
                        LongRateQty = null,
                        DeactivationDate = null,

                        // Este flag obliga a cambiar contraseña.
                        TmpPassword = true
                    };

                    ctx.clients.Add(client);
                    ctx.SaveChanges();

                    var initialShortCredits = row.InitialShortCredits.Value;
                    var initialLongCredits = row.InitialLongCredits.Value;
                    var totalCredits = initialShortCredits + initialLongCredits;

                    var room = new rooms
                    {
                        name = $"{clientName} - Default",
                        calls = 0,

                        // Total general
                        credits = totalCredits,

                        description = $"Room default para {clientName}",

                        // Créditos separados por tipo
                        short_sms = initialShortCredits,
                        long_sms = initialLongCredits
                    };

                    ctx.Rooms.Add(room);
                    ctx.SaveChanges();

                    var names = SplitFullName(row.ContactName);

                    var user = new Users
                    {
                        IdCliente = client.id,
                        userName = email,
                        firstName = names.firstName,
                        lastName = names.lastName,
                        status = true,
                        createDate = DateTime.Now,
                        lastPasswordChangeDate = DateTime.Now,
                        email = email,
                        emailConfirmed = true,
                        lockoutEndDateUtc = null,
                        lockoutEnabled = true,
                        accessFailedCount = 0,
                        idRole = AdminRoleId,
                        clauseAccepted = false,

                        // Teléfono genérico y 2FA apagado.
                        phonenumber = GenericPhoneNumber,
                        TwoFactorAuthentication = false,
                        SMS = false,
                        Call = false,

                        SecondaryEmail = "",
                        futurerooms = false,
                        extension = null
                    };

                    user.passwordHash = HashUserPassword(TemporaryPassword);

                    ctx.Users.Add(user);
                    ctx.SaveChanges();

                    ctx.roomsbyuser.Add(new roomsbyuser
                    {
                        idUser = user.Id,
                        idRoom = room.id
                    });

                    ctx.UserOnboarding.Add(new UserOnboarding
                    {
                        idUser = user.Id,
                        roomSelector = false,
                        homeActions = false,
                        campaigns = false,
                        blacklist = false,
                        paymentSettings = false,
                        userAdministration = false,
                        createDate = DateTime.Now,
                        updateDate = DateTime.Now
                    });

                    if (ApiBackBoneManager.UseBackbone())
                    {
                        int idBackboneFinal;

                        if (UseExistingBackboneUserForRecovery &&
                            backboneUsername.Equals(ExistingBackboneUsernameForRecovery, StringComparison.OrdinalIgnoreCase))
                        {
                            // RECUPERACIÓN:
                            // El usuario ya fue creado en Backbone y ya tiene crédito.
                            // No volvemos a llamar CreateUser ni AddCredit para no duplicar nada.
                            idBackboneFinal = ExistingBackboneIdForRecovery;

                            Console.WriteLine(
                                $"⚠️ Recuperando usuario Backbone ya existente: {backboneUsername} | id_backbone={idBackboneFinal}. No se vuelve a crear ni a cargar crédito."
                            );
                        }
                        else
                        {
                            var adminToken = new ApiBackBoneManager()
                                .LoginResponse(
                                    Common.ConfigurationManagerJson("USRBACKBONE"),
                                    Common.ConfigurationManagerJson("PSSBACKBONE")
                                )
                                .GetAwaiter()
                                .GetResult();

                            if (adminToken == null || string.IsNullOrWhiteSpace(adminToken.token))
                                throw new Exception("No se pudo autenticar en Backbone.");

                            var userBackboneJson = new ApiBackBoneManager()
                                .CreateUser(
                                    adminToken.token,
                                    backboneUsername,
                                    TemporaryPassword,
                                    email,
                                    3,
                                    BackboneStatusWebhookUrl
                                )
                                .GetAwaiter()
                                .GetResult();

                            if (string.IsNullOrWhiteSpace(userBackboneJson))
                                throw new Exception($"Backbone no regresó respuesta al crear usuario {backboneUsername}.");

                            var idBackbone = JObject.Parse(userBackboneJson)["id"]?.Value<int>();

                            if (!idBackbone.HasValue)
                                throw new Exception($"Backbone no regresó id al crear usuario {backboneUsername}. Respuesta: {userBackboneJson}");

                            idBackboneFinal = idBackbone.Value;

                            var backboneCredit = ToBackboneCredits(totalCredits, row.ExcelRowNumber, clientName);

                            var addCreditResp = new ApiBackBoneManager()
                                .AddCredit(adminToken.token, idBackboneFinal, backboneCredit)
                                .GetAwaiter()
                                .GetResult();

                            if (addCreditResp == null)
                                throw new Exception($"Backbone no regresó respuesta al agregar {backboneCredit} créditos al usuario {backboneUsername}.");

                            Console.WriteLine($"✅ Créditos agregados en Backbone para {backboneUsername}: {backboneCredit}");
                        }

                        var passEncrypt = ClientAccessManager.Encrypt(TemporaryPassword);

                        ctx.Client_Access.Add(new ClientAccess
                        {
                            client_id = client.id,
                            username = backboneUsername,
                            password = passEncrypt,
                            created_at = DateTime.Now,
                            status = true,
                            id_backbone = idBackboneFinal
                        });
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ BACKBONE_ENABLED=false/0. No se creó usuario Backbone ni Client_Access para {clientName}.");
                    }

                    ctx.SaveChanges();
                    tx.Commit();

                    bool welcomeEmailSent = false;

                    try
                    {
                        SendWelcomeEmail(email, TemporaryPassword);
                        welcomeEmailSent = true;
                    }
                    catch (Exception exMail)
                    {
                        var mailMsg =
                            $"Fila {row.ExcelRowNumber}: cliente creado, pero no se pudo enviar correo de bienvenida a {email}: {GetFullError(exMail)}";

                        warnings.Add(mailMsg);
                        Console.WriteLine($"⚠️ {mailMsg}");
                    }

                    var createdMsg =
                        $"Fila {row.ExcelRowNumber}: Cliente: {clientName} | Usuario: {email} | Room: {room.name} | Backbone: {backboneUsername} | Password temporal: {TemporaryPassword} | Correo bienvenida: {(welcomeEmailSent ? "Enviado" : "Falló")}";

                    created.Add(createdMsg);
                    Console.WriteLine($"✅ {createdMsg}");
                }
                catch (Exception exRow)
                {
                    tx.Rollback();

                    var msg = $"Fila {row.ExcelRowNumber}: error creando cliente {row.ClientName}: {GetFullError(exRow)}";
                    errors.Add(msg);
                    Console.WriteLine($"❌ {msg}");
                }

                Console.WriteLine();
            }

            SendOnboardingSummaryEmail(notifyEmail, created, warnings, errors);

            return !errors.Any();
        }
        catch (Exception ex)
        {
            var msg = $"Error general: {GetFullError(ex)}";
            errors.Add(msg);
            Console.WriteLine($"❌ {msg}");

            SendOnboardingSummaryEmail(notifyEmail, created, warnings, errors);
            return false;
        }
    }

    private static List<ClientOnboardingRow> ReadExcel(string excelPath)
    {
        var rows = new List<ClientOnboardingRow>();

        using var workbook = new XLWorkbook(excelPath);
        var ws = workbook.Worksheet(1);

        var rowNumber = FirstDataRow;

        while (true)
        {
            var clientName = CellText(ws.Cell(rowNumber, 1));
            var contactName = CellText(ws.Cell(rowNumber, 2));
            var email = CellText(ws.Cell(rowNumber, 3));

            var isEmptyRow =
                string.IsNullOrWhiteSpace(clientName) &&
                string.IsNullOrWhiteSpace(contactName) &&
                string.IsNullOrWhiteSpace(email);

            if (isEmptyRow)
                break;

            rows.Add(new ClientOnboardingRow
            {
                ExcelRowNumber = rowNumber,
                ClientName = clientName,
                ContactName = contactName,
                Email = email,

                // D: Tarifa corto
                RateForShort = GetDecimal(ws.Cell(rowNumber, 4)),

                // E: Tarifa largo
                RateForLong = GetDecimal(ws.Cell(rowNumber, 5)),

                // F: Inicial créditos cortos
                InitialShortCredits = GetDouble(ws.Cell(rowNumber, 6)),

                // G: Inicial créditos largos
                InitialLongCredits = GetDouble(ws.Cell(rowNumber, 7))
            });

            rowNumber++;
        }

        return rows;
    }

    private static List<string> ValidateClientOnboardingRow(ClientOnboardingRow row)
    {
        var missing = new List<string>();

        if (string.IsNullOrWhiteSpace(row.ClientName))
            missing.Add("Cliente");

        if (string.IsNullOrWhiteSpace(row.ContactName))
            missing.Add("Contacto");

        if (string.IsNullOrWhiteSpace(row.Email))
            missing.Add("Correo");

        if (!string.IsNullOrWhiteSpace(row.Email) && !IsValidEmail(row.Email))
            missing.Add("Correo válido");

        if (!row.RateForShort.HasValue)
            missing.Add("Tarifa corto");

        if (!row.RateForLong.HasValue)
            missing.Add("Tarifa largo");

        if (!row.InitialShortCredits.HasValue)
            missing.Add("Inicial créditos cortos");

        if (!row.InitialLongCredits.HasValue)
            missing.Add("Inicial créditos largos");

        return missing;
    }

    private static string HashUserPassword(string password)
    {
        return SecurityHelper.GenerarPasswordHash(password);
    }

    private static string BuildBackboneUsername(string clientName)
    {
        var clean = RemoveDiacritics(clientName.Trim());

        clean = clean
            .Replace(" ", "_")
            .Replace(".", "")
            .Replace(",", "")
            .Replace("-", "_")
            .Replace("/", "_")
            .Replace("\\", "_")
            .Replace("'", "")
            .Replace("\"", "");

        return $"H_{clean}";
    }

    private static (string firstName, string lastName) SplitFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return ("", "");

        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length == 1)
            return (parts[0], "");

        return (parts[0], string.Join(" ", parts.Skip(1)));
    }

    private static string CellText(IXLCell cell)
    {
        if (cell == null || cell.IsEmpty())
            return null;

        return cell.GetFormattedString()?.Trim();
    }

    private static decimal? GetDecimal(IXLCell cell)
    {
        if (cell == null || cell.IsEmpty())
            return null;

        try
        {
            if (cell.TryGetValue<decimal>(out var numericValue))
                return numericValue;
        }
        catch
        {
            // Si ClosedXML no lo puede leer como número, caemos al texto.
        }

        return ParseNullableDecimal(cell.GetFormattedString());
    }

    private static double? GetDouble(IXLCell cell)
    {
        if (cell == null || cell.IsEmpty())
            return null;

        try
        {
            if (cell.TryGetValue<double>(out var numericValue))
                return numericValue;
        }
        catch
        {
            // Si ClosedXML no lo puede leer como número, caemos al texto.
        }

        var parsed = ParseNullableDecimal(cell.GetFormattedString());

        if (!parsed.HasValue)
            return null;

        return Convert.ToDouble(parsed.Value);
    }

    private static decimal? ParseNullableDecimal(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var text = value
            .Replace("$", "")
            .Replace(" ", "")
            .Trim();

        // Casos:
        // 0.24       -> 0.24
        // 0,24       -> 0.24
        // 20,000     -> 20000
        // 2,000.50   -> 2000.50

        if (text.Contains(",") && text.Contains("."))
        {
            text = text.Replace(",", "");
        }
        else if (text.Contains(",") && !text.Contains("."))
        {
            var commaIndex = text.LastIndexOf(',');
            var digitsAfterComma = text.Length - commaIndex - 1;

            if (digitsAfterComma <= 2)
                text = text.Replace(",", ".");
            else
                text = text.Replace(",", "");
        }

        if (decimal.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
            return result;

        if (decimal.TryParse(text, NumberStyles.Any, new CultureInfo("es-MX"), out result))
            return result;

        return null;
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var mail = new MailAddress(email);
            return mail.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private static string RemoveDiacritics(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return text;

        var normalized = text.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();

        foreach (var c in normalized)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);

            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                builder.Append(c);
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    private static void SendOnboardingSummaryEmail(
        string to,
        List<string> created,
        List<string> warnings,
        List<string> errors
    )
    {
        if (string.IsNullOrWhiteSpace(to))
        {
            Console.WriteLine("⚠️ No se envió correo resumen porque notifyEmail viene vacío.");
            return;
        }

        var body = new StringBuilder();

        body.AppendLine("Resumen de alta de clientes");
        body.AppendLine();
        body.AppendLine($"Fecha: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        body.AppendLine();

        body.AppendLine("Creados:");
        body.AppendLine(created.Any()
            ? string.Join(Environment.NewLine, created.Select(x => "- " + x))
            : "- Ninguno");

        body.AppendLine();
        body.AppendLine("Advertencias:");
        body.AppendLine(warnings.Any()
            ? string.Join(Environment.NewLine, warnings.Select(x => "- " + x))
            : "- Ninguna");

        body.AppendLine();
        body.AppendLine("Errores:");
        body.AppendLine(errors.Any()
            ? string.Join(Environment.NewLine, errors.Select(x => "- " + x))
            : "- Ninguno");

        MailManager.SendEmail(
            to,
            "Resumen alta de clientes",
            body.ToString()
        );
    }

    private static void SendWelcomeEmail(string email, string temporaryPassword)
    {
        string sitioFront = Common.ConfigurationManagerJson("UrlSitio");

        string mensaje = MailManager.GenerateMailMessage(
            email,
            temporaryPassword,
            sitioFront,
            "NewClient"
        );

        MailManager.SendEmail(
            email,
            "Bienvenido a Red Quantum",
            mensaje
        );
    }

    private static string GetFullError(Exception ex)
    {
        var sb = new StringBuilder();

        var current = ex;

        while (current != null)
        {
            sb.Append(current.Message);

            if (current.InnerException != null)
                sb.Append(" | Inner: ");

            current = current.InnerException;
        }

        return sb.ToString();
    }

    private static void EnsureRuntimeAppSettings()
    {
        var json = BuildAppSettingsJson();

        var basePath = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
        File.WriteAllText(basePath, json, Encoding.UTF8);

        var currentPath = Path.Combine(Directory.GetCurrentDirectory(), "appsettings.json");

        if (!string.Equals(basePath, currentPath, StringComparison.OrdinalIgnoreCase))
        {
            File.WriteAllText(currentPath, json, Encoding.UTF8);
        }

        Console.WriteLine($"✅ appsettings.json temporal generado en: {basePath}");

        if (!string.Equals(basePath, currentPath, StringComparison.OrdinalIgnoreCase))
            Console.WriteLine($"✅ appsettings.json temporal generado también en: {currentPath}");

        Console.WriteLine();
    }

    private static string BuildAppSettingsJson()
    {
        return $@"
{{
  ""Logging"": {{
    ""LogLevel"": {{
      ""Default"": ""Information"",
      ""Microsoft.AspNetCore"": ""Warning""
    }}
  }},
  ""AllowedHosts"": ""*"",
  ""ConnectionStrings"": {{
    ""Conexion"": ""{EscapeJson(DbConnection)}""
  }},
  ""UrlSitioRecuperacion"": ""{EscapeJson(UrlSitioRecuperacion)}"",
  ""UrlSitio"": ""{EscapeJson(UrlSitio)}"",
  ""BackBoneURL"": ""{EscapeJson(BackBoneUrl)}"",
  ""USRBACKBONE"": ""{EscapeJson(UsrBackbone)}"",
  ""PSSBACKBONE"": ""{EscapeJson(PssBackbone)}"",
  ""BACKBONE_ENABLED"": ""{EscapeJson(BackboneEnabled)}"",
  ""USRAUTENTIFICATION"": ""{EscapeJson(UsrAutentification)}"",
  ""PSSAUTENTIFICATION"": ""{EscapeJson(PssAutentification)}"",
  ""APIKEY"": ""{EscapeJson(ApiKey)}"",
  ""MERCHANTID"": ""{EscapeJson(MerchantId)}"",
  ""OPENPAYPRODUCTION"": ""{EscapeJson(OpenPayProduction)}"",
  ""OPENPAY_REDIRECT_URL"": ""{EscapeJson(OpenPayRedirectUrl)}"",
  ""OPENPAY_REDIRECT_URL_MyNumbers"": ""{EscapeJson(OpenPayRedirectUrlMyNumbers)}"",
  ""TotalPaginas"": ""{EscapeJson(TotalPaginas)}"",
  ""EmailReceivers"": ""{EscapeJson(EmailReceivers)}"",
  ""ShortNumberSetupCost"": ""{EscapeJson(ShortNumberSetupCost)}"",
  ""ShortNumberMonthlyCost"": ""{EscapeJson(ShortNumberMonthlyCost)}"",
  ""LongNumberSetupCost"": ""{EscapeJson(LongNumberSetupCost)}"",
  ""LongNumberMonthlyCost"": ""{EscapeJson(LongNumberMonthlyCost)}"",
  ""ReactFolder"": ""{EscapeJson(ReactFolder)}"",
  ""JwtIssuer"": ""{EscapeJson(JwtIssuer)}"",
  ""JwtAudience"": ""{EscapeJson(JwtAudience)}"",
  ""SecretKey"": ""{EscapeJson(SecretKey)}"",
  ""MaxCampaignsPerRoom"": ""{EscapeJson(MaxCampaignsPerRoom)}"",
  ""ReportCleanup"": {{
    ""Enabled"": true,
    ""IntervalMinutes"": 10,
    ""MaxAgeHours"": 1
  }},
  ""EmailSettings"": {{
    ""From"": ""{EscapeJson(EmailFrom)}"",
    ""Password"": ""{EscapeJson(EmailPassword)}"",
    ""Host"": ""{EscapeJson(EmailHost)}"",
    ""Port"": {EmailPort},
    ""EnableSsl"": {EmailEnableSsl.ToString().ToLowerInvariant()},
    ""BannerPath"": ""{EscapeJson(EmailBannerPath)}"",
    ""BannerUrl"": ""{EscapeJson(EmailBannerUrl)}""
  }}
}}";
    }

    private static string EscapeJson(string value)
    {
        if (value == null)
            return "";

        return value
            .Replace("\\", "\\\\")
            .Replace("\"", "\\\"");
    }

    private static int ToBackboneCredits(double totalCredits, int excelRowNumber, string clientName)
    {
        if (totalCredits <= 0)
            throw new Exception($"Fila {excelRowNumber}: créditos iniciales inválidos para {clientName}. Total: {totalCredits}");

        var rounded = Math.Round(totalCredits, 0);

        if (Math.Abs(totalCredits - rounded) > 0.0001)
            throw new Exception($"Fila {excelRowNumber}: Backbone espera créditos enteros. Total recibido: {totalCredits}");

        if (rounded > int.MaxValue)
            throw new Exception($"Fila {excelRowNumber}: créditos exceden el máximo permitido. Total: {totalCredits}");

        return Convert.ToInt32(rounded);
    }
}

public class ClientOnboardingRow
{
    public int ExcelRowNumber { get; set; }

    public string ClientName { get; set; }
    public string ContactName { get; set; }
    public string Email { get; set; }

    public decimal? RateForShort { get; set; }
    public decimal? RateForLong { get; set; }

    public double? InitialShortCredits { get; set; }
    public double? InitialLongCredits { get; set; }
}