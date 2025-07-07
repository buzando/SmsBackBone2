import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChipBar from "../components/commons/ChipBar";
import { Box, Divider, Typography, Checkbox, Radio, Modal, Select, MenuItem, SelectChangeEvent, TextField, FormControlLabel } from '@mui/material';
import { InputAdornment, Tooltip, TooltipProps } from "@mui/material";
import { styled } from '@mui/material/styles';
import MainButtonIcon from '../components/commons/MainButtonIcon'
import MainButton from '../components/commons/MainButton';
import SecondaryButton from '../components/commons/SecondaryButton';
import trash from '../assets/Icon-trash-Card.svg'
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import visa from '../assets/visa.png';
import mastercard from '../assets/masterCard.png';
import amex from '../assets/americanExpress.png';
import openpay from '../assets/OpenPayLogoColor.jpg';
import spei from '../assets/spei.png'
import ModalError from "../components/commons/ModalError"
import { useLocation } from 'react-router-dom';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from "react-router-dom";

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
const AccountRecharge: React.FC = () => {
    const [selectedChannel, setSelectedChannel] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState('0.00');
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal
    const [cardDetails, setCardDetails] = useState<FormData>({
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
    const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
    const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
    const [TitleErrorModal, setTitleErrorModa] = useState<string>("");
    const [OpenErrorModal, setOpenErrorModa] = useState<boolean>(Boolean);
    const [MessageErrorModal, setMessageErrorModa] = useState<string>("");
    const [generateInvoice, setGenerateInvoice] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const invoiceData = {
        name: "Nuxiba",
        rfc: "VECJ880326",
        postalCode: "45678",
        fiscalRegime: "Régimen ejemplo",
        description: "Régimen ejemplo",
        credits: "8,000",
        unitPrice: "$0.10",
        totalCost: "$0.10",
        paymentMethod: selectedCard ? `${selectedCard.type} **${selectedCard.card_number.slice(-4)}, ${selectedCard.card_name}` : 'No seleccionada'
    };
    const [showChipBarAdd, setshowChipBarAdd] = useState(false);
    const [showChipBarCard, setshowChipBarCard] = useState(false);
    const [showChipBarDelete, setshowChipBarDelete] = useState(false);
    const navigate = useNavigate();

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };

    const checkRechargeStatus = async (id: string) => {
        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_VERIFY_RECHARGE}${id}`; // Ajusta el endpoint real aquí
            const response = await axios.get(requestUrl);

            if (response.status === 200 && response.data) {
                if (response.data.success) {
                    setshowChipBarAdd(true);
                    setTimeout(() => setshowChipBarAdd(false), 10000);
                    const storedRoom = localStorage.getItem('selectedRoom');
                    const request = localStorage.getItem('request');
                    if (storedRoom) {
                        const room = JSON.parse(storedRoom);
                        const amountParsed = JSON.parse(request);
                        if (amountParsed.Chanel === 'long_sms') {
                            room.long_sms = (parseFloat(room.long_sms) || 0) + amountParsed.QuantityCredits;
                        } else {
                            room.short_sms = (parseFloat(room.short_sms) || 0) + amountParsed.QuantityCredits;
                        }
                    }
                } else {
                    setTitleErrorModa("Error en recarga");
                    setMessageErrorModa(response.data.message || "Hubo un problema al validar la recarga.");
                    setOpenErrorModa(true);
                }
            }
        } catch {

        }
        finally {
            setshowChipBarAdd(true);
            setTimeout(() => setshowChipBarAdd(false), 10000);
            const storedRoom = localStorage.getItem('selectedRoom');
            const request = localStorage.getItem('request');
            if (storedRoom && request) {
                const room = JSON.parse(storedRoom);
                const amountParsed = JSON.parse(request);
                if (amountParsed.Chanel === 'long_sms') {
                    room.long_sms = (parseFloat(room.long_sms) || 0) + (parseFloat(amountParsed.QuantityCredits));
                } else {
                    room.short_sms = (parseFloat(room.short_sms) || 0) + (parseFloat(amountParsed.QuantityCredits));
                }
                room.credits = (parseFloat(room.credits) || 0) + (parseFloat(amountParsed.QuantityCredits));
                localStorage.setItem('selectedRoom', JSON.stringify(room));
                window.dispatchEvent(new Event('storageUpdate'));
                localStorage.removeItem('request');
            }
        }
    };

    const query = useQuery();
    const id = query.get('id');

    useEffect(() => {
        if (id) {
            checkRechargeStatus(id);
        }
    }, [id]);


    const handleGenerateInvoiceCheck = () => {
        if (generateInvoice) {
            setGenerateInvoice(false);
        } else {
            setIsInvoiceModalOpen(true);
        }
    };
    const [Loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const isRechargeButtonDisabled = (): boolean => {
        return !selectedChannel || !creditAmount || !rechargeAmount || !selectedCard;
    };

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



    // Funciones para abrir y cerrar el modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChannelChange = (event: SelectChangeEvent<string>) => {
        setSelectedChannel(event.target.value);
    };

    const calculateCredits = (value: string) => {
        const credits = parseFloat(value);
        if (!isNaN(credits)) {
            const calculatedAmount = credits * 0.65;  // 🔥 Ajusta el valor por crédito si es diferente
            setRechargeAmount(calculatedAmount.toFixed(2));  // 🔥 Guarda el monto calculado con 2 decimales
        } else {
            setRechargeAmount('0.00');  // 🔥 Si no es un número válido, pone 0.00
        }
    };

    const handleRechargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRechargeAmount(event.target.value);
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
        } catch (error) {
            console.error("Error al obtener las tarjetas de crédito:", error);
        }
    };

    useEffect(() => {
        fetchCreditCards();
    }, []); // Este useEffect se ejecutará solo una vez cuando el componente se monte

    const handleRecharge = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }

        try {
            const storedRoom = localStorage.getItem('selectedRoom');
            const room = JSON.parse(storedRoom);
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ADD_RECHARGE}`;
            const payload = {
                IdCreditCard: selectedCard?.id,
                IdUser: obj.id,
                Chanel: selectedChannel,
                QuantityCredits: creditAmount,
                QuantityMoney: rechargeAmount,
                AutomaticInvoice: generateInvoice,
                room: room.name,
            };
            localStorage.setItem('request', JSON.stringify(payload));

            const response = await axios.post(requestUrl, payload);

            if (response.status === 200) {
                if (response.data.startsWith('http'))
                    window.location.href = response.data;
                return;

            }
        } catch (error) {
            console.log(error);
            setTitleErrorModa("Error en la recarga de saldo");
            setMessageErrorModa("Error de pago, comuniquese con su banco e inténtelo de nuevo.");
            setOpenErrorModa(true);

            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const addCreditCard = async () => {
        setLoading(false);
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
                card_number: cardDetails.cardNumber,
                card_name: cardDetails.cardName,
                expiration_month: cardDetails.month,
                expiration_year: cardDetails.year,
                cvv: cardDetails.cvv,
                is_default: cardDetails.isDefault,
                type: cardDetails.type,
                street: cardDetails.street,
                exterior_number: cardDetails.exteriorNumber,
                interior_number: cardDetails.interiorNumber || null,
                neighborhood: cardDetails.neighborhood,
                city: cardDetails.city,
                state: cardDetails.state,
                postal_code: cardDetails.postalCode,
            };

            const response = await axios.post(requestUrl, payload);

            if (response.status === 200) {
                setshowChipBarCard(true);
                setTimeout(() => setshowChipBarCard(false), 3000);
                await fetchCreditCards();
                handleCloseModal();
                setLoading(false);
            }
        } catch {
            setErrorModal({
                title: "Error al añadir tarjeta",
                message: "Algo salió mal. Inténtelo de nuevo o regrese más tarde.",
            });
            setLoading(false);
        } finally {
            handleCloseModal();
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        let name: string, value: string | number | boolean;

        if ("target" in e) { // ✅ TypeScript ya reconoce que e tiene target
            const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            name = target.name;
            value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
        } else {
            return; // Evita que TypeScript marque un error
        }

        // Aseguramos que los valores de 'month' y 'year' sean strings
        if (name === "month" || name === "year") {
            value = value.toString();
        }

        setCardDetails((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value.toString()) }));
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
                    setCardDetails((prev) => ({
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
                if (!numberRegex.test(value)) error = 'Solo se permiten números';
                break;
            case 'interiorNumber':
                if (value && !numberRegex.test(value)) error = 'Solo se permiten números';
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


    const areRequiredFieldsFilled = (): boolean => {
        // Verifica que los campos requeridos no estén vacíos
        const requiredFields = [
            cardDetails.cardNumber,
            cardDetails.cardName,
            cardDetails.street,
            cardDetails.exteriorNumber,
            cardDetails.neighborhood,
            cardDetails.city,
            cardDetails.state,
            cardDetails.postalCode,
            cardDetails.cvv,
            cardDetails.month,
            cardDetails.year,
        ];

        // Devuelve true si todos los campos requeridos están llenos y sin errores
        return requiredFields.every((field) => field.trim() !== '') && Object.values(errors).every((error) => !error);
    };


    const handleDeleteCard = async () => {
        if (!cardToDelete) return;
        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_DELETE_CREDITCARD + cardToDelete.id}`;
            const response = await axios.get(requestUrl);


            if (response.status === 200) {
                await fetchCreditCards();
                setshowChipBarDelete(true);
                setTimeout(() => setshowChipBarDelete(false), 3000);
            }


        } catch {
            setErrorModal({
                title: "Error al eliminar tarjeta",
                message: "Algo salió mal. Inténtelo de nuevo o regrese más tarde.",
            });
        } finally {
            closeDeleteModal();
        }
    };


    const handleSelectCard = (card: CreditCard) => {
        setSelectedCard(card);
    };

    const openDeleteModal = (card: CreditCard) => {
        setCardToDelete(card);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setCardToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const closeErrorModal = () => {
        setErrorModal(null);
    };


    const resetForm = () => {
        setSelectedChannel('');
        setCreditAmount('');
        setRechargeAmount('');
        setSelectedCard(null);
        setGenerateInvoice(false);
        setCardDetails({
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
        setErrors({});
    };


    return (
        <Box
            sx={{
                marginTop: "-50px",
                width: "100%",
                minHeight: "100vh",
                overflowY: "auto",
                backgroundColor: "#F2F2F2", // opcional para que se vea más claro
                px: 4,
                pb: 8, // aire abajo para que los botones no queden pegados o escondidos
                boxSizing: "border-box",
            }}
        >
            {/* Modal de confirmación para eliminar */}
            {isDeleteModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '400px',
                        textAlign: 'center',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginBottom: '10px', color: '#4a4a4a' }}>Eliminar tarjeta</h3>
                        <p style={{ marginBottom: '20px', color: '#6a6a6a' }}>
                            ¿Está seguro de que desea eliminar la tarjeta? Esta acción no puede ser revertida.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                onClick={closeDeleteModal}
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#8d406d',
                                    border: '2px solid #8d406d',
                                    borderRadius: '5px',
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteCard}
                                style={{
                                    backgroundColor: '#8d406d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ModalError
                isOpen={OpenErrorModal}
                title={TitleErrorModal}
                message={MessageErrorModal}
                buttonText="Cerrar"
                onClose={() => setOpenErrorModa(false)}
            />             {/* Modal de error */}
            {errorModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '400px',
                        textAlign: 'center',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginBottom: '10px', color: '#4a4a4a' }}>{errorModal.title}</h3>
                        <p style={{ marginBottom: '20px', color: '#6a6a6a' }}>
                            {errorModal.message}
                        </p>
                        <button
                            onClick={closeErrorModal}
                            style={{
                                backgroundColor: '#fff',
                                color: '#8d406d',
                                border: '2px solid #8d406d',
                                borderRadius: '5px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}


            <Modal open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '130px',
                    left: '415px',
                    width: '556px',
                    height: '520px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: 24,
                }}>
                    <Typography sx={{
                        textAlign: 'left',
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: '20px',
                        lineHeight: '54px',
                        letterSpacing: '0px',
                        color: '#574B4F',
                        opacity: 1,
                    }}>
                        Datos de Factura
                    </Typography>
                    <Divider sx={{ margin: '10px 0' }} />

                    <Box sx={{
                        backgroundColor: '#F5F4F4',
                        padding: '15px',
                        borderRadius: '5px',
                        textAlign: 'left',
                        fontSize: '16px',
                        color: '#6a6a6a'
                    }}>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Nombre o razón social:</strong> {invoiceData.name}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>RFC:</strong> {invoiceData.rfc}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Código postal:</strong> {invoiceData.postalCode}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Régimen fiscal:</strong> {invoiceData.fiscalRegime}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Descripción de los bienes o servicios:</strong> {invoiceData.description}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Créditos:</strong> {invoiceData.credits}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Precio unitario:</strong> {invoiceData.unitPrice}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Costo total:</strong> {invoiceData.totalCost}</Typography>
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px', }}><strong>Método de pago:</strong> {invoiceData.paymentMethod}</Typography>
                    </Box>

                    <Divider sx={{ margin: '20px 0' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <SecondaryButton text='Cancelar' onClick={() => setIsInvoiceModalOpen(false)} />
                        <MainButton text='Aceptar' onClick={() => {
                            setIsInvoiceModalOpen(false); // Cierra el modal
                            setGenerateInvoice(true); // Marca el checkbox como seleccionado
                        }} />
                    </Box>
                </Box>
            </Modal>

            <Box sx={{ display: 'flex', alignItems: 'center', pl: '0px', mb: 1, marginLeft: '25px' }}>
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
                        color: '#5A2836',
                        fontFamily: 'Poppins',
                        fontSize: '26px',
                    }}
                >
                    Recarga de credito
                </Typography>
            </Box>
            <Box sx={{ pl: 5 }}>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={(e) => e.preventDefault()}>
                    <div style={{ marginBottom: '20px', width: '60%' }}> {/* Hacemos más estrecho el recuadro */}
                        <Typography
                            sx={{
                                textAlign: 'left',
                                fontFamily: "Poppins",
                                letterSpacing: '0px',
                                color: '#330F1B',
                                opacity: 1,
                                display: 'block',
                                marginBottom: '5px',
                                fontSize: '18px',
                            }}>
                            Canal
                        </Typography>

                        <Select
                            id="channel"
                            value={selectedChannel}
                            onChange={handleChannelChange}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) {
                                    return (
                                        <span
                                            style={{
                                                textAlign: "left",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "12px",
                                                lineHeight: "40px",
                                                letterSpacing: "0px",
                                                color: "#786E71",
                                                opacity: 1,
                                            }}
                                        >
                                            Seleccionar canal
                                        </span>
                                    );
                                }
                                return selected === "short_sms" ? "SMS, números cortos" : "SMS, números largos";
                            }}
                            sx={{
                                width: "208px",
                                height: "40px",
                                border: "1px solid #dcdcdc",
                                borderRadius: "5px",
                                fontSize: "1rem",
                                fontFamily: "Poppins, sans-serif",
                                "& .MuiSelect-select": {
                                    textAlign: "left",
                                    padding: "10px 14px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                },
                            }}
                        >
                            <MenuItem value="short_sms">SMS, números cortos</MenuItem>
                            <MenuItem value="long_sms">SMS, números largos</MenuItem>
                        </Select>

                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', width: '60%' }}> {/* Ajustamos ancho aquí también */}
                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                fontSize: '18px',
                                fontFamily: "Poppins",
                                display: 'block',
                                marginBottom: '5px',
                                color: '#330F1B',
                            }}>Cantidad de créditos</Typography>

                            <TextField
                                id="credits"
                                type="number"
                                value={creditAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCreditAmount(value);
                                    calculateCredits(value); // 🔥 Calcula en tiempo real
                                }}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    sx: {
                                        textAlign: "left",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500, // medium
                                        lineHeight: "54px",
                                        letterSpacing: "0.03px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        height: "54px", // Altura fija según la imagen
                                        backgroundColor: "#FFFFFF", // Asegurar fondo blanco
                                    },
                                }}
                                sx={{
                                    width: "210px", // Ancho según la imagen
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "5px",
                                        border: "1px solid #dcdcdc",
                                        "& fieldset": {
                                            borderColor: "#dcdcdc",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#b8b8b8", // Cambio de color al pasar el mouse
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#574B4F", // Color al seleccionar
                                        },
                                    },
                                }}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                fontSize: '18px',
                                fontFamily: "Poppins",
                                display: 'block',
                                marginBottom: '5px',
                                color: '#330F1B',
                            }}>Monto a recargar</Typography>
                            <TextField
                                id="amount"
                                type="text"
                                disabled
                                value={`${rechargeAmount}`}
                                onChange={handleRechargeChange}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    sx: {
                                        textAlign: "left",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500, // medium
                                        lineHeight: "54px",
                                        letterSpacing: "0.03px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        height: "54px", // Mantener altura uniforme
                                        backgroundColor: "#f5f5f5", // Gris de fondo para indicar que está deshabilitado
                                    },
                                }}
                                sx={{
                                    width: "210px", // Ancho según la imagen
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "5px",
                                        border: "1px solid #dcdcdc",
                                        "& fieldset": {
                                            borderColor: "#dcdcdc",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#b8b8b8", // Cambio de color al pasar el mouse
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#574B4F", // Color al seleccionar
                                        },
                                    },
                                }}
                            />

                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', width: '60%' }}> {/* Texto del método de pago */}
                        <Typography style={{
                            fontSize: '18px',
                            fontFamily: "Poppins",
                            display: 'block',
                            marginBottom: '5px',
                            color: '#330F1B',
                        }}>Seleccione el método de pago</Typography>
                    </div>
                    <Typography style={{
                        fontSize: '14px',
                        fontFamily: "Poppins",
                        marginBottom: '10px',
                        color: '#786E71',
                    }}>
                        Métodos disponibles
                    </Typography>


                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                        {[visa, mastercard, amex, spei].map((imgSrc, index) => (
                            <Box
                                key={index}
                                sx={{
                                    border: '1px solid #E1E1E1',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    backgroundColor: '#FFFFFF',
                                    width: '80px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    src={imgSrc}
                                    alt={`Método ${index}`}
                                    style={{ maxHeight: '24px', objectFit: 'contain' }}
                                />
                            </Box>
                        ))}
                    </Box>

                    <MainButtonIcon onClick={handleOpenModal} text='Agregar Tarjeta' width='210px' />


                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto', // Habilita el scroll horizontal
                        whiteSpace: 'nowrap',
                        marginTop: '20px',
                        paddingBottom: '10px',
                    }}>
                        {creditCards.map((card) => (
                            <div
                                key={card.id}
                                style={{
                                    border: selectedCard?.id === card.id ? '2px solid #8d406d' : '1px solid #dcdcdc',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    width: '360px', // Ancho del contenedor
                                    height: '172px', // Alto del contenedor
                                    position: 'relative',
                                    backgroundColor: selectedCard?.id === card.id ? '#f3e6f5' : '#fff',
                                    display: 'inline-block',
                                    whiteSpace: 'normal',
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
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    textAlign: "left",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 1,
                                    fontSize: "14px"
                                }}>
                                    <div>
                                        {card.type}
                                    </div>
                                </div>

                                {/* Detalles */}

                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontFamily: "Poppins",
                                        display: 'flex',
                                        flexDirection: 'column', // Distribución en filas
                                        gap: '5px', // Espacio entre filas
                                        lineHeight: '1.2', // Compacta las líneas ligeramente
                                    }}
                                >
                                    <span style={{ margin: '0', padding: '0' }}>{card.card_name}</span>
                                    <span style={{ margin: '0', padding: '0' }}>Terminación: •••• {card.card_number.slice(-4)}</span>
                                    <span style={{ margin: '0', padding: '0' }}>Vencimiento: {card.expiration_month.toString().padStart(2, '0')}/{card.expiration_year.toString().slice(-2)}</span>
                                </div>

                                {/* Radio para seleccionar */}
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        marginBottom: '10px',
                                        marginTop: '15px',
                                        cursor: 'pointer',
                                        marginLeft: '-10px',
                                    }}
                                    onClick={() => handleSelectCard(card)}
                                >
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
                                    }}>{selectedCard?.id === card.id ? 'Tarjeta seleccionada' : 'Seleccionar tarjeta'}</span>

                                </label>

                                {/* Botón para eliminar */}
                                <Tooltip title="Eliminar tarjeta" arrow>
                                    <button
                                        onClick={() => openDeleteModal(card)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <img src={trash} width='24px' height='24px' />
                                    </button>
                                </Tooltip>
                            </div>
                        ))}
                    </div>

                    <Box sx={{ width: '100%', marginTop: '24px' }}>
                        {/* Checkbox */}
                        <Box sx={{ marginBottom: '4px' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateInvoice}
                                        onChange={(e) => setGenerateInvoice(e.target.checked)}
                                        sx={{ color: '#8F4D63' }}
                                    />
                                }
                                label={
                                    <Typography
                                        sx={{
                                            fontFamily: 'Poppins',
                                            fontSize: '14px',
                                            color: '#786E71',
                                        }}
                                    >
                                        Generar factura automáticamente
                                    </Typography>
                                }
                            />
                        </Box>

                        {/* Openpay + Botones */}
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
                                    sx={{ height: '20px', objectFit: 'contain' }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <SecondaryButton text="Cancelar" onClick={resetForm} />
                                <MainButton
                                    text="Recargar"
                                    onClick={handleRecharge}
                                    disabled={isRechargeButtonDisabled()}
                                    isLoading={Loading}
                                />
                            </Box>
                        </Box>
                    </Box>

                </form>
            </Box>
            <Modal
                open={isModalOpen}
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
                                font: "normal normal 600 20px/54px Poppins",
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
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            columnGap: '20px',
                            rowGap: '15px',
                        }}
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div style={{ display: 'flex', gap: '20px', gridColumn: 'span 2' }}>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        textAlign: "left",
                                        font: "normal normal medium 16px/54px Poppins",
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
                                    value={cardDetails.cardNumber}
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
                                        font: "normal normal medium 16px/54px Poppins",
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
                                    value={cardDetails.cardName}
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
                                    font: "normal normal medium 16px/54px Poppins",
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
                                value={cardDetails.street}
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
                                        font: "normal normal medium 16px/54px Poppins",
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
                                    value={cardDetails.exteriorNumber}
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
                                        font: "normal normal medium 16px/54px Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "16px",
                                        display: "block",
                                        marginBottom: "5px"
                                    }}
                                >
                                    Número interior
                                </label>
                                <TextField type="number"
                                    name="interiorNumber"
                                    value={cardDetails.interiorNumber}
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
                                    font: "normal normal medium 16px/54px Poppins",
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
                                value={cardDetails.neighborhood}
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
                                    font: "normal normal medium 16px/54px Poppins",
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
                                value={cardDetails.city}
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
                                    font: "normal normal medium 16px/54px Poppins",
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
                                value={cardDetails.state}
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
                                    font: "normal normal medium 16px/54px Poppins",
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
                                value={cardDetails.postalCode}
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
                                        font: "normal normal medium 16px/54px Poppins",
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
                                        font: "normal normal medium 16px/54px Poppins",
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
                                        name="month" // 🔥 Aseguramos que `name` esté presente
                                        value={cardDetails.month} // 🔥 `value` debe coincidir con `formData.month`
                                        onChange={handleChange}
                                        required
                                        style={{
                                            background: "#FFFFFF",
                                            border: "1px solid #9B9295",
                                            borderRadius: "8px",
                                            width: "87px",
                                            height: "40px",
                                        }}
                                    >
                                        <MenuItem value="" disabled>Mes</MenuItem>
                                        {[...Array(12)].map((_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem> // 🔥 Convertimos a `string`
                                        ))}
                                    </Select>

                                    <Select
                                        name="year" // 🔥 Aseguramos que `name` esté presente
                                        value={cardDetails.year} // 🔥 `value` debe coincidir con `formData.year`
                                        onChange={handleChange}
                                        required
                                        style={{
                                            background: "#FFFFFF",
                                            border: "1px solid #9B9295",
                                            borderRadius: "8px",
                                            width: "87px",
                                            height: "40px",
                                        }}
                                    >
                                        <MenuItem value="" disabled>Año</MenuItem>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                            <MenuItem key={year} value={year.toString()}>{year}</MenuItem> // 🔥 Convertimos a `string`
                                        ))}
                                    </Select>

                                    <TextField
                                        type="number"
                                        name="cvv"
                                        value={cardDetails.cvv}
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
                                    checked={cardDetails.isDefault}
                                    onChange={handleChange}
                                    sx={{
                                        '&.Mui-checked': {
                                            color: '#ffffff', // 🔥 Color del check (blanco)
                                        },
                                        '&.Mui-checked .MuiSvgIcon-root': {
                                            backgroundColor: '#8F4D63', // 🔥 Cambia el color de adentro cuando está seleccionado
                                            borderRadius: '4px',
                                            color: '#ffffff', // 🔥 Cambia el color de la flecha (check) a blanco
                                        }
                                    }}
                                />
                                <span style={{
                                    textAlign: "left",
                                    font: "normal normal normal 16px/20px Poppins",
                                    letterSpacing: "0px",
                                    color: "#8F4D63",
                                    opacity: 1,
                                    fontSize: "16px",
                                }}>Establecer como forma de pago predeterminada.</span>
                            </div>
                        </div>
                        <Box sx={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                            {[visa, mastercard, amex, spei, openpay].map((imgSrc, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        border: '1px solid #E1E1E1',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        backgroundColor: '#FFFFFF',
                                        width: '80px',
                                        height: '50px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <img
                                        src={imgSrc}
                                        alt={`Método ${index}`}
                                        style={{ maxHeight: '24px', objectFit: 'contain' }}
                                    />
                                </Box>
                            ))}
                        </Box>
                        <hr
                            style={{
                                gridColumn: 'span 2',
                                width: '100%',
                                border: '1px solid #ccc',
                                margin: '20px 0',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '20px', gridColumn: 'span 2' }}>
                            <div style={{ flex: 1 }}>
                                <SecondaryButton
                                    onClick={() => handleCloseModal()}
                                    text="Cancelar"// 🔥 Se asegura que no se expanda
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <MainButton
                                    text="Agregar"
                                    isLoading={Loading}
                                    onClick={() => addCreditCard()}
                                    disabled={!areRequiredFieldsFilled()}
                                />
                            </div>
                        </div>



                    </form>
                </Box>
            </Modal>

            {showChipBarAdd && (
                <ChipBar
                    message="La recarga se ha realizado exitosamente"
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarAdd(false)}
                />
            )}
            {showChipBarCard && (
                <ChipBar
                    message="Se ha agregado la tarjeta con exito"
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarAdd(false)}
                />
            )}
            {showChipBarDelete && (
                <ChipBar
                    message="Se ha eliminado la tarjeta con exito"
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarAdd(false)}
                />
            )}
        </Box>
    );
};

export default AccountRecharge;
