import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, IconButton, Menu, MenuItem, Tooltip, Modal, Divider, TableRow } from "@mui/material";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../components/commons/CSS/DatePicker.css';
import { es } from 'date-fns/locale';
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import DatePicker from '../components/commons/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import boxclose from '../assets/Nousers.svg'
import axios from "../components/commons/AxiosInstance";
import boxopen from '../assets/NoResultados.svg'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EyeIcon from '../assets/eye-icon.svg';
import DownloadIcon from '../assets/download-icon.svg';
import ModalError from '../components/commons/ModalError'
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from "react-router-dom";
import Snackbar from '../components/commons/ChipBar'
import billingicon from '../assets/billing.svg'
import { letterSpacing } from 'html2canvas/dist/types/css/property-descriptors/letter-spacing';
interface Historic {
    id: number,
    quantityMoney: number,
    Client: string,
    RechargeDate: Date,
    PaymentMethod: string,
    Estatus: string,
    facturadaPreviamente: boolean
}

export interface FacturaResumen {
    id: number;
    uuid: string;
    serie: string | null;
    folio: string | null;
    fechaEmision: string;
    subtotal: number;
    iva: number | null;
    total: number;
    urlXml: string | null;
    urlPdf: string | null;
    origen: string | null;
    fechaRegistro: string;
    rechargeId: number;
}

