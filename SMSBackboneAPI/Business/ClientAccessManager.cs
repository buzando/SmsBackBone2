using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Modal.Model.Model;
using Modal;
using Microsoft.EntityFrameworkCore;

namespace Business
{
    public class ClientAccessManager
    {
        public const string EncryptionKey = "16CharEncryptKey"; 

        // Método para insertar nuevo acceso
        public static async Task<bool> InsertClientAccess(int clientId, string username, string password)
        {
            try
            {
                using var ctx = new Entities();

                var encryptedPassword = Encrypt(password);

                var access = new ClientAccess
                {
                    client_id = clientId,
                    username = username,
                    password = encryptedPassword,
                    created_at = DateTime.Now,
                    status = true
                };

                ctx.Client_Access.Add(access);
                await ctx.SaveChangesAsync();
                return true;
            }
            catch (Exception e)
            {
                // Aquí podrías loggear el error
                return false;
            }
        }

        // Método para obtener acceso por clientId
        public static async Task<ClientAccess?> GetClientAccessByClientId(int clientId)
        {
            using var ctx = new Entities();
            var access = await ctx.Client_Access.Where(c => c.client_id == clientId && c.status).FirstOrDefaultAsync();

            if (access != null)
            {
                access.password = Decrypt(access.password); 
            }

            return access;
        }


        // Método para actualizar acceso
        public static async Task<bool> UpdateClientAccess(int clientId, string newUsername, string newPassword)
        {
            try
            {
                using var ctx = new Entities();
                var access = await ctx.Client_Access.Where(c => c.client_id == clientId && c.status).FirstOrDefaultAsync();
                if (access == null)
                    return false;

                access.username = newUsername;
                access.password = Encrypt(newPassword);
                await ctx.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // Método para desactivar acceso
        public static async Task<bool> DeactivateClientAccess(int clientId)
        {
            try
            {
                using var ctx = new Entities();
                var access = await ctx.Client_Access.Where(c => c.client_id == clientId && c.status).FirstOrDefaultAsync();
                if (access == null)
                    return false;

                access.status = false;
                await ctx.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // === Métodos de encriptación y desencriptación ===

        public static string Encrypt(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(EncryptionKey); // 16 bytes
            aes.GenerateIV(); // IV aleatorio

            var encryptor = aes.CreateEncryptor();
            var plainBytes = Encoding.UTF8.GetBytes(plainText);
            var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

            // Combina IV + texto cifrado
            var result = new byte[aes.IV.Length + cipherBytes.Length];
            Array.Copy(aes.IV, 0, result, 0, aes.IV.Length);
            Array.Copy(cipherBytes, 0, result, aes.IV.Length, cipherBytes.Length);

            return Convert.ToBase64String(result);
        }


        public static string Decrypt(string cipherText)
        {
            var fullCipher = Convert.FromBase64String(cipherText);

            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(EncryptionKey);

            // Extrae IV
            var iv = new byte[16]; // AES block size = 128 bits = 16 bytes
            Array.Copy(fullCipher, 0, iv, 0, iv.Length);
            aes.IV = iv;

            var cipherBytes = new byte[fullCipher.Length - iv.Length];
            Array.Copy(fullCipher, iv.Length, cipherBytes, 0, cipherBytes.Length);

            var decryptor = aes.CreateDecryptor();
            var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);

            return Encoding.UTF8.GetString(plainBytes);
        }

    }
}
