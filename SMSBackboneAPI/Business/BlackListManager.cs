using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contract.Response;
using Modal;
using Modal.Model.Model;
using ClosedXML.Excel;
using Contract.Request;
using System.Text.RegularExpressions;

namespace Business
{
    public class BlackListManager
    {
        public List<BlackListResponse> GetRecordsByUser(int id)
        {
            var lista = new List<BlackListResponse>();
            try
            {
                using (var ctx = new Entities())
                {
                    lista = lista = ctx.BlackList
    .Where(x => x.idroom == id)
    .GroupBy(x => x.Name)
    .Select(g => new BlackListResponse
    {
        id = g.First().Id,
        CreationDate = g.First().CreationDate,
        ExpirationDate = g.First().ExpirationDate,
        Name = g.Key,
        Quantity = g.Count(),
        HasActiveCampaign = (from blc in ctx.blacklistcampains
                             join c in ctx.Campaigns on blc.idcampains equals c.Id
                             where blc.idblacklist == g.First().Id && c.AutoStart
                             select blc.id).Any()
    })
    .ToList();


                }
            }
            catch (Exception e)
            {
                return lista;
            }
            return lista;
        }

        public bool ProcessExcelBase64(BlackListRequest blacklistfile)
        {
            try
            {

                var archivoBytes = Convert.FromBase64String(blacklistfile.FileBase64);
                var telefonos = new List<string>();

                using (var stream = new MemoryStream(archivoBytes))
                using (var workbook = new XLWorkbook(stream))
                {
                    var hoja = workbook.Worksheet(1);
                    int fila = 1;

                    while (true)
                    {
                        var celda = hoja.Cell($"A{fila}").GetString()?.Trim();
                        if (string.IsNullOrEmpty(celda))
                            break;

                        telefonos.Add(celda);
                        fila++;
                    }
                }

                using (var ctx = new Entities())
                {

                    var entidades = telefonos
                        .Distinct()
                        .Select(t => new BlackList
                        {
                            Name = blacklistfile.Name,
                            phone = t,
                            ExpirationDate = blacklistfile.ExpirationDate,
                            idroom = blacklistfile.IdRoom,
                            CreationDate = DateTime.Now
                        }).ToList();

                    ctx.BlackList.AddRange(entidades);
                    ctx.SaveChanges();

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool SavePhoneList(BlackListRequest blacklistfile)
        {
            try
            {
                using (var ctx = new Entities())
                {

                    var entidades = blacklistfile.Phones
                        .Distinct()
                        .Select(t => new BlackList
                        {
                            Name = blacklistfile.Name,
                            phone = t,
                            ExpirationDate = blacklistfile.ExpirationDate,
                            idroom = blacklistfile.IdRoom,
                            CreationDate = DateTime.Now
                        }).ToList();

                    ctx.BlackList.AddRange(entidades);
                    ctx.SaveChanges();

                }
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public bool UpdateBlacklist(UpdateBlackList black)
        {
            try
            {
                using (var ctx = new Entities())
                {
                    var Names = ctx.BlackList.Where(x => x.Name == black.oldname).ToList();
                    foreach (var item in Names)
                    {
                        item.Name = black.newname;
                        if (black.expiration.HasValue)
                        {
                            item.ExpirationDate = black.expiration;
                        }
                    }
                    ctx.SaveChanges();
                }
                return true;
            }
            catch (Exception w)
            {
                return false;
            }
        }

        public bool ProcessExcelUpdateBase64(BlackListManagment blacklistfile)
        {
            try
            {
                var archivoBytes = Convert.FromBase64String(blacklistfile.FileBase64);
                var telefonosNuevos = new List<string>();
                var datosNuevos = new List<string>();

                using (var stream = new MemoryStream(archivoBytes))
                using (var workbook = new XLWorkbook(stream))
                {
                    var hoja = workbook.Worksheet(blacklistfile.SheetName);
                    var tieneEncabezado = !blacklistfile.OmitHeaders;

                    // Obtener encabezados de la primera fila
                    var headers = hoja.Row(1).Cells().Select((c, index) => new { Header = c.GetString()?.Trim(), Index = index + 1 }).ToList();

                    var index1 = headers.FirstOrDefault(h => h.Header == blacklistfile.ColumnPhone)?.Index ?? -1;
                    var index2 = headers.FirstOrDefault(h => h.Header == blacklistfile.ColumnData)?.Index ?? -1;

                    if (index1 == -1 || index2 == -1)
                        throw new Exception("No se encontraron ambas columnas especificadas");

                    // Verificar cuál columna tiene datos con formato de teléfono (al menos 10 dígitos)
                    int filaVerificacion = tieneEncabezado ? 2 : 1;
                    int conteo1 = 0, conteo2 = 0;

                    for (int f = filaVerificacion; f < filaVerificacion + 10; f++)
                    {
                        var v1 = hoja.Cell(f, index1).GetString()?.Trim();
                        var v2 = hoja.Cell(f, index2).GetString()?.Trim();
                        if (!string.IsNullOrEmpty(v1) && v1.Count(char.IsDigit) >= 10) conteo1++;
                        if (!string.IsNullOrEmpty(v2) && v2.Count(char.IsDigit) >= 10) conteo2++;
                    }

                    var indexPhone = conteo1 >= conteo2 ? index1 : index2;
                    var indexData = conteo1 >= conteo2 ? index2 : index1;

                    int fila = tieneEncabezado ? 2 : 1;
                    while (true)
                    {
                        var celdaTelefono = hoja.Cell(fila, indexPhone).GetString()?.Trim();
                        var celdaDato = hoja.Cell(fila, indexData).GetString()?.Trim();

                        if (string.IsNullOrEmpty(celdaTelefono))
                            break;

                        Regex regexTelefono = new Regex(@"^\d{10}$");
                        if (regexTelefono.IsMatch(celdaTelefono))
                        {
                            telefonosNuevos.Add(celdaTelefono);
                            datosNuevos.Add(celdaDato);
                        }
                        else
                        {
                            telefonosNuevos.Add(celdaDato);
                            datosNuevos.Add(celdaTelefono);
                        }


                        fila++;
                    }
                }

                using (var ctx = new Entities())
                {
                    if (blacklistfile.Operation?.ToLower() == "eliminar")
                    {
                        var registrosAEliminar = ctx.BlackList
                            .Where(x => x.idroom == blacklistfile.IdRoom && x.Name == blacklistfile.Name && telefonosNuevos.Contains(x.phone))
                            .ToList();

                        if (registrosAEliminar.Any())
                        {
                            var idsABorrar = registrosAEliminar.Select(x => x.Id).ToList();

                            var relaciones = ctx.blacklistcampains.Where(bc => idsABorrar.Contains(bc.idblacklist)).ToList();
                            ctx.blacklistcampains.RemoveRange(relaciones);
                            ctx.SaveChanges();
                            ctx.BlackList.RemoveRange(registrosAEliminar);
                            ctx.SaveChanges();
                        }

                        return true;
                    }

                    if (blacklistfile.Operation?.ToLower() == "actualizar")
                    {
                        var registrosExistentes = ctx.BlackList
                      .Where(x => x.idroom == blacklistfile.IdRoom && x.Name == blacklistfile.Name)
                      .ToList();
                        // Obtener IDs antes de eliminar

                        var idsABorrar = registrosExistentes.Select(x => x.Id).ToList();

                        // Obtener campañas asociadas antes de eliminar
                        var campañasAsociadas = ctx.blacklistcampains
                            .Where(bc => idsABorrar.Contains(bc.idblacklist))
                            .Select(bc => bc.idcampains)
                            .Distinct()
                            .ToList();



                        // Eliminar registros actuales
                        var relaciones = ctx.blacklistcampains.Where(bc => idsABorrar.Contains(bc.idblacklist)).ToList();
                        ctx.blacklistcampains.RemoveRange(relaciones);
                        ctx.SaveChanges();
                        ctx.BlackList.RemoveRange(registrosExistentes);
                        ctx.SaveChanges();

                        var expiration = registrosExistentes.FirstOrDefault()?.ExpirationDate;
                        // Insertar nuevos registros
                        var nuevosRegistros = telefonosNuevos
                            .Select((telefono, index) => new BlackList
                            {
                                Name = blacklistfile.Name,
                                phone = telefono,
                                ExpirationDate = expiration,
                                idroom = blacklistfile.IdRoom,
                                CreationDate = DateTime.Now
                            }).ToList();

                        ctx.BlackList.AddRange(nuevosRegistros);
                        ctx.SaveChanges();

                        // Reasignar campañas si las había
                        if (campañasAsociadas.Any())
                        {
                            var nuevasAsociaciones = nuevosRegistros
                                .SelectMany(nuevo => campañasAsociadas.Select(idCamp => new blacklistcampains
                                {
                                    idblacklist = nuevo.Id,
                                    idcampains = idCamp
                                }))
                                .ToList();

                            ctx.blacklistcampains.AddRange(nuevasAsociaciones);
                            ctx.SaveChanges();
                        }

                        return true;
                    }


                    if (blacklistfile.Operation?.ToLower() == "agregar")
                    {


                        var listaExistente = ctx.BlackList
                            .Where(x => x.idroom == blacklistfile.IdRoom && x.Name == blacklistfile.Name)
                            .ToList();

                        var expiration = listaExistente.FirstOrDefault()?.ExpirationDate;
                        var telefonosExistentes = listaExistente.Select(x => x.phone).ToHashSet();

                        var nuevosRegistros = telefonosNuevos
                            .Select((telefono, index) => new { Telefono = telefono, Dato = datosNuevos[index] })
                            .Where(x => !telefonosExistentes.Contains(x.Telefono))
                            .Select(x => new BlackList
                            {
                                Name = blacklistfile.Name,
                                phone = x.Telefono,
                                ExpirationDate = expiration,
                                idroom = blacklistfile.IdRoom,
                                CreationDate = DateTime.Now
                            })
                            .ToList();

                        ctx.BlackList.AddRange(nuevosRegistros);
                        ctx.SaveChanges();

                        // Heredar campañas asociadas si existen
                        var primerIdExistente = listaExistente.FirstOrDefault()?.Id;

                        if (primerIdExistente != null)
                        {
                            var campañasAsociadas = ctx.blacklistcampains
                                .Where(bc => bc.idblacklist == primerIdExistente)
                                .Select(bc => bc.idcampains)
                                .ToList();

                            if (campañasAsociadas.Any() && nuevosRegistros.Any())
                            {
                                var nuevasAsociaciones = nuevosRegistros
                                    .SelectMany(nuevo => campañasAsociadas.Select(idCamp => new blacklistcampains
                                    {
                                        idblacklist = nuevo.Id,
                                        idcampains = idCamp
                                    }))
                                    .ToList();

                                ctx.blacklistcampains.AddRange(nuevasAsociaciones);
                                ctx.SaveChanges();
                            }
                        }
                    }
                }

                return true;
            }
            catch (Exception e)
            {
                // log error si es necesario
                return false;
            }
        }

        public BlackListResponseRecords GetRecordsBlackList(BlackListRecords black)
        {
            var list = new BlackListResponseRecords();
            try
            {
                using (var ctx = new Entities())
                {
                    list.BlackListPhones = ctx.BlackList.Where(x => x.idroom == black.id && x.Name == black.name).Select(x => new BlackListPhones { phone = x.phone, dato = x.Name }).ToList();

                    list.Campains = (from bl in ctx.BlackList
                                     join blc in ctx.blacklistcampains on bl.Id equals blc.idblacklist
                                     join c in ctx.Set<Campaigns>() on blc.idcampains equals c.Id
                                     where bl.Name == black.name && bl.idroom == black.id
                                     select new CampainsBlackListResponse
                                     {
                                         Chanel = "SMS", // puedes hacerlo dinámico si tienes más canales
                                         CampainName = c.Name
                                     }).ToList();
                }
                return list;
            }
            catch (Exception w)
            {
                return null;
            }
        }
        public bool UpdateRecordsBlackList(BlackListManagment black)
        {
            try
            {
                using (var ctx = new Entities())
                {

                    if (black.Operation?.ToLower() == "eliminar")
                    {
                        if (!string.IsNullOrEmpty(black.eliminationname))
                        {
                            // Buscar todos los phones que correspondan a la eliminación por nombre
                            var phonesToDelete = ctx.BlackList
                                .Where(x => x.idroom == black.IdRoom && x.Name == black.eliminationname)
                                .Select(x => x.phone)
                                .ToList();

                            // Buscar registros que coincidan por phone en la lista original (black.Name)
                            var idsABorrar = ctx.BlackList
                                .Where(x => x.idroom == black.IdRoom && x.Name == black.Name && phonesToDelete.Contains(x.phone))
                                .Select(x => x.Id)
                                .ToList();

                            // Eliminar relaciones primero
                            var relaciones = ctx.blacklistcampains.Where(bc => idsABorrar.Contains(bc.idblacklist)).ToList();
                            ctx.blacklistcampains.RemoveRange(relaciones);
                            ctx.SaveChanges();

                            // Luego eliminar registros
                            var registros = ctx.BlackList.Where(x => idsABorrar.Contains(x.Id)).ToList();
                            ctx.BlackList.RemoveRange(registros);
                            ctx.SaveChanges();

                            return true;
                        }
                        else
                        {

                            // Eliminar de la tabla de campañas asociadas
                            var idsABorrar = ctx.BlackList
                                .Where(x => x.idroom == black.IdRoom && x.Name == black.Name && black.Phones.Contains(x.phone))
                                .Select(x => x.Id)
                                .ToList();

                            var relaciones = ctx.blacklistcampains.Where(bc => idsABorrar.Contains(bc.idblacklist)).ToList();
                            ctx.blacklistcampains.RemoveRange(relaciones);
                            ctx.SaveChanges();
                            var registros = ctx.BlackList.Where(x => idsABorrar.Contains(x.Id)).ToList();
                            ctx.BlackList.RemoveRange(registros);

                            ctx.SaveChanges();
                            return true;
                        }
                    }

                    if (black.Operation?.ToLower() == "agregar")
                    {


                        var lista = ctx.BlackList
                            .Where(x => x.idroom == black.IdRoom && x.Name == black.Name)
                            .ToList();

                        var telefonosExistentes = lista.Select(x => x.phone).ToHashSet();
                        var nuevosTelefonos = black.Phones?.Where(t => !telefonosExistentes.Contains(t)).Distinct().ToList();

                        if (nuevosTelefonos != null && nuevosTelefonos.Any())
                        {
                            var expiration = lista.FirstOrDefault()?.ExpirationDate;

                            var nuevosRegistros = nuevosTelefonos.Select(t => new BlackList
                            {
                                Name = black.Name,
                                phone = t,
                                idroom = black.IdRoom,
                                ExpirationDate = expiration,
                                CreationDate = DateTime.Now
                            }).ToList();

                            ctx.BlackList.AddRange(nuevosRegistros);
                            ctx.SaveChanges();

                            // Heredar campañas asociadas
                            var primerIdExistente = lista.FirstOrDefault()?.Id;
                            if (primerIdExistente != null)
                            {
                                var campañasAsociadas = ctx.blacklistcampains
                                    .Where(bc => bc.idblacklist == primerIdExistente)
                                    .Select(bc => bc.idcampains)
                                    .ToList();

                                if (campañasAsociadas.Any())
                                {
                                    var nuevasAsociaciones = nuevosRegistros
                                        .SelectMany(n => campañasAsociadas.Select(idCamp => new blacklistcampains
                                        {
                                            idblacklist = n.Id,
                                            idcampains = idCamp
                                        }))
                                        .ToList();

                                    ctx.blacklistcampains.AddRange(nuevasAsociaciones);
                                    ctx.SaveChanges();
                                }
                            }
                        }
                    }
                }

                return true;
            }
            catch (Exception w)
            {
                return false;
            }
        }

        public bool DeletePhoneList(DeleteBlackList blacklistfile)
        {

            try
            {
                using (var ctx = new Entities())
                {
                    // Obtener las entidades a eliminar
                    var entidades = ctx.BlackList
                        .Where(x => x.idroom == blacklistfile.idroom && blacklistfile.names.Contains(x.Name))
                        .ToList();

                    // Obtener los IDs de esas entidades
                    var ids = entidades.Select(x => x.Id).ToList();

                    // Eliminar las relaciones primero
                    var relaciones = ctx.blacklistcampains
                        .Where(bc => ids.Contains(bc.idblacklist))
                        .ToList();

                    ctx.blacklistcampains.RemoveRange(relaciones);
                    ctx.SaveChanges();

                    // Eliminar las entidades
                    ctx.BlackList.RemoveRange(entidades);
                    ctx.SaveChanges();
                }

                return true;
            }
            catch (Exception e)
            {
                // Loguear el error si necesitas
                return false;
            }
        }

    }
}
