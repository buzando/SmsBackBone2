// src/pages/ClientRoomPicker.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import axios from "../components/commons/AxiosInstance";

// Assets (mismos paths que usas en Rooms)
import seachicon from "../assets/icon-lupa.svg";
import Iconseachred from "../assets/Iconseachred.svg";
import iconclose from "../assets/icon-close.svg";
import NoResult from "../assets/NoResultados.svg";

// Botón primario del proyecto
import MainButton from "../components/commons/MainButton";

// ===== Tipos =====
export type RoomLite = {
  id: number;               // mapeado desde IdRoom
  name: string;             // nombreSala
  cliente?: string;         // nombrecliente
  description?: string;
  credits?: number;         // creditosGlobales
  short_sms?: number;       // creditosSmsCortos
  long_sms?: number;        // creditosSmsLargos
  calls?: number;
  canBeDeleted?: boolean;
  fechaAlta?: string;
};

// Tipos mínimos que necesitamos del endpoint de clientes
export type ClientLite = {
  id?: number;
  nombreCliente: string;
  email: string;
  roomName?: string; // CSV legacy: "Sala A, Sala B"
  totalCredits?: number;
  totalLongSmsCredits?: number;
  totalShortSmsCredits?: number;
  rateForShort?: number;
  rateForLong?: number;
};

