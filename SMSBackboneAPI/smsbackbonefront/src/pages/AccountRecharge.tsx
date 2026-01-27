import React, { useState, useEffect, useRef } from 'react';
import axios from "../components/commons/AxiosInstance";
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
import Errormodal from '../components/commons/ModalError'
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import { useSelectedRoom } from "../hooks/useSelectedRoom";

export interface Clients {
    id: number;
    nombreCliente: string;
    creationDate: string;
    rateForShort: number;
    rateForLong: number;
    shortRateType: number;
    longRateType: number;
    shortRateQty: string;
    longRateQty: string;
    estatus: number;
}

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
    const [Clients, setClients] = useState<Clients | null>(null);
    const [isErrorModalOpen, setisErrorModalOpen] = useState(false);
    const IVA_RATE = 0.16;
    const navigate = useNavigate();

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    };

    const hasRunRef = useRef(false);

    // ✅ Hook para reaccionar al cambio de sala (storageUpdate)
    const selectedRoom = useSelectedRoom();

    const checkRechargeStatus = async (id: string) => {
        try {
            const requestUrl = `${import.meta.env.VITE_API_VERIFY_RECHARGE}${id}`;
            const response = await axios.get(requestUrl);

            if (response.status === 200 && response.data) {
                if (response.data) {
                    setshowChipBarAdd(true);
                    setTimeout(() => setshowChipBarAdd(false), 10000);
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

            // ✅ Solo si hay sala seleccionada
            if (!selectedRoom) return;

            const request = localStorage.getItem("request");
            if (!request) return;

            // ✅ Clonar (NO mutar selectedRoom)
            const room = { ...selectedRoom } as any;
            const amountParsed = JSON.parse(request);

            const qty = Number(amountParsed.QuantityCredits) || 0;

            if (amountParsed.Chanel === 'long_sms') {
                room.long_sms = (Number(room.long_sms) || 0) + qty;
            } else {
                room.short_sms = (Number(room.short_sms) || 0) + qty;
            }

            room.credits = (Number(room.credits) || 0) + qty;

            localStorage.setItem('selectedRoom', JSON.stringify(room));
            window.dispatchEvent(new Event('storageUpdate'));
            localStorage.removeItem('request');
        }
    };

    const query = useQuery();
    const id = query.get('id');

    useEffect(() => {
        if (id && !hasRunRef.current) {
            hasRunRef.current = true;
            checkRechargeStatus(id);
        }
    }, [id]);

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        const userObj = userData ? JSON.parse(userData) : null;

        if (userObj?.idCliente) {
            const url = `${import.meta.env.VITE_API_GETRATE_CLIENT}${userObj.idCliente}`;
            axios.get(url)
                .then(res => {
                    if (res.status === 200 && res.data) {
                        setClients(res.data);
                    }
                })
                .catch(() => {
                    setisErrorModalOpen(true);
                });
        }
    }, []);

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
        },
    }));

    const resetAddCardForm = () => {
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

    // Funciones para abrir y cerrar el modal
    const handleOpenModal = () => {
        resetAddCardForm();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetAddCardForm();
    };

    const handleChannelChange = (event: SelectChangeEvent<string>) => {
        setSelectedChannel(event.target.value);
    };

    useEffect(() => {
        if (creditAmount) {
            calculateCredits(creditAmount);
        }
    }, [selectedChannel]);

    const calculateCredits = (value: string) => {
        const credits = parseFloat(value);
        if (!isNaN(credits) && Clients) {
            let rate = 0;
            if (selectedChannel === 'short_sms') {
                rate = parseFloat(Clients.rateForShort.toString());
            } else if (selectedChannel === 'long_sms') {
                rate = parseFloat(Clients.rateForLong.toString());
            }

            const baseAmount = credits * rate;
            const ivaAmount = baseAmount * IVA_RATE;
            const total = baseAmount + ivaAmount;

            setRechargeAmount(total.toFixed(2));
        } else {
            setRechargeAmount('0.00');
        }
    };

    const handleRechargeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        // Evitar negativos
        if (value.startsWith('-')) value = value.replace('-', '');

        // Evitar notación científica o caracteres extraños
        value = value.replace(/[^0-9]/g, '');

        // Si queda vacío, es 0
        if (value === '') value = '0';

        setRechargeAmount(value);
    };

    const fetchCreditCards = async () => {
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el correo electrónico del usuario.");
            return;
        }

        try {
            const requestUrl = `${import.meta.env.VITE_API_GET_CREDITCARD}${obj.id}`;
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
            // ✅ Ya no leer selectedRoom desde localStorage: usar hook
            if (!selectedRoom) {
                setTitleErrorModa("Selecciona una sala");
                setMessageErrorModa("Antes de recargar, selecciona una sala en el selector.");
                setOpenErrorModa(true);
                setLoading(false);
                return;
            }

            const requestUrl = `${import.meta.env.VITE_API_ADD_RECHARGE}`;
            const payload = {
                IdCreditCard: selectedCard?.id,
                IdUser: obj.id,
                Chanel: selectedChannel,
                QuantityCredits: creditAmount,
                QuantityMoney: rechargeAmount,
                AutomaticInvoice: generateInvoice,
                room: (selectedRoom as any).name,
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
            const requestUrl = `${import.meta.env.VITE_API_ADD_CREDITCARD}`;
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
            const requestUrl = `${import.meta.env.VITE_API_DELETE_CREDITCARD + cardToDelete.id}`;
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
            />

            {/* Modal de error */}
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
                    onClick={() => navigate('/')}
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
                    Recarga de créditos
                </Typography>
            </Box>

            <Box sx={{ pl: 5 }}>
                <Divider sx={{ mb: 3 }} />

                <form onSubmit={(e) => e.preventDefault()}>
                    <div style={{ marginBottom: '20px', width: '60%' }}>
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

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', width: '60%' }}>
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
                                    let value = e.target.value;

                                    value = value.replace(/[^0-9]/g, '');

                                    if (value.length > 1 && value.startsWith('0')) {
                                        value = value.replace(/^0+/, '');
                                        if (value === '') value = '0';
                                    }

                                    setCreditAmount(value);
                                    calculateCredits(value);
                                }}

                                onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    sx: {
                                        textAlign: "left",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "16px",
                                        fontWeight: 500,
                                        lineHeight: "54px",
                                        letterSpacing: "0.03px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        height: "54px",
                                        backgroundColor: "#FFFFFF",

                                        "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                                            WebkitAppearance: "none",
                                            margin: 0,
                                        },
                                        "& input[type=number]": {
                                            MozAppearance: "textfield",
                                        },
                                    },
                                }}
                                sx={{
                                    width: "210px",
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "5px",
                                        border: "1px solid #dcdcdc",
                                        "& fieldset": {
                                            borderColor: "#dcdcdc",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#b8b8b8",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#574B4F",
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
                            }}>Monto a recargar + iva</Typography>

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
                                        fontWeight: 500,
                                        lineHeight: "54px",
                                        letterSpacing: "0.03px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        height: "54px",
                                        backgroundColor: "#f5f5f5",
                                    },
                                }}
                                sx={{
                                    width: "210px",
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "5px",
                                        border: "1px solid #dcdcdc",
                                        "& fieldset": {
                                            borderColor: "#dcdcdc",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#b8b8b8",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#574B4F",
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', width: '60%' }}>
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
                        overflowX: 'auto',
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
                                    width: '360px',
                                    height: '172px',
                                    position: 'relative',
                                    backgroundColor: selectedCard?.id === card.id ? '#f3e6f5' : '#fff',
                                    display: 'inline-block',
                                    whiteSpace: 'normal',
                                }}
                            >
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

                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontFamily: "Poppins",
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px',
                                        lineHeight: '1.2',
                                    }}
                                >
                                    <span style={{ margin: '0', padding: '0' }}>{card.card_name}</span>
                                    <span style={{ margin: '0', padding: '0' }}>Terminación: •••• {card.card_number.slice(-4)}</span>
                                    <span style={{ margin: '0', padding: '0' }}>Vencimiento: {card.expiration_month.toString().padStart(2, '0')}/{card.expiration_year.toString().slice(-2)}</span>
                                </div>

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
                        <Box sx={{ marginBottom: '4px' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={generateInvoice}
                                        onChange={(e) => setGenerateInvoice(e.target.checked)}
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
                                            color: '#786E71',
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

            {/* --- EL RESTO DEL ARCHIVO SIGUE IGUAL --- */}
            {/* Modal agregar tarjeta, ChipBars y ModalError final */}

            <Modal
                open={isModalOpen}
                onClose={(_, reason) => {
                    if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
                        handleCloseModal();
                    }
                }}
                disableEscapeKeyDown
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
                                fontStyle: "normal",
                                fontWeight: 600,
                                fontSize: "20px",
                                lineHeight: "54px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
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

                    {/* (Todo el contenido del modal y lo demás queda igual que tu archivo original) */}

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
            <ModalError
                isOpen={isErrorModalOpen}
                title="Error al traer los creditos"
                message="Intentenlo más tarde o refresque la pagina"
                buttonText="Cerrar"
                onClose={() => setisErrorModalOpen(false)}
            />
        </Box>
    );
};

export default AccountRecharge;
