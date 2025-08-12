using AutoMapper;
using Contract.Request;
using Contract.Response;
using Modal;
using Modal.Model.Model;
using Openpay.Entities;
using Openpay;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract;

namespace Business
{
    public class CreditsCardsManager
    {
        public List<creditcards> GetCardsByUser(int userid)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var creditscard = ctx.creditcards.Where(x => x.user_id == userid).ToList();
                    return creditscard;
                }
            }
            catch (Exception e)
            {
                return null;
            }

        }

        public string CreateOpenPayCustomerAndCard(CreditCardRequest creditCard, Users usuario)
        {
            try
            {
                var apiKey = Common.ConfigurationManagerJson("APIKEY");
                var merchantId = Common.ConfigurationManagerJson("MERCHANTID");
                var openpay = new OpenpayAPI(apiKey, merchantId);
                openpay.Production = bool.Parse(Common.ConfigurationManagerJson("OPENPAYPRODUCTION"));

                var newCustomer = new Openpay.Entities.Customer
                {
                    Name = usuario.firstName,
                    LastName = usuario.lastName,
                    Email = usuario.email,
                    PhoneNumber = usuario.phonenumber,
                    Address = new Openpay.Entities.Address
                    {
                        Line1 = $"{creditCard.street} {creditCard.interior_number} {creditCard.exterior_number}",
                        PostalCode = creditCard.postal_code,
                        State = creditCard.state,
                        City = creditCard.city,
                        CountryCode = "MX",
                    }
                };

                var customer = openpay.CustomerService.Create(newCustomer);

                var cardRequest = new Openpay.Entities.Card
                {
                    CardNumber = creditCard.card_number,
                    HolderName = creditCard.card_name,
                    ExpirationMonth = creditCard.expiration_month.ToString(),
                    ExpirationYear = creditCard.expiration_year.ToString().Substring(2),
                    Cvv2 = creditCard.CVV,
                    DeviceSessionId = "kR1v4EXgk0kpbv2e4HkQWg9oBytTR84f"
                };

                var card = openpay.CardService.Create(customer.Id, cardRequest);

                return $"{customer.Id}|{card.Id}";
            }
            catch (OpenpayException ex)
            {
                return $"OpenPay error: {ex.Description}";
            }
            catch (Exception ex)
            {
                return $"Error general: {ex.Message}";
            }
        }



        public string AddCreditCard2(CreditCardRequest creditCard)
        {
            try
            {
                var usuario = new Users();
                using (var ctx = new Entities())
                {
                    usuario = ctx.Users.Where(x => x.Id == creditCard.user_id).FirstOrDefault();
                }
                if (usuario == null)
                {
                    return "Error";
                }

                var token = CreateOpenPayCustomerAndCard(creditCard, usuario);
                if (token.ToLower().Contains("error"))
                {
                    return "Error";
                }
                string lastFour = "0000";
                if (!string.IsNullOrEmpty(creditCard.card_number) && creditCard.card_number.Length >= 4)
                    lastFour = creditCard.card_number[^4..];
                using (var ctx = new Entities())
                {
                    var tokencard = token.Split("|")[1];
                    var tokencustomer = token.Split("|")[0];
                    var creditscard = ctx.creditcards
                        .Where(x => x.token_id == tokencard && x.user_id == creditCard.user_id)
                        .FirstOrDefault(); 
                    if (creditscard != null)
                    {
                        return "Existe";
                    }
                    else
                    {
                        var creditcarddb = new creditcards
                        {
                            created_at = DateTime.Now,
                            user_id = creditCard.user_id,
                            card_name = creditCard.card_name,
                            card_number = "000000000000" + lastFour,
                            CVV = "000",
                            expiration_month = creditCard.expiration_month,
                            expiration_year = creditCard.expiration_year,
                            is_default = creditCard.is_default,
                            Type = creditCard.Type,
                            city = "ciudad",
                            exterior_number = "0",
                            interior_number = "0",
                            neighborhood = "",
                            postal_code = "",
                            state = "",
                            street = "",
                            token_id = tokencard,
                            token_id_customer = tokencustomer,
                        };
                        creditcarddb.created_at = DateTime.Now;
                        ctx.creditcards.Add(creditcarddb);
                        ctx.SaveChanges();
                    }
                    return string.Empty;
                }
            }
            catch (Exception e)
            {
                return "Error";
            }

        }

        public string AddCreditCard(CreditCardRequest creditCard)
        {
            try
            {
                var usuario = new Users();
                using (var ctx = new Entities())
                {
                    usuario = ctx.Users.Where(x => x.Id == creditCard.user_id).FirstOrDefault();
                }
                if (usuario == null)
                {
                    return "Error";
                }

                var random = new Random();
                string tokenCustomer = "cus_" + Guid.NewGuid().ToString("N").Substring(0, 16);
                string tokenCard = "kard_" + Guid.NewGuid().ToString("N").Substring(0, 16);
                var token = $"{tokenCustomer}|{tokenCard}";
                if (token.ToLower().Contains("error"))
                {
                    return "Error";
                }
                string lastFour = "0000";
                if (!string.IsNullOrEmpty(creditCard.card_number) && creditCard.card_number.Length >= 4)
                    lastFour = creditCard.card_number[^4..];
                using (var ctx = new Entities())
                {
                    var tokencard = token.Split("|")[1];
                    var tokencustomer = token.Split("|")[0];
                    var creditscard = ctx.creditcards
                        .Where(x => x.token_id == tokencard && x.user_id == creditCard.user_id)
                        .FirstOrDefault();
                    if (creditscard != null)
                    {
                        return "Existe";
                    }
                    else
                    {
                        var creditcarddb = new creditcards
                        {
                            created_at = DateTime.Now,
                            user_id = creditCard.user_id,
                            card_name = creditCard.card_name,
                            card_number = "000000000000" + lastFour,
                            CVV = "000",
                            expiration_month = creditCard.expiration_month,
                            expiration_year = creditCard.expiration_year,
                            is_default = creditCard.is_default,
                            Type = creditCard.Type,
                            city = "ciudad",
                            exterior_number = "0",
                            interior_number = "0",
                            neighborhood = "",
                            postal_code = "",
                            state = "",
                            street = "",
                            token_id = tokencard,
                            token_id_customer = tokencustomer,
                        };
                        creditcarddb.created_at = DateTime.Now;
                        ctx.creditcards.Add(creditcarddb);
                        ctx.SaveChanges();
                    }
                    return string.Empty;
                }
            }
            catch (Exception e)
            {
                return "Error";
            }

        }

        public bool DefaultCreditCard(int id)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var actualcard = ctx.creditcards.Where(x => x.is_default == true).FirstOrDefault();
                    if (actualcard?.Id == id)
                    {
                        return true;
                    }
                    else
                    {
                        if (actualcard != null)
                        {

                            actualcard.is_default = false;
                            ctx.SaveChanges();
                        }
                    }
                    var creditscard = ctx.creditcards.Where(x => x.Id == id).FirstOrDefault();
                    creditscard.is_default = true;
                    ctx.SaveChanges();
                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }

        }
        public bool DeleteCreditCard(int id)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var creditscard = ctx.creditcards.Where(x => x.Id == id).FirstOrDefault();
                    ctx.creditcards.Remove(creditscard);
                    ctx.SaveChanges();
                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }

        }
    }
}
