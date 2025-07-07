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
import axios from "axios";
import iconlupa from "../assets/icon-lupa.svg";
import ClearIcon from "@mui/icons-material/Clear";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import NoResult from '../assets/NoResultados.svg'
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from "react-router-dom";

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
                    `${import.meta.env.VITE_SMS_API_URL +
                    import.meta.env.VITE_API_DELETE_ROOM}?id=${selectedRoom.id}`,
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
            const request = `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_GetRooms}?email=${obj?.email}`;
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

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => {
        setModalOpen(false);
        setNewRoom({ name: "", description: "" });
        setErrors({ name: false, description: false });
    };

    const handleOpenEditModal = () => {
        if (selectedRoom!) {
            setNewRoom({
                name: selectedRoom.name,
                description: selectedRoom.description,
            });
            setEditModalOpen(true); // Abre el modal de edición
            handleMenuClose(); // Cierra el menú después de abrir el modal
        }
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedRoom(null);
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
                `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_UPDATE_ROOM}`,
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
                `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_NEW_ROOM
                }`,
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
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1140px", height: 'calc(100vh - 64px)', }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{ color: "#5A2836", mr: 1 }}
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
            <Box sx={{ pl: 5 }}>
                <Divider sx={{ mb: 3 }} />
                <Box display="flex" alignItems="center" justifyContent="flex-start" mb={2}>
                    {/* Botón de Añadir Sala */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            backgroundColor: "#A05B71",
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
                            borderRadius: "8px",
                            padding: "8px 12px",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                            width: "400px", // Ancho fijo como estaba antes
                        }}
                    >
                        <img
                            src={iconlupa}
                            alt="Buscar"
                            style={{
                                height: "20px",
                                width: "20px",
                                marginRight: "8px",
                            }}
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
                                fontSize: "14px",
                                fontFamily: "Poppins, sans-serif",
                                backgroundColor: "transparent",
                            }}
                        />
                        {searchTerm && (
                            <IconButton onClick={clearSearch} size="small" sx={{ color: "#A05B71" }}>
                                <ClearIcon />
                            </IconButton>
                        )}
                    </Box>
                </Box>


                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: '16px',
                            columnGap: '24px',
                            gridTemplateColumns: '500px 500px',
                        }}
                    >
                        {rooms.filter((room) => {
                            const term = searchTerm.toLowerCase();
                            const nameWords = room.name.toLowerCase().split(" ");
                            return nameWords.some((word) => word.startsWith(term));
                        }).length === 0 ? (
                            <Grid item xs={12}>
                                <Box
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    mt={3}

                                >
                                    <img
                                        src={NoResult}
                                        alt="No hay resultados"
                                        style={{
                                            marginTop: 90,
                                            marginLeft: 500,
                                            width: "242px",
                                            height: "168px",
                                            marginBottom: "16px",
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            position: "absolute",
                                            marginTop: 40,
                                            marginLeft: 64,
                                            textAlign: "center",
                                            color: "#7B354D",
                                            fontWeight: 500,
                                            fontSize: "14px",
                                            fontFamily: "Poppins"
                                        }}
                                    >
                                        No se encontraron resultados.
                                    </Typography>
                                </Box>
                            </Grid>

                        ) : (
                            <Box
                                sx={{
                                    width: "1140px",
                                    maxHeight: '465px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    flexDirection: 'row',
                                    alignContent: 'flex-start',
                                    gap: '18px 16px',
                                }}
                            >
                                {rooms
                                    .filter((room) => {
                                        const term = searchTerm.toLowerCase();
                                        const nameWords = room.name.toLowerCase().split(" ");
                                        return nameWords.some((word) => word.startsWith(term));
                                    })
                                    .map((room) => (
                                        <Grid item xs={12} sm={6} md={6} display="flex" justifyContent="flex-start"
                                            width={"430px"} height={"101px"}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '8px',
                                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                                    padding: '16px',
                                                    width: '100%',
                                                    height: '108|px',
                                                    maxWidth: 600,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <HomeIcon
                                                        sx={{
                                                            backgroundColor: '#796E71',
                                                            borderRadius: '50%',
                                                            padding: '8px',
                                                            fontSize: 40,
                                                            color: 'white',
                                                            width: "46px",
                                                            height: "46px",
                                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                                            marginRight: '16px',
                                                        }}
                                                    />
                                                    <Box>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{ fontWeight: '500', fontSize: '16px', color: '#574B4F', fontFamily: "Poppins", }}
                                                        >
                                                            {room.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontSize: '14px', color: '#574B4F', fontFamily: "Poppins", }}
                                                        >
                                                            Cliente: {room.cliente}
                                                        </Typography>
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
                                                                    boxShadow: '0px 8px 16px #00131F3D',
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
                                    }
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
                                disabled={!newRoom.name || !newRoom.description}
                                sx={{
                                    width: "106px",
                                    backgroundColor: "#A05B71",
                                    color: "#fff",
                                    "&:hover": {
                                        backgroundColor: "#8B4D61",
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
                                marginTop: "-5px"
                            }}
                        >
                            Editar sala
                        </Typography>
                        <IconButton
                            onClick={handleCloseEditModal}
                            sx={{
                                position: 'absolute',
                                marginTop: '-68px',
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
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2, mt: 2 }} />
                        <Box display="flex" justifyContent="space-between">
                            <SecondaryButton onClick={handleCloseEditModal}
                                text='Cancelar'
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleUpdateRoom}
                                disabled={
                                    !newRoom.name || !newRoom.description || errors.name || errors.description
                                }
                                sx={{
                                    backgroundColor: "#A05B71",
                                    color: "#fff",
                                    "&:hover": {
                                        backgroundColor: "#8B4D61",
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
                            width: 450,
                            height: 280,
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
                                font: "normal normal 600 20px/54px Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "20px", // Aplicación del tamaño de fuente específico
                                mb: 2, // Margen inferior opcional para espaciar el título del contenido
                            }}
                        >
                            Eliminar sala
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: "left",
                                font: "normal normal normal 16px/22px Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "16px", // Aplicación del tamaño de fuente específico
                                mb: 3, // Margen inferior opcional para espaciar del contenido posterior
                            }}
                        >
                            ¿Está seguro de que desea eliminar la sala? Esta acción no puede ser revertida.
                        </Typography>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 450,
                                height: 300,
                                bgcolor: "background.paper",
                                boxShadow: 24,
                                p: 4,
                                borderRadius: "12px",
                                display: "flex", // Contenedor flexible
                                flexDirection: "column", // Dirección de los elementos
                                justifyContent: "space-between", // Espaciado entre contenido y botones
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        textAlign: "left",
                                        font: "normal normal 600 20px/54px Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "20px",
                                        mb: 2,
                                    }}
                                >
                                    Eliminar sala
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: "left",
                                        font: "normal normal normal 16px/22px Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        mb: 3,
                                    }}
                                >
                                    ¿Está seguro de que desea eliminar la sala? Esta acción no puede ser revertida.
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseDeleteModal}
                                    sx={{
                                        font: "normal normal 600 12px/16px Poppins",
                                        letterSpacing: "1.12px",
                                        color: "#833A53",
                                        textTransform: "uppercase",
                                        opacity: 1,
                                        borderColor: "#833A53",
                                        padding: "0 12px",
                                        height: "50px",
                                        width: "100px",
                                        minWidth: "80px",
                                        lineHeight: "16px",
                                        fontSize: "12px",
                                        "&:hover": {
                                            backgroundColor: "#f9f4f5",
                                        },
                                    }}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleDeleteRoom}
                                    sx={{
                                        font: "normal normal 600 12px/16px Poppins",
                                        letterSpacing: "1.12px",
                                        color: "#fff",
                                        textTransform: "uppercase",
                                        opacity: 1,
                                        backgroundColor: "#833A53",
                                        padding: "0 12px",
                                        height: "50px",
                                        width: "100px",
                                        minWidth: "80px",
                                        lineHeight: "16px",
                                        fontSize: "12px",
                                        "&:hover": {
                                            backgroundColor: "#A54261",
                                        },
                                    }}
                                >
                                    Eliminar
                                </Button>
                            </Box>
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
