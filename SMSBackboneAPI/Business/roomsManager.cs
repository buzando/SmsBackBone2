using Contract.Request;
using Contract.Response;
using Modal;
using Modal.Model;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business
{
    public class roomsManager
    {
        public bool addroomByNewUser(int User, int client)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var room = new Modal.Model.Model.rooms { name = "Default", calls = 0, credits = 0, description = "Room default", long_sms = 0, short_sms = 0 };
                    ctx.Rooms.Add(room);
                    ctx.SaveChanges();

                    var roombyuser = new Modal.Model.Model.roomsbyuser { idRoom = room.id, idUser = User };
                    ctx.roomsbyuser.Add(roombyuser);
                    ctx.SaveChanges();

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }
        public bool ManageroomBystring(string rooms, int userid)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var allroms = ctx.roomsbyuser.Where(x => x.idUser == userid).ToList();
                    foreach (var room in rooms.Split(","))
                    {
                        var exiteroom = allroms.Where(x => x.idRoom == int.Parse(room)).FirstOrDefault();
                        if (exiteroom != null)
                        {
                            continue;
                        }
                        else
                        {
                            var rommbuyser = new Modal.Model.Model.roomsbyuser { idRoom = int.Parse(room), idUser = userid };
                            ctx.roomsbyuser.Add(rommbuyser);
                            ctx.SaveChanges();
                        }
                      
                    }

                    foreach(var room in allroms)
                    {
                        var exiteroom = rooms.Split(",").Where(x => x == room.idRoom.ToString()).FirstOrDefault();
                        if (exiteroom != null)
                        {
                            continue;
                        }
                        else
                        {
                            var roomdelete = ctx.roomsbyuser.Where(x => x.idRoom == room.idRoom).FirstOrDefault();
                            ctx.roomsbyuser.Remove(roomdelete);
                            ctx.SaveChanges();
                        }
                    }

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool UpdateRooms(string Rooms, int userid)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    foreach (var Room in Rooms.Split(","))
                    {
                        var room = ctx.roomsbyuser.Where(x => x.idUser == userid && x.idRoom == int.Parse(Room)).ToList();
                        if (room != null)
                        {
                            continue;
                        }
                        else
                        {
                            var rommbyuser = new roomsbyuser { idRoom = int.Parse(Room), idUser = userid };
                            ctx.roomsbyuser.Add(rommbyuser);
                            ctx.SaveChanges();
                        }
                     
                    }


                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool addroom(roomsDTO Newroom)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var room = new Modal.Model.Model.rooms { name = Newroom.name, calls = 0, credits = 0, description = Newroom.description, long_sms = 0, short_sms = 0 };
                    ctx.Rooms.Add(room);
                    ctx.SaveChanges();


                    var newRoomId = room.id;
                    var newrombyuser = new roomsbyuser { idUser = Newroom.iduser, idRoom = newRoomId };

                    ctx.roomsbyuser.Add(newrombyuser);
                    ctx.SaveChanges();

                    var cliente = ctx.Users.Where(x => x.Id == Newroom.iduser).Select(x => x.IdCliente).FirstOrDefault();

                    var usuarios = ctx.Users.Where(x => x.IdCliente == cliente && x.futurerooms == true).ToList();

                    foreach (var user in usuarios)
                    {
                        if (user.Id == Newroom.iduser)
                        {
                            continue;
                        }
                        ctx.roomsbyuser.Add(new roomsbyuser { idUser = user.Id, idRoom = newRoomId });
                        ctx.SaveChanges();
                    }
                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool UpdateRoom(roomsDTO Newroom)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var room = ctx.Rooms.Where(x => x.id == Newroom.id).FirstOrDefault();
                    room.name = Newroom.name;
                    room.description = Newroom.description;
                    ctx.SaveChanges();

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool DeleteRoom(int id)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var roomforeign = ctx.roomsbyuser.Where(x => x.idRoom == id).ToList();
                    ctx.roomsbyuser.RemoveRange(roomforeign);
                    ctx.SaveChanges();

                    var room = ctx.Rooms.Where(x => x.id == id).FirstOrDefault();
                    ctx.Rooms.Remove(room);
                    ctx.SaveChanges();

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public List<roomsDTO> GetRoomsByClient(int id)
        {
            var rooms = new List<roomsDTO>();
            try
            {
                using (var ctx = new Entities())
                {

                    rooms = ctx.roomsbyuser
    .Join(ctx.Rooms,
          rb => rb.idRoom,
          r => r.id,
          (rb, r) => new { rb, r })
    .Join(ctx.Users,
          combined => combined.rb.idUser,
          u => u.Id,
          (combined, u) => new { combined, u })
    .Join(ctx.clients,
          result => result.u.IdCliente,
          c => c.id,
          (result, c) => new { result.combined, c })
    .Where(result => result.c.id == id) // Filtro por ID del cliente
    .Select(result => new roomsDTO
    {
        id = result.combined.r.id,
        iduser = result.combined.rb.idUser,
        name = result.combined.r.name,
        description = result.combined.r.description,
        credits = result.combined.r.credits,
        long_sms = result.combined.r.long_sms,
        calls = result.combined.r.calls,
        idClient = result.c.id,
        short_sms = result.combined.r.short_sms
    })
    .AsEnumerable() // Cambia a evaluación en cliente
    .GroupBy(room => room.name) // Agrupamos por 'name'
    .Select(group => group.First()) // Seleccionamos el primer elemento de cada grupo
    .ToList();



                }
                return rooms;
            }
            catch (Exception e)
            {
                return new List<roomsDTO>();
            }

        }

        public List<rooms> TransferRoom(acountmanagment room)
        {
            var lista = new List<rooms>();
            try
            {
                using (var ctx = new Entities())
                {
                    var oldroomdb = (from r in ctx.Rooms
                                join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                                where r.name == room.oldRoom && rbu.idUser == room.idUser
                                select r).FirstOrDefault();

                    oldroomdb.credits = oldroomdb.credits - room.transfer;
                    if (room.Channel == "SMS Cortos")
                    {
                        oldroomdb.short_sms = oldroomdb.short_sms - room.transfer; 
                    }
                    if (room.Channel == "SMS Largos")
                    {
                        oldroomdb.long_sms = oldroomdb.long_sms - room.transfer;

                    }
                    ctx.SaveChanges();
                    lista.Add(oldroomdb);
                    var newRoom = (from r in ctx.Rooms
                                   join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                                   where r.name == room.newRoom && rbu.idUser == room.idUser
                                   select r).FirstOrDefault();
                    newRoom.credits = newRoom.credits + room.transfer;
                    if (room.Channel == "SMS Cortos")
                    {
                        newRoom.short_sms = newRoom.short_sms + room.transfer;
                    }
                    if (room.Channel == "SMS Largos")
                    {
                        newRoom.long_sms = newRoom.long_sms + room.transfer;

                    }
                    ctx.SaveChanges();
                    lista.Add(newRoom);
                }
                return lista;
            }
            catch (Exception e)
            {
                return lista;
            }
        }
    }
}
