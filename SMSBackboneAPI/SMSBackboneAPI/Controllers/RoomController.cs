using Business;
using Contract;
using Contract.Request;
using Contract.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Modal.Model.Model;
using Newtonsoft.Json;
using SMSBackboneAPI.Service;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace SMSBackboneAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        string JwtIssuer = "Issuer";
        string JwtAudience = "Audience";
        private IConfiguration configuration;
        public RoomController(IConfiguration iConfig)
        {
            configuration = iConfig;
        }
        [HttpPost("NewRoom")]
        public async Task<IActionResult> NewRoom(roomsDTO rooms)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var RoomManager = new Business.roomsManager();
            var responseDto = RoomManager.addroom(rooms);
            if (!responseDto)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok();
                return response;
            }
        }

    

       [HttpPost("UpdateRoom")]
        public async Task<IActionResult> UpdateRoom(roomsDTO rooms)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var RoomManager = new Business.roomsManager();
            var responseDto = RoomManager.UpdateRoom(rooms);
            if (!responseDto)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok();
                return response;
            }
        }

        [HttpGet("DeleteRoom")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var RoomManager = new Business.roomsManager();
            var responseDto = RoomManager.DeleteRoom(id);
            if (!responseDto)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok();
                return response;
            }
        }


        [HttpGet("GetRoomsByClient")]
        public async Task<IActionResult> GetRoomsByClient(int Client)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var RoomManager = new Business.roomsManager();
            var responseDto = RoomManager.GetRoomsByClient(Client);
            if (responseDto.Count() == 0)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Creating ROOM" });



            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

        [HttpPost("TransferRoom")]
        public async Task<IActionResult> TransferRoom(acountmanagment rooms)
        {
            GeneralErrorResponseDto[] errorResponse = new GeneralErrorResponseDto[1];
            //var login = await ServiceRequest.GetRequest<LoginDto>(Request.Body);
            //if (login == null)
            //{
            //    return BadRequest("Sin request valido.");
            //}
            var RoomManager = new Business.roomsManager();
            var responseDto = RoomManager.TransferRoom(rooms);
            if (responseDto.Count() == 0)
            {


                return BadRequest(new GeneralErrorResponseDto() { code = "Error", description = "Transfering Room" });



            }
            else
            {
                var response = Ok(responseDto);
                return response;
            }
        }

    }
}
