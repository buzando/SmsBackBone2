import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Modal,
    Fade,
    Backdrop,
    Divider,
    TextField,
    Select,
    CircularProgress,
    MenuItem as MuiMenuItem,
    List,
    ListItem,
    ListItemText,
    InputAdornment,
    ClickAwayListener,
    Paper,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import TrashIcon from "../assets/Icon-trash.svg";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import seachicon from '../assets/icon-lupa.svg'
import NoResult from '../assets/NoResultados.svg'
import ChipBar from "../components/commons/ChipBar";
import HouseIcon from "../assets/IconRooms.svg"
import iconclose from "../assets/icon-close.svg"
import MainButton from "../components/commons/MainButton";
import SecondaryButton from "../components/commons/SecondaryButton";
import ErrorModal from '../components/commons/ModalError'
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "../assets/icon-punta-flecha-bottom.svg";
type Rooms = {
    id: string | number;
    name: string;
    cliente: string;
    description: string;
    credits: number;
    short_sms: number;
    long_sms: number;
    calls: number;
};

const CreditManagement: React.FC = () => {
    const [rooms, setrooms] = useState<Rooms[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<Rooms | null>(null);
    const [selectedRoom2, setSelectedRoom2] = useState<Rooms | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedChannel, setSelectedChannel] = useState<string>("");
    const [transferAmount, setTransferAmount] = useState<number | null>(null);
    const [searchTerm2, setSearchTerm2] = useState("");
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);
    const [openDropdown2, setOpenDropdown2] = useState<boolean>(false);
    const [searchTerm3, setSearchTerm3] = useState("");
    const [OpenErrorModal, setOpenErrorModal] = useState(false);
    const [showChipBarAdd, setshowChipBarAdd] = useState(false);
    const navigate = useNavigate();
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };



    const GetCredits = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        try {
            const request = `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_GetRooms}?email=${obj?.email}`;
            const response = await axios.get(request);

            if (response.status === 200) {
                setrooms(response.data);
                localStorage.setItem('ListRooms', JSON.stringify(response.data));
            }
        } catch {
            console.error("Error al traer los créditos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        GetCredits();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, room: Rooms) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedRoom2(room);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleOpenModal = () => {
        if (selectedRoom2) {
            setSearchTerm3(selectedRoom2.name); // Preselecciona el nombre en el campo de búsqueda
        }
        setModalOpen(true);
        setMenuAnchorEl(null); // Cierra el menú al abrir el modal
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRoom(null); // Clear selected room
        setSelectedRoom2(null); // Clear selected room2
        setSelectedChannel(""); // Reset the channel selection
        setTransferAmount(null); // Clear the transfer amount
        setSearchTerm2(""); // Clear search term for room
        setSearchTerm3(""); // Clear search term for room2
        setOpenDropdown(false); // Close any open dropdowns
        setOpenDropdown2(false);
        setModalOpen(false);
    };


    const handleSelectRoom = (room: Rooms) => {
        setSelectedRoom(room);
        setSearchTerm2(room.name);
        handleCloseDropdown();
    };

    const filteredRooms = rooms.filter(
        (room) =>
            room.id !== selectedRoom2?.id && // Excluye la sala destino seleccionada
            room.name.toLowerCase().includes(searchTerm2.toLowerCase()) // Aplica el filtro de búsqueda
    );

    const handleOpenDropdown = () => {
        setOpenDropdown(true);
    };

    const handleCloseDropdown = () => {
        setOpenDropdown(false);
    };

    const filteredRooms2 = rooms.filter((room) =>
        room.name.toLowerCase().includes(searchTerm3.toLowerCase())
    );

    const handleSelectRoom2 = (room: Rooms) => {
        setSelectedRoom2(room); // Actualiza la sala seleccionada
        setSearchTerm3(room.name); // Muestra el nombre de la sala seleccionada en el campo de texto
        setOpenDropdown2(false); // Cierra el desplegable
    };

    const handleOpenDropdown2 = () => {
        setOpenDropdown2(true); // Abre el desplegable
    };

    const handleCloseDropdown2 = () => {
        setOpenDropdown2(false); // Cierra el desplegable
    };

    const getAvailableCredits = () => {
        if (!selectedRoom2) return 0; // Si no hay sala seleccionada, retorna 0

        if (selectedChannel === "SMS Cortos") {
            return selectedRoom2.short_sms || 0; // Créditos de SMS Cortos
        } else if (selectedChannel === "SMS Largos") {
            return selectedRoom2.long_sms || 0; // Créditos de SMS Largos
        }

        return 0; // Por defecto, 0 créditos si no hay un canal válido seleccionado
    };

    const handleTransferSubmit = async () => {
        if (!selectedRoom2 || !selectedRoom || !selectedChannel || !transferAmount) {

            return;
        }

        setLoading(true);

        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el ID del usuario.");
            setLoading(false);
            return;
        }

        const payload = {
            oldRoom: selectedRoom2.name,
            Channel: selectedChannel,
            transfer: transferAmount,
            newRoom: selectedRoom.name,
            idUser: obj.id,
        };

        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_TRANSFER_ROOMS}`;
            const response = await axios.post(requestUrl, payload);

            if (response.status === 200) {
                const currentSelected = localStorage.getItem('selectedRoom');
                if (currentSelected) {
                    try {
                        const parsed = JSON.parse(currentSelected);

                        // Buscar en la lista que regresó el backend si alguna es la seleccionada
                        const updatedRoom = response.data.find((r: any) => r.id === parsed.id);

                        if (updatedRoom) {
                            localStorage.setItem('selectedRoom', JSON.stringify(updatedRoom));
                            window.dispatchEvent(new Event('storageUpdate'));
                        }
                    } catch (error) {
                        console.error("Error actualizando selectedRoom desde localStorage", error);
                    }
                }
                setshowChipBarAdd(true);
                setTimeout(() => setshowChipBarAdd(false), 3000);
                GetCredits();
                handleCloseModal();
            } else {
                setOpenErrorModal(true);
            }
        } catch {
            setOpenErrorModal(true);
        } finally {
            setLoading(false);
        }
    };



    return (
        <Box p={3} sx={{ marginTop: "-80px", width: '90%', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: '16px', mb: 3 }}>
                <IconButton onClick={() => navigate('/')} sx={{ color: "#5A2836", mr: 1 }}>
                    <img
                        src={ArrowBackIcon}
                        alt="Regresar"
                        style={{ width: 24, height: 24, transform: 'rotate(270deg)' }}
                    />
                </IconButton>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "500",
                        fontFamily: "Poppins, sans-serif",
                        color: "#5A2836",
                        fontSize: '26px',
                    }}
                >
                    Gestión
                </Typography>
            </Box>
            <Box sx={{ pl: 5 }}>
                <Box>

                    <Divider sx={{ mb: 3 }} />
                    <Box display="flex" alignItems="center" justifyContent="flex-start" mb={2}>
                        <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                                backgroundColor: "#FFFFFF",
                                border: searchTerm ? "1px solid #7B354D" : "1px solid #9B9295", // Cambia el color del borde si hay texto
                                borderRadius: "4px",
                                padding: "8px 12px",
                                width: "218px",
                                height: "40px",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <img
                                src={seachicon}
                                alt="Buscar"
                                style={{
                                    marginRight: "8px",
                                    width: "16px",
                                    height: "16px",
                                    filter: searchTerm ? "invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)" : "none", // Ajusta el color si hay texto
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Buscar"
                                value={searchTerm} // Variable de estado para el valor del input
                                onChange={handleSearch} // Función que maneja el cambio en el input
                                style={{
                                    border: "none", // Sin borde
                                    outline: "none", // Sin borde al enfocar
                                    width: "100%", // Ocupa todo el espacio restante
                                    fontSize: "16px", // Tamaño de la fuente
                                    fontFamily: "Poppins, sans-serif", // Fuente según especificación
                                    color: searchTerm ? "#7B354D" : "#9B9295", // Cambia el color del texto si hay texto
                                    backgroundColor: "transparent", // Fondo transparente para evitar interferencias
                                }}
                            />
                            {/* Ícono de cerrar cuando hay texto */}
                            {searchTerm && (
                                <img
                                    src={iconclose}
                                    alt="Limpiar búsqueda"
                                    style={{
                                        marginLeft: "8px",
                                        width: "16px",
                                        height: "16px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setSearchTerm("")} // Borra el texto al hacer clic
                                />
                            )}
                        </Box>

                    </Box>
                </Box>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'grid', // Cambiamos el diseño a grid
                            gap: '10px', // Espaciado entre los recuadros
                            gridTemplateColumns: '430px 430px', // Dos columnas con ancho fijo
                            columnGap: '10px', // Espacio horizontal entre columnas
                        }}
                    >
                        {rooms.filter((rooms) => {
                            const term = searchTerm.toLowerCase();
                            const nameWords = rooms.name.toLowerCase().split(" ");
                            return nameWords.some((word) => word.startsWith(term));
                        }).length === 0 ? (
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-end",
                                        justifyContent: "center",
                                        height: "300px",
                                        marginLeft: "50px",
                                    }}
                                >
                                    <img
                                        src={NoResult}
                                        alt="Sin resultados"
                                        style={{
                                            // Ajusta el tamaño a tu gusto
                                            width: "300px",
                                            marginBottom: "16px",
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            textAlign: "center",
                                            color: "#833A53",
                                            fontSize: "16px",
                                            fontFamily: "Poppins, sans-serif",
                                            fontWeight: "medium",
                                        }}
                                    >
                                        No se encontraron resultados.
                                    </Typography>
                                </Box>
                            </Grid>
                        ) : (
                            rooms
                                .filter((rooms) => {
                                    const term = searchTerm.toLowerCase();
                                    const nameWords = rooms.name.toLowerCase().split(" ");
                                    return nameWords.some((word) => word.startsWith(term));
                                })
                                .map((room) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        key={room.id}
                                    >
                                        <Box
                                            sx={{
                                                width: '430px', // Ancho especificado
                                                height: '101px', // Alto especificado
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: '8px',
                                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                                padding: '16px',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <img
                                                    src={HouseIcon}
                                                    alt="Rooms Icon"
                                                    style={{
                                                        width: '46px', // Ajustado al tamaño del icono anterior
                                                        height: '46px',
                                                        marginRight: '16px',
                                                    }}
                                                />
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            textAlign: 'left',
                                                            fontFamily: "Poppins, sans-serif",
                                                            letterSpacing: '0px',
                                                            color: '#574B4F',
                                                            opacity: 1,
                                                            fontSize: '16px',
                                                            whiteSpace: 'nowrap', // Evita el salto de línea
                                                            overflow: 'hidden', // Oculta el texto si es muy largo
                                                        }}
                                                    >
                                                        {room.name}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textAlign: 'left',
                                                            fontFamily: "Poppins, sans-serif",
                                                            letterSpacing: '0px',
                                                            color: '#574B4F',
                                                            opacity: 1,
                                                            fontSize: '14px',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: '90%',
                                                        }}
                                                    >
                                                        {room.description}
                                                    </Typography>

                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ textAlign: 'right', marginRight: '16px' }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textAlign: 'right',
                                                            fontFamily: "Poppins, sans-serif",
                                                            letterSpacing: '0px',
                                                            color: '#8D4B62',
                                                            opacity: 1,
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        SMS # Cortos: {room.short_sms.toLocaleString()}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textAlign: 'right',
                                                            fontFamily: "Poppins, sans-serif",
                                                            letterSpacing: '0px',
                                                            color: '#8D4B62',
                                                            opacity: 1,
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        SMS # Largos: {room.long_sms.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <IconButton onClick={(event) => handleMenuOpen(event, room)}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={menuAnchorEl}
                                                    open={Boolean(menuAnchorEl)}
                                                    onClose={handleMenuClose}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    }}
                                                    transformOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'right',
                                                    }}
                                                    PaperProps={{
                                                        sx: {
                                                            borderRadius: '8px',
                                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                                        },
                                                    }}
                                                >
                                                    <MenuItem onClick={handleOpenModal} sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '10px 16px',
                                                        borderRadius: '8px',
                                                        '&:hover': {
                                                            background: '#F2EBED 0% 0% no-repeat padding-box',
                                                            opacity: 1,
                                                        },
                                                    }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <img
                                                                src={TrashIcon}
                                                                alt="Distribución de créditos"
                                                                width="24"
                                                                height="24"
                                                                style={{ marginRight: "8px" }}
                                                            />
                                                            <Typography
                                                                sx={{
                                                                    fontSize: '14px',
                                                                    fontWeight: 'medium',
                                                                    textAlign: 'left',
                                                                }}
                                                            >
                                                                Distribución de créditos
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))

                        )}
                    </Box>
                )}
            </Box>
            {/* Modal */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={modalOpen}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 460,
                            maxHeight: "80vh", // Limita la altura máxima
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: "12px",
                            overflowY: "auto", // Habilita el scroll vertical
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                                sx={{
                                    textAlign: 'left',
                                    font: 'normal normal 600 20px/54px Poppins',
                                    letterSpacing: '0px',
                                    color: '#574B4F',
                                    opacity: 1,
                                    fontSize: '20px',
                                }}
                            >
                                Distribución de créditos
                            </Typography>
                            <IconButton onClick={handleCloseModal}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center', // Centra horizontalmente
                                gap: 2,               // Espaciado vertical entre elementos
                            }}
                        >
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    font: "normal normal medium 16px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}
                            >
                                Seleccionar sala destino
                            </Typography>
                            <ClickAwayListener onClickAway={handleCloseDropdown2}>
                                <Box sx={{
                                    position: "relative",
                                    // Importante: si tu contenedor tiene overflowY: "auto",
                                    // cámbialo a overflow: "visible" o elimínalo:
                                    // overflow: "visible",
                                }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Seleccionar sala destino"
                                        value={searchTerm3}
                                        onClick={handleOpenDropdown2}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <ArrowDropDownIcon style={{ color: "#A05B71" }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                background: "#FFFFFF",
                                                border: "1px solid #9B9295",
                                                borderRadius: "8px",
                                                opacity: 1,
                                                width: "244px",
                                                height: "40px",
                                                "& input": {
                                                    textAlign: "left",
                                                    font: "normal normal normal 12px/54px Poppins",
                                                    letterSpacing: "0px",
                                                    color: "#786E71",
                                                    opacity: 1,
                                                    fontSize: "12px",
                                                },
                                            },
                                        }}
                                    />
                                    {openDropdown2 && (
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                position: "absolute",
                                                top: "calc(100% + 4px)", // Ubícalo justo debajo del TextField
                                                left: 0,
                                                width: "244px",         // Mismo ancho que el TextField
                                                zIndex: 9999,           // Asegúrate de que se superponga
                                                maxHeight: 300,
                                                overflowY: "auto",
                                                borderRadius: "8px",
                                                // Quita margin o padding extra para que no empuje nada
                                            }}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                sx={{
                                                    backgroundColor: "#FFFFFF",
                                                    border: searchTerm3 ? "1px solid #7B354D" : "1px solid #9B9295",
                                                    borderRadius: "4px",
                                                    padding: "8px 12px",
                                                    width: "218px",         // O el ancho que quieras
                                                    height: "40px",
                                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                                    mb: 2,                  // Separación inferior para la lista
                                                }}
                                            >
                                                <img
                                                    src={seachicon} // Tu ícono de lupa
                                                    alt="Buscar"
                                                    style={{
                                                        marginRight: "8px",
                                                        width: "16px",
                                                        height: "16px",
                                                        // Cambia el color del ícono si hay texto
                                                        filter: searchTerm3
                                                            ? "invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)"
                                                            : "none",
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar"
                                                    value={searchTerm3}
                                                    onChange={(e) => setSearchTerm3(e.target.value)}
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        width: "100%",        // Ocupa el espacio sobrante
                                                        fontSize: "16px",
                                                        fontFamily: "Poppins, sans-serif",
                                                        color: searchTerm3 ? "#7B354D" : "#9B9295",
                                                        backgroundColor: "transparent",
                                                    }}
                                                />
                                                {searchTerm3 && (
                                                    <img
                                                        src={iconclose}  // Tu ícono de cerrar
                                                        alt="Limpiar búsqueda"
                                                        style={{
                                                            marginLeft: "8px",
                                                            width: "16px",
                                                            height: "16px",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => setSearchTerm3("")}
                                                    />
                                                )}
                                            </Box>
                                            <Divider sx={{ my: 0 }} />
                                            <List sx={{ p: 0 }}>
                                                {filteredRooms2.length > 0 ? (
                                                    filteredRooms2.map((room) => (
                                                        <ListItem
                                                            key={room.id}
                                                            component="button"
                                                            onClick={() => handleSelectRoom2(room)}
                                                            sx={{
                                                                // Quita cualquier borde u outline
                                                                border: "none",
                                                                outline: "none",
                                                                boxShadow: "none",

                                                                // Fondo blanco por defecto
                                                                backgroundColor: "#FFF",

                                                                // Evita el color de hover morado
                                                                "&:hover": {
                                                                    backgroundColor: "#f5f5f5", // o "transparent"
                                                                },

                                                                // Quita color de foco o selección si existe
                                                                "&.Mui-focusVisible": {
                                                                    backgroundColor: "transparent",
                                                                },
                                                                "&.Mui-selected": {
                                                                    backgroundColor: "transparent",
                                                                },
                                                                "& .MuiListItemText-primary": {
                                                                    textAlign: "left",
                                                                    font: "normal normal normal 12px/54px Poppins",
                                                                    letterSpacing: "0px",
                                                                    color: "#786E71",
                                                                    opacity: 1,
                                                                    fontSize: "12px",
                                                                    lineHeight: "1.2",
                                                                },

                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={room.name}
                                                                sx={{
                                                                    // Asegura que el texto sea visible
                                                                    color: "#574B4F",
                                                                    fontSize: "16px",
                                                                }}
                                                            />
                                                        </ListItem>
                                                    ))
                                                ) : (
                                                    <ListItem>
                                                        <ListItemText primary="No se encontraron resultados" />
                                                    </ListItem>
                                                )}
                                            </List>
                                        </Paper>
                                    )}
                                </Box>
                            </ClickAwayListener>

                            <Typography
                                sx={{
                                    textAlign: "left",
                                    font: "normal normal medium 16px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}
                            >
                                Seleccionar canal
                            </Typography>
                            <Select
                                fullWidth
                                value={selectedChannel}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                                sx={{
                                    background: "#FFFFFF",
                                    border: "1px solid #9B9295",
                                    borderRadius: "8px",
                                    opacity: 1,
                                    width: "244px",
                                    height: "40px",
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    "& .MuiSelect-select": {
                                        textAlign: "left",
                                        font: "normal normal normal 12px/54px Poppins",
                                        letterSpacing: "0px",
                                        color: "#786E71",
                                        opacity: 1,
                                        fontSize: "12px",
                                        padding: "0 14px",
                                        display: "flex",
                                        alignItems: "center",
                                        lineHeight: "40px",
                                    },
                                }}
                            >
                                <MuiMenuItem value="SMS Cortos" sx={{
                                    textAlign: "left",
                                    font: "normal normal normal 12px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#786E71",
                                    opacity: 1,
                                    fontSize: "12px",
                                    "&:hover": {
                                        background: "#F2EBED 0% 0% no-repeat padding-box",
                                        opacity: 1,
                                    },
                                }}>SMS # Cortos</MuiMenuItem>
                                <MuiMenuItem value="SMS Largos" sx={{
                                    textAlign: "left",
                                    font: "normal normal normal 12px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#786E71",
                                    opacity: 1,
                                    fontSize: "12px",
                                    "&:hover": {
                                        background: "#F2EBED 0% 0% no-repeat padding-box",
                                        opacity: 1,
                                    },
                                }}>SMS # Largos</MuiMenuItem>
                            </Select>
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    font: "normal normal medium 16px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}
                            >
                                Créditos disponibles (sala destino)
                            </Typography>
                            <TextField
                                value={getAvailableCredits()} // Valor dinámico calculado
                                InputProps={{ readOnly: true }} // Hace el campo de solo lectura
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        width: "244px",
                                        height: "40px",
                                        textAlign: 'center',
                                        backgroundColor: "#E0E0E0", // Ajusta el tono de gris que quieras
                                        borderRadius: "2px",
                                        "&:hover fieldset": {
                                            borderColor: "#833A53",
                                        }
                                    },
                                    "& input": {
                                        textAlign: "left",
                                        font: "normal normal medium 16px/54px Poppins",
                                        letterSpacing: "0.03px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                    },
                                }}
                            />

                            <Typography
                                sx={{
                                    textAlign: "left",
                                    font: "normal normal medium 16px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}
                            >
                                Créditos a transferir
                            </Typography>
                            <TextField
                                type="number"
                                value={transferAmount}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (value <= (getAvailableCredits())) {
                                        setTransferAmount(value);
                                    }
                                }}
                                inputProps={{
                                    min: 0,
                                    max: selectedRoom?.credits || 0,
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        width: "244px",
                                        height: "40px",
                                        textAlign: 'center',
                                        borderRadius: "2px",
                                    },
                                    "& input": {
                                        textAlign: "left",
                                        font: "normal normal medium 16px/54px Poppins",
                                        letterSpacing: "0.03px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                    },
                                }}
                            />
                            {/* Nuevo Select Activo */}
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    font: "normal normal medium 16px/54px Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}
                            >
                                Seleccionar nueva sala
                            </Typography>
                            <ClickAwayListener onClickAway={handleCloseDropdown}>
                                {/* 1. Contenedor con position relative para el menú flotante */}
                                <Box sx={{ position: "relative" }}>
                                    {/* Este TextField funciona como 'select' principal */}
                                    <TextField
                                        fullWidth
                                        placeholder="Seleccionar nueva sala"
                                        value={searchTerm2}
                                        onClick={handleOpenDropdown}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <ArrowDropDownIcon style={{ color: "#A05B71" }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                backgroundColor: "#f5f5f5",
                                                "&:hover fieldset": {
                                                    borderColor: "#833A53",
                                                },
                                                width: "244px", // Ajusta el ancho fijo
                                                height: "40px", // Ajusta la altura
                                            },
                                            "& input": {
                                                textAlign: "left",
                                                font: "normal normal normal 12px/54px Poppins",
                                                letterSpacing: "0px",
                                                color: "#786E71",
                                                opacity: 1,
                                                fontSize: "12px",
                                            },
                                        }}
                                    />

                                    {/* 2. Menú flotante que se abre al dar clic */}
                                    {openDropdown && (
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                position: "absolute",
                                                top: "calc(100% + 6px)", // Lo bajas un poco respecto al TextField
                                                left: "6px",            // Lo mueves ligeramente a la derecha
                                                width: "244px",         // Mismo ancho que el TextField
                                                zIndex: 9999,
                                                maxHeight: 250,
                                                overflowY: "auto",
                                                borderRadius: "8px",
                                                p: 0, // Quita padding interno extra
                                            }}
                                        >
                                            {/* 3. Buscador interno estilo “externo” (con lupa y cerrar) */}
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                sx={{
                                                    backgroundColor: "#FFFFFF",
                                                    border: searchTerm2 ? "1px solid #7B354D" : "1px solid #9B9295",
                                                    borderRadius: "4px",
                                                    padding: "8px 12px",
                                                    width: "218px",
                                                    height: "40px",
                                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                                    m: 2, // Separación dentro del Paper
                                                }}
                                            >
                                                <img
                                                    src={seachicon} // tu ícono de lupa
                                                    alt="Buscar"
                                                    style={{
                                                        marginRight: "8px",
                                                        width: "16px",
                                                        height: "16px",
                                                        filter: searchTerm2
                                                            ? "invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)"
                                                            : "none",
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar sala..."
                                                    value={searchTerm2}
                                                    onChange={(e) => setSearchTerm2(e.target.value)}
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        width: "100%",
                                                        fontSize: "16px",
                                                        fontFamily: "Poppins, sans-serif",
                                                        color: searchTerm2 ? "#7B354D" : "#9B9295",
                                                        backgroundColor: "transparent",
                                                    }}
                                                />
                                                {searchTerm2 && (
                                                    <img
                                                        src={iconclose} // tu ícono de cerrar
                                                        alt="Limpiar búsqueda"
                                                        style={{
                                                            marginLeft: "8px",
                                                            width: "16px",
                                                            height: "16px",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => setSearchTerm2("")}
                                                    />
                                                )}
                                            </Box>

                                            {/* 4. Lista con los resultados filtrados */}
                                            <List disablePadding sx={{ p: 0, m: 0 }}>
                                                {filteredRooms.length > 0 ? (
                                                    filteredRooms.map((room) => (
                                                        <ListItem
                                                            key={room.id}
                                                            onClick={() => handleSelectRoom(room)}
                                                            sx={{
                                                                // Menos espacio vertical
                                                                py: 1,
                                                                px: 2,
                                                                cursor: "pointer",
                                                                "&:hover": { backgroundColor: "#f5f5f5" },
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={room.name}
                                                                sx={{
                                                                    textAlign: "left",
                                                                    font: "normal normal normal 12px/54px Poppins",
                                                                    letterSpacing: "0px",
                                                                    color: "#786E71",
                                                                    opacity: 1,
                                                                    fontSize: "12px",
                                                                    lineHeight: "1.2", // Más compacto
                                                                }}
                                                            />
                                                        </ListItem>
                                                    ))
                                                ) : (
                                                    <ListItem sx={{ py: 1, px: 2 }}>
                                                        <ListItemText
                                                            primary="No se encontraron resultados"
                                                            sx={{
                                                                textAlign: "left",
                                                                font: "normal normal normal 12px/54px Poppins",
                                                                letterSpacing: "0px",
                                                                color: "#786E71",
                                                                opacity: 1,
                                                                fontSize: "12px",
                                                            }}
                                                        />
                                                    </ListItem>
                                                )}
                                            </List>
                                        </Paper>
                                    )}
                                </Box>
                            </ClickAwayListener>
                        </Box>

                        {/* Nuevo Select Canal */}
                        {/*<Typography variant="body2" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>*/}
                        {/*    Seleccionar nuevo canal*/}
                        {/*</Typography>*/}
                        {/*<Select*/}
                        {/*    fullWidth*/}
                        {/*    value={selectedNewChannel}*/}
                        {/*    onChange={(e) => setSelectedNewChannel(e.target.value)}*/}
                        {/*>*/}
                        {/*    <MuiMenuItem value="SMS Cortos">SMS # Cortos</MuiMenuItem>*/}
                        {/*    <MuiMenuItem value="SMS Largos">SMS # Largos</MuiMenuItem>*/}
                        {/*</Select>*/}
                        <Divider sx={{ my: 2 }} />

                        <Box display="flex" justifyContent="space-between" mt={3}>
                            <SecondaryButton onClick={handleCloseModal} text="Cancelar" />
                            <MainButton isLoading={loading} text="Transferir" onClick={handleTransferSubmit} />
                        </Box>
                    </Box>
                </Fade>
            </Modal>
            {/* Toast de éxito */}
            {showChipBarAdd && (
                <ChipBar
                    message="Los creditos han sido transferidos correctamente."
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarAdd(false)}
                />
            )}


            <ErrorModal
                isOpen={OpenErrorModal}
                title='Error al transferir créditos'
                message='Algo salió mal. Inténtelo de nuevo o regrese más tarde.'
                buttonText="Cerrar"
                onClose={() => setOpenErrorModal(false)}
            />
        </Box>
    );
};

export default CreditManagement;
