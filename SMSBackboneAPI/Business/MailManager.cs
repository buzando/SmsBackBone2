using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Contract;

namespace Business
{
    public static class MailManager
    {
        public static bool SendEmail(string userEmail, string subject, string body)
        {
            try
            {
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(Common.ConfigurationManagerJson("EmailSettings:From"));

                // Soporte para múltiples destinatarios separados por coma
                foreach (var email in userEmail.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    mailMessage.To.Add(email.Trim());
                }

                mailMessage.Subject = subject;
                mailMessage.IsBodyHtml = true;
                mailMessage.Body = body;

                SmtpClient client = new SmtpClient
                {
                    UseDefaultCredentials = false,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    EnableSsl = bool.TryParse(Common.ConfigurationManagerJson("EmailSettings:EnableSsl"), out bool ssl) ? ssl : true,
                    Credentials = new NetworkCredential(
                        Common.ConfigurationManagerJson("EmailSettings:From"),
                        Common.ConfigurationManagerJson("EmailSettings:Password")
                    ),
                    Host = Common.ConfigurationManagerJson("EmailSettings:Host") ?? "smtp.ionos.com",
                    Port = int.TryParse(Common.ConfigurationManagerJson("EmailSettings:Port"), out int port) ? port : 587
                };

                client.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Error sending email: {ex.Message}");
                return false;
            }
        }

