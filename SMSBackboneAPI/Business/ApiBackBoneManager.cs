using Contract;
using Contract.Other;
using log4net;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Business
{
    public class ApiBackBoneManager
    {
        private static readonly ILog _logger =
            LogManager.GetLogger(typeof(SmsBalanceCheckManager));

        public static string _baseUrl = Common.ConfigurationManagerJson("BackBoneURL");
        public async Task<LoginResponse> LoginResponse(string usr, string pss)
        {
            try
            {
                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}user/login");

                var usuario = usr;
                var password = pss;

                var body = new
                {
                    username = usuario,
                    password = password
                };

                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                request.Content = content;

                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var loginResponse = JsonSerializer.Deserialize<LoginResponse>(responseBody);

                return loginResponse;
            }
            catch (Exception e)
            {
                return null;
            }
        }
        public async Task<SendResponse> SendCode(string phoneNumber, string token, LoginResponse tokenLogin)
        {
            try
            {
                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}message");

                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenLogin.token);

                var body = new
                {
                    text = "Su Codigo para ingresar al portal QUANTUM es el siguiente: " + token,
                    PhoneNumber = phoneNumber
                };

                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                request.Content = content;

                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var loginResponse = JsonSerializer.Deserialize<SendResponse>(responseBody);

                return loginResponse;
            }
            catch (Exception e)
            {
                return null;
            }
        }
        public async Task<SendResponse> SendTestMessage(string phoneNumber, string Message, LoginResponse tokenLogin)
        {
            try
            {
                var client = new HttpClient();
                var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}message");

                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokenLogin.token);

                var body = new
                {
                    text = Message,
                    PhoneNumber = phoneNumber
                };

                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                request.Content = content;

                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var loginResponse = JsonSerializer.Deserialize<SendResponse>(responseBody);

                return loginResponse;
            }
            catch (Exception e)
            {
                return null;
            }
        }
        public async Task<List<ApiResponse>> SendMessagesAsync(List<MessageToSend> messages, string token)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var json = JsonSerializer.Serialize(messages);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{_baseUrl}message/list", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<ApiResponse>>(responseBody);
        }

        private HttpClient CreateAuthenticatedClient(string token)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        public async Task<string> GetUsers(string token)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}api/user";
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> GetUserById(string token, int id)
        {

            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}api/user/{id}";
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        public async Task<string> CreateUser(
     string token,
     string username,
     string password,
     string email,
     int rol,
     string uri)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}user";

            var newUser = new
            {
                Username = username,
                Password = password,
                Email = email,
                Rol = rol,
                Uri = uri,
                Account = username
            };

            var content = new StringContent(
                JsonSerializer.Serialize(newUser),
                System.Text.Encoding.UTF8,
                "application/json"
            );

            var response = await client.PostAsync(url, content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Error {(int)response.StatusCode}: {response.ReasonPhrase}\n{responseContent}");
            }

            return responseContent;
        }
        public async Task<string> UpdateUser(string token, int id, string username, string email, string apiUrl)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}api/user/{id}";

            var updatedUser = new
            {
                Id = id,
                UserName = username,
                Email = email,
                ApiUrl = apiUrl
            };

            var content = new StringContent(JsonSerializer.Serialize(updatedUser), System.Text.Encoding.UTF8, "application/json");
            var response = await client.PutAsync(url, content);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        public async Task<string> DeleteUser(string token, int id)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}api/user/{id}";
            var response = await client.DeleteAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        public async Task<string> ToggleUserStatus(string token, int id)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}api/user/{id}/status";
            var response = await client.PatchAsync(url, null); // no necesita body
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        public async Task<string> AddCredit(string token, int id, int newCredit)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}user/{id}/credit";

            var content = new StringContent(JsonSerializer.Serialize(newCredit), System.Text.Encoding.UTF8, "application/json");
            var response = await client.PatchAsync(url, content);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        public async Task<string> GetOwnCredit(string token)
        {
            using var client = CreateAuthenticatedClient(token);
            var url = $"{_baseUrl}user/credit";
            var response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        public static bool UseBackbone()
        {
            var enabled = Common.ConfigurationManagerJson("BACKBONE_ENABLED");
            return enabled == "1" || enabled?.Equals("true", StringComparison.OrdinalIgnoreCase) == true;
        }
        public async Task<ApiResponse?> GetMessageStatusAsync(string token, string messageId)
        {
            try
            {
                using var client = CreateAuthenticatedClient(token);
                var url = $"{_baseUrl}message/{messageId}";

                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    var errorText = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Error al consultar estado del mensaje {messageId}: {response.StatusCode} - {errorText}");
                }

                var json = await response.Content.ReadAsStringAsync();
                var statusResponse = JsonSerializer.Deserialize<ApiResponse>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return statusResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en GetMessageStatusAsync({messageId}): {ex.Message}");
                return null;
            }
        }


        private bool TryFindCreditValue(JsonElement element, out double credit)
        {
            credit = 0;

            if (element.ValueKind == JsonValueKind.Number && element.TryGetDouble(out credit))
                return true;

            if (element.ValueKind == JsonValueKind.String &&
                double.TryParse(element.GetString(), out credit))
                return true;

            if (element.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in element.EnumerateObject())
                {
                    var name = prop.Name.ToLower();

                    if (
                        name == "credit" ||
                        name == "credits" ||
                        name == "saldo" ||
                        name == "balance" ||
                        name == "currentcredit" ||
                        name == "currentcredits"
                    )
                    {
                        if (TryFindCreditValue(prop.Value, out credit))
                            return true;
                    }

                    if (TryFindCreditValue(prop.Value, out credit))
                        return true;
                }
            }

            if (element.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in element.EnumerateArray())
                {
                    if (TryFindCreditValue(item, out credit))
                        return true;
                }
            }

            return false;
        }

    }
}
