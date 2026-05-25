import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    TextField,
    Grid,
    IconButton,
    CircularProgress,
    Divider,
    Modal,
    Fade,
    Backdrop,
    Tooltip,
    Menu,
    MenuItem
} from "@mui/material";
import ChipBar from "../components/commons/ChipBar";
import AddIcon from "@mui/icons-material/Add";
import SecondaryButton from '../components/commons/SecondaryButton'
import Thrashicon from '../assets/Icon-trash-Card.svg'
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import IconCloseModal from "../assets/IconCloseModal.svg";
import HouseIcon from "../assets/IconRooms.svg";
import axios from "../components/commons/AxiosInstance";
import iconlupa from "../assets/icon-lupa.svg";
import ClearIcon from "@mui/icons-material/Clear";
import SpinnerTop from "../assets/SpinnerTop.svg";
import SpinnerBottom from "../assets/SpinnerBottom.svg";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import NoResult from '../assets/NoResultados.svg'
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from "react-router-dom";
import seachicon from '../assets/icon-lupa.svg';
import Iconseachred from "../assets/Iconseachred.svg";
import iconclose from '../assets/icon-close.svg';
import MainButton from "../components/commons/MainButton";

type Room = {
    id: string | number;
    name: string;
    cliente: string;
    description: string;
    credits: number;
    short_sms: number;
    long_sms: number;
    calls: number;
};

