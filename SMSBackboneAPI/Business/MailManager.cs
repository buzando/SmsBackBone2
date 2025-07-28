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
            MailMessage mailMessage = new MailMessage();
            mailMessage.From = new MailAddress(Common.ConfigurationManagerJson("EmailSettings:From"));

            // Separar los correos por coma y agregarlos uno por uno
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
                EnableSsl = bool.TryParse(Common.ConfigurationManagerJson("EmailSettings:EnableSsl"), out bool n) ? n : true,
                Credentials = new NetworkCredential(Common.ConfigurationManagerJson("EmailSettings:From"), Common.ConfigurationManagerJson("EmailSettings:Password")),
                Host = Common.ConfigurationManagerJson("EmailSettings:Host"),
                Port = int.TryParse(Common.ConfigurationManagerJson("EmailSettings:Port"), out int x) ? x : 587
            };

            try
            {
                client.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }


        public static string GenerateMailMessage(string email, string token, string url, string msgType)
        {
            string msgBody = "";
            var link = $"{url}?email={email}&token={token}";

            switch (msgType)
            {
                case "confirmation":
                    msgBody = $"<h1>Confirm Email</h1>" + $"Please click on the following link to confirm your email and complete the registration:<p>" +
                        $"<a href=\"{link}\">Confirm</a></p>";
                    break;
                case "recovery":
                    msgBody = $"<h1>Recorver Password</h1>" + $"Please click on the following link to change your password:<p>" +
                        $"<a href=\"{link}\">Recover Password</a></p>";
                    break;
                case "Code":
                    msgBody = $"<h1>2 step verification</h1> Inserta el siguiente Codigo para Iniciar Sesion: {token}";
                    break;
                case "Register":
                   var sitiofront = Common.ConfigurationManagerJson("UrlSitio");
                    link =  $"{sitiofront.Replace("Login", "ConfigurationAccount")}?email={email}";
                    msgBody = $"<h1>Register user</h1>" + $"Please click on the following link to finish your register:<p>" +
                       $"<a href=\"{link}\">Finish Register</a></p>";
                    break;
                case "NewClient":
                    var Login = Common.ConfigurationManagerJson("UrlSitio");
                    link = Login;
                    msgBody = $"<h1>Register user</h1>" + $"Porfavor ingrese al link con la siguiente contraseña: {token}<p>" +
                       $"<a href=\"{link}\">Login</a></p>";
                    break;
                default:
                    msgBody = "";
                    break;
            }

            return msgBody;
        }
    }
}
