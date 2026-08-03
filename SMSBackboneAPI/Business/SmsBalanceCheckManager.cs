using Contract;
using Contract.Other;
using log4net;
using Microsoft.EntityFrameworkCore;
using Modal;
using Modal.Model.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Business
{
    public class SmsBalanceCheckManager
    {
        private static readonly ILog _logger =
            LogManager.GetLogger(typeof(SmsBalanceCheckManager));

        public async Task<SmsBalanceCheckResult> CheckBalancesAsync()
        {
            var result = new SmsBalanceCheckResult();

            try
            {
                using var ctx = new Entities();

                var accessIdFiltroConfig = Common.ConfigurationManagerJson("BalanceAccessIdFiltro");
                var tieneFiltroAccess = int.TryParse(accessIdFiltroConfig, out var accessIdFiltro) && accessIdFiltro > 0;

                var queryClientes =
                    from access in ctx.Client_Access
                    join client in ctx.clients on access.client_id equals client.id
                    select new
                    {
                        ClientId = client.id,
                        AccessId = access.id,
                        access.username,
                        access.password
                    };

                if (tieneFiltroAccess)
                {
                    queryClientes = queryClientes.Where(x => x.AccessId == accessIdFiltro);
                    _logger.Warn($"Filtro temporal activo para BalanceAccessIdFiltro={accessIdFiltro}");
                }

                var clientes = queryClientes
                    .Distinct()
                    .ToList();

                _logger.Info($"Clientes con acceso Backbone encontrados: {clientes.Count}");

                foreach (var cliente in clientes)
                {
                    result.ClientesRevisados++;

                    try
                    {
                        _logger.Info("--------------------------------------------------");
                        _logger.Info($"Validando saldo para ClientId={cliente.ClientId}, AccessId={cliente.AccessId}, Username={cliente.username}");

                        var password = ClientAccessManager.Decrypt(cliente.password);

                        if (string.IsNullOrWhiteSpace(password))
                        {
                            _logger.Warn($"No se pudo desencriptar password de Backbone. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}");
                            result.Errores++;
                            continue;
                        }

                        var api = new ApiBackBoneManager();
                        var login = await api.LoginResponse(cliente.username, password);

                        if (login == null || string.IsNullOrWhiteSpace(login.token))
                        {
                            _logger.Warn($"No se pudo autenticar en Backbone. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}");
                            result.Errores++;
                            continue;
                        }

                        _logger.Info($"Login Backbone correcto. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}");

                        var backboneCreditRaw = await api.GetOwnCredit(login.token);

                        _logger.Info(
                            $"Respuesta Backbone /user/credit. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}, Response={backboneCreditRaw}"
                        );

                        if (!TryParseBackboneCredit(backboneCreditRaw, out var backboneCredit))
                        {
                            _logger.Warn(
                                $"No se pudo interpretar saldo Backbone. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}, Response={backboneCreditRaw}"
                            );

                            result.Errores++;
                            continue;
                        }

                        var rooms = (
                            from rbu in ctx.roomsbyuser
                            join u in ctx.Users on rbu.idUser equals u.Id
                            join r in ctx.Rooms on rbu.idRoom equals r.id
                            where u.IdCliente == cliente.ClientId
                            select r
                        )
                        .Distinct()
                        .ToList();

                        if (!rooms.Any())
                        {
                            _logger.Warn($"Cliente sin rooms asociados. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}");
                            result.Errores++;
                            continue;
                        }

                        var portalShort = rooms.Sum(r => r.short_sms);
                        var portalLong = rooms.Sum(r => r.long_sms);
                        var portalTotal = portalShort + portalLong;

                        var diferencia = portalTotal - backboneCredit;
                        var fechaRevision = DateTime.Today.AddDays(-1).Date;

                        _logger.Info(
                            $"Saldo ClientId={cliente.ClientId}, AccessId={cliente.AccessId}. " +
                            $"FechaRevision={fechaRevision:yyyy-MM-dd}, Backbone={backboneCredit}, " +
                            $"PortalTotal={portalTotal}, Short={portalShort}, Long={portalLong}, Diferencia={diferencia}"
                        );

                        if (YaExisteConciliacion(ctx, cliente.ClientId, cliente.AccessId, fechaRevision))
                        {
                            _logger.Warn(
                                $"Ya existe conciliación para este día. No se procesa otra vez. " +
                                $"ClientId={cliente.ClientId}, AccessId={cliente.AccessId}, FechaRevision={fechaRevision:yyyy-MM-dd}"
                            );

                            result.ConciliacionesOmitidas++;
                            continue;
                        }

                        using var transaction = await ctx.Database.BeginTransactionAsync();

                        try
                        {
                            if (Math.Abs(diferencia) < 0.01)
                            {
                                var bitacoraOk = CrearBitacora(
                                    cliente.ClientId,
                                    cliente.AccessId,
                                    fechaRevision,
                                    backboneCredit,
                                    portalShort,
                                    portalLong,
                                    portalTotal,
                                    portalShort,
                                    portalLong,
                                    portalTotal,
                                    diferencia,
                                    0,
                                    0,
                                    "OK",
                                    "Saldo local coincide con Backbone."
                                );

                                ctx.SmsBalanceReconciliation.Add(bitacoraOk);

                                await ctx.SaveChangesAsync();
                                await transaction.CommitAsync();

                                result.ConciliacionesOk++;

                                _logger.Info($"Saldo correcto. ClientId={cliente.ClientId}, AccessId={cliente.AccessId}");
                                continue;
                            }

                            if (backboneCredit == 0 && portalTotal > 0)
                            {
                                var bitacora = CrearBitacora(
                                    cliente.ClientId,
                                    cliente.AccessId,
                                    fechaRevision,
                                    backboneCredit,
                                    portalShort,
                                    portalLong,
                                    portalTotal,
                                    0,
                                    0,
                                    0,
                                    diferencia,
                                    0,
                                    diferencia,
                                    "FORZADO_CERO_BACKBONE",
                                    "Backbone reportó saldo 0. Se forzó saldo local a 0."
                                );

                                ctx.SmsBalanceReconciliation.Add(bitacora);
                                await ctx.SaveChangesAsync();

                                ForzarroomsEnCero(ctx, rooms, bitacora.Id);

                                await ctx.SaveChangesAsync();
                                await transaction.CommitAsync();

                                result.AjustesAplicados++;
                                result.ForzadosCero++;

                                _logger.Warn(
                                    $"Backbone=0. Saldo local forzado a 0. " +
                                    $"ClientId={cliente.ClientId}, AccessId={cliente.AccessId}"
                                );

                                continue;
                            }

                            if (diferencia > 0)
                            {
                                await ProcesarPortalMayorQueBackbone(
                                    ctx,
                                    cliente.ClientId,
                                    cliente.AccessId,
                                    fechaRevision,
                                    backboneCredit,
                                    portalShort,
                                    portalLong,
                                    portalTotal,
                                    diferencia,
                                    rooms,
                                    result
                                );

                                await ctx.SaveChangesAsync();
                                await transaction.CommitAsync();

                                continue;
                            }

                            if (diferencia < 0)
                            {
                                await ProcesarBackboneMayorQuePortal(
                                    ctx,
                                    cliente.ClientId,
                                    cliente.AccessId,
                                    fechaRevision,
                                    backboneCredit,
                                    portalShort,
                                    portalLong,
                                    portalTotal,
                                    diferencia,
                                    rooms,
                                    result
                                );

                                await ctx.SaveChangesAsync();
                                await transaction.CommitAsync();

                                continue;
                            }
                        }
                        catch
                        {
                            await transaction.RollbackAsync();
                            throw;
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errores++;
                        _logger.Error($"Error validando saldo para ClientId={cliente.ClientId}, AccessId={cliente.AccessId}", ex);
                    }
                }

                _logger.Info(
                    $"Validación de saldos finalizada. " +
                    $"ClientesRevisados={result.ClientesRevisados}, " +
                    $"ConciliacionesOk={result.ConciliacionesOk}, " +
                    $"AjustesAplicados={result.AjustesAplicados}, " +
                    $"ForzadosCero={result.ForzadosCero}, " +
                    $"ConciliacionesOmitidas={result.ConciliacionesOmitidas}, " +
                    $"Errores={result.Errores}"
                );

                return result;
            }
            catch (Exception ex)
            {
                result.Errores++;
                _logger.Error("Error general en SmsBalanceCheckManager.CheckBalancesAsync", ex);
                return result;
            }
        }

        private async Task ProcesarPortalMayorQueBackbone(
            Entities ctx,
            int clientId,
            int accessId,
            DateTime fechaRevision,
            double backboneCredit,
            double portalShort,
            double portalLong,
            double portalTotal,
            double diferencia,
            List<rooms> rooms,
            SmsBalanceCheckResult result
        )
        {
            var creditosAjustar = Convert.ToInt32(Math.Floor(diferencia));

            _logger.Warn(
                $"Portal tiene más saldo que Backbone. Se bajará saldo local. " +
                $"ClientId={clientId}, AccessId={accessId}, Diferencia={diferencia}, CreditosAjustar={creditosAjustar}"
            );

            var mensajesParaAjustar = GetSmsCobrablesParaAjuste(
                ctx,
                clientId,
                creditosAjustar
            );

            var smsJustificados = mensajesParaAjustar.Count;
            var ajusteAdministrativo = diferencia - smsJustificados;

            if (ajusteAdministrativo < 0)
                ajusteAdministrativo = 0;

            var status = ajusteAdministrativo > 0
                ? "AJUSTE_ADMINISTRATIVO_BAJA"
                : "AJUSTE_POR_SMS";

            var notes = ajusteAdministrativo > 0
                ? "Se ajustó el saldo local contra Backbone. Parte o todo el ajuste no tuvo SMS justificable."
                : "Se ajustó el saldo local con respaldo de SMS cobrables.";

            var bitacora = CrearBitacora(
                clientId,
                accessId,
                fechaRevision,
                backboneCredit,
                portalShort,
                portalLong,
                portalTotal,
                0,
                0,
                0,
                diferencia,
                smsJustificados,
                ajusteAdministrativo,
                status,
                notes
            );

            ctx.SmsBalanceReconciliation.Add(bitacora);
            await ctx.SaveChangesAsync();

            var ajustes = mensajesParaAjustar
                .GroupBy(x => new { x.RoomId, x.NumberType })
                .Select(g => new SmsBalanceAdjustmentItem
                {
                    RoomId = g.Key.RoomId,
                    NumberType = g.Key.NumberType,
                    Quantity = g.Count()
                })
                .ToList();

            if (ajustes.Any())
            {
                AplicarAjustesSaldo(ctx, ajustes, bitacora.Id);
            }

            if (ajusteAdministrativo > 0)
            {
                AplicarBajaAdministrativa(
                    ctx,
                    rooms,
                    ajusteAdministrativo,
                    bitacora.Id
                );

                result.AjustesAdministrativos++;
            }
            else
            {
                result.AjustesSms++;
            }

            var portalShortAfter = rooms.Sum(r => r.short_sms);
            var portalLongAfter = rooms.Sum(r => r.long_sms);
            var portalTotalAfter = portalShortAfter + portalLongAfter;

            ActualizarBitacoraAfter(
                bitacora,
                portalShortAfter,
                portalLongAfter,
                portalTotalAfter
            );

            result.AjustesAplicados++;

            _logger.Warn(
                $"Ajuste de baja aplicado. ClientId={clientId}, AccessId={accessId}, " +
                $"SmsJustificados={smsJustificados}, AjusteAdministrativo={ajusteAdministrativo}, " +
                $"PortalAfter={portalTotalAfter}, Backbone={backboneCredit}"
            );
        }

        private async Task ProcesarBackboneMayorQuePortal(
            Entities ctx,
            int clientId,
            int accessId,
            DateTime fechaRevision,
            double backboneCredit,
            double portalShort,
            double portalLong,
            double portalTotal,
            double diferencia,
            List<rooms> rooms,
            SmsBalanceCheckResult result
        )
        {
            var saldoAgregar = Math.Abs(diferencia);

            _logger.Warn(
                $"Backbone tiene más saldo que Portal. Se subirá saldo local. " +
                $"ClientId={clientId}, AccessId={accessId}, SaldoAgregar={saldoAgregar}"
            );

            var destino = ObtenerDestinoSaldoExtra(ctx, clientId, rooms);

            var bitacora = CrearBitacora(
                clientId,
                accessId,
                fechaRevision,
                backboneCredit,
                portalShort,
                portalLong,
                portalTotal,
                0,
                0,
                0,
                diferencia,
                0,
                saldoAgregar,
                "AJUSTE_ADMINISTRATIVO_SUBE",
                "Backbone reportó más saldo que Portal. Se sumó la diferencia al Room con más movimiento reciente."
            );

            ctx.SmsBalanceReconciliation.Add(bitacora);
            await ctx.SaveChangesAsync();

            AplicarAltaAdministrativa(
                ctx,
                destino.Room,
                destino.NumberType,
                saldoAgregar,
                bitacora.Id
            );

            var portalShortAfter = rooms.Sum(r => r.short_sms);
            var portalLongAfter = rooms.Sum(r => r.long_sms);
            var portalTotalAfter = portalShortAfter + portalLongAfter;

            ActualizarBitacoraAfter(
                bitacora,
                portalShortAfter,
                portalLongAfter,
                portalTotalAfter
            );

            result.AjustesAplicados++;
            result.AjustesAdministrativos++;

            _logger.Warn(
                $"Ajuste de alta aplicado. ClientId={clientId}, AccessId={accessId}, " +
                $"RoomDestino={destino.Room.id}, NumberType={destino.NumberType}, " +
                $"SaldoAgregado={saldoAgregar}, PortalAfter={portalTotalAfter}, Backbone={backboneCredit}"
            );
        }

        private bool TryParseBackboneCredit(string raw, out double credit)
        {
            credit = 0;

            if (string.IsNullOrWhiteSpace(raw))
                return false;

            raw = raw.Trim();

            try
            {
                using var doc = JsonDocument.Parse(raw);

                if (!doc.RootElement.TryGetProperty("credit", out var creditElement))
                    return false;

                if (creditElement.ValueKind == JsonValueKind.Number)
                    return creditElement.TryGetDouble(out credit);

                if (creditElement.ValueKind == JsonValueKind.String)
                    return double.TryParse(creditElement.GetString(), out credit);

                return false;
            }
            catch
            {
                return false;
            }
        }

        private List<SmsBillableMessageItem> GetSmsCobrablesParaAjuste(
            Entities ctx,
            int clientId,
            int creditosAjustar
        )
        {
            var fechaInicio = DateTime.Today.AddDays(-1);
            var fechaFin = DateTime.Today;

            var mensajes = (
                from s in ctx.CampaignContactScheduleSend
                join c in ctx.Campaigns on s.CampaignId equals c.Id
                join r in ctx.Rooms on c.RoomId equals r.id
                join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                join u in ctx.Users on rbu.idUser equals u.Id
                where u.IdCliente == clientId
                      && (s.Status == "1" || s.Status == "2")
                      && s.SentAt != null
                      && s.SentAt >= fechaInicio
                      && s.SentAt < fechaFin
                select new SmsBillableMessageItem
                {
                    MessageId = s.Id,
                    CampaignId = c.Id,
                    RoomId = r.id,
                    NumberType = c.NumberType,
                    Status = s.Status,
                    SentAt = s.SentAt.Value
                }
            )
            .AsNoTracking()
            .ToList();

            return mensajes
                .GroupBy(x => x.MessageId)
                .Select(g => g.First())
                .OrderByDescending(x => x.SentAt)
                .Take(creditosAjustar)
                .ToList();
        }

        private void AplicarAjustesSaldo(
            Entities ctx,
            List<SmsBalanceAdjustmentItem> ajustes,
            int reconciliationId
        )
        {
            foreach (var ajuste in ajustes)
            {
                var room = ctx.Rooms.FirstOrDefault(r => r.id == ajuste.RoomId);

                if (room == null)
                {
                    _logger.Warn($"No se encontró RoomId={ajuste.RoomId} para aplicar ajuste SMS.");
                    continue;
                }

                var shortBefore = room.short_sms;
                var longBefore = room.long_sms;

                double shortDelta = 0;
                double longDelta = 0;

                if (ajuste.NumberType == 1)
                {
                    shortDelta = -ajuste.Quantity;
                    room.short_sms = Math.Max(0, room.short_sms - ajuste.Quantity);
                }
                else if (ajuste.NumberType == 2)
                {
                    longDelta = -ajuste.Quantity;
                    room.long_sms = Math.Max(0, room.long_sms - ajuste.Quantity);
                }
                else
                {
                    _logger.Warn(
                        $"NumberType no reconocido. No se ajustó saldo. " +
                        $"RoomId={room.id}, NumberType={ajuste.NumberType}, Cantidad={ajuste.Quantity}"
                    );

                    continue;
                }

                InsertarDetalleConciliacion(
                    ctx,
                    reconciliationId,
                    room.id,
                    shortBefore,
                    longBefore,
                    shortDelta,
                    longDelta,
                    room.short_sms,
                    room.long_sms,
                    "SMS_JUSTIFICADO"
                );

                _logger.Warn(
                    $"Ajuste por SMS aplicado. RoomId={room.id}, NumberType={ajuste.NumberType}, " +
                    $"Cantidad={ajuste.Quantity}, ShortBefore={shortBefore}, LongBefore={longBefore}, " +
                    $"ShortAfter={room.short_sms}, LongAfter={room.long_sms}"
                );
            }
        }

        private void AplicarBajaAdministrativa(
            Entities ctx,
            List<rooms> rooms,
            double cantidad,
            int reconciliationId
        )
        {
            var restante = cantidad;

            foreach (var room in rooms.OrderByDescending(r => r.short_sms + r.long_sms))
            {
                if (restante <= 0.01)
                    break;

                var shortBefore = room.short_sms;
                var longBefore = room.long_sms;

                var bajarShort = Math.Min(room.short_sms, restante);
                room.short_sms -= bajarShort;
                restante -= bajarShort;

                var bajarLong = 0.0;

                if (restante > 0.01)
                {
                    bajarLong = Math.Min(room.long_sms, restante);
                    room.long_sms -= bajarLong;
                    restante -= bajarLong;
                }

                if (bajarShort <= 0 && bajarLong <= 0)
                    continue;

                InsertarDetalleConciliacion(
                    ctx,
                    reconciliationId,
                    room.id,
                    shortBefore,
                    longBefore,
                    -bajarShort,
                    -bajarLong,
                    room.short_sms,
                    room.long_sms,
                    "AJUSTE_ADMINISTRATIVO_BAJA"
                );

                _logger.Warn(
                    $"Baja administrativa aplicada. RoomId={room.id}, " +
                    $"ShortDelta={-bajarShort}, LongDelta={-bajarLong}, Restante={restante}"
                );
            }

            if (restante > 0.01)
            {
                _logger.Warn(
                    $"Quedó ajuste administrativo pendiente sin poder aplicar por falta de saldo local. Restante={restante}"
                );
            }
        }

        private void AplicarAltaAdministrativa(
            Entities ctx,
            rooms room,
            int numberType,
            double cantidad,
            int reconciliationId
        )
        {
            var shortBefore = room.short_sms;
            var longBefore = room.long_sms;

            double shortDelta = 0;
            double longDelta = 0;

            if (numberType == 2)
            {
                longDelta = cantidad;
                room.long_sms += cantidad;
            }
            else
            {
                shortDelta = cantidad;
                room.short_sms += cantidad;
            }

            InsertarDetalleConciliacion(
                ctx,
                reconciliationId,
                room.id,
                shortBefore,
                longBefore,
                shortDelta,
                longDelta,
                room.short_sms,
                room.long_sms,
                "AJUSTE_ADMINISTRATIVO_SUBE"
            );
        }

        private void ForzarroomsEnCero(
            Entities ctx,
            List<rooms> rooms,
            int reconciliationId
        )
        {
            foreach (var room in rooms)
            {
                var shortBefore = room.short_sms;
                var longBefore = room.long_sms;

                room.short_sms = 0;
                room.long_sms = 0;

                InsertarDetalleConciliacion(
                    ctx,
                    reconciliationId,
                    room.id,
                    shortBefore,
                    longBefore,
                    -shortBefore,
                    -longBefore,
                    0,
                    0,
                    "FORZADO_CERO_BACKBONE"
                );

                _logger.Warn(
                    $"Room forzado a 0 por BackboneCredit=0. " +
                    $"RoomId={room.id}, ShortBefore={shortBefore}, LongBefore={longBefore}"
                );
            }
        }

        private SmsBalanceExtraTarget ObtenerDestinoSaldoExtra(
            Entities ctx,
            int clientId,
            List<rooms> rooms
        )
        {
            var fechaInicio = DateTime.Today.AddDays(-1);
            var fechaFin = DateTime.Today;

            var movimiento = (
                from s in ctx.CampaignContactScheduleSend
                join c in ctx.Campaigns on s.CampaignId equals c.Id
                join r in ctx.Rooms on c.RoomId equals r.id
                join rbu in ctx.roomsbyuser on r.id equals rbu.idRoom
                join u in ctx.Users on rbu.idUser equals u.Id
                where u.IdCliente == clientId
                      && s.SentAt != null
                      && s.SentAt >= fechaInicio
                      && s.SentAt < fechaFin
                group s by new
                {
                    RoomId = r.id,
                    c.NumberType
                }
                into g
                orderby g.Count() descending
                select new
                {
                    g.Key.RoomId,
                    g.Key.NumberType,
                    Total = g.Count()
                }
            )
            .FirstOrDefault();

            if (movimiento != null)
            {
                var roomPorMovimiento = rooms.FirstOrDefault(r => r.id == movimiento.RoomId);

                if (roomPorMovimiento != null)
                {
                    return new SmsBalanceExtraTarget
                    {
                        Room = roomPorMovimiento,
                        NumberType = movimiento.NumberType
                    };
                }
            }

            var roomFallback = rooms
                .OrderByDescending(r => r.short_sms + r.long_sms)
                .First();

            var numberTypeFallback = roomFallback.long_sms > roomFallback.short_sms
                ? 2
                : 1;

            return new SmsBalanceExtraTarget
            {
                Room = roomFallback,
                NumberType = numberTypeFallback
            };
        }

        private bool YaExisteConciliacion(
            Entities ctx,
            int clientId,
            int accessId,
            DateTime fechaRevision
        )
        {
            return ctx.SmsBalanceReconciliation.Any(x =>
                x.ClientId == clientId &&
                x.AccessId == accessId &&
                x.FechaRevision == fechaRevision
            );
        }

        private SmsBalanceReconciliation CrearBitacora(
            int clientId,
            int accessId,
            DateTime fechaRevision,
            double backboneCredit,
            double portalShortBefore,
            double portalLongBefore,
            double portalTotalBefore,
            double portalShortAfter,
            double portalLongAfter,
            double portalTotalAfter,
            double diferencia,
            int smsJustificados,
            double ajusteAdministrativo,
            string status,
            string notes
        )
        {
            return new SmsBalanceReconciliation
            {
                ClientId = clientId,
                AccessId = accessId,
                FechaRevision = fechaRevision,

                BackboneCredit = Convert.ToDecimal(backboneCredit),

                PortalShortBefore = Convert.ToDecimal(portalShortBefore),
                PortalLongBefore = Convert.ToDecimal(portalLongBefore),
                PortalTotalBefore = Convert.ToDecimal(portalTotalBefore),

                PortalShortAfter = Convert.ToDecimal(portalShortAfter),
                PortalLongAfter = Convert.ToDecimal(portalLongAfter),
                PortalTotalAfter = Convert.ToDecimal(portalTotalAfter),

                Diferencia = Convert.ToDecimal(diferencia),

                SmsJustificados = smsJustificados,
                AjusteAdministrativo = Convert.ToDecimal(ajusteAdministrativo),

                Status = status,
                Notes = notes,
                CreatedAt = DateTime.Now
            };
        }

        private void ActualizarBitacoraAfter(
            SmsBalanceReconciliation bitacora,
            double portalShortAfter,
            double portalLongAfter,
            double portalTotalAfter
        )
        {
            bitacora.PortalShortAfter = Convert.ToDecimal(portalShortAfter);
            bitacora.PortalLongAfter = Convert.ToDecimal(portalLongAfter);
            bitacora.PortalTotalAfter = Convert.ToDecimal(portalTotalAfter);
        }

        private void InsertarDetalleConciliacion(
            Entities ctx,
            int reconciliationId,
            int roomId,
            double shortBefore,
            double longBefore,
            double shortDelta,
            double longDelta,
            double shortAfter,
            double longAfter,
            string reason
        )
        {
            var detalle = new SmsBalanceReconciliationDetail
            {
                ReconciliationId = reconciliationId,
                RoomId = roomId,

                ShortBefore = Convert.ToDecimal(shortBefore),
                LongBefore = Convert.ToDecimal(longBefore),

                ShortDelta = Convert.ToDecimal(shortDelta),
                LongDelta = Convert.ToDecimal(longDelta),

                ShortAfter = Convert.ToDecimal(shortAfter),
                LongAfter = Convert.ToDecimal(longAfter),

                Reason = reason,
                CreatedAt = DateTime.Now
            };

            ctx.SmsBalanceReconciliationDetail.Add(detalle);
        }

        private class SmsBillableMessageItem
        {
            public int MessageId { get; set; }
            public int CampaignId { get; set; }
            public int RoomId { get; set; }
            public int NumberType { get; set; }
            public string Status { get; set; }
            public DateTime SentAt { get; set; }
        }

        private class SmsBalanceAdjustmentItem
        {
            public int RoomId { get; set; }
            public int NumberType { get; set; }
            public int Quantity { get; set; }
        }

        private class SmsBalanceExtraTarget
        {
            public rooms Room { get; set; }
            public int NumberType { get; set; }
        }
    }
}