const Rooms: React.FC = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newRoom, setNewRoom] = useState({
        name: "",
        description: "",
    });
    const [errors, setErrors] = useState({
        name: false,
        description: false,
    });
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false); // Estado del modal de eliminación
    const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [errorTitle, setErrorTitle] = useState<string>("");
    const [showChipBar, setShowChipBar] = useState(false);
    const [showEditChipBar, setShowEditChipBar] = useState(false);
    const [showDeleteChipBar, setShowDeleteChipBar] = useState(false);
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };
    const [originalRoom, setOriginalRoom] = useState({ name: "", description: "" });



    const handleOpenErrorModal = (title: string) => {
        setErrorTitle(title);
        setErrorModalOpen(true);
    };

    const handleCloseErrorModal = () => {
        setErrorModalOpen(false);
    };
    const handleOpenDeleteModal = (room: Room) => {
        setSelectedRoom(room); // Almacena la sala seleccionada
        setDeleteModalOpen(true); // Abre el modal
    };

    const handleOpenEditModal = () => {
        if (selectedRoom!) {
            const roomData = {
                name: selectedRoom.name,
                description: selectedRoom.description,
            };
            setNewRoom(roomData);
            setOriginalRoom(roomData); // guarda los valores originales
            setEditModalOpen(true);
            handleMenuClose();
        }
    };


    const hasChanges = () => {
        return (
            newRoom.name !== originalRoom.name ||
            newRoom.description !== originalRoom.description
        );
    };


    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false); // Cierra el modal
        setSelectedRoom(null); // Limpia la sala seleccionada
    };
    const handleDeleteRoom = async () => {
        if (selectedRoom) {
            setLoading(true);
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*"
                };
                const response = await axios.get(
                    `${import.meta.env.VITE_API_DELETE_ROOM}?id=${selectedRoom.id}`,
                    { headers }
                );

                if (response.status === 200) {
                    setShowDeleteChipBar(true);
                    setTimeout(() => setShowDeleteChipBar(false), 3000);
                    GetRooms();
                }
            } catch {
                handleOpenErrorModal("Error al eliminar sala");
            } finally {
                setLoading(false);
                handleCloseDeleteModal(); // Cierra el modal
            }
        }
    };

    const GetRooms = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        try {
            const request = `${import.meta.env.VITE_API_GetRooms}?email=${obj?.email}`;
            const response = await axios.get(request);

            if (response.status === 200) {
                setRooms(response.data);
                localStorage.setItem('ListRooms', JSON.stringify(response.data));
                window.dispatchEvent(new Event('roomsUpdate'));
            }
        } catch {
            handleOpenErrorModal("Error al traer las salas");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        GetRooms();
    }, []);

    const handleOpenModal = () => {
        setNewRoom({ name: "", description: "" });
        setErrors({ name: false, description: false });
        setModalOpen(true);
    };
    const handleCloseModal = () => {
        setModalOpen(false);
        setNewRoom({ name: "", description: "" });
        setErrors({ name: false, description: false });
    };



    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedRoom(null);
        setOriginalRoom({ name: "", description: "" }); // opcional
    };


    const handleUpdateRoom = async () => {
        setLoading(true); // Muestra el loader mientras se procesa la solicitud
        const usuario = localStorage.getItem("userData");
        const formData = JSON.parse(usuario!);

        try {
            // Define los datos que se enviarán en la solicitud
            const data = {
                id: selectedRoom?.id || 0,
                iduser: formData.id,
                name: newRoom.name,
                description: newRoom.description,
                credits: 0,
                long_sms: 0,
                calls: 0,
                idClient: formData.idCliente,
            };

            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*"
            };

            // Realiza la solicitud POST al endpoint
            const response = await axios.post(
                `${import.meta.env.VITE_API_UPDATE_ROOM}`,
                data,
                { headers },
            );

            console.log(`Response: ${response}`);
            if (response.status === 200) {
                setShowEditChipBar(true);
                setTimeout(() => setShowEditChipBar(false), 3000);

                GetRooms();
            }
        } catch {
            handleOpenErrorModal("Error al actualizar sala");
        } finally {
            setLoading(false); // Detén el loader
            handleCloseEditModal(); // Cierra el modal
        }
    };



    const handleCreateRoom = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");

        const formData = JSON.parse(usuario!);
        try {
            const data = {
                iduser: formData.id,
                name: newRoom.name,
                description: newRoom.description,
                credits: 0,
                long_sms: 0,
                calls: 0,
                idClient: formData.idCliente,

            };

            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*"
            };
            const response = await axios.post(
                `${import.meta.env.VITE_API_NEW_ROOM}`,
                data,
                { headers },
            );

            console.log(`Response: ${response}`);
            if (response.status === 200) {
                setShowChipBar(true); // Mostrar ChipBar
                setTimeout(() => setShowChipBar(false), 3000);
                setLoading(false);

            }
        } catch {
            handleOpenErrorModal("Error al crear sala");
        }

        console.log("Room Created:", newRoom);
        GetRooms();
        handleCloseModal();
    };

    const handleInputChange = (
        field: "name" | "description",
        value: string
    ) => {
        setNewRoom((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: !validateInput(value) }));
    };

    const validateInput = (value: string) => {
        return /^[a-zA-ZÀ-ÿ0-9\s]*$/.test(value);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, room: Room) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedRoom(room);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    return (
        <Box p={3}
            sx={{
                width: "100%",
                mx: "auto",
                px: {
                    sm: 2,
                    md: 3,
                    lg: 3,
                },
                pt: {
                    sm: 2,
                    md: 3,
                },
                minHeight: "calc(100vh - 64px)",
                overflowX: "hidden", marginTop: "-80px"
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{ p: 0, mr: 1 }}
                >
                    <img
                        src={ArrowBackIosNewIcon}
                        alt="Regresar"
                        style={{ width: 24, height: 24, transform: 'rotate(270deg)' }}
                    />
                </IconButton>

                <Typography
                    variant="h4"
                    fontFamily="Poppins"
                    sx={{ color: "#330F1B", fontSize: '26px', }}
                >
                    Salas
                </Typography>
            </Box>
            <Box sx={{
                width: "100%",

                px: {
                    sm: 1,
                    md: 2,
                    lg: 3,
                },
            }}>
                <Divider sx={{ width: '100%', mb: 3 }} />
                <Box
                    display="flex"
                    flexWrap="wrap"
                    alignItems="center"
                    gap={2}
                    mb={2}
                >
                    {/* Botón de Añadir Sala */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: "#833A53",
                            border: "1px solid #60293C",
                            width: "170px",
                            height: "100%",
                            marginRight: "16px",
                        }}
                        onClick={handleOpenModal}
                    >
                        Añadir Sala
                    </Button>

                    {/* Contenedor del Buscador */}
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            backgroundColor: "#FFFFFF",
                            border: searchTerm ? "1px solid #7B354D" : "1px solid #9B9295",
                            borderRadius: "4px",
                            px: 2,
                            py: 1,
                            width: "218px",
                            height: "40px"
                        }}
                    >
                        <img
                            src={searchTerm ? Iconseachred : seachicon}
                            alt="Buscar"
                            style={{ marginRight: 8, width: 24 }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{
                                border: "none",
                                outline: "none",
                                width: "100%",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: searchTerm ? "#7B354D" : "#9B9295",
                                backgroundColor: "transparent",
                            }}
                        />
                        {searchTerm && (
                            <img
                                src={iconclose}
                                alt="Limpiar búsqueda"
                                onClick={clearSearch}
                                style={{ marginLeft: 8, width: 24, height: 24, cursor: 'pointer' }}
                            />
                        )}
                    </Box>
                </Box>


                {loading ? (
                    <Box sx={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}>
                        <Box
                            sx={{
                                position: "relative",
                                width: 80,
                                height: 80
                            }}
                        >
                            {/* Spinner base */}
                            <img
                                src={SpinnerBottom}
                                alt="loading-base"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    position: "absolute",
                                    top: 0,
                                    left: 0
                                }}
                            />

                            {/* Spinner que gira */}
                            <img
                                src={SpinnerTop}
                                alt="loading-top"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    animation: "spin 1s linear infinite"
                                }}
                            />
                        </Box>
                        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "grid",

                            gap: {
                                sm: "16px",
                                md: "24px",
                            },

                            gridTemplateColumns: {
                                sm: "1fr",
                                md: "repeat(2, 1fr)",
                            },

                            width: "100%",
                        }}
                    >
                        {rooms.filter((room) => {
                            const term = searchTerm.toLowerCase();
                            const nameWords = room.name.toLowerCase().split(" ");
                            return nameWords.some((word) => word.startsWith(term));
                        }).length === 0 ? (

                            <Box
                                sx={{
                                    display: "flex",

                                    flexDirection: "column",

                                    alignItems: "center",

                                    justifyContent: "center",

                                    width: "100%",
                                    minHeight: "40vh",

                                    mt: 12, ml: 32,

                                    textAlign: "center",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={NoResult}
                                    alt="No hay resultados"
                                    sx={{
                                        width: {
                                            sm: "200px",
                                            md: "240px",
                                            lg: "280px",
                                        },

                                        height: "auto",

                                        mb: 2,
                                    }}
                                />

                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#7B354D",

                                        fontWeight: 500,

                                        fontSize: {
                                            sm: "12px",
                                            md: "14px",
                                        },

                                        fontFamily: "Poppins",
                                    }}
                                >
                                    No se encontraron resultados.
                                </Typography>
                            </Box>

                        ) : (
                            <Box
                                sx={{
                                    backgroundColor: "F2F2F2",
                                    width: "200%",
                                    maxHeight: {
                                        sm: "60vh",
                                        md: "65vh",
                                    },

                                    overflowY: "auto",

                                    display: "grid",

                                    gridTemplateColumns: {
                                        sm: "1fr",
                                        md: "repeat(2, 1fr)",
                                    },

                                    gap: {
                                        sm: "16px",
                                        md: "24px",
                                    },
                                }}
                            >
                                {rooms
                                    .filter((room) => {
                                        const term = searchTerm.toLowerCase();
                                        const nameWords = room.name.toLowerCase().split(" ");
                                        return nameWords.some((word) => word.startsWith(term));
                                    })
                                    .map((room) => (
                                        <Grid item
                                            xs={12}
                                            sm={12}
                                            md={6}
                                            sx={{
                                                width: "100%",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',

                                                    backgroundColor: '#FFFFFF',

                                                    borderRadius: '8px',

                                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',

                                                    padding: {
                                                        sm: '12px',
                                                        md: '16px',
                                                    },

                                                    width: '100%',

                                                    minHeight: '108px',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <img
                                                        src={HouseIcon}
                                                        alt="Rooms Icon"
                                                        style={{
                                                            width: '46px',
                                                            height: '46px',
                                                            marginRight: '16px',
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{ fontWeight: '500', fontSize: '16px', color: '#574B4F', fontFamily: "Poppins", }}
                                                        >
                                                            {room.name?.length > 28
                                                                ? `${room.name.slice(0, 28)}...`
                                                                : room.name
                                                            }
                                                        </Typography>

                                                        <Tooltip
                                                            title={room.description}
                                                            placement="top"
                                                            arrow
                                                            componentsProps={{
                                                                tooltip: {
                                                                    sx: {
                                                                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                                                                        color: "#DEDADA",
                                                                        fontFamily: "Poppins, sans-serif",
                                                                        fontSize: "12px",
                                                                        padding: "6px 8px",
                                                                        borderRadius: "8px",
                                                                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)"
                                                                    }
                                                                },
                                                                arrow: {
                                                                    sx: {
                                                                        color: "rgba(0, 0, 0, 0.8)"
                                                                    }
                                                                }
                                                            }}
                                                            PopperProps={{
                                                                modifiers: [
                                                                    {
                                                                        name: 'offset',
                                                                        options: {
                                                                            offset: [0, -10]
                                                                        }
                                                                    }
                                                                ]
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ fontSize: '14px', color: '#574B4F', fontFamily: "Poppins", }}
                                                            >
                                                                Descripción:
                                                                {room.description?.length > 16
                                                                    ? `${room.description.slice(0, 16)}...`
                                                                    : room.description
                                                                }
                                                            </Typography>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{ textAlign: 'right', marginRight: '16px' }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontSize: '14px',
                                                                color: '#8D4B62',
                                                                fontWeight: '500',
                                                                fontFamily: "Poppins"
                                                            }}
                                                        >
                                                            SMS cortos: {room.short_sms.toLocaleString()}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontSize: '14px',
                                                                color: '#8D4B62',
                                                                fontWeight: '500',
                                                                fontFamily: "Poppins"
                                                            }}
                                                        >
                                                            SMS largos: {room.long_sms.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <IconButton onClick={(event) => handleMenuOpen(event, room)}>
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                        <Menu
                                                            anchorEl={menuAnchorEl}
                                                            open={Boolean(menuAnchorEl)}
                                                            onClose={handleMenuClose}
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                            PaperProps={{
                                                                sx: {
                                                                    borderRadius: '8px',
                                                                },
                                                            }}
                                                        >
                                                            <MenuItem onClick={handleOpenEditModal}
                                                                sx={{
                                                                    width: "184px", height: "40px",
                                                                    fontFamily: 'Poppins',
                                                                    fontSize: '14px',
                                                                    '&:hover': {
                                                                        backgroundColor: '#F2EBED'
                                                                    }
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" sx={{ mr: 1, color: '#5F5064', width: 24, height: 24 }} />
                                                                <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#583B43" }}>

                                                                    Editar
                                                                </Typography>
                                                            </MenuItem>
                                                            <MenuItem onClick={() => handleOpenDeleteModal(room)}
                                                                sx={{
                                                                    fontFamily: 'Poppins',
                                                                    fontSize: '14px',
                                                                    '&:hover': {
                                                                        backgroundColor: '#F2EBED'
                                                                    }
                                                                }}
                                                            >
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    <img
                                                                        src={Thrashicon}
                                                                        alt="Eliminar"
                                                                        style={{ width: 24, height: 24, color: '#5F5064' }}
                                                                    />
                                                                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4F" }}>
                                                                        Eliminar
                                                                    </Typography>
                                                                </Box>
                                                            </MenuItem>
                                                        </Menu>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                            </Box>
                        )}
                    </Box>

                )}
            </Box>
            {/* Modal for adding room */}
            <Modal
                open={modalOpen}
                onClose={(_, reason) => {
                    if (reason === "backdropClick") return;
                    handleCloseModal();
                }}
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
                            width: "556px",
                            height: "405px",
                            bgcolor: "background.paper",
                            fontFamily: "Poppins",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: "12px",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: "left",
                                fontStyle: "normal",
                                fontVariant: "normal",
                                fontFamily: "Poppins",
                                fontWeight: 600,
                                letterSpacing: "1.12px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "20px",
                                marginBottom: "16px",
                                marginTop: "-5px"
                            }}
                        >
                            Añadir sala
                        </Typography>
                        <IconButton
                            onClick={handleCloseModal}
                            sx={{
                                position: 'absolute',
                                marginTop: '-68px',
                                marginLeft: '474px',
                                zIndex: 10
                            }}
                        >
                            <img
                                src={IconCloseModal}
                                alt="x"
                                width="24"
                                height="24"
                            />
                        </IconButton>
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2 }} />
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            marginBottom: 2
                        }}>
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                    marginBottom: "2px",
                                    marginLeft: "-180px"
                                }}
                            >
                                Nombre de la sala
                                <span style={{ color: "red" }}>*</span>
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={newRoom.name}
                                error={errors.name}
                                helperText={errors.name ? "Nombre inválido, solo letras y números." : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setNewRoom((prev) => ({ ...prev, name: value }));
                                    setErrors((prev) => ({ ...prev, name: !validateInput(value) }));
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip
                                            title={
                                                <Box
                                                    sx={{
                                                        backgroundColor: "#FFFFFF",
                                                        borderRadius: "8px",
                                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                        padding: "8px 12px",
                                                        fontSize: "14px",
                                                        fontFamily: "Poppins",
                                                        color: "#574B4F",
                                                        whiteSpace: "pre-line",
                                                        transform: "translate(-1px, -15px)",
                                                        borderColor: "#00131F3D",
                                                        borderStyle: "solid",
                                                        borderWidth: "1px"
                                                    }}
                                                >
                                                    <>
                                                        • Solo caracteres alfanuméricos<br />
                                                        • Longitud máxima de 40<br />
                                                        caracteres
                                                    </>
                                                </Box>
                                            }
                                            placement="bottom-end"
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        backgroundColor: "transparent",
                                                        padding: 0,
                                                    },
                                                },
                                            }}
                                        >
                                            <img
                                                src={errors.name ? infoiconerror : infoicon}
                                                alt="Info"
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    marginLeft: "8px",
                                                }}
                                            />
                                        </Tooltip>
                                    ),
                                }}
                                inputProps={{
                                    maxLength: 40,
                                    style: {
                                        fontFamily: 'Poppins, sans-serif'
                                    }
                                }}
                                sx={{
                                    width: "340px",
                                    height: "54px",
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        fontFamily: 'Poppins, sans-serif',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontFamily: 'Poppins, sans-serif',
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                        }}>
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                    marginBottom: "2px",
                                    marginLeft: "-232px"
                                }}
                            >
                                Descripción
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={newRoom.description}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setNewRoom((prev) => ({ ...prev, description: value }));
                                    setErrors((prev) => ({ ...prev, description: !validateInput(value) }));
                                }}
                                error={errors.description}
                                helperText={errors.description ? "Descripción inválida, solo caracteres alfabéticos." : ""}
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip
                                            title={
                                                <Box
                                                    sx={{
                                                        backgroundColor: "#FFFFFF",
                                                        borderRadius: "8px",
                                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                        padding: "8px 12px",
                                                        fontSize: "14px",
                                                        fontFamily: "Poppins",
                                                        color: "#574B4F",
                                                        whiteSpace: "pre-line",
                                                        transform: "translate(-1px, -15px)",
                                                        borderColor: "#00131F3D",
                                                        borderStyle: "solid",
                                                        borderWidth: "1px"
                                                    }}
                                                >
                                                    <>
                                                        • Solo caracteres alfabéticos<br />
                                                        • Longitud máxima de 40<br />
                                                        caracteres
                                                    </>
                                                </Box>
                                            }
                                            placement="bottom-end"
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        backgroundColor: "transparent",
                                                        padding: 0,
                                                    },
                                                },
                                            }}
                                        >
                                            <img
                                                src={errors.description ? infoiconerror : infoicon}
                                                alt="Info"
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    marginLeft: "8px",
                                                }}
                                            />
                                        </Tooltip>
                                    ),
                                }}
                                inputProps={{ maxLength: 40 }}
                                sx={{
                                    width: "340px",
                                    height: "54px",
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        fontFamily: 'Poppins, sans-serif',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontFamily: 'Poppins, sans-serif',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                    },
                                }}
                            />
                        </Box>
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2, mt: 2 }} />
                        <Box display="flex" justifyContent="space-between">
                            <SecondaryButton onClick={handleCloseModal}
                                text='Cancelar'
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateRoom}
                                disabled={
                                    !newRoom.name ||

                                    errors.name
                                }
                                sx={{
                                    width: "106px",
                                    backgroundColor: "#833A53",
                                    color: "#fff",
                                    "&:hover": {
                                        backgroundColor: "#60293C",
                                    },
                                    height: "100%",
                                    marginLeft: "8px",
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            color: "#fff",
                                        }}
                                    />
                                ) : (
                                    "Crear"
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <Modal
                open={editModalOpen}
                onClose={handleCloseEditModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={editModalOpen}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "556px",
                            height: "405px",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: "12px",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: "left",
                                fontStyle: "normal",
                                fontVariant: "normal",
                                fontFamily: "Poppins",
                                fontWeight: 600,
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "20px",
                                marginBottom: "16px",
                                marginTop: "-10px", marginLeft: "-5px"
                            }}
                        >
                            Editar sala
                        </Typography>
                        <IconButton
                            onClick={handleCloseEditModal}
                            sx={{
                                position: 'absolute',
                                marginTop: '-64px',
                                marginLeft: '474px',
                                zIndex: 10
                            }}
                        >
                            <CloseIcon sx={{ color: '#A6A6A6' }} />
                        </IconButton>
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2 }} />
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            marginBottom: 2
                        }}>
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                    marginBottom: "2px",
                                    marginLeft: "-180px"
                                }}
                            >
                                Nombre de la sala
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={newRoom.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                error={errors.name}
                                helperText={
                                    errors.name ? "Nombre inválido, solo caracteres alfabéticos." : ""
                                }
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip
                                            title={
                                                <Box
                                                    sx={{
                                                        backgroundColor: "#FFFFFF",
                                                        borderRadius: "8px",
                                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                        padding: "8px 12px",
                                                        fontSize: "14px",
                                                        fontFamily: "Poppins",
                                                        color: "#574B4F",
                                                        whiteSpace: "pre-line",
                                                        transform: "translate(-1px, -15px)",
                                                        borderColor: "#00131F3D",
                                                        borderStyle: "solid",
                                                        borderWidth: "1px"
                                                    }}
                                                >
                                                    <>
                                                        • Solo caracteres alfabéticos<br />
                                                        • Longitud máxima de 40<br />
                                                        caracteres
                                                    </>
                                                </Box>
                                            }
                                            placement="bottom-end"
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        backgroundColor: "transparent",
                                                        padding: 0,
                                                    },
                                                },
                                            }}
                                        >
                                            <img
                                                src={errors.name ? infoiconerror : infoicon}
                                                alt="Info"
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    marginLeft: "8px",
                                                }}
                                            />
                                        </Tooltip>
                                    ),
                                }}
                                inputProps={{
                                    maxLength: 40,
                                    style: {
                                        fontFamily: 'Poppins, sans-serif'
                                    }
                                }}
                                sx={{
                                    width: "340px",
                                    height: "54px",
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        fontFamily: 'Poppins, sans-serif',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontFamily: 'Poppins, sans-serif',
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                        }}>
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "16px",
                                    marginBottom: "2px",
                                    marginLeft: "-232px"
                                }}
                            >
                                Descripción
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={newRoom.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                error={errors.description}
                                helperText={
                                    errors.description
                                        ? "Descripción inválida, solo caracteres alfabéticos."
                                        : ""
                                }
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip
                                            title={
                                                <Box
                                                    sx={{
                                                        backgroundColor: "#FFFFFF",
                                                        borderRadius: "8px",
                                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                        padding: "8px 12px",
                                                        fontSize: "14px",
                                                        fontFamily: "Poppins",
                                                        color: "#574B4F",
                                                        whiteSpace: "pre-line",
                                                        transform: "translate(-1px, -15px)",
                                                        borderColor: "#00131F3D",
                                                        borderStyle: "solid",
                                                        borderWidth: "1px"
                                                    }}
                                                >
                                                    <>
                                                        • Solo caracteres alfabéticos<br />
                                                        • Longitud máxima de 40<br />
                                                        caracteres
                                                    </>
                                                </Box>
                                            }
                                            placement="bottom-end"
                                            componentsProps={{
                                                tooltip: {
                                                    sx: {
                                                        backgroundColor: "transparent",
                                                        padding: 0,
                                                    },
                                                },
                                            }}
                                        >
                                            <img
                                                src={errors.description ? infoiconerror : infoicon}
                                                alt="Info"
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    marginLeft: "8px",
                                                }}
                                            />
                                        </Tooltip>
                                    ),
                                }}
                                inputProps={{ maxLength: 40 }}
                                sx={{
                                    width: "340px",
                                    height: "54px",
                                    mb: 2,
                                    '& .MuiInputBase-input': {
                                        fontFamily: 'Poppins, sans-serif',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        fontFamily: 'Poppins, sans-serif',
                                    }
                                }}
                            />
                        </Box>
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2, mt: 3 }} />
                        <Box display="flex" gap={24.1} >
                            <SecondaryButton onClick={handleCloseEditModal}
                                text='Cancelar'
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpdateRoom}
                                disabled={
                                    !hasChanges() || !newRoom.name || !newRoom.description || errors.name || errors.description
                                }
                                sx={{
                                    backgroundColor: "#833A53",
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#60293C" },
                                    height: "100%",
                                    marginLeft: "8px",
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </Button>

                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <Modal
                open={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={deleteModalOpen}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "480px",
                            height: "228px",
                            backgroundColor: "#FFFFFF",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: "8px",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: "left",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "20px", mt: -1, mb: 3, fontWeight: 600
                            }}
                        >
                            Eliminar sala
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: "left",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "16px",
                                mb: 3,
                            }}
                        >
                            ¿Está seguro de que desea eliminar la sala? Esta acción no puede ser revertida.
                        </Typography>

                        <Box mt={4} display="flex" gap={2.5} justifyContent={"flex-end"} >

                            <Button onClick={handleCloseDeleteModal}
                                sx={{
                                    width: "112px", height: "32px", borderRadius: "4px", border: "transparent",
                                    backgroundColor: "#FFFFFF",
                                    "&:hover": {
                                        backgroundColor: "#F2E9EC",
                                    },
                                }}
                            >
                                <Typography sx={{ fontFamily: "Poppins", color: "#833A53", fontSize: "14px", fontWeight: 600, letterSpacing: "1.12px" }}>
                                    CANCELAR
                                </Typography>
                            </Button>

                            <Button onClick={handleDeleteRoom}
                                sx={{
                                    width: "92px", height: "32px", borderRadius: "4px", border: "transparent",
                                    backgroundColor: "#FFFFFF",
                                    "&:hover": {
                                        backgroundColor: "#F2E9EC",
                                    },
                                }}
                            >
                                <Typography sx={{ fontFamily: "Poppins", color: "#833A53", fontSize: "14px", fontWeight: 600, letterSpacing: "1.12px" }}>
                                    ELIMINAR
                                </Typography>
                            </Button>
                        </Box>



                    </Box>
                </Fade>
            </Modal>

            <Modal
                open={errorModalOpen}
                onClose={handleCloseErrorModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={errorModalOpen}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 400,
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: "12px",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                            {errorTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>
                            Algo salió mal. Inténtelo de nuevo o regrese más tarde.
                        </Typography>
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                onClick={handleCloseErrorModal}
                                sx={{ backgroundColor: "#A05B71", color: "#fff" }}
                            >
                                Cerrar
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
            {showChipBar && (
                <ChipBar
                    message="La sala ha sido añadida correctamente."
                    buttonText="Cerrar"
                    onClose={() => setShowChipBar(false)}
                />
            )}
            {showEditChipBar && (
                <ChipBar
                    message="La sala ha sido editada correctamente."
                    buttonText="Cerrar"
                    onClose={() => setShowEditChipBar(false)}
                />
            )}

            {showDeleteChipBar && (
                <ChipBar
                    message="La sala ha sido eliminada correctamente."
                    buttonText="Cerrar"
                    onClose={() => setShowDeleteChipBar(false)}
                />
            )}

        </Box>
    );
};

export default Rooms;