const ClientRoomPicker: React.FC = () => {
  // ===== State clientes =====
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [search, setSearch] = useState("");

  // ===== Selecciones =====
  const [selectedClient, setSelectedClient] = useState<ClientLite | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomLite | null>(null);

  // ===== Salas por cliente =====
  const [clientRooms, setClientRooms] = useState<RoomLite[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsCache, setRoomsCache] = useState<Record<string, RoomLite[]>>({});

  const navigate = useNavigate();

  // === Data (fetch clientes con debounce y SearchTerm) ===
  useEffect(() => {
    let canceled = false;
    const controller = new AbortController();

    setLoadingClients(true);

    const url = `${import.meta.env.VITE_API_GET_CLIENTSADMIN}0`;
    const payload = {
      page: 0,                              // ← página 0
      ClienteIds: null,
      Estatus: null,
      SearchTerm: search.trim() || null,    // ← server-side search
    };

    const t = setTimeout(async () => {
      try {
        const res = await axios.post(url, payload, { signal: controller.signal });
        if (!canceled && res.status === 200) {
          const items = Array.isArray(res.data?.items) ? res.data.items : [];
          setClients(items);
        }
      } catch (_err) {
        if (!canceled) setClients([]);
      } finally {
        if (!canceled) setLoadingClients(false);
      }
    }, 300); // debounce

    return () => {
      canceled = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [search]);

  // Reset suave cuando se cambia el término de búsqueda
  useEffect(() => {
    setSelectedClient(null);
    setSelectedRoom(null);
    setClientRooms([]);
  }, [search]);

  // Filtro local (opcional si el API ya filtra)
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        (c.nombreCliente ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
    );
  }, [clients, search]);

  const canContinue = Boolean(selectedClient && selectedRoom);

  // === Fetch de salas al seleccionar cliente ===
  const fetchRoomsForClient = async (c: ClientLite) => {
    setSelectedRoom(null);
    setClientRooms([]);

    if (!c) return;

    // Clave robusta: usa id si existe; si no, nombre
    const clientParam = (c.id ?? c.nombreCliente)?.toString().trim() ?? "";
    const queryName = c.nombreCliente?.trim() ?? "";

    // Cache para no repetir llamadas si re-seleccionan el mismo cliente
    if (clientParam && roomsCache[clientParam]?.length) {
      setClientRooms(roomsCache[clientParam]);
      return;
    }

    setLoadingRooms(true);
    try {
      const base = import.meta.env.VITE_API_GET_ROOMBYCLIENT; // "/api/Client/GetRoomsByClient"
      // El endpoint actual recibe nombre en "client"
      const url = `${base}?client=${encodeURIComponent(queryName)}`;

      const resp = await axios.get(url);

      // Mapeo defensivo por si la API devuelve props con diferentes capitalizaciones
      let mapped: RoomLite[] = (Array.isArray(resp.data) ? resp.data : []).map((x: any) => ({
        id: x.idRoom ?? x.IdRoom ?? x.id ?? 0,
        name: x.nombreSala ?? x.name ?? "",
        cliente: x.nombrecliente ?? x.cliente ?? c.nombreCliente,
        description: x.description,
        credits: x.creditosGlobales ?? x.credits,
        short_sms: x.creditosSmsCortos ?? x.short_sms,
        long_sms: x.creditosSmsLargos ?? x.long_sms,
        calls: x.calls,
        canBeDeleted: x.canBeDeleted ?? x.CanBeDeleted,
        fechaAlta: x.fechaAlta,
      }));

      // Fallback a CSV también cuando el 200 viene vacío
      if (!mapped.length) {
        const csv = c.roomName?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
        mapped = csv.map((name, idx) => ({
          id: idx + 1,
          name,
          cliente: c.nombreCliente,
        }));
      }

      if (clientParam) {
        setRoomsCache((prev) => ({ ...prev, [clientParam]: mapped }));
      }
      setClientRooms(mapped);
    } catch (_e) {
      // Fallback LEGACY al CSV (por si hay clientes viejos con sólo roomName)
      const csv =
        c.roomName?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
      const fallback: RoomLite[] = csv.map((name, idx) => ({
        id: idx + 1,
        name,
        cliente: c.nombreCliente,
      }));
      if (clientParam) {
        setRoomsCache((prev) => ({ ...prev, [clientParam]: fallback }));
      }
      setClientRooms(fallback);
    } finally {
      setLoadingRooms(false);
    }
  };

  // === Handler: guardar selección y navegar ===
  const handleContinue = () => {
    if (!selectedClient || !selectedRoom) return;

    try {
      // Guardar cliente (campos útiles)
      localStorage.setItem(
        "selectedClient",
        JSON.stringify({
          id: selectedClient.id ?? null,
          nombreCliente: selectedClient.nombreCliente,
          email: selectedClient.email,
          totalCredits: selectedClient.totalCredits,
          totalLongSmsCredits: selectedClient.totalLongSmsCredits,
          totalShortSmsCredits: selectedClient.totalShortSmsCredits,
          rateForShort: selectedClient.rateForShort,
          rateForLong: selectedClient.rateForLong,
        })
      );

      // Guardar sala completa
      localStorage.setItem("selectedRoom", JSON.stringify(selectedRoom));
    } catch {
      // noop/log si quieres
    }

    // Navegar a home
    navigate("/");
  };

  // Enter en el buscador para continuar si ya se puede
  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && canContinue) {
      handleContinue();
    }
  };

  // === UI ===
  return (
    <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1260px" }}>
      <Typography
        variant="h4"
        sx={{
          color: "#330F1B",
          fontSize: "26px",
          fontFamily: "Poppins",
          mb: 2,
        }}
      >
        Selecciona un cliente y sala para continuar
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          bgcolor: "transparent",
        }}
      >
        {/* Columna izquierda: clientes */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            border: "1px solid #E7E1E3",
          }}
        >
          <Typography
            sx={{
              p: 2.5,
              pb: 1,
              fontFamily: "Poppins",
              color: "#574B4F",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Seleccionar un cliente
          </Typography>
          <Divider />

          {/* Buscador */}
          <Box
            display="flex"
            alignItems="center"
            sx={{
              m: 2,
              mt: 2.5,
              border: `1px solid ${search ? "#7B354D" : "#9B9295"}`,
              borderRadius: 1,
              px: 2,
              height: 40,
              background: "#fff",
            }}
          >
            <img
              src={search ? Iconseachred : seachicon}
              alt="Buscar"
              style={{ width: 24, marginRight: 8 }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: 16,
                fontFamily: "Poppins",
                color: search ? "#7B354D" : "#9B9295",
                background: "transparent",
              }}
            />
            {search && (
              <img
                src={iconclose}
                alt="Limpiar búsqueda"
                onClick={() => setSearch("")}
                style={{ width: 24, height: 24, cursor: "pointer" }}
              />
            )}
          </Box>

          {loadingClients ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : filteredClients.length === 0 ? (
            <Box
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <img src={NoResult} alt="Sin resultados" style={{ width: 220 }} />
              <Typography
                sx={{ color: "#7B354D", fontFamily: "Poppins", fontSize: 14 }}
              >
                No se encontraron resultados
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 2, pb: 2, maxHeight: 440, overflowY: "auto" }}>
              {filteredClients.map((c) => (
                <Box
                  key={`${c.id}-${c.email}`}
                  onClick={() => {
                    setSelectedClient(c);
                    fetchRoomsForClient(c);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderBottom: "1px solid #EFE8EB",
                    cursor: "pointer",
                    backgroundColor:
                      selectedClient?.id === c.id &&
                      selectedClient?.email === c.email
                        ? "#F6EEF1"
                        : "transparent",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AccountCircleIcon
                      sx={{ width: 36, height: 36, color: "#796E71" }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          color: "#574B4F",
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                      >
                        {c.nombreCliente}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          color: "#574B4F",
                          fontSize: 14,
                        }}
                      >
                        {c.email}
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronRightIcon sx={{ color: "#796E71" }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Columna derecha: salas */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            border: "1px solid #E7E1E3",
            position: "relative",
          }}
        >
          <Typography
            sx={{
              p: 2.5,
              pb: 1,
              fontFamily: "Poppins",
              color: "#574B4F",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Seleccionar una sala
          </Typography>
          <Divider />

          {!selectedClient ? (
            <Box
              sx={{
                height: 480,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <img
                src={NoResult}
                alt="Seleccione un cliente"
                style={{ width: 260 }}
              />
              <Typography sx={{ fontFamily: "Poppins", color: "#7B354D" }}>
                Seleccione un cliente para comenzar
              </Typography>
            </Box>
          ) : loadingRooms ? (
            <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : clientRooms.length === 0 ? (
            <Box
              sx={{
                height: 480,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <img src={NoResult} alt="Sin salas" style={{ width: 260 }} />
              <Typography sx={{ fontFamily: "Poppins", color: "#7B354D" }}>
                El cliente no tiene salas
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 2, pb: 10, maxHeight: 480, overflowY: "auto" }}>
              {clientRooms.map((r) => (
                <Box
                  key={r.id ?? r.name}
                  onClick={() => setSelectedRoom(r)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderBottom: "1px solid #EFE8EB",
                    cursor: "pointer",
                    backgroundColor:
                      selectedRoom?.id === r.id ? "#F6EEF1" : "transparent",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#796E71",
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {r.name?.[0] ?? "R"}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          color: "#574B4F",
                          fontSize: 16,
                          fontWeight: 500,
                        }}
                      >
                        {r.name}
                      </Typography>
                      {typeof r.credits === "number" && (
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            color: "#796E71",
                            fontSize: 13,
                          }}
                        >
                          Créditos: {r.credits}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <ChevronRightIcon sx={{ color: "#796E71" }} />
                </Box>
              ))}
            </Box>
          )}

          {/* CTA inferior derecha */}
          <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
            <MainButton
              disabled={!canContinue}
              text={canContinue ? "Continuar" : "Selecciona cliente y sala"}
              onClick={handleContinue}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientRoomPicker;