        public static string GenerateMailMessage(string email, string token, string url, string msgType)
        {
            string msgBody = "";
            var link = $"{url}?email={email}&token={token}";
            var bannerUrl = "https://quantum.nuxibacloud.com/QuantumAPI/img/banner.png";
            var loginUrl = Common.ConfigurationManagerJson("UrlSitio");
            switch (msgType)
            {
                case "confirmation":
                    var confirmLink = $"{url}?email={email}&token={token}";
                

                    msgBody = $@"<!DOCTYPE html>
<html lang=""es"" style=""margin: 0; padding: 0; box-sizing: border-box;"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Confirmar correo</title>
</head>
<body style=""margin: 0; box-sizing: border-box; font-family: sans-serif; background: #ffffff; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;"">
    <div style=""margin: 0 auto; box-sizing: border-box; padding: 40px; max-width: 600px; width: 100%; text-align: center;""> 

        <div style=""width: 100%; max-width: 600px; height: 207px; margin: 0 auto 40px; border-radius: 20px; overflow: hidden;"">
            <img src=""{bannerUrl}"" alt=""Quantum"" style=""width: 100%; height: auto; display: block;"">
        </div>

        <h1 style=""font-size: 40px; font-weight: 400; margin: 20px 0; color: #1a1a1a;"">¡Bienvenido a Quantum!</h1>

        <p style=""font-size: 18px; color: #333; margin-bottom: 40px;"">
            Para continuar usando tu cuenta, haz clic en el siguiente botón para confirmar tu dirección de correo:
        </p>

        <!-- Botón centrado (compatible con Outlook) -->
        <table role=""presentation"" align=""center"" style=""margin: 0 auto 25px auto;"">
          <tr>
            <td>
              <a href=""{confirmLink}"" style=""text-decoration: none;"">
                <div style=""margin: 0 auto; background: #813050; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;"">
                  CONFIRMAR EMAIL
                </div>
              </a>
            </td>
          </tr>
        </table>

        <p style=""font-size: 18px; font-weight: 400; color: #1a1a1a; line-height: 1.6; margin: 40px 0 20px;"">
            Este enlace solo será <strong>válido durante 24 horas</strong>. En caso de que expire, solicita uno nuevo.
        </p>

        <p style=""padding: 32px; text-align: center; color: #aaa; font-size: 12px;"">
            Copyright © 2025 Nuxiba
        </p>
    </div>
</body>
</html>";
                    break;

                case "recovery":
                    msgBody = $"<h1>Recorver Password</h1>" + $"Please click on the following link to change your password:<p>" +
                        $"<a href=\"{link}\">Recover Password</a></p>";
                    break;
                case "Code":
                    {
                        // Genera las celdas <td> para cada dígito del token
                        var tds = string.Join("", (token ?? "")
                            .Select(d => $@"<td style=""border:1px solid #333; width:50px; height:50px; text-align:center; font-size:24px; font-weight:500; border-radius:8px;"">{System.Net.WebUtility.HtmlEncode(d.ToString())}</td>"));

                        msgBody = $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8"">
  <title>Código de Verificación - Quantum</title>
</head>
<body style=""margin:0; padding:0; font-family:Poppins,Arial,sans-serif; background-color:#ffffff;"">

  <!-- Banner principal -->
  <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" align=""center"" width=""100%"" style=""max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden;"">
    <tr>
      <td style=""padding:0;"">
        <img src=""https://quantum.nuxibacloud.com/QuantumAPI/img/banner.png"" alt=""Quantum"" style=""display:block; width:100%; max-width:600px; height:auto; border-radius:12px 12px 0 0;"">
      </td>
    </tr>
    <tr>
      <td style=""padding:40px 20px; text-align:center;"">
        <h1 style=""font-size:32px; font-weight:600; margin:20px 0;"">¡Hola!</h1>
        <p style=""font-size:16px; color:#333333; margin-bottom:30px;"">Este es tu código para iniciar sesión:</p>

        <!-- Cajas de código -->
        <table role=""presentation"" cellspacing=""10"" cellpadding=""0"" border=""0"" align=""center"" style=""margin:auto;"">
          <tr>
            {tds}
          </tr>
        </table>

        <p style=""margin-top:30px; font-size:15px; font-weight:600; color:#000; line-height:1.4;"">
          Escribe el código en la plataforma y sigue los pasos que aparezcan en pantalla
        </p>

        <p style=""font-size:13px; color:#666; line-height:1.6; margin-top:20px;"">
          Válido durante 1 minuto.<br>
          En caso de que expire, tendrás que solicitar uno nuevo.
        </p>

        <p style=""font-size:12px; color:#aaa; margin-top:30px;"">Copyright © 2024 Nuxiba</p>
      </td>
    </tr>
  </table>

</body>
</html>";
                        break;
                    }


                case "Register":

                    msgBody = $@"<!DOCTYPE html>
<html lang=""es"" style=""margin: 0; padding: 0; box-sizing: border-box;"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Bienvenida pwd</title>
</head>
<body style=""margin: 0; box-sizing: border-box; font-family: sans-serif; background: #ffffff; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;"">
    <div style=""margin: 0 auto; box-sizing: border-box; padding: 40px; max-width: 600px; width: 100%; text-align: center;""> 

        <div style=""width: 100%; max-width: 600px; height: 207px; margin: 0 auto 40px; border-radius: 20px; overflow: hidden;"">
            <img src=""{bannerUrl}"" alt=""Quantum"" style=""width: 100%; height: auto; display: block;"">
        </div>

        <h1 style=""font-size: 40px; font-weight: 400; margin: 20px 0; color: #1a1a1a;"">¡Bienvenido a Quantum!</h1>

        <p style=""font-size: 18px; color: #333; margin-bottom: 12px;"">
           Usted hacreado un usuario en el portal Quantum.
        </p>
        
        <p style=""font-size: 18px; color: #333; margin-bottom: 40px; font-weight: 500;"">
            Para comenzar a utilizar tu cuenta, haz clic en el siguiente botón e ingresa la contraseña proporcionada en este correo.
        </p>

        <!-- Botón centrado -->
        <table role=""presentation"" align=""center"" style=""margin: 0 auto 25px auto;"">
          <tr>
            <td>
              <a href=""{loginUrl}"" style=""text-decoration: none;"">
                <div style=""margin: 0 auto; background: #813050; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;"">
                  ACCEDE A TU CUENTA
                </div>
              </a>
            </td>
          </tr>
        </table>
        <p style=""padding: 32px; text-align: center; color: #aaa; font-size: 12px;"">
            Copyright © 2025 Nuxiba
        </p>
    </div>
</body>
</html>";
                    break;
                case "NewClient":


                    msgBody = $@"<!DOCTYPE html>
<html lang=""es"" style=""margin: 0; padding: 0; box-sizing: border-box;"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Bienvenida pwd</title>
</head>
<body style=""margin: 0; box-sizing: border-box; font-family: sans-serif; background: #ffffff; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px;"">
    <div style=""margin: 0 auto; box-sizing: border-box; padding: 40px; max-width: 600px; width: 100%; text-align: center;""> 

        <div style=""width: 100%; max-width: 600px; height: 207px; margin: 0 auto 40px; border-radius: 20px; overflow: hidden;"">
            <img src=""{bannerUrl}"" alt=""Quantum"" style=""width: 100%; height: auto; display: block;"">
        </div>

        <h1 style=""font-size: 40px; font-weight: 400; margin: 20px 0; color: #1a1a1a;"">¡Bienvenido a Quantum!</h1>

        <p style=""font-size: 18px; color: #333; margin-bottom: 12px;"">
            Un administrador de tu empresa te ha creado un usuario en el portal Quantum.
        </p>
        
        <p style=""font-size: 18px; color: #333; margin-bottom: 40px; font-weight: 500;"">
            Para comenzar a utilizar tu cuenta, haz clic en el siguiente botón e ingresa la contraseña proporcionada en este correo.
        </p>

        <!-- Botón centrado -->
        <table role=""presentation"" align=""center"" style=""margin: 0 auto 25px auto;"">
          <tr>
            <td>
              <a href=""{loginUrl}"" style=""text-decoration: none;"">
                <div style=""margin: 0 auto; background: #813050; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-size: 18px; font-weight: 600; display: inline-block;"">
                  ACCEDE A TU CUENTA
                </div>
              </a>
            </td>
          </tr>
        </table>

        <p style=""font-size: 18px; color: #333; margin-bottom: 8px; margin-top: 40px;"">
            Tu contraseña es: <strong>{token}</strong>
        </p>

        <p style=""line-height: 1.6; color: #666; font-size: 14px; margin-bottom: 20px;"">
            Por seguridad, recuerda no compartir esta contraseña con nadie más.
        </p>
        
        <p style=""padding: 32px; text-align: center; color: #aaa; font-size: 12px;"">
            Copyright © 2025 Nuxiba
        </p>
    </div>
</body>
</html>";
                    break;

                default:
                    msgBody = "";
                    break;
            }

            return msgBody;
        }
    }
}
