import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Tooltip,
    Modal,
    TextField,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    RadioGroup,
    Radio,
    Grid,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import usrAdmin from "../assets/usrAdmin.svg";
import usrSup from "../assets/usrSup.svg";
import usrMon from "../assets/usrMon.svg"
import Nousers from "../assets/Nousers.svg"
import { Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Thrashicon from '../assets/Icon-trash-Card.svg'
import ChipBar from "../components/commons/ChipBar";
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import IconCheckBox2 from "../assets/IconCheckBox2.svg";
import IconHouse from "../assets/IconHouse.svg";
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import SecondaryButton from "../components/commons/SecondaryButton";
import MainButton from "../components/commons/MainButton";
type Account = {
    id: number;
    name: string;
    email: string;
    rooms: string;
    status: boolean;
    role: string;
    phoneNumber?: string;
};

type Room = {
    id: number;
    name: string;
    long_sms: boolean;
    calls: boolean;
    credits: number;
};

type FormData = {
    name: string;
    email: string;
    confirmEmail: string;
    phone: string;
    useRecoveryEmail: boolean;
    password: string;
    confirmPassword: string;
    allAndFuture: boolean;
    profile: string;
    rooms: string;
};



const ManageAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [openAddUserModal, setOpenAddUserModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [ConfirmationEmail, setConfirmationEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false); // Para saber si es edición
    const [loading, setLoading] = useState(false);
    const [showChipBarAdd, setshowChipBarAdd] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        confirmEmail: "",
        phone: "",
        useRecoveryEmail: false,
        password: "",
        confirmPassword: "",
        allAndFuture: false,
        profile: "",
        rooms: "",
    });

    const [showErrors, setShowErrors] = useState({
        email: false,
        confirmEmail: false,
        phone: false,
        password: false,
        confirmPassword: false,
    });


    const isPasswordValid = (password: string): boolean => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    };




    const handleCheckboxChange = (id: number) => {
        setSelectedRooms((prev) => {
            const newSelectedRooms = prev.includes(id)
                ? prev.filter((roomId) => roomId !== id)
                : [...prev, id];

            // Actualizar formData.rooms como una lista separada por comas
            setFormData((prevFormData) => ({
                ...prevFormData,
                rooms: newSelectedRooms.join(","),
            }));

            return newSelectedRooms;
        });
    };
    const navigate = useNavigate();


    const handleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            // Seleccionar todas las salas
            setSelectedRooms(rooms.map((room) => room.id));
        } else {
            // Deseleccionar todas las salas
            setSelectedRooms([]);
        }
    };
    const handleSelectAllAndFuture = (isChecked: boolean) => {
        if (isChecked) {
            setSelectedRooms(rooms.map((room) => room.id)); // Seleccionar todas las salas
            setFormData((prev) => ({ ...prev, allAndFuture: true })); // Establecer allAndFuture como true
        } else {
            setSelectedRooms([]); // Deseleccionar todas las salas
            setFormData((prev) => ({ ...prev, allAndFuture: false })); // Establecer allAndFuture como false
        }
    };

    const areAllRoomsSelected = rooms.length > 0 && selectedRooms.length === rooms.length;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: Account) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedAccount(account); // Asegúrate de configurar el estado correctamente
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleOpenModal = () => {
        fetchRooms();
        setOpenAddUserModal(true);
    };

    const handleCloseModal = () => {
        setOpenAddUserModal(false);
        setIsEditing(false);
        setFormData({
            name: "",
            email: "",
            confirmEmail: "",
            phone: "",
            useRecoveryEmail: false,
            password: "",
            confirmPassword: "",
            allAndFuture: false,
            profile: "",
            rooms: "",
        });
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));


        if (type !== "checkbox" && value !== "") {
            setShowErrors((prev) => ({ ...prev, [name]: true }));
        }
    };

    const handleDeleteUser = async () => {
        if (selectedAccount) {
            try {
                const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_DELETE_USERS}?id=${selectedAccount.id}`;
                const response = await axios.get(requestUrl);

                if (response.status === 200) {
                    setAccounts((prevAccounts) =>
                        prevAccounts.filter((account) => account.id !== selectedAccount.id)
                    );
                    console.log("Usuario eliminado correctamente.");
                } else {
                    console.error("Error al eliminar la cuenta.");
                }
            } catch (error) {
                console.error("Error en la solicitud de eliminación:", error);
            } finally {
                setOpenDeleteModal(false);
                setSelectedAccount(null);
            }
        }
    };

    const handleAddUser = async () => {
        try {
            const userData = localStorage.getItem("userData");
            if (!userData) {
                navigate('/');
                return;
            }

            const parsedUserData = JSON.parse(userData);
            const clientId = parsedUserData.idCliente;
            // Prepare data to match the DTO
            if (formData.useRecoveryEmail) {
                setConfirmationEmail(parsedUserData.email);
            } else {
                setConfirmationEmail(formData.email);
            }
            const data = {
                FirstName: formData.name,
                Email: formData.email,
                ConfirmationEmail: ConfirmationEmail,
                FutureRooms: formData.allAndFuture,
                Profile: formData.profile,
                PhoneNumber: formData.phone,
                Password: !isEditing ? formData.password : '123', // Solo enviar si no es edición
                Rooms: selectedRooms.join(","),
                IdCliente: clientId,
                IdUsuario: parsedUserData.id,
            };

            // Make POST request
            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*",
            };

            if (isEditing) {
                // Lógica para actualizar un usuario existente
                const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_UPDATE_USERS}`; // Cambiar por el endpoint real de actualización
                const response = await axios.post(apiEndpoint, data, { headers });

                if (response.status === 200) {
                    setshowChipBarAdd(true); // Mostrar ChipBar para edición exitosa
                    setTimeout(() => setshowChipBarAdd(false), 3000);
                    fetchAccounts(); // Refrescar la lista de usuarios
                    setOpenAddUserModal(false); // Cerrar el modal
                    setIsEditing(false); // Salir del modo de edición
                }
            } else {
                const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ADD_USERS}`; // Cambia por tu endpoint real
                const response = await axios.post(apiEndpoint, data, {
                    headers
                });

                if (response.status === 200) {
                    fetchAccounts();
                    setFormData({
                        name: "",
                        email: "",
                        confirmEmail: "",
                        phone: "",
                        useRecoveryEmail: false,
                        password: "",
                        confirmPassword: "",
                        allAndFuture: false,
                        profile: "",
                        rooms: "",
                    });
                    setOpenAddUserModal(false);
                }
            }


        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorCode = error.response.data?.code;

                if (errorCode === "DuplicateUserName") {
                    setErrorMessage(
                        "Email Registrado previamente."
                    );
                }
                if (errorCode === "ConfirmationUnsent") {
                    setErrorMessage(
                        "No se pudo enviar el mail de confirmacion"
                    );
                }
                if (errorCode === "agregarusuario") {
                    setErrorMessage(
                        "Error al Agregar un usuario. por favor intente más tarde"
                    );
                }
            }

            setErrorModalOpen(true);
        }
        finally {
            fetchRooms();
        }
    };

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const userData = localStorage.getItem("userData");
            if (!userData) {
                navigate("/login");
                return;
            }

            const parsedUserData = JSON.parse(userData);
            const clientId = parsedUserData.idCliente;

            if (!clientId) {
                console.error("El idCliente no está disponible en los datos del usuario.");
                return;
            }

            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GETBYCLIENT_USERS}?Client=${clientId}`;
            const response = await axios.get(request);
            if (response.status === 200) {
                setAccounts(response.data);
            }
        } catch {
            setErrorMessage(
                "Error al traer los usuarios. por favor intente más tarde"
            );
            setErrorModalOpen(true);
        }
        finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };
    const fetchRooms = async () => {
        try {
            const userData = localStorage.getItem("userData");
            if (!userData) {
                navigate("/login");
                return;
            }

            const parsedUserData = JSON.parse(userData);
            const clientId = parsedUserData.idCliente;

            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ROOMBYCLIENTE_ROOM}?Client=${clientId}`;
            const response = await axios.get(request);
            if (response.status === 200) {
                const roomsData = Array.isArray(response.data) ? response.data : [];
                // Asegurarse de que los datos coincidan con el tipo Room
                const validRooms = roomsData.map((room: Room) => ({
                    id: room.id,
                    name: room.name,
                    long_sms: room.long_sms || false,
                    calls: room.calls || false,
                    credits: room.credits || 0,
                }));
                setRooms(validRooms) // Actualizar conexiones
            }
        } catch (error) {
            console.error("Error al obtener los rooms:", error);
        }
    };
    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleEditClick = async (account: Account) => {

        if (rooms.length === 0) {
            await fetchRooms();
        }


        const selectedRoomNames = account.rooms
            ? account.rooms.split(", ").map((name) => name.trim())
            : [];


        const selectedRoomIds = rooms
            .filter((room) => selectedRoomNames.includes(room.name))
            .map((room) => room.id);

        setSelectedRooms(selectedRoomIds);


        setFormData({
            name: account.name || "",
            email: account.email || "",
            confirmEmail: account.email || "",
            phone: account.phoneNumber || "",
            useRecoveryEmail: false,
            password: "",
            confirmPassword: "",
            allAndFuture: false,
            profile: account.role || "",
            rooms: selectedRoomIds.join(","),
        });




        setIsEditing(true);
        setOpenAddUserModal(true);
    };

    const isFormValid = (): boolean => {
        const nameRegex = /^[a-zA-Z\s]*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]*$/;

        const isValid = (
            nameRegex.test(formData.name.trim()) &&
            phoneRegex.test(formData.phone.trim()) &&
            emailRegex.test(formData.email) &&
            formData.email === formData.confirmEmail &&
            formData.profile.trim() !== "" &&
            selectedRooms.length > 0 &&
            (isEditing || (
                isPasswordValid(formData.password) &&
                formData.password === formData.confirmPassword
            ))
        );
        return isValid;
    };



    return (
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1140px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <Backdrop
                open={loading}
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
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
                    sx={{ color: "#330F1B", fontSize: '26px', }}                >
                    Usuarios
                </Typography>
            </Box>


            <Box sx={{ pl: 5 }}>
                <Divider sx={{ marginBottom: "21px", marginTop: "18px" }} />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mb: 3, backgroundColor: "#A05B71", fontFamily: "Poppins" }}
                    onClick={handleOpenModal}
                >
                    Añadir usuario
                </Button>
                <TableContainer component={Paper}
                    sx={{
                        width: "1050px", height: "415px",
                        marginLeft: "-200 auto",
                        overflowX: "auto", overflowY: "hidden",
                    }}
                >
                    <Table
                        sx={{
                            maxWidth: 1750,
                            tableLayout: "auto"
                        }}
                        aria-label="tabla de usuarios"
                    >
                        {accounts.length > 0 && (
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#5A2836', fontFamily: "Poppins" }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#5A2836', fontFamily: "Poppins" }}>Correo Electrónico</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#5A2836', fontFamily: "Poppins" }}>Rol</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#5A2836', fontFamily: "Poppins" }}>Ícono</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#5A2836', fontFamily: "Poppins" }}>Salas</TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                        )}

                        <TableBody>
                            {accounts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                py: 4,
                                                width: "100%",
                                                height: "415px"

                                            }}
                                        >
                                            <img src={Nousers} alt="Sin usuarios" style={{
                                                maxWidth: "250px",
                                                width: "auto",
                                                height: "auto",
                                                objectFit: "contain",
                                            }} />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontFamily: "Poppins",
                                                    color: "#7B354D",
                                                    fontSize: "14px",
                                                    mt: 2,
                                                }}
                                            >
                                                Añade un usuario para comenzar
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                accounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell><Typography sx={{ fontFamily: "Poppins", color: "#574B4F" }}>{account.name} </Typography></TableCell>
                                        <TableCell><Typography sx={{ fontFamily: "Poppins", color: "#574B4F" }}>{account.email} </Typography></TableCell>
                                        <TableCell><Typography sx={{ fontFamily: "Poppins", color: "#574B4F" }}>{account.role} </Typography></TableCell>
                                        {/* Ícono condicional */}
                                        <TableCell>
                                            {account.role === "Administrador" && (
                                                <img src={usrAdmin} alt="Administrador" width="32" height="32" />
                                            )}
                                            {account.role === "Supervisor" && (
                                                <img src={usrSup} alt="Supervisor" width="32" height="32" />
                                            )}
                                            {account.role === "Monitor" && (
                                                <img src={usrMon} alt="Monitor" width="32" height="32" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {account.rooms.length > 30 ? (
                                                <Tooltip
                                                    title={account.rooms}
                                                    placement="top"
                                                    arrow
                                                >
                                                    <Typography
                                                        noWrap
                                                        sx={{
                                                            maxWidth: "200px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            cursor: "pointer",
                                                            fontFamily: "Poppins",
                                                        }}
                                                    >
                                                        {account.rooms}
                                                    </Typography>
                                                </Tooltip>
                                            ) : (
                                                <Typography
                                                    noWrap
                                                    sx={{
                                                        maxWidth: "200px",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        fontFamily: "Poppins",
                                                        color: "#574B4F"
                                                    }}
                                                >
                                                    {account.rooms}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell
                                            align="center"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                                borderLeft: "2px solid #F2F2F2"
                                            }}
                                        >

                                            <IconButton
                                                onClick={(e) => handleMenuOpen(e, account)}
                                                aria-label="more"
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Menu
                                                anchorEl={menuAnchorEl}
                                                open={Boolean(menuAnchorEl)}
                                                onClose={handleMenuClose}
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                sx={{}}
                                            >
                                                <MenuItem
                                                    onClick={() => {
                                                        handleEditClick(selectedAccount!);
                                                        handleMenuClose();
                                                    }}
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
                                                <MenuItem
                                                    onClick={() => {
                                                        setOpenDeleteModal(true);
                                                        handleMenuClose();
                                                    }}
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
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Modal open={openAddUserModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "768px",
                        maxHeight: "704px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >

                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{
                        textAlign: "left",
                        fontStyle: "normal",
                        fontVariant: "normal",
                        fontWeight: "600",
                        fontFamily: "Poppins",
                        letterSpacing: "0px",
                        color: "#574B4F",
                        opacity: 1,
                        fontSize: "20px",
                        mt: -1,
                        ml: -1
                    }}>
                        {isEditing ? "Editar usuario" : "Añadir usuario"}
                    </Typography>
                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', my: 2 }} />

                    <Box sx={{ overflowY: "auto", mt: -1, pt: 4, pr: 4, pb: 4, pl: 0, flexGrow: 1 }}>
                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>

                            <Box gridColumn="span 6">
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: !/^[a-zA-Z\s]*$/.test(formData.name) ? "#D11247" : "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Nombre<span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    error={!/^[a-zA-Z\s]*$/.test(formData.name)}
                                    helperText={!/^[a-zA-Z\s]*$/.test(formData.name) && "Solo letras y espacios."}
                                    sx={{
                                        fontFamily: "Poppins",
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                        },
                                        "& .MuiFormHelperText-root": {
                                            fontFamily: "Poppins",
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title={
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
                                                            transform: "translate(-10px, -22px)",
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
                                                        src={!/^[a-zA-Z\s]*$/.test(formData.name) ? infoiconerror : infoicon}
                                                        alt="Info"
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box gridColumn="span 6"></Box>
                            <Box gridColumn="span 6">
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: showErrors.phone && !/^[0-9]{10}$/.test(formData.phone) ? "#D11247" : "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        marginBottom: "8px",

                                    }}
                                >
                                    Teléfono<span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    error={showErrors.phone && !/^[0-9]{10}$/.test(formData.phone)}
                                    helperText={showErrors.phone && !/^[0-9]{10}$/.test(formData.phone) && "Debe tener 10 dígitos."}
                                    sx={{
                                        fontFamily: "Poppins",
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                        },
                                        "& .MuiFormHelperText-root": {
                                            fontFamily: "Poppins",
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title={
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
                                                            transform: "translate(-10px, -22px)",
                                                            borderColor: "#00131F3D",
                                                            borderStyle: "solid",
                                                            borderWidth: "1px"
                                                        }}
                                                    >
                                                        <>
                                                            • Número telefónico
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
                                                        src={showErrors.phone && !/^[0-9]{10}$/.test(formData.phone) ? infoiconerror : infoicon}
                                                        alt="Info"
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            <Box gridColumn="span 6">
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: showErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "#D11247" : "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Correo Electrónico<span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={showErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)}
                                    helperText={showErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && "Ingrese un correo válido."}
                                    sx={{
                                        fontFamily: "Poppins",
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                        },
                                        "& .MuiFormHelperText-root": {
                                            fontFamily: "Poppins",
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title={
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
                                                            transform: "translate(-10px, -22px)",
                                                            borderColor: "#00131F3D",
                                                            borderStyle: "solid",
                                                            borderWidth: "1px"
                                                        }}
                                                    >
                                                        <>
                                                            • Ejemplo: usuario@domino.com
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
                                                        src={showErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? infoiconerror : infoicon}
                                                        alt="Info"
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                />
                            </Box>

                            <Box gridColumn="span 6">
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: formData.email !== formData.confirmEmail ? "#D11247" : "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Confirmar Correo electronico<span style={{ color: "red" }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    name="confirmEmail"
                                    value={formData.confirmEmail}
                                    onChange={handleInputChange}
                                    error={formData.email !== formData.confirmEmail}
                                    helperText={
                                        formData.email !== formData.confirmEmail && "Los correos electrónicos no coinciden."
                                    }
                                    sx={{
                                        fontFamily: "Poppins",
                                        "& .MuiInputBase-input": {
                                            fontFamily: "Poppins",
                                        },
                                        "& .MuiFormHelperText-root": {
                                            fontFamily: "Poppins",
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title={
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
                                                            transform: "translate(-10px, -22px)",
                                                            borderColor: "#00131F3D",
                                                            borderStyle: "solid",
                                                            borderWidth: "1px"
                                                        }}
                                                    >
                                                        <>
                                                            • Debe coincidir con el<br />
                                                            correo ingresado
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
                                                        src={formData.email !== formData.confirmEmail ? infoiconerror : infoicon}
                                                        alt="Info"
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                />
                            </Box>

                            {!isEditing && (
                                <>
                                    <Box gridColumn="span 6">
                                        <Typography
                                            sx={{
                                                textAlign: "left",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: showErrors.password && !isPasswordValid(formData.password) ? "#D11247" : "#574B4F",
                                                opacity: 1,
                                                fontSize: "16px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Contraseña<span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            error={showErrors.password && !isPasswordValid(formData.password)}
                                            helperText={showErrors.password && !isPasswordValid(formData.password) && "La contraseña debe cumplir con los requisitos."}
                                            sx={{
                                                fontFamily: "Poppins",
                                                "& .MuiInputBase-input": {
                                                    fontFamily: "Poppins",
                                                },
                                                "& .MuiFormHelperText-root": {
                                                    fontFamily: "Poppins",
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title={
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
                                                                    transform: "translate(-10px, -22px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }}
                                                            >
                                                                <>
                                                                    • Debe tener al menos 8 carácteres,<br />
                                                                    incluir una letra mayúscula<br />
                                                                    una minúscula y un número.
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
                                                                src={showErrors.password && !isPasswordValid(formData.password) ? infoiconerror : infoicon}
                                                                alt="Info"
                                                                style={{ width: 24, height: 24 }}
                                                            />
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            required
                                        />
                                    </Box>

                                    <Box gridColumn="span 6">
                                        <Typography
                                            sx={{
                                                textAlign: "left",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: formData.password !== formData.confirmPassword ? "#D11247" : "#574B4F",
                                                opacity: 1,
                                                fontSize: "16px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Confirma contraseña<span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            error={formData.password !== formData.confirmPassword}
                                            helperText={
                                                formData.password !== formData.confirmPassword && "Las contraseñas no coinciden."
                                            }
                                            sx={{
                                                fontFamily: "Poppins",
                                                "& .MuiInputBase-input": {
                                                    fontFamily: "Poppins",
                                                },
                                                "& .MuiFormHelperText-root": {
                                                    fontFamily: "Poppins",
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title={
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
                                                                    transform: "translate(-10px, -22px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }}
                                                            >
                                                                <>
                                                                    • Deben coincidir las contraseñas
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
                                                                src={(formData.password !== formData.confirmPassword) ? infoiconerror : infoicon}
                                                                alt="Info"
                                                                style={{ width: 24, height: 24 }}
                                                            />
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            required
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                        {/* Checkbox */}
                        {!isEditing && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, marginLeft: '10px' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.useRecoveryEmail}
                                            onChange={handleInputChange}
                                            name="useRecoveryEmail"
                                            checkedIcon={
                                                <Box
                                                    sx={{
                                                        width: '24px',
                                                        height: '24px',
                                                        position: 'relative',
                                                        marginTop: '0px',
                                                        marginLeft: '0px',
                                                    }}
                                                >
                                                    <img
                                                        src={IconCheckBox1}
                                                        alt="Seleccionado"
                                                        style={{ width: '24px', height: '24px' }}
                                                    />
                                                </Box>
                                            }
                                            sx={{
                                                color: '#574B4FCC',
                                                '&.Mui-checked': { color: '#6C3A52' },
                                                marginLeft: '-5px',

                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            sx={{
                                                textAlign: "left",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: formData.useRecoveryEmail ? "#8F4D63" : "#574B4FCC",
                                                opacity: 1,
                                                fontSize: "16px",
                                                lineHeight: "24px",
                                            }}
                                        >
                                            Usar el correo de registro para la recuperación de cuenta
                                        </Typography>
                                    }
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                />
                            </Box>
                        )}
                        {/* Selección de roles */}
                        {/* Roles en línea horizontal */}
                        <Divider sx={{ my: 2, backgroundColor: "#F2F2F2" }} />
                        <Typography variant="subtitle1" fontWeight="bold" mb={2} sx={{ fontFamily: "Poppins", fontSize: "16px" }}>
                            Rol de usuario<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <Typography variant="body2" mb={3} mt={-1} sx={{ fontFamily: "Poppins", color: "#574B4F", fontSize: "14px" }}>
                            Seleccione el rol que el colaborador podrá desempeñar.
                        </Typography>
                        <RadioGroup
                            row
                            value={formData.profile}
                            onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                        >
                            <Box display="flex" justifyContent="space-between" gap={2}>
                                <Box
                                    sx={{
                                        border: "2px solid #9963C3",
                                        borderRadius: "8px",
                                        padding: 2,
                                        position: "relative",
                                        textAlign: "center",
                                        width: "224px", height: "224px",
                                        cursor: "pointer",
                                        backgroundColor: formData.profile === "Monitor" ? "#9100FF1A" : "white",
                                    }}
                                >
                                    <Radio
                                        value="Monitor"
                                        checked={formData.profile === "Monitor"}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            color: "#574B4FCC",
                                            '&.Mui-checked': {
                                                color: "#9963C3"
                                            }
                                        }}
                                    />
                                    <img src={usrMon} alt="Monitor" width="50" height="50" />
                                    <Typography fontWeight="bold" color="#9963C3" mt={1} sx={{ fontFamily: "Poppins", }}>
                                        Monitor
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Poppins", }}>
                                        - Iniciar/detener campañas <br />
                                        - Consultar reportes
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        border: "2px solid #DD8E27",
                                        borderRadius: 2,
                                        padding: 2,
                                        position: "relative",
                                        textAlign: "center",
                                        width: "224px", height: "224px",
                                        cursor: "pointer",
                                        backgroundColor: formData.profile === "Supervisor" ? "#FEF6E3" : "white",
                                    }}
                                >
                                    <Radio
                                        value="Supervisor"
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            color: "#574B4FCC",
                                            '&.Mui-checked': {
                                                color: "#DD8E27"
                                            }
                                        }}
                                    />
                                    <img src={usrSup} alt="Supervisor" width="50" height="50" />
                                    <Typography fontWeight="bold" color="#FB8C00" mt={1} sx={{ fontFamily: "Poppins", }}>
                                        Supervisor
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Poppins", }}>
                                        - Iniciar/detener campañas <br />
                                        - Consultar reportes <br />
                                        - Crear/eliminar campañas
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        border: "2px solid #FB8FB8",
                                        borderRadius: 2,
                                        padding: 2,
                                        position: "relative",
                                        textAlign: "center",
                                        width: "224px", height: "224px",
                                        cursor: "pointer",
                                        backgroundColor: formData.profile === "Administrador" ? "#FDEEF3" : "white",
                                    }}
                                >
                                    <Radio
                                        value="Administrador"
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            color: "#574B4FCC",
                                            '&.Mui-checked': {
                                                color: "#FB8FB8"
                                            }
                                        }}
                                    />
                                    <img src={usrAdmin} alt="Administrador" width="50" height="50" />
                                    <Typography fontWeight="bold" color="#F06292" mt={1} sx={{ fontFamily: "Poppins", }}>
                                        Administrador
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Poppins", }}>
                                        - Iniciar/detener campañas <br />
                                        - Consultar reportes <br />
                                        - Crear usuarios
                                    </Typography>
                                </Box>
                            </Box>
                        </RadioGroup>

                        <Divider sx={{ my: 2, backgroundColor: "#F2F2F2" }} />

                        <Box p={2}>
                            <Typography variant="h6" fontWeight="bold" mb={2} mt={-2} sx={{ fontFamily: "Poppins", fontSize: "16px" }}>
                                Salas a las que podrá acceder <span style={{ color: "red", }}>*</span>
                            </Typography>
                            <Typography variant="body2" mb={2} mt={-1} sx={{ fontFamily: "Poppins", color: "#574B4F", fontSize: "14px" }}>
                                Seleccione las salas a las que el usuario tendrá acceso.
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={2}>

                                <Box display="flex" alignItems="center" gap={2}>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={areAllRoomsSelected}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                indeterminate={selectedRooms.length > 0 && selectedRooms.length < rooms.length}
                                                checkedIcon={
                                                    <Box
                                                        sx={{
                                                            width: '24px',
                                                            height: '24px',
                                                            position: 'relative',
                                                            marginTop: '0px',
                                                            marginLeft: '0px',
                                                        }}
                                                    >
                                                        <img
                                                            src={IconCheckBox1}
                                                            alt="Seleccionado"
                                                            style={{ width: '24px', height: '24px' }}
                                                        />
                                                    </Box>
                                                }
                                                indeterminateIcon={
                                                    <Box
                                                        sx={{
                                                            width: '24px',
                                                            height: '24px',
                                                            position: 'relative',
                                                            marginTop: '0px',
                                                            marginLeft: '0px',
                                                            color: "#574B4FCC"
                                                        }}
                                                    >
                                                        <img
                                                            src={IconCheckBox2}
                                                            alt="Indeterminado"
                                                            style={{ width: '24px', height: '24px' }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        }
                                        label={
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    fontWeight: 500,
                                                    color: areAllRoomsSelected ? "#8F4D63" : "#574B4FCC"
                                                }}
                                            >
                                                Todas
                                            </Typography>
                                        }
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.allAndFuture}
                                                onChange={(e) => handleSelectAllAndFuture(e.target.checked)}
                                                checkedIcon={
                                                    <Box
                                                        sx={{
                                                            width: '24px',
                                                            height: '24px',
                                                            position: 'relative',
                                                            marginTop: '0px',
                                                            marginLeft: '0px',
                                                            color: "#574B4FCC"
                                                        }}
                                                    >
                                                        <img
                                                            src={IconCheckBox1}
                                                            alt="Seleccionado"
                                                            style={{ width: '24px', height: '24px' }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        }
                                        label={
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    fontWeight: 500,
                                                    color: formData.allAndFuture ? "#8F4D63" : "#574B4FCC"
                                                }}
                                            >
                                                Todas y futuras
                                            </Typography>
                                        }
                                    />
                                </Box>


                                {rooms.map((room) => (
                                    <Box
                                        key={room.id}
                                        sx={{
                                            position: "relative",
                                            marginBottom: 1,
                                            fontFamily: "Poppins",
                                            marginLeft: "18px",
                                        }}
                                    >

                                        <Checkbox
                                            checked={selectedRooms.includes(room.id)}
                                            onChange={() => handleCheckboxChange(room.id)}
                                            sx={{
                                                position: "absolute",
                                                left: -30,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                mt: 1,
                                                color: "#574B4FCC",
                                                '&.Mui-checked': { color: '#6C3A52' },

                                            }}
                                            checkedIcon={
                                                <Box
                                                    sx={{
                                                        width: '24px',
                                                        height: '24px',
                                                        position: 'relative',
                                                        marginTop: '0px',
                                                        marginLeft: '0px',
                                                    }}
                                                >
                                                    <img
                                                        src={IconCheckBox1}
                                                        alt="Seleccionado"
                                                        style={{ width: '24px', height: '24px' }}
                                                    />
                                                </Box>
                                            }
                                        />
                                        <Paper
                                            sx={{
                                                display: "flex",
                                                marginLeft: "15px",
                                                alignItems: "center",
                                                padding: 2,
                                                border: selectedRooms.includes(room.id)
                                                    ? "1px solid #83395366"
                                                    : "1px solid #CED2D5CC",
                                                backgroundColor: selectedRooms.includes(room.id)
                                                    ? "#EFEAEC"
                                                    : "#FFFFFF",
                                                borderRadius: "8px",
                                                flex: 1,
                                                width: "229px",
                                                height: "47px",
                                                mb: -1.5
                                            }}
                                        >
                                            <Grid container alignItems="center" flex={1}>
                                                <Grid item display="flex" alignItems="center">
                                                    <Box
                                                        sx={{
                                                            backgroundColor: selectedRooms.includes(room.id)
                                                                ? "#833953"
                                                                : "#796E71",
                                                            borderRadius: "50%",
                                                            width: "26px",
                                                            height: "26px",
                                                            color: "white",
                                                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                                            marginRight: "16px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <img
                                                            src={IconHouse}
                                                            alt="HouseIcon"
                                                            width="14px"
                                                            height="14px"
                                                            color="#FFFFFF"
                                                            style={{ display: 'block' }}
                                                        />
                                                    </Box>
                                                    <Typography sx={{
                                                        fontWeight: "bold",
                                                        color: selectedRooms.includes(room.id)
                                                            ? "#833953"
                                                            : "#574B4F",
                                                    }}>
                                                        {room.name}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    </Box>
                                ))}

                            </Box>
                        </Box>
                    </Box>
                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5 }} />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                            mb: -2

                        }}
                    >
                        <SecondaryButton onClick={handleCloseModal} text="Cancelar" />
                        <MainButton onClick={handleAddUser} text={isEditing ? "Actualizar" : "Guardar"}
                            disabled={!isFormValid()} />


                    </Box>
                </Box>
            </Modal>

            <Modal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" component="h2">
                        Eliminar cuenta
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        ¿Está seguro de que desea eliminar la cuenta?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                        <Button
                            onClick={() => setOpenDeleteModal(false)}
                            sx={{
                                color: "#8F4D63", // Color del texto
                                fontWeight: "bold", // Negrita
                                backgroundColor: "transparent", // Fondo transparente
                                border: "none", // Sin bordes
                                fontSize: "16px", // Tamaño del texto
                                letterSpacing: "2px", // Espaciado entre letras
                                textTransform: "uppercase", // Texto en mayúsculas
                                boxShadow: "none", // Sin sombra
                                '&:hover': {
                                    backgroundColor: "transparent", // Fondo transparente en hover
                                    textDecoration: "underline", // Subrayado en hover
                                },
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteUser}
                            variant="contained"
                            sx={{
                                color: "#8F4D63", // Color del texto
                                fontWeight: "bold", // Negrita
                                backgroundColor: "transparent", // Fondo transparente
                                border: "none", // Sin bordes
                                fontSize: "16px", // Tamaño del texto
                                letterSpacing: "2px", // Espaciado entre letras
                                textTransform: "uppercase", // Texto en mayúsculas
                                boxShadow: "none", // Sin sombra
                                '&:hover': {
                                    backgroundColor: "transparent", // Fondo transparente en hover
                                    textDecoration: "underline", // Subrayado en hover
                                },
                            }}
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal de error */}
            <Modal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "480px",
                        height: "228px",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: 'Poppins',
                            fontSize: '20px',
                            color: '#574B4F',
                            fontWeight: 600
                        }}
                    >
                        Error al agregar un usuario
                    </Typography>
                    {/*{errorMessage} pendiente de confirmación con supervisor*/}
                    <Typography sx={{
                        mt: 2,
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        color: '#574B4F',
                        fontWeight: 500
                    }}>Algo salió mal. Inténtelo de nuevo o regrese más tarde.</Typography>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                        <Button
                            onClick={() => {
                                setErrorModalOpen(false);
                            }}
                            sx={{
                                marginTop: "25px",
                                right: -15,
                                color: "#833A53",
                                fontWeight: 600,
                                backgroundColor: "transparent",
                                border: "none",
                                fontSize: "14px",
                                letterSpacing: "1.12px",
                                textTransform: "uppercase",
                                boxShadow: "none",
                                '&:hover': {
                                    backgroundColor: "transparent",
                                },
                            }}
                        >
                            Cerrar
                        </Button>

                    </Box>
                </Box>
            </Modal>
            {showChipBarAdd && (
                <ChipBar
                    message="El Usuario ha sido añadido correctamente."
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarAdd(false)}
                />
            )}
        </Box>
    );
};

export default ManageAccounts;
