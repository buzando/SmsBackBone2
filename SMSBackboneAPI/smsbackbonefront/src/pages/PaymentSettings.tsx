import React, { useState, useEffect } from 'react';
import { Checkbox, TextField, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Backdrop, CircularProgress, Typography, FormControlLabel, Divider } from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModalError from "../components/commons/ModalError"
import usrAdmin from "../assets/usrAdmin.svg";
import usrSup from "../assets/usrSup.svg";
import usrMon from "../assets/usrMon.svg";
import MainIcon from '../components/commons/MainButtonIcon';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import { InputAdornment, Tooltip, TooltipProps } from "@mui/material";
import Radio from '@mui/material/Radio';
import { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import SecondaryButton from '../components/commons/SecondaryButton'
import MainButton from '../components/commons/MainButton'
import trash from '../assets/Icon-trash-Card.svg'
import MainModal from "../components/commons/MainModal"
import ChipBar from "../components/commons/ChipBar";
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import visa from '../assets/visa.png';
import mastercard from '../assets/masterCard.png';
import amex from '../assets/americanExpress.png';
import spei from '../assets/spei.png'
import openpay from '../assets/OpenPayLogoColor.jpg';
import IconCheckBox1 from "../assets/IconCheckBox1.svg";

type Account = {
    id: number;
    name: string;
    email: string;
    rooms: string;
    status: boolean;
    role: string;
    phoneNumber?: string;
};

interface CreditCard {
    id: number;
    user_id: number;
    card_number: string;
    card_name: string;
    expiration_month: number;
    expiration_year: number;
    CVV: string;
    is_default: boolean;
    created_at: string;
    updated_at?: string;
    type: string;
}

interface FormData {
    cardNumber: string;
    cardName: string;
    street: string;
    exteriorNumber: string;
    interiorNumber: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    cvv: string;
    month: string;
    year: string;
    isDefault: boolean;
    type: string;
}
type Errors = {
    [K in keyof FormData]?: string;
};
const PaymentSettings: React.FC = () => {
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
    const [isAutoRechargeEnabled, setIsAutoRechargeEnabled] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [threshold, setThreshold] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [Users, setUsers] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [TitleErrorModal, setTitleErrorModal] = useState('');
    const [MessageErrorModal, setMessageErrorModal] = useState('');
    const [thresholdAutomatic, setthresholdAutomatic] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [TitleMainModal, setTitleMainModal] = useState('');
    const [MessageMainModal, setMessageMainModal] = useState('');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showChipBarCard, setshowChipBarCard] = useState(false);
    const [MessageChipBar, setMessageChipBar] = useState('');
    const [generateInvoice, setGenerateInvoice] = useState('');
    const [formData, setFormData] = useState<FormData>({
        cardNumber: '',
        cardName: '',
        street: '',
        exteriorNumber: '',
        interiorNumber: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: '',
        cvv: '',
        month: '',
        year: '',
        isDefault: false,
        type: '',
    });
    const [errors, setErrors] = useState<Errors>({});
    const [isShortSmsEnabled, setIsShortSmsEnabled] = useState(false);
    const [isLongSmsEnabled, setIsLongSmsEnabled] = useState(false);
    const [isCallEnabled, setIsCallEnabled] = useState(false);
    const WhiteTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(() => ({
        [`& .MuiTooltip-tooltip`]: {
            backgroundColor: '#ffffff',
            color: '#000000',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            borderRadius: '4px',
        },
    }));

    const handleNotificationToggle = () => {
        setIsNotificationEnabled((prev) => !prev);
    };

    const calcularMontoRecarga = (cantidad: number) => {
        return cantidad * 0.65;  // 🔄 Ajusta el multiplicador según necesites
    };


    const isAcceptButtonDisabled = !(
        (isAutoRechargeEnabled &&  // 🔄 Si autorecarga está activada, verifica los campos debajo
            selectedCard !== null &&
            thresholdAutomatic.trim() !== "" &&
            rechargeAmount.trim() !== "") ||
        (isNotificationEnabled &&  // 🔄 Si notificaciones están activadas, verifica los campos de arriba
            selectedChannels.length > 0 &&
            threshold.trim() !== "" &&
            selectedUsers.length > 0)
    );



    const handleChannelToggle = (channel: string) => {
        setSelectedChannels((prevChannels) => {
            if (prevChannels.includes(channel)) {
                return prevChannels.filter((ch) => ch !== channel); // Deselecciona si ya estaba seleccionado
            } else {
                return [...prevChannels, channel]; // Agrega si no estaba seleccionado
            }
        });
    };

    const handleUserToggle = (userId: number) => {
        setSelectedUsers((prevUsers) => {
            if (prevUsers.includes(userId)) {
                return prevUsers.filter((id) => id !== userId);
            } else {
                return [...prevUsers, userId];
            }
        });
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchAccounts();
            await fetchCreditCards();
        };

        loadData();
    }, []);

    useEffect(() => {
        if (Users.length > 0 && creditCards.length > 0) {
            fetchSettings();
        }
    }, [Users, creditCards]);

    useEffect(() => {
        setIsShortSmsEnabled(selectedChannels.includes("SMS # cortos"));
        setIsLongSmsEnabled(selectedChannels.includes("SMS # largos"));
        setIsCallEnabled(selectedChannels.includes("Llamada"));
    }, [selectedChannels]);


    const navigate = useNavigate();
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
                setUsers(response.data);
            }
        } catch {
            setTitleErrorModal('Error al traer Usuarios');
            setMessageErrorModal('Algo salió mal. Inténtelo de nuevo o regreso más tarde.');
            setIsErrorModalOpen(true);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const selectedRoom = localStorage.getItem("selectedRoom");
            if (!selectedRoom) {
                navigate("/login");
                return;
            }

            const parsedUserData = JSON.parse(selectedRoom);
            const selectedRoomid = parsedUserData.id;

            if (!selectedRoomid) {
                console.error("El id del room no está disponible en los datos del usuario.");
                return;
            }

            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GET_AUTORECHARGE + selectedRoomid}`;
            const response = await axios.get(request);
            if (response.status === 200) {
                const config = response.data;

                setIsNotificationEnabled(
                    config.shortSms || config.longSms || config.call ? true : false
                );

                const channels: string[] = [];
                if (config.shortSms) channels.push("SMS # cortos");
                if (config.longSms) channels.push("SMS # largos");
                if (config.call) channels.push("Llamada");
                setSelectedChannels(channels);

                setThreshold(config.amountValue?.toString() || "");
                setIsAutoRechargeEnabled(!!config.autoRecharge);
                setthresholdAutomatic(config.autoRechargeAmountNotification?.toString() || "");
                setRechargeAmount(config.autoRechargeAmount?.toString() || "");

                if (config.idCreditCard && creditCards.length > 0) {
                    const card = creditCards.find(c => c.id === config.IdCreditCard);
                    if (card) setSelectedCard(card);
                }

                if (config.Users && config.Users.length > 0) {
                    const matchedUserIds = Users
                        .filter(u => config.Users.includes(u.email))
                        .map(u => u.id);
                    setSelectedUsers(matchedUserIds);
                }
            }

        } catch {

        }
        finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };

    const fetchCreditCards = async () => {
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el correo electrónico del usuario.");
            return;
        }

        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GET_CREDITCARD}${obj.id}`;
            const response = await axios.get(requestUrl);

            if (response.status === 200) {
                setCreditCards(response.data); // Asigna las tarjetas de crédito al estado
            }
        } catch {
            setTitleErrorModal('Error al traer información de sus tarjetas');
            setMessageErrorModal('Algo salió mal. Inténtelo de nuevo o regreso más tarde.');
            setIsErrorModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsAddCardModalOpen(false);
    };

    const handleAddCardSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Formulario enviado");
        setIsAddCardModalOpen(false);
    };

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        let parsedValue: string | number | boolean = value;

        if (type === "checkbox") {
            parsedValue = checked; // 🔥 Maneja los checkbox correctamente
        } else if (name === "month" || name === "year") {
            parsedValue = parseInt(value, 10); // 🔥 Convierte mes y año a número
        }

        const error = validateField(name, parsedValue.toString()); // 🔥 Mantiene la validación activa

        setFormData((prev) => ({ ...prev, [name]: parsedValue }));
        setErrors((prev) => ({ ...prev, [name]: error }));
    };


    const validateField = (name: string, value: string) => {
        let error = '';
        const cardRegex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$/;
        const textRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
        const numberRegex = /^[0-9]+$/;
        const postalCodeRegex = /^[0-9]{5}$/;
        const cvvRegex = /^[0-9]{3,4}$/; // CVV debe ser 3 o 4 dígitos según el tipo de tarjeta

        switch (name) {
            case 'cardNumber':
                if (!cardRegex.test(value)) {
                    error = 'Número de tarjeta no válido';
                } else {
                    const detectedType = detectCardType(value);
                    setFormData((prev) => ({
                        ...prev,
                        type: detectedType, // Se actualiza automáticamente el tipo de tarjeta
                    }));
                }
                break;
            case 'cardName':
            case 'street':
            case 'neighborhood':
            case 'city':
            case 'state':
                if (!textRegex.test(value)) error = 'No se permiten caracteres especiales';
                break;
            case 'exteriorNumber':
            case 'interiorNumber':
                if (!numberRegex.test(value)) error = 'Solo se permiten números';
                break;
            case 'postalCode':
                if (!postalCodeRegex.test(value)) error = 'Debe ser un código postal válido (5 dígitos)';
                break;
            case 'cvv':
                if (!cvvRegex.test(value)) error = 'CVV no válido. Debe contener 3 o 4 dígitos';
                break;
            case 'month':
                if (!numberRegex.test(value) || parseInt(value, 10) < 1 || parseInt(value, 10) > 12) error = 'Mes no válido';
                break;
            case 'year':
                if (!numberRegex.test(value) || value.length !== 4) error = 'Año no válido';
                break;
            default:
                break;
        }
        return error;
    };

    const detectCardType = (number: string) => {
        if (/^4/.test(number)) {
            return "Visa";
        } else if (/^5[1-5]/.test(number)) {
            return "Mastercard";
        } else if (/^3[47]/.test(number)) {
            return "American Express";
        }
        return "Desconocida"; // En caso de no coincidir con ningún tipo
    };

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const years = Array.from(new Array(30), (_, index) => `${new Date().getFullYear() + index}`);


    const handleCloseAddCardModal = () => {
        setTitleMainModal('Cancelación');
        setMessageMainModal('¿Estás seguro de que deseas cancelar? Los datos ingresados no serán almacenados.');
        setIsAddCardModalOpen(false);
        setIsConfirmModalOpen(true); // Abre el modal de confirmación
    };

    const areRequiredFieldsFilled = (): boolean => {
        // Verifica que los campos requeridos no estén vacíos
        const requiredFields = [
            formData.cardNumber,
            formData.cardName,
            formData.street,
            formData.exteriorNumber,
            formData.neighborhood,
            formData.city,
            formData.state,
            formData.postalCode,
            formData.cvv,
            formData.month,
            formData.year,
        ];
        return requiredFields.every((field) => field.trim() !== '') && Object.values(errors).every((error) => !error);

    }

    const addCreditCard = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }

        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ADD_CREDITCARD}`;
            const payload = {
                user_id: obj.id,
                card_number: formData.cardNumber,
                card_name: formData.cardName,
                expiration_month: parseInt(formData.month),
                expiration_year: parseInt(formData.year),
                cvv: formData.cvv,
                is_default: formData.isDefault,
                type: formData.type,
                street: formData.street,
                exterior_number: formData.exteriorNumber,
                interior_number: formData.interiorNumber || null,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
            };

            const response = await axios.post(requestUrl, payload);

            if (response.status === 200) {
                setMessageChipBar('La tarjeta se añadió correctamente');
                setshowChipBarCard(true);
                setTimeout(() => setshowChipBarCard(false), 3000);
                await fetchCreditCards();
                handleCloseModal();
            }
        } catch {
            setTitleErrorModal('Error al añadir tarjeta');
            setMessageErrorModal('Algo salió mal. Inténtelo de nuevo o regreso más tarde.');
            setIsErrorModalOpen(true);
        } finally {
            handleCloseModal();
            setLoading(false);
        }
    };

    const addRechargeSetting = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }
        const selectedEmails = Users.filter(user => selectedUsers.includes(user.id)).map(user => user.email);


        const savedRoom = localStorage.getItem('selectedRoom');
        const objroom = savedRoom ? JSON.parse(savedRoom) : null;

        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ADD_AUTORECHARGE}`;
            const payload = {
                shortSms: isShortSmsEnabled,
                longSms: isLongSmsEnabled,
                call: isCallEnabled,
                amountValue: parseFloat(threshold),
                autoRecharge: isAutoRechargeEnabled,
                autoRechargeAmountNotification: parseFloat(thresholdAutomatic),
                autoRechargeAmount: parseFloat(rechargeAmount),
                idCreditCard: selectedCard?.id,
                users: selectedEmails,
                idRoom: objroom.id,
            };

            const response = await axios.post(requestUrl, payload);

            if (response.status === 200) {
                setMessageChipBar('Configuración Guardada con Exito');
                setshowChipBarCard(true);
                setTimeout(() => setshowChipBarCard(false), 5000);
            }
        } catch {
            setTitleErrorModal('Error al añadir tarjeta');
            setMessageErrorModal('Algo salió mal. Inténtelo de nuevo o regreso más tarde.');
            setIsErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAccept = () => {
        setFormData({
            cardNumber: '',
            cardName: '',
            month: '',
            year: '',
            cvv: '',
            isDefault: false,
            street: '',
            exteriorNumber: '',
            interiorNumber: '',
            neighborhood: '',
            city: '',
            state: '',
            postalCode: '',
            type: '',
        }); // Limpia los datos
        setIsConfirmModalOpen(false); // Cierra el modal de confirmación
        setIsAddCardModalOpen(false); // Cierra el modal principal
    };

    const handleCloseCancelationModal = () => {
        setTitleMainModal('');
        setMessageMainModal('');
        setIsAddCardModalOpen(true);
        setIsConfirmModalOpen(false); // Abre el modal de confirmación
    };


    const handleSelectCard = async (card: CreditCard) => {
        setSelectedCard(card);
    };

    return (
        <Box p={4} sx={{ padding: '10px', marginLeft: "35px", marginTop: '-50px', maxWidth: "1140px" }}>
            <Backdrop
                open={loading}
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: '0px', mb: 1 }}>
                <IconButton
                    onClick={() => navigate('/')} // ← O ajusta la ruta a donde quieras volver
                    sx={{
                        ml: '-20px',
                        p: 0,
                        mr: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={ArrowBackIosNewIcon}
                        alt="Regresar"
                        style={{ width: 24, height: 24, transform: 'rotate(270deg)' }}
                    />
                </IconButton>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 500,
                        color: '#5A2836',
                        fontFamily: 'Poppins',
                        fontSize: '26px',
                    }}
                >
                    Ajustes de pago
                </Typography>
            </Box>
            <Divider sx={{ width: 'calc(100% + 0px)', marginLeft: '0px', mb: 1.5, mt: 1 }} />

            {/* Checkbox para activar alertas */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Checkbox
                    checked={isNotificationEnabled}
                    onChange={handleNotificationToggle}
                    sx={{
                        color: '#6C3A52',
                        '&.Mui-checked': { color: '#6C3A52' },
                        marginLeft: '-5px',

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
                <span
                    style={{
                        textAlign: 'left',
                        fontFamily: "Poppins",
                        letterSpacing: '0px',
                        color: '#574B4FCC',
                        opacity: 1,
                        fontSize: '16px',
                    }}
                >
                    Recibir una alerta cuando los créditos se muestren por debajo de la cantidad seleccionada
                </span>
            </label>

            {/* Sección de canales */}
            <h3
                style={{
                    textAlign: 'left',
                    fontFamily: "Poppins",
                    letterSpacing: '0px',
                    fontWeight: "500",
                    color: isNotificationEnabled ? '#330F1B' : '#B0B0B0',
                    opacity: 1,
                    fontSize: '16px',
                }}
            >
                Seleccionar canal
            </h3>
            <div style={{ opacity: isNotificationEnabled ? 1 : 0.5, pointerEvents: isNotificationEnabled ? 'auto' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['SMS # cortos', 'SMS # largos'].map((channel) => {
                        const isChecked = selectedChannels.includes(channel);
                        return (
                            <label key={channel} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleChannelToggle(channel)}
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
                                <span
                                    style={{
                                        textAlign: 'left',
                                        fontFamily: 'Poppins',
                                        letterSpacing: '0px',
                                        color: isChecked ? '#8F4D63' : '#574B4FCC',
                                        fontSize: '16px',
                                    }}
                                >
                                    {channel}
                                </span>
                            </label>
                        );
                    })}
                </div>

                {/*Ingresar Cantidad */}
                <h3
                    style={{
                        textAlign: 'left',
                        fontFamily: "Poppins",
                        fontWeight: "500",
                        letterSpacing: '0px',
                        color: '#330F1B',
                        opacity: 1,
                        fontSize: '16px',
                        marginTop: '20px',
                    }}
                >
                    Ingresar Cantidad
                </h3>
                <TextField
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    type="number"
                    disabled={!isNotificationEnabled}
                    sx={{
                        background: '#FFFFFF',
                        borderRadius: '4px',
                        opacity: 1,
                        width: '100%',
                        maxWidth: '220px',
                        height: '54px',
                        '& .MuiInputBase-input': {
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 500,

                            // 🔽 Remueve las flechas en navegadores
                            MozAppearance: 'textfield', // Firefox
                            '&::-webkit-outer-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                            '&::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                            },
                        }
                    }}
                />

                {/* Título de la tabla */}
                <h3
                    style={{
                        textAlign: 'left',
                        fontFamily: "Poppins",
                        fontWeight: "500",
                        letterSpacing: '0px',
                        color: '#330F1B',
                        opacity: 1,
                        fontSize: '16px',
                        marginTop: '20px'
                    }}
                >
                    Seleccionar usuarios para recibir notificación
                </h3>

                {/* Tabla de usuarios */}
                <TableContainer component={Paper} style={{
                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                    border: '1px solid #E6E4E4',
                    borderRadius: '8px',
                    opacity: 1,
                    width: '553px',
                    minHeight: "191px",
                    overflowY: 'auto',

                }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#330F1B" }}>Nombre</TableCell>
                                <TableCell sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#330F1B" }}>Rol</TableCell>
                                <TableCell sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#330F1B" }}>Ícono</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id)}
                                            disabled={!isNotificationEnabled}
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
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#574B4F" }}>{user.name}</TableCell>
                                    <TableCell sx={{ fontFamily: "Poppins", fontSize: "13px", color: "#574B4F" }}>{user.role}</TableCell>
                                    <TableCell>{user.role === "Administrador" && (
                                        <img src={usrAdmin} alt="Administrador" width="32" height="32" />
                                    )}
                                        {user.role === "Supervisor" && (
                                            <img src={usrSup} alt="Supervisor" width="32" height="32" />
                                        )}
                                        {user.role === "Monitor" && (
                                            <img src={usrMon} alt="Monitor" width="32" height="32" />
                                        )}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Nueva sección: Activar Autorecarga */}


            </div>
            <Divider sx={{ width: 'calc(100% + 0px)', marginLeft: '0px', mb: 2, mt: 3 }} />
            <h3 style={{
                textAlign: 'left', fontFamily: "Poppins", letterSpacing: '0px', fontWeight: "500",
                color: '#330F1B', opacity: 1, fontSize: '18px', marginTop: '20px'
            }}>
                Activar Autorecarga
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Checkbox
                    checked={isAutoRechargeEnabled}
                    onChange={() => setIsAutoRechargeEnabled((prev) => !prev)}
                    sx={{
                        color: '#6C3A52',
                        '&.Mui-checked': { color: '#6C3A52' },
                        marginLeft: '-5px',
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


                <span style={{ textAlign: 'left', fontFamily: "Poppins", letterSpacing: '0px', color: '#8F4D63', opacity: 1, fontSize: '16px' }}>
                    Recibir una alerta y realizar autorecarga cuando los créditos se muestren por debajo de la cantidad seleccionada
                </span>
            </label>
            {/* Nueva sección: Cantidad y Monto a Recargar */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginTop: '20px',
                    opacity: isAutoRechargeEnabled ? 1 : 0.5,  // 🔴 Aplica grisecito cuando está deshabilitado
                    pointerEvents: isAutoRechargeEnabled ? 'auto' : 'none'  // 🔴 Desactiva la interacción cuando está deshabilitado
                }}
            >

                {/* Cantidad y Monto */}
                <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                    <div>
                        <h3 style={{
                            textAlign: 'left',
                            fontFamily: "Poppins",
                            fontWeight: "500",
                            letterSpacing: '0px',
                            color: '#330F1B',
                            opacity: 1,
                            fontSize: '16px'
                        }}>Cantidad</h3>
                        <TextField
                            value={thresholdAutomatic}
                            onChange={(e) => {
                                const valor = e.target.value;
                                setthresholdAutomatic(valor);
                                const cantidad = parseFloat(valor) || 0;
                                setRechargeAmount(cantidad > 0 ? calcularMontoRecarga(cantidad).toFixed(2) : '');  // 🔄 Calcula y establece el monto
                            }}
                            type="number"
                            disabled={!isAutoRechargeEnabled}
                            sx={{
                                background: '#FFFFFF 0% 0% no-repeat padding-box',
                                borderRadius: '4px',
                                opacity: 1,
                                width: '100%',
                                maxWidth: '220px',
                                height: '54px',
                                '& .MuiInputBase-input': {
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 500,

                                    // 🔽 Remueve las flechas en navegadores
                                    MozAppearance: 'textfield', // Firefox
                                    '&::-webkit-outer-spin-button': {
                                        WebkitAppearance: 'none',
                                        margin: 0,
                                    },
                                    '&::-webkit-inner-spin-button': {
                                        WebkitAppearance: 'none',
                                        margin: 0,
                                    },
                                }
                            }}
                        />

                    </div>

                    <div style={{ flex: '1' }}>
                        <h3 style={{
                            textAlign: 'left',
                            fontFamily: "Poppins",
                            fontWeight: "500",
                            letterSpacing: '0px',
                            color: '#330F1B',
                            opacity: 1,
                            fontSize: '16px'
                        }}>Monto a recargar</h3>
                        <TextField
                            value={rechargeAmount}
                            type="text"
                            disabled={!isAutoRechargeEnabled}
                            InputProps={{
                                readOnly: true,  // 🔴 Solo lectura para evitar que el usuario lo edite manualmente
                            }}
                            sx={{
                                background: '#FFFFFF 0% 0% no-repeat padding-box',
                                borderRadius: '4px',
                                opacity: 1,
                                width: '100%',
                                maxWidth: '220px',
                                height: '54px',
                                '& .MuiInputBase-input': {
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 500
                                }
                            }}
                        />

                    </div>
                </div>
                <Divider sx={{ width: 'calc(100% + 0px)', marginLeft: '0px', mb: 2, mt: 3 }} />
                {/* SECCIÓN SEPARADA - Método de pago */}
                <h3 style={{
                    textAlign: 'left',
                    fontFamily: "Poppins",
                    fontWeight: "500",
                    letterSpacing: '0px',
                    color: '#330F1B',
                    opacity: 1,
                    fontSize: '18px',
                    marginTop: '20px'
                }}>
                    Seleccionar Método de pago
                </h3>
                <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                    {[visa, mastercard, amex, spei].map((imgSrc, index) => (
                        <Box
                            key={index}
                            sx={{
                                border: '1px solid #9B929566',
                                borderRadius: '6px',
                                padding: '10px',
                                backgroundColor: '#F7F7F7',
                                width: '85px',
                                height: '76px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                src={imgSrc}
                                alt={`Método ${index}`}
                                style={{ maxHeight: '38px', objectFit: 'contain' }}
                            />
                        </Box>
                    ))}
                </Box>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                    <MainIcon
                        text="Agregar Tarjeta"
                        isLoading={loading}
                        onClick={() => setIsAddCardModalOpen(true)}
                        width="210px"
                    >
                        <span className="flex items-center">
                            <span className="mr-2">+</span> Agregar Tarjeta
                        </span>
                    </MainIcon>
                </div>

                {/* Tarjetas de Crédito - Scroll Horizontal */}
                <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    gap: '20px',
                    marginTop: '20px',
                    paddingBottom: '10px',
                    paddingLeft: '10px',
                    paddingRight: '10px'
                }}>
                    <div style={{ display: 'flex', gap: '20px', margin: '20px 0', flexWrap: 'wrap' }}>
                        {creditCards.map((card) => (
                            <div
                                key={card.id}
                                style={{
                                    border: selectedCard?.id === card.id ? '1px solid rgba(112, 112, 112, 0.2)' : '1px solid #dcdcdc',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    width: '360px',
                                    height: '172px',
                                    position: 'relative',
                                    backgroundColor: selectedCard?.id === card.id ? 'rgba(237, 196, 209, 0.2)' : '#FFFFFF',
                                }}
                            >
                                {/* Barra lateral de color */}
                                {selectedCard?.id === card.id && (
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        height: '100%',
                                        width: '8px',
                                        backgroundColor: '#8F4D63',
                                        borderTopLeftRadius: '8px',
                                        borderBottomLeftRadius: '8px',
                                    }}></div>
                                )}
                                {/* Marca de la tarjeta */}
                                <div style={{
                                    marginBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "14px",
                                    marginLeft: "10px"
                                }}>
                                    {card.type}
                                </div>

                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontFamily: "Poppins",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px',
                                        lineHeight: '1.2',
                                        marginLeft: "10px",
                                    }}
                                >
                                    <span style={{ margin: '0', padding: '2px' }}>{card.card_name}</span>
                                    <span style={{ margin: '0', padding: '2px' }}>Terminación: •••• {card.card_number.slice(-4)}</span>
                                    <span style={{ margin: '0', padding: '2px' }}>Vencimiento: {card.expiration_month.toString().padStart(2, '0')}/{card.expiration_year.toString().slice(-2)}</span>
                                </div>

                                {/* Radio para seleccionar */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', cursor: 'pointer', }} onClick={() => handleSelectCard(card)} >
                                    <Radio
                                        checked={selectedCard?.id === card.id}
                                        readOnly
                                        sx={{
                                            color: '#8F4D63',
                                            '&.Mui-checked': { color: '#8F4D63' },
                                        }}
                                    />
                                    <span style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#8F4D63",
                                        opacity: 1,
                                        fontSize: "14px",
                                    }}>
                                        {selectedCard?.id === card.id ? 'Tarjeta seleccionada' : 'Seleccionar tarjeta'}
                                    </span>
                                </label>
                                {/* Botón para eliminar */}
                                <button
                                    onClick={() => openDeleteModal(card)}
                                    style={{
                                        position: 'absolute',
                                        marginTop: "-164px",
                                        marginLeft: "278px",
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Tooltip title="Eliminar" arrow placement="top"
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                    color: "#CCC3C3",
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
                                                        offset: [0, -7]
                                                    }
                                                }
                                            ]
                                        }}
                                    >
                                        <img src={trash} width='24px' height='24px' />
                                    </Tooltip>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Box sx={{ marginBottom: '4px' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={generateInvoice}
                            onChange={(e) => setGenerateInvoice(e.target.checked)}
                            sx={{ color: '#8F4D63' }}
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
                    }
                    label={
                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '14px',
                                color: generateInvoice ? '#8F4D63' : '#574B4FCC',
                            }}
                        >
                            Generar factura automáticamente
                        </Typography>
                    }
                />
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 0',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            color: '#574B4F',
                            fontWeight: 500,
                        }}
                    >
                        Pagos procesados de forma segura con
                    </Typography>
                    <Box
                        component="img"
                        src={openpay}
                        alt="Openpay"
                        sx={{
                            height: '34px', objectFit: 'contain',
                            border: "1px solid #9B929566",
                            borderRadius: "6px"
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <SecondaryButton onClick={() => navigate(-1)} text="Cancelar" />
                    <MainButton text="Aceptar" isLoading={loading} onClick={addRechargeSetting} disabled={isAcceptButtonDisabled} />

                </Box>
            </Box>

            <div style={{ padding: '20px', maxWidth: '1000px', marginLeft: '0', backgroundColor: '#F2F2F2', borderRadius: '8px', marginBottom: "50px" }}>

                {/* Botones de acción debajo de las tarjetas de crédito */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0px' }}>
                </div>
            </div>


            <ModalError
                isOpen={isErrorModalOpen}
                title={TitleErrorModal}
                message={MessageErrorModal}
                buttonText="Cerrar"
                onClose={() => setIsErrorModalOpen(false)}
            />

            {/* Modal para agregar tarjeta */}
            <Modal
                open={isAddCardModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="add-card-modal-title"
                aria-describedby="add-card-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '885px',
                        height: '756px',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                        overflowY: 'auto',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2
                            id="add-card-modal-title"
                            style={{
                                textAlign: "left",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "20px",
                                margin: 0
                            }}
                        >
                            Agregar tarjeta
                        </h2>
                        <IconButton onClick={handleCloseModal} style={{ color: "#574B4F" }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <hr style={{ width: '100%', border: '1px solid #ccc', margin: '10px 0' }} />
                    <form
                        onSubmit={handleAddCardSubmit}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            columnGap: '20px',
                            rowGap: '15px',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '20px', gridColumn: 'span 2' }}>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Número de tarjeta<span style={{ color: "#D01247" }}>*</span>
                                </label>
                                <TextField name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    error={Boolean(errors['cardNumber'])}
                                    helperText={errors['cardNumber']}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <WhiteTooltip title={<>
                                                    <div>• Solo caracteres numéricos</div>
                                                    <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                                </>}>
                                                    <img src={errors['cardNumber'] ? infoiconerror : infoicon} alt="info-icon" />
                                                </WhiteTooltip>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Nombre en la tarjeta<span style={{ color: "#D01247" }}>*</span>
                                </label>
                                <TextField name="cardName"
                                    value={formData.cardName}
                                    onChange={handleChange}
                                    error={Boolean(errors.cardName)}
                                    helperText={errors.cardName}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <WhiteTooltip title={<>
                                                    <div>• Solo caracteres numéricos</div>
                                                    <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                                </>}>
                                                    <img src={errors.cardName ? infoiconerror : infoicon} alt="info-icon" />
                                                </WhiteTooltip>
                                            </InputAdornment>
                                        )
                                    }} />
                            </div>
                        </div>
                        <div>
                            <label
                                style={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#574B4F",
                                    opacity: 1,
                                    fontSize: "16px",
                                    display: "block",
                                    marginBottom: "5px"
                                }}
                            >
                                Calle<span style={{ color: "#D01247" }}>*</span>
                            </label>
                            <TextField name="street"
                                value={formData.street}
                                onChange={handleChange}
                                error={Boolean(errors.street)}
                                helperText={errors.street}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <WhiteTooltip title={<>
                                                <div>• Solo caracteres numéricos</div>
                                                <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                            </>}>
                                                <img src={errors.street ? infoiconerror : infoicon} alt="info-icon" />
                                            </WhiteTooltip>
                                        </InputAdornment>
                                    )
                                }} />
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Número exterior<span style={{ color: "#D01247" }}>*</span>
                                </label>
                                <TextField type="number"
                                    name="exteriorNumber"
                                    value={formData.exteriorNumber}
                                    onChange={handleChange}
                                    error={Boolean(errors.exteriorNumber)}
                                    helperText={errors.exteriorNumber}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <WhiteTooltip title={<>
                                                    <div>• Solo caracteres numéricos</div>
                                                    <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                                </>}>
                                                    <img src={errors.exteriorNumber ? infoiconerror : infoicon} alt="info-icon" />
                                                </WhiteTooltip>
                                            </InputAdornment>
                                        )
                                    }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Número interior<span style={{ color: "#D01247" }}>*</span>
                                </label>
                                <TextField type="number"
                                    name="street"
                                    value={formData.interiorNumber}
                                    onChange={handleChange}
                                    error={Boolean(errors.interiorNumber)}
                                    helperText={errors.interiorNumber}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <WhiteTooltip title={<>
                                                    <div>• Solo caracteres numéricos</div>
                                                    <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                                </>}>
                                                    <img src={errors.interiorNumber ? infoiconerror : infoicon} alt="info-icon" />
                                                </WhiteTooltip>
                                            </InputAdornment>
                                        )
                                    }} />
                            </div>
                        </div>
                        <div>
                            <label
                                style={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#574B4F",
                                    opacity: 1,
                                    fontSize: "16px",
                                    display: "block",
                                    marginBottom: "5px"
                                }}
                            >
                                Colonia<span style={{ color: "#D01247" }}>*</span>
                            </label>
                            <TextField name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleChange}
                                error={Boolean(errors.neighborhood)}
                                helperText={errors.neighborhood}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <WhiteTooltip title={<>
                                                <div>• Solo caracteres numéricos</div>
                                                <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                            </>}>
                                                <img src={errors.neighborhood ? infoiconerror : infoicon} alt="info-icon" />
                                            </WhiteTooltip>
                                        </InputAdornment>
                                    )
                                }} />
                        </div>
                        <div>
                            <label
                                style={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#574B4F",
                                    opacity: 1,
                                    fontSize: "16px",
                                    display: "block",
                                    marginBottom: "5px"
                                }}
                            >
                                Ciudad<span style={{ color: "#D01247" }}>*</span>
                            </label>
                            <TextField name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={Boolean(errors.city)}
                                helperText={errors.city}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <WhiteTooltip title={<>
                                                <div>• Solo caracteres numéricos</div>
                                                <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                            </>}>
                                                <img src={errors.city ? infoiconerror : infoicon} alt="info-icon" />
                                            </WhiteTooltip>
                                        </InputAdornment>
                                    )
                                }} />
                        </div>
                        <div>
                            <label
                                style={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#574B4F",
                                    opacity: 1,
                                    fontSize: "16px",
                                    display: "block",
                                    marginBottom: "5px"
                                }}
                            >
                                Estado<span style={{ color: "#D01247" }}>*</span>
                            </label>
                            <TextField name="state"
                                value={formData.state}
                                onChange={handleChange}
                                error={Boolean(errors.state)}
                                helperText={errors.state}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <WhiteTooltip title={<>
                                                <div>• Solo caracteres numéricos</div>
                                                <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                            </>}>
                                                <img src={errors.state ? infoiconerror : infoicon} alt="info-icon" />
                                            </WhiteTooltip>
                                        </InputAdornment>
                                    )
                                }} />
                        </div>
                        <div>
                            <label
                                style={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#574B4F",
                                    opacity: 1,
                                    fontSize: "16px",
                                    display: "block",
                                    marginBottom: "5px"
                                }}
                            >
                                CP<span style={{ color: "#D01247" }}>*</span>
                            </label>
                            <TextField type="number"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                error={Boolean(errors.postalCode)}
                                helperText={errors.postalCode}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <WhiteTooltip title={<>
                                                <div>• Solo caracteres numéricos</div>
                                                <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                            </>}>
                                                <img src={errors.postalCode ? infoiconerror : infoicon} alt="info-icon" />
                                            </WhiteTooltip>
                                        </InputAdornment>
                                    )
                                }} />
                        </div>
                        <div style={{ display: 'flex', gap: '20px', gridColumn: 'span 2' }}>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "inline-block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Fecha de vencimiento<span style={{ color: "#D01247" }}>*</span>
                                </label>
                                <label
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "inline-block",
                                        marginBottom: "5px",
                                        marginLeft: "37px"
                                    }}
                                >
                                    CVV <span style={{ color: "#D01247" }}>*</span>
                                </label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Select
                                        value={formData.month.toString()}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            background: "#FFFFFF 0% 0% no-repeat padding-box",
                                            border: "1px solid #9B9295",
                                            borderRadius: "8px",
                                            width: "87px",
                                            height: "40px",
                                        }}
                                    >
                                        <MenuItem value="" disabled>Mes</MenuItem>
                                        {months.map((month, index) => (
                                            <MenuItem key={index} value={index + 1}>{month}</MenuItem>
                                        ))}
                                    </Select>
                                    <Select
                                        value={formData.year.toString()}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            background: "#FFFFFF 0% 0% no-repeat padding-box",
                                            border: "1px solid #9B9295",
                                            borderRadius: "8px",
                                            width: "87px",
                                            height: "40px",
                                        }}
                                    >
                                        <MenuItem value="" disabled>Año</MenuItem>
                                        {years.map((year, index) => (
                                            <MenuItem key={index} value={parseInt(year, 10)}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                    <TextField
                                        type="number"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleChange}
                                        error={Boolean(errors.cvv)}
                                        helperText={errors.cvv}
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <WhiteTooltip title={<>
                                                        <div>• Solo caracteres numéricos</div>
                                                        <div>• Longitud min. 14 dígitos, máx. 19 dígitos</div>
                                                    </>}>
                                                        <img src={errors.cvv ? infoiconerror : infoicon} alt="info-icon" />
                                                    </WhiteTooltip>
                                                </InputAdornment>
                                            )
                                        }}
                                        style={{
                                            background: "#FFFFFF 0% 0% no-repeat padding-box",
                                            border: "1px solid #9B9295",
                                            borderRadius: "4px",
                                            width: "132px",
                                            height: "54px",
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleChange}
                                />
                                <span style={{
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#8F4D63",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}>Establecer como forma de pago predeterminada.</span>
                            </div>
                        </div>
                        <hr
                            style={{
                                gridColumn: 'span 2',
                                width: '100%',
                                border: '1px solid #ccc',
                                margin: '20px 0',
                            }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '16px', width: '100%' }}>
                            <div style={{ gridColumn: '1 / 2', display: 'flex', justifyContent: 'flex-start' }}>
                                <SecondaryButton onClick={() => handleCloseAddCardModal()} text="Cancel"

                                />
                            </div>
                            <div style={{ gridColumn: '2 / 3', display: 'flex', justifyContent: 'flex-end' }}>
                                <MainButton text="Agregar" isLoading={loading} onClick={() => addCreditCard()} disabled={!areRequiredFieldsFilled()}

                                />
                            </div>
                        </div>



                    </form>
                </Box>
            </Modal>
            <MainModal
                isOpen={isConfirmModalOpen}
                Title={TitleMainModal}
                message={MessageMainModal}
                primaryButtonText="Aceptar"
                secondaryButtonText="Cancelar"
                onPrimaryClick={handleConfirmAccept}
                onSecondaryClick={handleCloseCancelationModal}

            />
            {showChipBarCard && (
                <ChipBar
                    message={MessageChipBar}
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarCard(false)}
                />
            )}
        </Box>
    );
};

export default PaymentSettings;
