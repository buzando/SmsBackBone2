using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contract.Response
{
    public class ExternalApiResponse<T>
    {
        public bool Success { get; set; }
        public string Code { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }

        public static ExternalApiResponse<T> Ok(T data, string message = "OK")
        {
            return new ExternalApiResponse<T>
            {
                Success = true,
                Code = "OK",
                Message = message,
                Data = data
            };
        }

        public static ExternalApiResponse<T> Fail(string code, string message)
        {
            return new ExternalApiResponse<T>
            {
                Success = false,
                Code = code,
                Message = message,
                Data = default
            };
        }


    }
}