const PaymentHistoric: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDates, setSelectedDates] = useState<{ start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [Historic, setHistoric] = useState<Historic | null | undefined>(undefined);
    const [selectedRecarga, setSelectedRecarga] = useState<number | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [creatingInvoice, setCreatingInvoice] = useState(false);
    const [showChipBarInvoice, setShowChipBarInvoice] = useState(false);
    const invoiceData = {
        name: "Nuxiba",
        rfc: "VECJ880326",
        postalCode: "45678",
        fiscalRegime: "Régimen ejemplo",
        description: "Régimen ejemplo",
        credits: "8,000",
        unitPrice: "$0.10",
        totalCost: "$0.10",
    };
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [TitleErrorModal, setTitleErrorModal] = useState('');
    const [BodyErrorModal, setBodyErrorModal] = useState('');
    const [selectedRow, setSelectedRow] = useState<Historic | null>(null);
    const [facturaResumen, setFacturaResumen] = React.useState<FacturaResumen | null>(null);
    const [isFacturaResumenOpen, setFacturaResumenOpen] = useState(false);
    const formatDateRange = () => {
        if (!selectedDates) return 'FECHA'; // Muestra "FECHA" si no hay fechas seleccionadas
        return `${format(selectedDates.start, "dd MMM", { locale: es })}, ${String(selectedDates.startHour).padStart(2, '0')}:${String(selectedDates.startMinute).padStart(2, '0')} - ${format(selectedDates.end, "d MMM", { locale: es })} ${String(selectedDates.endHour).padStart(2, '0')}:${String(selectedDates.endMinute).padStart(2, '0')}`;
    };
    const navigate = useNavigate();
    const handleDateSelectionApply = async (start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number) => {
        setSelectedDates({ start, end, startHour, startMinute, endHour, endMinute });
        setDatePickerOpen(false);
        setAnchorEl(null);
        setLoading(true);
        try {
            const usuario = localStorage.getItem("userData");
            const obj = usuario ? JSON.parse(usuario) : null;

            const requestUrl = `${import.meta.env.VITE_API_GET_RECHARGE}`;
            const payload = {
                FechaInicio: start?.toISOString(), // Formato ISO 8601
                FechaFin: end?.toISOString(),
                IdUser: obj.id
            };

            const response = await axios.post(requestUrl, payload);

            if (response.status === 200 && response.data.length > 0) {
                setHistoric(response.data);
            } else {
                setHistoric(null);
            }
        } catch {
            setHistoric(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget); // Asegurar que el anchor es el botón de fecha
        setDatePickerOpen(true);
    };


    const handleClose = () => {
        setAnchorEl(null);
        //setSelectedRecarga(null);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, id: number, paymentMethod: string, row: Historic) => {
        setAnchorEl(event.currentTarget);
        setSelectedRecarga(id);
        setSelectedPaymentMethod(paymentMethod);
        setSelectedRow(row);
    };

    const handleAsyncAction = async (actionType: 'Consultar' | 'Descargar') => {
        try {
            const userId =
                Number(JSON.parse(localStorage.getItem('userData') ?? '{}')?.id);

            setLoading(true); // Simula la carga

            if (actionType == 'Consultar') {
                const url = import.meta.env.VITE_API_CHECK_INVOICE;
                const payload = {
                    IdCredit: Number(selectedRecarga),
                    IdUser: userId,
                };

                const { data } = await axios.post<FacturaResumen>(url, payload);
                setFacturaResumen(data);
                setFacturaResumenOpen(true);
            }
            if (actionType === 'Descargar') {
                try {
                    setLoading(true);

                    const userId = Number(JSON.parse(localStorage.getItem('userData') ?? '{}')?.id);
                    const url = import.meta.env.VITE_API_DOWNLOAD_INVOICE; // endpoint que regresa base64 del XML
                    const payload = { IdCredit: Number(selectedRecarga), IdUser: userId };

                    // devuelve un string base64 del XML (posible con o sin "data:...;base64,")
                    const { data } = await axios.post<string>(url, payload);

                    const xmlBase64 = data?.includes('base64,') ? data.split('base64,')[1] : data;
                    if (!xmlBase64) {
                        setTitleErrorModal('Error al descargar factura');
                        setBodyErrorModal('No se recibió contenido del XML.');
                        setIsErrorModalOpen(true);
                        return;
                    }

                    // helpers que ya tienes en el archivo:
                    const blobUrl = base64ToBlobUrl(xmlBase64, 'application/xml');
                    const nombreArchivo = `factura_${(facturaResumen?.folio || facturaResumen?.uuid || selectedRow?.id || 'xml')}.xml`;

                    download(blobUrl, nombreArchivo);
                } catch (err) {
                    setTitleErrorModal('Error al descargar factura');
                    setBodyErrorModal('La factura que desea descargar no existe o no está disponible.');
                    setIsErrorModalOpen(true);
                } finally {
                    setLoading(false);
                }
            }

        } catch {
            if (actionType == 'Consultar') {
                setTitleErrorModal(`Error al consultar Factura`);
                setBodyErrorModal('La factura que desea consultar no existe.');
            }
            if (actionType == 'Descargar') {
                setTitleErrorModal('Error al descargar factura');
                setBodyErrorModal('La factura que desea descargar no existe.');
            }

            setIsErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };


    const handleCreateInvoice = async () => {
        if (!selectedRecarga) return;

        const userId =
            Number(JSON.parse(localStorage.getItem('userData') ?? '{}')?.id);

        const url = import.meta.env.VITE_API_SEND_INVOICE;
        const payload = {
            IdCredit: Number(selectedRecarga),
            IdUser: userId,
        };

        try {
            setCreatingInvoice(true);

            const { data, status } = await axios.post<boolean>(url, payload);

            const ok = status === 200 && data === true;
            if (ok) {
                setIsInvoiceModalOpen(false);
                setShowChipBarInvoice(true);
            } else {
                setIsErrorModalOpen(true);
            }
        } catch {
            setIsErrorModalOpen(true);
        } finally {
            setCreatingInvoice(false);
        }
    };



    const norm = (s?: string) => (s ?? '').trim().toLowerCase();

    const hasPrevInvoice = !!selectedRow?.facturadaPreviamente;
    const statusOk = norm(selectedRow?.Estatus) === 'exitoso';

    const canGenerate = !hasPrevInvoice && statusOk;   // ✅ no facturada y estatus exitoso
    const canConsult = hasPrevInvoice;                // ✅ ya facturada
    const canDownload = hasPrevInvoice;                // ✅ ya facturada

    return (
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1180px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, }}>
                <IconButton
                    onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img
                        src={ArrowBackIosNewIcon}
                        alt="Regresar"
                        style={{ width: 24, height: 24, transform: 'rotate(270deg)' }}
                    />
                </IconButton>

                {/* TÍTULO alineado normal */}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 500,
                        color: '#5A2836',
                        fontFamily: 'Poppins',
                        fontSize: '26px'
                    }}
                >
                    Historial de pago
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", }}>
                <Divider sx={{ marginBottom: "17px", marginTop: "16px", backgroundColor: '#E6E4E4' }} />
                <Button
                    variant="outlined"
                    sx={{
                        ...buttonStyle,
                        width: selectedDates ? 'auto' : '90px',
                        height: '36px',
                        minWidth: '90px',
                        ...(selectedDates && {
                            border: '1px solid #8F4E63',
                            color: '#8F4E63',
                            background: '#FFFFFF',
                        }),
                        ...(datePickerOpen && {
                            border: '1px solid #8F4E63',
                            color: '#8F4E63',
                            background: '#FFFFFF',
                        }),
                    }}
                    onClick={handleDateClick}
                >
                    {formatDateRange()}
                </Button>
                <DatePicker
                    open={datePickerOpen}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    onApply={handleDateSelectionApply}
                    onClose={() => setAnchorEl(null)}
                />

                <Divider sx={{ marginBottom: "17px", marginTop: "16px", backgroundColor: '#E6E4E4' }} />

                {/* Lógica para mostrar el contenido correcto */}
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '512px'
                        }}
                    >
                        <CircularProgress sx={{ color: '#7B354D' }} size={60} />
                    </Box>
                ) : Historic === undefined ? (

                    <Box
                        sx={{
                            background: '#FFFFFF',
                            border: '1px solid #E6E4E4',
                            borderRadius: '8px',
                            maxWidth: "1140px",
                            height: '468px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '20px'
                        }}
                    >
                        <img src={boxclose} alt="No data" style={{ width: '240px', height: '190px' }} />
                        <Typography
                            sx={{
                                textAlign: 'center',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                fontWeight: '500',
                                lineHeight: '18px',
                                color: '#7B354D',
                                marginTop: '15px'
                            }}
                        >
                            Seleccione un período para comenzar.
                        </Typography>
                    </Box>
                ) : Historic === null ? (
                    // Imagen de caja abierta cuando NO se encuentran resultados
                    <Box
                        sx={{
                            background: '#FFFFFF',
                            border: '1px solid #E6E4E4',
                            borderRadius: '8px',
                            maxWidth: "1140px",
                            height: '468px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '20px'
                        }}
                    >
                        <img src={boxopen} alt="No results" style={{ width: '240px', height: '190px' }} />
                        <Typography
                            sx={{
                                textAlign: 'center',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                fontWeight: '500',
                                lineHeight: '18px',
                                color: '#7B354D',
                                marginTop: '10px'
                            }}
                        >
                            No se encontraron resultados.
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            background: '#FFFFFF',
                            border: '1px solid #E6E4E4',
                            borderRadius: '8px',
                            maxWidth: "1140px",
                            height: '480px',
                            padding: '8px 2px',
                            marginTop: '20px',
                            overflowX: 'auto'
                        }}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            {/* Encabezados */}
                            <thead>
                                <tr style={{
                                    textAlign: 'left', fontFamily: 'Poppins', fontSize: '13px',
                                    color: '#330F1B', fontWeight: 500, borderBottom: '1px solid #E0E0E0',
                                    height: "35px",
                                }}>
                                    <th style={{
                                        width: '200px',
                                        textAlign: 'left',
                                        padding: '0 14px',
                                        fontFamily: 'Poppins, sans-serif',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                        fontSize: '13px',
                                        backgroundColor: '#FFFFFF',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontWeight: 500
                                    }}>
                                        Fecha
                                    </th>
                                    <th style={{
                                        width: '200px',
                                        textAlign: 'left',
                                        padding: '0 0px',
                                        fontFamily: 'Poppins, sans-serif',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                        fontSize: '13px',
                                        backgroundColor: '#FFFFFF',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontWeight: 500
                                    }}>
                                        Cliente
                                    </th>
                                    <th style={{
                                        width: '150px',
                                        textAlign: 'left',
                                        padding: '0 0px',
                                        fontFamily: 'Poppins, sans-serif',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                        fontSize: '13px',
                                        backgroundColor: '#FFFFFF',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontWeight: 500
                                    }}>
                                        ID de pago
                                    </th>
                                    <th style={{
                                        width: '150px',
                                        textAlign: 'left',
                                        padding: '0 0px',
                                        fontFamily: 'Poppins, sans-serif',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                        fontSize: '13px',
                                        backgroundColor: '#FFFFFF',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontWeight: 500
                                    }}>
                                        Cantidad
                                    </th>
                                    <th style={{
                                        width: '250px',
                                        textAlign: 'left',
                                        padding: '0 0px',
                                        fontFamily: 'Poppins, sans-serif',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                        fontSize: '13px',
                                        backgroundColor: '#FFFFFF',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontWeight: 500
                                    }}>
                                        Métodos de pago
                                    </th>
                                    <th style={{
                                        width: '150px',
                                        textAlign: 'left',
                                        padding: '0 0px',
                                        fontFamily: 'Poppins, sans-serif',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                        fontSize: '13px',
                                        backgroundColor: '#FFFFFF',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontWeight: 500
                                    }}>
                                        Estatus
                                    </th>
                                    <td style={{
                                        position: 'sticky', textAlign: "center",
                                        right: -2,
                                        background: '#fff',
                                        padding: '3.5px', width: '75px', height: "30px", whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F",
                                    }}>
                                        <Divider sx={{
                                            marginTop: "-51px", marginLeft: "14px",
                                            position: "absolute",
                                            height: '90px',
                                            width: "0px",
                                            borderLeft: "1px solid #E0E0E0"
                                        }} />
                                    </td>
                                </tr>
                            </thead>

                            {/* Datos */}
                            <tbody>
                                {Historic.map((recarga) => (
                                    <tr key={recarga.id} style={{ borderBottom: '1px solid #E6E4E4' }}>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#000000',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {new Date(recarga.rechargeDate).toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#000000',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.client}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#000000',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.id}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#000000',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            ${recarga.quantityMoney.toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#000000',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            <Tooltip title={recarga.paymentMethod} arrow>
                                                <span style={truncatedStyle}>
                                                    {recarga.paymentMethod.split('-')[0]} - ...
                                                </span>
                                            </Tooltip>
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#000000',
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.estatus}
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            <IconButton onClick={(event) => handleMenuClick(event, recarga.id, recarga.paymentMethod, recarga)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Menú de opciones */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        >
                            <MenuItem disabled={selectedRow?.facturadaPreviamente} style={menuItemStyle} onClick={() => {
                                setIsInvoiceModalOpen(true);
                                handleClose();
                            }} >
                                <img src={billingicon} alt="billing" style={iconStyle} />

                                Generar Factura
                            </MenuItem>
                            <MenuItem disabled={!canConsult} onClick={() => { handleAsyncAction('Consultar'); handleClose(); }} style={menuItemStyle}
                                sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '14px',
                                    '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}
                            >
                                <img src={EyeIcon} alt="Consultar" style={iconStyle} />
                                Consultar Factura
                            </MenuItem>
                            <MenuItem disabled={!canDownload} onClick={() => { handleAsyncAction('Descargar'); handleClose(); }} style={menuItemStyle}
                                sx={{
                                    fontFamily: 'Poppins',
                                    fontSize: '14px',
                                    '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}
                            >
                                <img src={DownloadIcon} alt="Descargar" style={iconStyle} />
                                Descargar Factura
                            </MenuItem>

                        </Menu>
                    </Box>
                )}
            </Box>

            <Modal open={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '35%',
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
                        Consultar factura
                    </Typography>
                    <IconButton
                        onClick={() => setIsInvoiceModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            marginTop: '-68px',
                            marginLeft: '492px',
                            zIndex: 10
                        }}
                    >
                        <CloseIcon sx={{ color: '#A6A6A6' }} />
                    </IconButton>
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
                        <Typography sx={{ marginBottom: '10px', fontFamily: 'Poppins', fontSize: '16px' }}>
                            <strong>Método de pago:</strong> {selectedPaymentMethod ?? 'No disponible'}
                        </Typography>
                    </Box>

                    <Divider sx={{ margin: '20px 0' }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <SecondaryButton text='Cancelar' onClick={() => setIsInvoiceModalOpen(false)} />
                        <MainButton
                            text={creatingInvoice ? 'Generando…' : 'Aceptar'}
                            onClick={handleCreateInvoice}
                            disabled={creatingInvoice}
                            isLoading={creatingInvoice}
                        />
                    </Box>
                </Box>
            </Modal>
            <Modal open={isFacturaResumenOpen} onClose={() => setFacturaResumenOpen(false)}>
                <Box sx={{ position: 'absolute', top: '20%', left: '35%', width: 556, height: 520, bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 24 }}>
                    <Typography sx={{ textAlign: 'left', fontFamily: 'Poppins', fontWeight: 600, fontSize: 20, lineHeight: '54px', color: '#574B4F' }}>
                        Resumen de factura
                    </Typography>

                    <IconButton onClick={() => setFacturaResumenOpen(false)}
                        sx={{ position: 'absolute', mt: '-68px', ml: '492px', zIndex: 10 }}>
                        <CloseIcon sx={{ color: '#A6A6A6' }} />
                    </IconButton>

                    <FacturaResumenContent
                        facturaResumen={facturaResumen}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onClose={() => setFacturaResumenOpen(false)}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <SecondaryButton text='Cerrar' onClick={() => setFacturaResumenOpen(false)} />
                    </Box>
                </Box>
            </Modal>

            {showChipBarInvoice && (
                <Snackbar
                    message="Factura generada correctamente"
                    buttonText="Cerrar"
                    onClose={() => setShowChipBarInvoice(false)}
                />
            )}

            <ModalError
                isOpen={isErrorModalOpen}
                title={TitleErrorModal}
                message={BodyErrorModal}
                buttonText="Cerrar"
                onClose={() => setIsErrorModalOpen(false)}
            />
        </Box>
    );
};

const buttonStyle = {
    fontFamily: 'Poppins, sans-serif',
    background: '#F6F6F6',
    border: '1px solid #C6BFC2',
    borderRadius: '18px',
    letterSpacing: "1.12px",
    fontWeight: 500,
    color: '#330F1B',
    textTransform: 'none',
    '&:hover': {
        background: '#F8F8F8',
        border: '1px solid #8F4E63CC',
        color: '#8F4E63'
    },
    '&:active': {
        background: '#F8F8F8',
        border: '1px solid #8F4E63CC',
        color: '#8F4E63'
    }

};

const headerStyle = {
    width: '200px',
    textAlign: 'left',
    padding: '10px',
    fontFamily: 'Poppins, sans-serif',
    letterSpacing: '0px',
    color: '#330F1B',
    fontSize: '13px',
    backgroundColor: '#FFFFFF'
};

const tdStyle = {
    padding: '10px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '11px',
    color: '#000000',
    textAlign: 'left'
};

const menuItemStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '14px',
    color: '#675C60'
};

const truncatedStyle = {
    display: 'inline-block',
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer'
};
const iconStyle = {
    width: '20px',
    height: '20px',
    marginRight: '10px'
};

type FacturaResumenProps = {
    facturaResumen: FacturaResumen | null;
    selectedPaymentMethod?: string | null;
    onClose: () => void;
};

const money = (n?: number | null) =>
    typeof n === 'number'
        ? n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
        : '—';

const fmtDate = (s?: string | null) =>
    s ? new Date(s).toLocaleString('es-MX') : '—';

// ¿parece base64 (con o sin data:...;base64,)?
const looksBase64 = (s?: string | null) => {
    if (!s) return false;
    if (/^data:.*;base64,/.test(s)) return true;
    return /^[A-Za-z0-9+/=\s]+$/.test(s) && s.length > 100;
};

const base64ToBlobUrl = (b64: string, mime: string) => {
    const clean = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
    const bin = atob(clean);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
};

const download = (href: string, filename: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
};

const FacturaResumenContent: React.FC<FacturaResumenProps> = ({
    facturaResumen,
    selectedPaymentMethod,
    onClose,
}) => {
    const serie = facturaResumen?.serie ?? '—';
    const folio = facturaResumen?.folio ?? '—';
    const uuid = facturaResumen?.uuid ?? '—';

    const subtotal = money(facturaResumen?.subtotal);
    const iva = money(facturaResumen?.iva ?? null);
    const total = money(facturaResumen?.total);
    const fechaEmision = fmtDate(facturaResumen?.fechaEmision);
    const origen = facturaResumen?.origen ?? '—';

    const canPdf = !!facturaResumen?.urlPdf;
    const canXml = !!facturaResumen?.urlXml;

    const handleDownloadPdf = () => {
        const src = facturaResumen?.urlPdf;
        if (!src) return;
        if (looksBase64(src)) {
            const url = base64ToBlobUrl(src, 'application/pdf');
            download(url, `factura_${folio || uuid}.pdf`);
        } else {
            window.open(src, '_blank');
        }
    };

    const handleDownloadXml = () => {
        const src = facturaResumen?.urlXml;
        if (!src) return;
        if (looksBase64(src)) {
            const url = base64ToBlobUrl(src, 'application/xml');
            download(url, `factura_${folio || uuid}.xml`);
        } else {
            window.open(src, '_blank');
        }
    };

    const copyUuid = async () => {
        if (!uuid || uuid === '—') return;
        try {
            await navigator.clipboard.writeText(uuid);
            // TODO: muestra tu toast si quieres
        } catch { }
    };

    return (
        <Box sx={{ bgcolor: '#F5F4F4', p: 2, borderRadius: 1, color: '#6a6a6a' }}>
            <Typography sx={{ mb: 1, fontFamily: 'Poppins', fontSize: 16 }}>
                <strong>Serie/Folio:</strong> {serie}/{folio}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography sx={{ fontFamily: 'Poppins', fontSize: 16 }}>
                    <strong>UUID:</strong> {uuid}
                </Typography>
            </Box>

            <Typography sx={{ mb: 1, fontFamily: 'Poppins', fontSize: 16 }}>
                <strong>Fecha de emisión:</strong> {fechaEmision}
            </Typography>

            <Typography sx={{ mb: 1, fontFamily: 'Poppins', fontSize: 16 }}>
                <strong>Subtotal:</strong> {subtotal}
            </Typography>

            <Typography sx={{ mb: 1, fontFamily: 'Poppins', fontSize: 16 }}>
                <strong>IVA:</strong> {iva}
            </Typography>

            <Typography sx={{ mb: 1, fontFamily: 'Poppins', fontSize: 16 }}>
                <strong>Total:</strong> {total}
            </Typography>

            <Typography sx={{ mb: 1, fontFamily: 'Poppins', fontSize: 16 }}>
                <strong>Método de pago:</strong> {selectedPaymentMethod ?? 'No disponible'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <MainButton onClick={handleDownloadPdf} disabled={!canPdf} text='DescargarPDF' />

                <MainButton onClick={handleDownloadXml} disabled={!canXml} text='DescargaXML' />

            </Box>
        </Box>
    );
};


export default PaymentHistoric;
