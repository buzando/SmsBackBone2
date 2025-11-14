import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, IconButton, Checkbox, TextField, InputAdornment, Tooltip, CircularProgress } from '@mui/material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Select,
    Stepper,
    Step,
    StepLabel,
    Button,
    FormControlLabel,
    Radio,
    Grid,
    Modal,
    FormControl,
    InputLabel,
    FormGroup,
    FormLabel,
    RadioGroup
} from '@mui/material';
import MainIcon from '../components/commons/MainButtonIcon';
import seachicon from '../assets/icon-lupa.svg';
import Iconseachred from "../assets/Iconseachred.svg";
import iconclose from '../assets/icon-close.svg';
import BoxEmpty from '../assets/Nousers.svg';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from 'react-router-dom';
import axios from "../components/commons/AxiosInstance";
import IconDownloadCSV from '../assets/IconCSV.svg';
import IconDownloadExcel from '../assets/IconExcel.svg';
import IconDownloadPDF from '../assets/IconPDF.svg';
import backarrow from '../assets/MoveTable.svg';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListItemIcon from '@mui/material/ListItemIcon';
import CloseIcon from '@mui/icons-material/Close';
import ListItemText from '@mui/material/ListItemText';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DeleteIcon from '@mui/icons-material/Delete';
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import NoResult from '../assets/NoResultados.svg';
import ModalError from "../components/commons/ModalError";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ModalMain from '../components/commons/MainModal'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BlockIcon from '@mui/icons-material/Block';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CustomDateTimePicker from '../components/commons/DatePickerOneDate';
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import IconCheckBox2 from "../assets/IconCheckBox2.svg";
import IconSuS from "../assets/IconSuS.svg";
import IconSDown from "../assets/IconSDown.svg";
import IconSChecked from "../assets/IconSChecked.svg";
import IconPlus4 from "../assets/IconPlus4.svg";
import IconMinus4 from "../assets/IconMinus4.svg";
import IconCheckedCircle1 from "../assets/IconCheckedCircle1.svg";
import IconCheckedCircle2 from "../assets/IconCheckedCircle2.svg";
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Thrashicon from '../assets/Icon-trash-Card.svg'
import SnackBar from "../components/commons/ChipBar";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'

export interface PagedClientResponse {
    items: Clients[];
    total: number;
}

export interface Clients {
    id?: number;
    nombreCliente: string;
    creationDate: string;
    rateForShort: number;
    rateForLong: number;
    shortRateType: number;
    longRateType: number;
    shortRateQty: string;
    longRateQty: string;
    estatus: number;

    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    extension: number;

    roomName: string;
    totalCredits: number;
    totalLongSmsCredits: number;
    totalShortSmsCredits: number;
    deactivationDate: Date;
}

interface FormData {
    Name: string;
    Phones: string[];
    ExpirationDate: Date | null;
    File: string;
}

interface SmsCost {
    id: number;
    smsType: string;
    quantity: string;
    displayPrice: number;
}

const Clients: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<'cliente' | ''>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentItems, setCurrentItems] = useState<any[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRowId, setMenuRowId] = useState<number | null>(null);
    const open = Boolean(anchorEl);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const [serviceAnchorEl, setServiceAnchorEl] = useState<null | HTMLElement>(null);
    const openServiceFilter = Boolean(serviceAnchorEl);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [clientsList, setClientsList] = useState<Clients[]>([]);
    const [originalData, setOriginalData] = useState<Clients[]>([]);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [clientAnchorEl, setClientAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [clientSearch, setClientSearch] = useState('');

    const [estadoAnchorEl, setEstadoAnchorEl] = useState<null | HTMLElement>(null);
    const [estadoMenuOpen, setEstadoMenuOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

    const [isExportingCSV, setIsExportingCSV] = useState(false);
    const [isExportingXLSX, setIsExportingXLSX] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const anyExporting = isExportingCSV || isExportingXLSX || isExportingPDF;

    const [MainModal, setMainModal] = useState(false);
    const [MainModalDelete, setMainModalDelete] = useState(false);
    const [MainModalMessage, setMainModalMessage] = useState('');
    const [MainModalTitle, setMainModalTitle] = useState('');
    const [openClientModal, setOpenClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Clients | null>(null);
    const [rechargeRooms, setRechargeRooms] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [newRooms, setNewRooms] = useState<string[]>(['Default']);
    const [roomCount, setRoomCount] = useState<number>(1);
    const [shortRateType, setShortRateType] = useState<'estandar' | 'personalizada'>('estandar');
    const [longRateType, setLongRateType] = useState<'estandar' | 'personalizada'>('estandar');
    const [shortStandardQty, setShortStandardQty] = useState('');
    const [shortStandardPrice, setShortStandardPrice] = useState('');
    const [shortCustomQty, setShortCustomQty] = useState('');

    const [longStandardQty, setLongStandardQty] = useState('');
    const [longStandardPrice, setLongStandardPrice] = useState('');
    const [longCustomQty, setLongCustomQty] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [confirmEmailError, setConfirmEmailError] = useState(false);
    const [modalAction, setModalAction] = useState<() => void>(() => () => { });

    const [selectedSmsType, setSelectedSmsType] = useState<'short' | 'long'>('short');
    const [selectedRoomsForRecharge, setSelectedRoomsForRecharge] = useState<string[]>([]);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEditClient, setIsEditClient] = useState(false);
    const [MessageSnack, setMessageSnack] = useState("");
    const [ShowSnackBar, setShowSnackBar] = useState(false);
    const [ShowModalError, setShowModalError] = useState(false);
    const [TitleModalError, setTitleModalError] = useState("");
    const [MessageModal, setMessageModal] = useState("");
    const initialRechargeState = {
        smsType: '', // 'short' | 'long'
        roomsSelected: [] as string[],
        ratePerMessage: 0,
        amount: 0,
        totalWithTax: 0,
        paymentType: '',
        billingDate: new Date().toISOString().split('T')[0],
    };
    const [rechargeData, setRechargeData] = useState(initialRechargeState);
    const [appliedClientIds, setAppliedClientIds] = useState<number[]>([]);
    const isClientActive = activeFilter === 'cliente';
    const hasClientSelected = selectedClients.length > 0;
    const showClientHighlight = isClientActive || hasClientSelected;
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [shortRates, setShortRates] = useState<SmsCost[]>([]);
    const [longRates, setLongRates] = useState<SmsCost[]>([]);
    const [standardShortRates, setStandardShortRates] = useState<Record<string, number>>({});
    const [standardLongRates, setStandardLongRates] = useState<Record<string, number>>({});
    const [phoneError, setPhoneError] = useState(false);
    const [clientNameError, setClientNameError] = useState(false);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [extError, setExtError] = useState(false);

    const reClientName = /^[\p{L}\d\s.&-]{2,100}$/u;
    const rePersonName = /^[\p{L}\s'’-]{2,60}$/u;
    const reExt = /^\d{0,5}$/;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rePhone10 = /^\d{10}$/;


    const DualSpinner = () => (
        <Box
            sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress
                variant="determinate"
                value={100}
                size={24}
                thickness={8}
                sx={{ color: '#D6C4CB', position: 'absolute' }}
            />
            <CircularProgress
                size={24}
                thickness={8}
                sx={{
                    color: '#7B354D',
                    position: 'absolute',
                    animationDuration: '1s',
                }}
            />
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    zIndex: 3,
                }}
            />
        </Box>
    );

    const getStepColor = (stepIndex: number) =>
        stepIndex === step
            ? '#8F4E63'
            : stepIndex < step
                ? '#BC94A1'
                : '#574B4F66';



    const GetClientsAdmin = async () => {
        setLoading(true);

        try {
            const request = `${import.meta.env.VITE_API_GET_CLIENTSADMIN}${currentPage + 1}`;

            const requestPayload = {
                page: currentPage + 1,
                ClienteIds: selectedClients.length > 0 ? selectedClients.join(",") : null,
                Estatus: selectedStatus.length > 0
                    ? selectedStatus
                        .map((s) => (s === "Inactivo" ? 1 : s === "Activo" ? 0 : null))
                        .filter((s) => s !== null)
                        .join(",")
                    : null,
                SearchTerm: searchTerm || null,
            };

            const response = await axios.post<PagedClientResponse>(
                request,
                requestPayload
            );


            if (response.status === 200) {
                const fetchedClient = response.data.items;
                const uniqueClients: Clients[] = [
                    ...new Map(fetchedClient.map((item: Clients) => [item.nombreCliente, item])).values()
                ];
                setClientsList(uniqueClients);
                const sinFiltros =
                    (!requestPayload.ClienteIds || requestPayload.ClienteIds.length === 0) &&
                    (!requestPayload.Estatus || requestPayload.Estatus.length === 0) &&
                    !requestPayload.SearchTerm;

                if (sinFiltros) {
                    setOriginalData(uniqueClients);
                }
                setTotalPages(Math.ceil(response.data.total / itemsPerPage));
                setItemsPerPage(response.data.total);
                setTotalItems(response.data.total);
            }
        } catch {

        } finally {
            setLoading(false);
        }
    }


    const Getcost = async () => {

        try {
            const request = `${import.meta.env.VITE_API_Client_COST}`;
            const response = await axios.get(request);

            if (response.status === 200) {
                const data: SmsCost[] = response.data;

                const shortOptions = data.filter((x) => x.smsType === 'short');
                const longOptions = data.filter((x) => x.smsType === 'long');

                setShortRates(shortOptions);
                setLongRates(longOptions);

                console.log(setShortRates);
                console.log(setLongRates);

                const shortRatesMap: Record<string, number> = {};
                shortOptions.forEach((x) => {
                    shortRatesMap[x.quantity] = x.displayPrice;
                });

                const longRatesMap: Record<string, number> = {};
                longOptions.forEach((x) => {
                    longRatesMap[x.quantity] = x.displayPrice;
                });

                setStandardShortRates(shortRatesMap);
                setStandardLongRates(longRatesMap);
            }
        } catch {

        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        GetClientsAdmin();
        Getcost();
    }, []);

    const exportReport2 = async (
        format: 'pdf' | 'xlsx' | 'csv',
        callback: () => void
    ) => {
        try {

            const payload = {
                ReportType: "Clients",
                Format: format,
                RoomId: 0,
                PageOrigin: "Reportes"
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_GETREPORTS_ALL}`,
                payload
            );

            if (response.data?.success && response.data?.downloadUrl) {
                const responsedata = await fetch("/Quantum/Download/" + response.data?.fileName);
                const blob = await responsedata.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = response.data?.fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                console.error("Error: No se generó el archivo.");
            }
        } catch (error) {
            console.error(`Error al exportar reporte a ${format}:`, error);
        } finally {
            callback();
        }
    };

    const handleExportClick = (
        format: 'csv' | 'xlsx' | 'pdf',
        setThisLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setThisLoading(true);
        setTimeout(() => {
            exportReport2(format, () => setThisLoading(false));
        }, 1000);
    };

    const goToFirstPage = () => setCurrentPage(0);

    const goToLastPage = () => setCurrentPage(totalPages);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
        GetClientsAdmin();
    }, [currentPage]);

    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const filtered = clientsList.filter((client) =>
            client.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setCurrentItems(filtered.slice(start, end));
        setTotalItems(filtered.length);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }, [clientsList, searchTerm, currentPage]);


    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
        setAnchorEl(event.currentTarget);
        setMenuRowId(rowId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRowId(null);
    };


    const filteredData = clientsList.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.nombreCliente.toLowerCase().includes(term)
        );
    });

    const visibleData = clientsList
        .filter(client =>
            appliedClientIds.length === 0 || (client.id !== undefined && appliedClientIds.includes(client.id))
        )
        .filter(client =>
            client.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase())
        );


    const paginatedData = visibleData.slice(startIndex, endIndex);

    const handleAddClient = () => {

        setIsEditClient(false);
        setSelectedClient(null);
        setStep(0);
        setOpenClientModal(true);
        setEmail('');
        setConfirmEmail('');
        setEmailError(false);
        setConfirmEmailError(false);
    };

    const handleEditClient = (client: Clients) => {
        setSelectedClient(client);
        setIsEditClient(true);
        // Salas
        setNewRooms(
            client.roomName
                ? client.roomName.split(',').map(r => r.trim()).slice(0, 5)
                : []
        );

        // Email
        setEmail(client.email);
        setConfirmEmail(client.email);

        // Tarifas cortas
        setShortRateType(client.shortRateType === 1 ? 'personalizada' : 'estandar');
        setShortStandardQty(client.shortRateQty || '');
        setShortCustomQty(client.shortRateQty || '');
        setLongCustomQty(client.longRateQty || '');

        // Tarifas largas
        setLongRateType(client.longRateType === 1 ? 'personalizada' : 'estandar');
        setLongStandardQty(client.longRateQty || '');
        setShortCustomQty(client.shortRateQty || '');
        setLongCustomQty(client.longRateQty || '');

        // Step y modal
        setStep(0);
        setOpenClientModal(true);
    };

    const rateForShort =
        shortRateType === 'estandar'
            ? parseFloat(shortStandardPrice)
            : selectedClient?.rateForShort;

    const rateForLong =
        longRateType === 'estandar'
            ? parseFloat(longStandardPrice)
            : selectedClient?.rateForLong;

    const handleSubmit = async () => {
        setIsSavingClient(true);
        if (!selectedClient) return;

        const payload = {
            id: selectedClient.id ?? null,
            nombreCliente: selectedClient.nombreCliente,
            firstName: selectedClient.firstName,
            lastName: selectedClient.lastName,
            phoneNumber: selectedClient.phoneNumber,
            extension: selectedClient.extension ?? null,
            email: email,
            rateForShort: rateForShort?.toString(),
            rateForLong: rateForLong?.toString(),
            shortRateType: shortRateType === 'personalizada' ? 1 : 0,
            longRateType: longRateType === 'personalizada' ? 1 : 0,
            shortRateQty: shortRateType === 'estandar' ? shortStandardQty : shortCustomQty,
            longRateQty: longRateType === 'estandar' ? longStandardQty : longCustomQty,
            roomNames: newRooms.filter((r) => r.trim() !== ''),
        };

        try {
            const endpoint = `${import.meta.env.VITE_API_UPDATE_CREATE_CLIENT}`


            const method = axios.post;

            await method(endpoint, payload);
            setOpenClientModal(false);
            GetClientsAdmin();
            if (payload.id != null) {
                setMessageSnack('Cliente Actualizado correctamente');
            } else {
                setMessageSnack('Cliente agregado correctamente');
            }

            setShowSnackBar(true);
            setTimeout(() => {
                setShowSnackBar(false);
            }, 5000);
            setMainModal(false);
        } catch (error) {
            setTitleModalError('Error al agregar el cliente');
            setMessageModal('Intentelo más tarde');
            setShowModalError(true);
        }
        finally {
            setOpenClientModal(false);
            setIsSavingClient(false);
        }
    };

    const validateEmailFormat = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };


    const handleDeactivateClient = async (id: number) => {
        const newStatus = currentClient?.estatus === 1 ? 0 : 1;
        try {
            const requestUrl = `${import.meta.env.VITE_API_DEACTIVATE_CLIENT}${id}`;
            await axios.get(requestUrl);

            setClientsList(prev =>
                prev.map(client =>
                    client.id === id
                        ? { ...client, estatus: newStatus }
                        : client
                )
            );
            const message =
                newStatus === 0
                    ? 'El cliente ha sido dado de baja exitosamente'
                    : 'El cliente ha sido activado exitosamente';

            setMessageSnack(message);
            setShowSnackBar(true);
            setTimeout(() => {
                setShowSnackBar(false);
            }, 5000);
            setMainModal(false);

        } catch (error) {
            setTitleModalError('Error al desactivar el cliente');
            setMessageModal('Intentelo màs tarde');
            setShowModalError(true);
        }
        finally {
            setAnchorEl(null);
        }
    };

    const handleOpenDeactivateModal = () => {
        if (menuRowId === null) return;

        setMainModalTitle("Dar de baja cliente");
        setMainModalMessage("¿Está seguro de que desea dar de baja al cliente seleccionado?");
        setModalAction(() => () => handleDeactivateClient(menuRowId));
        setMainModal(true);
    };


    const handleActivateClient = () => {
        if (menuRowId === null) return;

        setMainModalTitle("¿Estás seguro que deseas dar de alta este cliente?");
        setMainModalMessage("Estas Seguro que desea dar de alta al cliente seleccionado?.");
        setModalAction(() => () => handleDeactivateClient(menuRowId));
        setMainModal(true);
    };
    const currentClient = clientsList.find((c) => c.id === menuRowId);
    const canDeleteClient = (client: Clients) => {
        if (client.estatus !== 0 || !client.deactivationDate) return false;

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const clientDeactivationDate = new Date(client.deactivationDate);
        return clientDeactivationDate <= sixMonthsAgo;
    };
    const handleDeleteClient = async (id: number) => {
        try {
            const requestUrl = `${import.meta.env.VITE_API_DELETE_CLIENT}${id}`;
            await axios.get(requestUrl);

            GetClientsAdmin();
            setMainModalDelete(false);
            setShowSnackBar(true);
            setMessageSnack('Cliente Eliminado correctamente');
            setTimeout(() => {
                setShowSnackBar(false);
            }, 5000);
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            setTitleModalError('Error al eliminar el cliente');
            setMessageModal('Intentelo màs tarde');
            setShowModalError(true);
        }
    };

    const handleToggleRoom = (room: string) => {
        setRechargeData(prev => {
            const exists = prev.roomsSelected.includes(room);
            return {
                ...prev,
                roomsSelected: exists
                    ? prev.roomsSelected.filter(r => r !== room)
                    : [...prev.roomsSelected, room]
            };
        });
    };


    const getRoomsList = () => {
        return currentClient?.roomName?.split(',').map(r => r.trim()) || [];
    };

    const handleOpenRechargeModal = (client: Clients) => {
        setSelectedClient(client);

        const parsedRooms = client.roomName
            ? client.roomName.split(',').map(r => r.trim()).filter(Boolean)
            : [];
        setRechargeData(prev => ({
            ...prev,
            smsType: '',
            roomsSelected: [],
            ratePerMessage: 0,
            amount: 0,
            tax: 0,
            totalWithTax: 0,
            paymentType: '',
            billingDate: ''
        }));


        setRechargeModalOpen(true);
    };

    const handleOpenDatePicker = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl2(event.currentTarget);
        setDatePickerOpen(true);
    };

    const handleDateChange = (newDate: Date) => {
        setSelectedDate(newDate);
    };

    const handleSaveRecharge = async () => {
        if (!selectedClient) return;

        // Validaciones básicas
        if (!rechargeData.smsType || rechargeData.roomsSelected.length === 0 || !rechargeData.amount || !rechargeData.paymentType || !rechargeData.billingDate) {
            setTitleModalError('Faltan datos por capturar');
            setMessageModal('Favor de capturar todos los datos');
            setShowModalError(true);
            setRechargeModalOpen(false);
            return;
        }
        const userData = localStorage.getItem("userData");
        const parsedUser = userData ? JSON.parse(userData) : null;

        if (!parsedUser?.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }
        const selectedRoom = JSON.parse(localStorage.getItem('selectedRoom') || '{}');
        const roomId = selectedRoom?.id;
        try {
            const payload = {
                IdUser: parsedUser.id,
                clientId: selectedClient.id,
                smsType: rechargeData.smsType,
                rooms: rechargeData.roomsSelected,
                rate: rechargeData.ratePerMessage,
                amount: rechargeData.amount,
                total: rechargeData.totalWithTax,
                paymentType: rechargeData.paymentType,
                billingDate: rechargeData.billingDate,
                IdRoom: roomId
            };

            const url = `${import.meta.env.VITE_API_RECHARGE_CLIENT}`;
            const response = await axios.post(url, payload);

            if (response.status === 200) {
                setRechargeModalOpen(false);
                GetClientsAdmin();
                setShowSnackBar(true);
                setMessageSnack('Recarga Exitosa');
                setTimeout(() => {
                    setShowSnackBar(false);
                }, 5000);
            } else {
                setTitleModalError('Error al capturar la recarga');
                setMessageModal('Intentelo màs tarde');
                setShowModalError(true);
            }
            setRechargeModalOpen(false);
        } catch (error) {
            setTitleModalError('Error al capturar la recarga');
            setMessageModal('Intentelo màs tarde');
            setShowModalError(true);
            setRechargeModalOpen(false);
        }
        finally {
            setRechargeModalOpen(false);
        }
    };

    useEffect(() => {
        if (rechargeData.amount) {
            const subtotal = parseFloat(rechargeData.amount.toString());
            const iva = subtotal * 0.16;
            const total = subtotal + iva;

            setRechargeData(prev => ({
                ...prev,
                totalWithTax: total,
            }));
        }
    }, [rechargeData.amount]);

    const handleFilterClients = () => {
        const selectedClientIds = clientsList
            .filter(c => c.id !== undefined && selectedClients.includes(c.id))
            .map(c => c.id as number);

        setAppliedClientIds(selectedClientIds);
        setClientMenuOpen(false);
        setCurrentPage(0);
    };

    useEffect(() => {
        if (selectedStatus.length === 0) {
            setCurrentPage(0);
            GetClientsAdmin();
        }
    }, [selectedStatus]);

    useEffect(() => {
        if (selectedClients.length === 0) {
            GetClientsAdmin();
        }
    }, [selectedClients]);

    useEffect(() => {
        if (searchTerm.length === 3 || searchTerm.length === 0) {
            GetClientsAdmin();
        }
    }, [searchTerm]);


    const showEstadoHighlight = selectedStatus.length > 0;

    const resetClientModalState = () => {
        // core del modal
        setSelectedClient(null);
        setIsEditClient(false);
        setStep(0);

        // inputs de Info
        setEmail('');
        setConfirmEmail('');
        setEmailError(false);
        setConfirmEmailError(false);

        // tarifas (tipos + cantidades + precios)
        setShortRateType('estandar');
        setLongRateType('estandar');

        setShortStandardQty('');
        setShortStandardPrice('');
        setShortCustomQty('');

        setLongStandardQty('');
        setLongStandardPrice('');
        setLongCustomQty('');


        setNewRooms(['']);
    };

    const handleCloseClientModal = () => {
        resetClientModalState();
        setOpenClientModal(false);
    };

    const isStepValid = () => {
        if (step === 0) {
            const phoneOk = rePhone10.test((selectedClient?.phoneNumber || '').trim());
            const clientNameOk = reClientName.test((selectedClient?.nombreCliente || '').trim());
            const firstOk = rePersonName.test((selectedClient?.firstName || '').trim());
            const lastOk = rePersonName.test((selectedClient?.lastName || '').trim());
            const extOk = !extError; // ya limitado arriba
            const emailOk = reEmail.test(email.trim());
            const confirmOk = email === confirmEmail && reEmail.test(confirmEmail.trim());

            const noErrors = !clientNameError && !firstNameError && !lastNameError &&
                !phoneError && !extError && !emailError && !confirmEmailError;

            return clientNameOk && firstOk && lastOk && phoneOk && extOk && emailOk && confirmOk && noErrors;
        }

        if (step === 1) {
            const shortValid = shortRateType === 'estandar'
                ? shortStandardQty && shortStandardPrice
                : shortCustomQty && selectedClient?.rateForShort;

            const longValid = longRateType === 'estandar'
                ? longStandardQty && longStandardPrice
                : longCustomQty && selectedClient?.rateForLong;

            return !!(shortValid && longValid);
        }

        return true;
    };




    return (
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1180px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Header con título y flecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 500, fontFamily: 'Poppins', fontSize: '26px', color: '#330F1B' }}>
                    Clientes
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", }}>
                <Divider sx={{ marginBottom: "17px", marginTop: "16px" }} />
                {/* Controles de acción */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px',
                        marginBottom: '24px',
                    }}
                >
                    {/* Chips redonditos */}
                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['CLIENTE', 'ESTADO'].map((label) => {
                            const isClient = label === 'CLIENTE';
                            const count = isClient ? selectedClients.length : selectedStatus.length;
                            const labelDisplay = count > 0 ? `${count} ${label}` : label;

                            const highlight = isClient ? showClientHighlight : showEstadoHighlight;

                            return (
                                <Box
                                    key={label}
                                    onClick={(e) => {
                                        if (isClient) {
                                            setClientAnchorEl(e.currentTarget);
                                            setClientMenuOpen(true);
                                        } else {
                                            setEstadoAnchorEl(e.currentTarget);
                                            setEstadoMenuOpen(true);
                                        }
                                        setActiveFilter(label.toLowerCase() as any);
                                    }}
                                    sx={{
                                        px: '18px',
                                        py: '7px',
                                        border: '1px solid',
                                        borderColor: highlight ? '#7B354D' : '#CFCFCF',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins', letterSpacing: "1.12px",
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        backgroundColor: highlight ? '#F6EEF1' : '#FFFFFF',
                                        color: highlight ? '#7B354D' : '#9B9295',
                                        transition: 'all 0.2s ease-in-out',
                                        userSelect: 'none', height: "36px"
                                    }}
                                >
                                    {labelDisplay}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Botón y buscador */}
                    <Box sx={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <SecondaryButton text="SALAS" onClick={() => navigate('/RoomsAdmin')} />
                        <MainIcon text="Añadir cliente" width="186px" onClick={handleAddClient} />
                        <Box sx={{ position: 'relative', width: '220px' }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{
                                    backgroundColor: "#FFFFFF",
                                    border: searchTerm ? "1px solid #7B354D" : "1px solid #9B9295",
                                    borderRadius: "4px",
                                    px: 2,
                                    py: 1,
                                    width: "100%",
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                        onClick={() => {
                                            setSearchTerm('');
                                        }}
                                        style={{ marginLeft: 8, width: 24, height: 24, cursor: 'pointer' }}
                                    />

                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ width: 'calc(100% + 0px)', mb: 0, mt: -1 }} />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={0}
                    p={2}
                    sx={{ backgroundColor: "#F2F2F2", borderRadius: "8px" }}>

                    {/* Rango de resultados */}
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#6F565E" }}>
                        {(currentPage + 1)}–
                        {totalPages} de {totalItems}
                    </Typography>

                    {/* Flechas + Exportaciones */}
                    <Box display="flex" alignItems="center" gap={1} height={"25px"} marginBottom={"-5px"} marginTop={"-5px"}>
                        <Box sx={{ marginRight: "750px" }}>
                            <Tooltip title="Primera página">
                                <IconButton onClick={goToFirstPage} disabled={currentPage === 0}>
                                    <Box
                                        display="flex"
                                        gap="0px"
                                        alignItems="center"
                                        sx={{
                                            opacity: currentPage === 0 ? 0.3 : 1
                                        }}
                                    >
                                        <img src={backarrow} style={{ width: 24, marginRight: "-16px" }} />
                                        <img src={backarrow} style={{ width: 24 }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Página Anterior">
                                <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
                                    <img src={backarrow} style={{ width: 24, opacity: currentPage === 0 ? 0.3 : 1, marginLeft: "-18px" }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Siguiente página">
                                <IconButton onClick={handleNextPage} disabled={currentPage + 1 === totalPages}>
                                    <img src={backarrow} style={{
                                        width: 24, transform: 'rotate(180deg)', marginRight: "-28px", marginLeft: "-28px",
                                        opacity: currentPage + 1 === totalPages ? 0.3 : 1
                                    }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Ultima Página">
                                <IconButton onClick={goToLastPage} disabled={currentPage + 1 === totalPages}>
                                    <Box
                                        display="flex"
                                        gap="0px"
                                        alignItems="center"
                                        sx={{
                                            opacity: currentPage + 1 === totalPages ? 0.3 : 1
                                        }}
                                    >
                                        <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', marginLeft: "-6px" }} />
                                        <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', marginLeft: "-16px" }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Exportaciones */}
                        <Box display="flex" alignItems="center" gap={0} mr={-2.5}>
                            <Tooltip title="Exportar a CSV" placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 0,
                                            },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#312D2E',
                                            color: '#DEDADA',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                        },
                                    },
                                    arrow: {
                                        sx: {
                                            color: '#322D2E',
                                        },
                                    },
                                }}
                            >
                                <IconButton
                                    onClick={() => handleExportClick('csv', setIsExportingCSV)}
                                    disabled={anyExporting && !isExportingCSV}
                                    sx={{ opacity: !isExportingCSV && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingCSV ? <DualSpinner /> : <img src={IconDownloadCSV} alt="CSV" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar a Excel" placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 0,
                                            },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#312D2E',
                                            color: '#DEDADA',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                        },
                                    },
                                    arrow: {
                                        sx: {
                                            color: '#322D2E',
                                        },
                                    },
                                }}
                            >
                                <IconButton
                                    onClick={() => handleExportClick('xlsx', setIsExportingXLSX)}
                                    disabled={anyExporting && !isExportingXLSX}
                                    sx={{ opacity: !isExportingXLSX && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingXLSX ? <DualSpinner /> : <img src={IconDownloadExcel} alt="Excel" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar a PDF" placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 0,
                                            },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#312D2E',
                                            color: '#DEDADA',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                        },
                                    },
                                    arrow: {
                                        sx: {
                                            color: '#322D2E',
                                        },
                                    },
                                }}
                            >
                                <IconButton
                                    onClick={() => handleExportClick('pdf', setIsExportingPDF)}
                                    disabled={anyExporting && !isExportingPDF}
                                    sx={{ opacity: !isExportingPDF && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingPDF ? <DualSpinner /> : <img src={IconDownloadPDF} alt="PDF" />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                    </Box>
                </Box>

                {originalData.length === 0 ? (
                    // Caja cerrada - sin registros cargados
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            minHeight: '450px',
                            backgroundColor: '#F9F9F9',
                            padding: 4,
                            borderRadius: '12px',
                            border: '1px solid #E0E0E0',
                            mt: 2,
                        }}
                    >
                        <img src={NoResult} alt="No resultados" style={{ width: '240px', marginBottom: '16px' }} />
                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: '#7B354D',
                                fontWeight: 500,
                            }}
                        >
                            No se encontraron resultados.
                        </Typography>
                    </Box>
                ) : clientsList.length === 0 ? (
                    // Caja abierta - no hay coincidencias con los filtros
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            minHeight: '450px',
                            backgroundColor: '#FFFFFF',
                            padding: 4,
                            borderRadius: '12px',
                            border: '1px solid #E0E0E0',
                        }}
                    >
                        <img src={BoxEmpty} alt="Caja vacía" style={{ width: '240px', marginBottom: '16px' }} />
                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: '#7B354D',
                                fontWeight: 500,
                            }}
                        >
                            Da de alta un cliente para comenzar.
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '8px 2px',
                            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                            overflowX: 'auto',
                            maxHeight: "472px"
                        }}
                    >
                        <table style={{ minWidth: '1180px', borderCollapse: 'collapse', }}>
                            <thead>
                                <tr style={{
                                    textAlign: 'left', fontFamily: 'Poppins', fontSize: '13px',
                                    color: '#330F1B', fontWeight: 500, borderBottom: '1px solid #E0E0E0',
                                    height: "45px",
                                }}
                                >
                                    <th style={{
                                        textAlign: 'left', padding: '0 15px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Fecha de alta</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Cliente</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Nombre</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Apellidos</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Teléfono</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 0px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Extensión</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 46px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Correo electrónico</th>
                                    <th style={{
                                        textAlign: 'left', whiteSpace: 'nowrap', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Tarifa SMS # Cortos</th>
                                    <th style={{
                                        textAlign: 'left', fontSize: "13px", padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", whiteSpace: 'nowrap'
                                    }}>Tarifa SMS # Largos</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Salas</th>
                                    <th style={{
                                        textAlign: 'left', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Estatus</th>
                                    <th style={{
                                        textAlign: 'left', whiteSpace: 'nowrap', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Créditos Globales</th>
                                    <th style={{
                                        textAlign: 'left', whiteSpace: 'nowrap', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Créditos SMS # Cortos</th>
                                    <th style={{
                                        textAlign: 'left', whiteSpace: 'nowrap', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Créditos SMS # Largos</th>
                                    <th style={{
                                        textAlign: 'left', whiteSpace: 'nowrap', padding: '0 24px',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Fecha de desactivación</th>
                                    <td style={{
                                        position: 'sticky', textAlign: "center",
                                        right: -2,
                                        background: '#fff',
                                        padding: '3.5px', width: '75px', height: "30px", whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F",
                                    }}>
                                        <Divider sx={{
                                            marginTop: "-51px", marginLeft: "-3px",
                                            position: "absolute",
                                            height: '90px',
                                            width: "0px",
                                            borderLeft: "1px solid #E0E0E0"
                                        }} />
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {clientsList.map((Client) => (
                                    <tr key={Client.id} style={{
                                        borderBottom: '1px solid #E0E0E0',
                                        backgroundColor: Client.estatus === 0 ? '#FFFFFF' : '#F2F2F2',
                                        color: Client.estatus === 0 ? '#574B4F' : '#9D9696',
                                    }}>
                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 14px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.creationDate}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.nombreCliente}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.firstName}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.lastName}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.phoneNumber}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px', maxWidth: '100px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.extension}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 46px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.email}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.rateForShort}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.rateForLong}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px', maxWidth: '100px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.roomName}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 28px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.estatus === 0 ? 'Activo' : 'Inactivo'}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.totalCredits}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>{Client.totalShortSmsCredits}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins',
                                            fontSize: "13px"

                                        }}>{Client.totalLongSmsCredits}</td>
                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins',
                                            fontSize: "13px"

                                        }}>{Client.deactivationDate}</td>
                                        <td style={{
                                            position: 'sticky', textAlign: "center",
                                            right: -2,
                                            background: '#fff',
                                            padding: '3.5px', width: '75px', height: "51px", whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', fontSize: "13px"
                                        }}>
                                            <IconButton onClick={(event) => handleMenuOpen(event, Client.id as number)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                            <Divider sx={{
                                                marginTop: "-51px", marginLeft: "-3px",
                                                position: "absolute",
                                                height: '60px',
                                                width: "0px",
                                                borderLeft: "1px solid #E0E0E0"
                                            }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                )}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => {
                    const clientToEdit = clientsList.find(c => c.id === menuRowId);
                    if (clientToEdit) {
                        handleEditClient(clientToEdit);
                    }
                    handleMenuClose();
                }}
                    sx={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        width: "198px",
                        borderRadius: 0,
                        '&:hover': {
                            borderRadius: 0,
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <EditIcon fontSize="small" sx={{ mr: 1, color: '#5F5064', width: 24, height: 24 }} />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4FE6" }}>
                        Editar
                    </Typography>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        const clientToEdit = clientsList.find(c => c.id === menuRowId);
                        if (clientToEdit) {
                            handleOpenRechargeModal(clientToEdit);
                        }

                    }}
                    sx={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        borderRadius: 0,
                        '&:hover': {
                            borderRadius: 0,
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <img
                        src={IconSuS} alt="Recarga"
                        style={{
                            width: '24px', height: '24px', marginRight: "9px", color: "#574B4F"
                        }}
                    />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4FE6" }}>
                        Recargar
                    </Typography>
                </MenuItem>

                {currentClient?.estatus === 1 ? (
                    <MenuItem onClick={() => {
                        handleActivateClient();
                        handleMenuClose();
                    }}
                        sx={{
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            borderRadius: 0,
                            '&:hover': {
                                borderRadius: 0,
                                backgroundColor: '#F2EBED'
                            }
                        }}
                    >
                        <img
                            src={IconSChecked}
                            alt="Recarga"
                            style={{ width: '24px', height: '24px', marginRight: "9px" }}
                        />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4FE6" }}>
                            Dar de alta
                        </Typography>
                    </MenuItem>
                ) : (
                    <MenuItem onClick={() => {
                        handleOpenDeactivateModal();
                        handleMenuClose();
                    }}
                        sx={{
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            borderRadius: 0,
                            '&:hover': {
                                borderRadius: 0,
                                backgroundColor: '#F2EBED'
                            }
                        }}
                    >
                        <img
                            src={IconSDown}
                            alt="Recarga"
                            style={{ width: '24px', height: '24px', marginRight: "10px" }}
                        />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#583B43" }}>
                            Dar de baja
                        </Typography>
                    </MenuItem>
                )}



                <MenuItem
                    disabled={!currentClient || !canDeleteClient(currentClient)}
                    onClick={() => {
                        setSelectedClient(currentClient ?? null);
                        setModalAction(() => () => handleDeleteClient(menuRowId!));
                        setMainModalDelete(true);
                        handleMenuClose();
                    }}
                    sx={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '14px',
                        borderRadius: 0,
                        '&:hover': {
                            borderRadius: 0,
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <img
                            src={Thrashicon}
                            alt="Eliminar"
                            style={{ width: 24, height: 24, color: '#5F5064', marginLeft: "1px" }}
                        />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4F", marginLeft: "2px" }}>
                            Eliminar
                        </Typography>

                    </Box>
                    {currentClient && !canDeleteClient(currentClient) &&
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
                                        transform: "translate(-10px, -22px)",
                                        borderColor: "#00131F3D",
                                        borderStyle: "solid",
                                        borderWidth: "1px"
                                    }}
                                >
                                    <>
                                        El cliente no puede ser<br />
                                        eliminado debido a que<br />
                                        no ha cumplido 6 meses<br />
                                        sin inactividad
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
                            <IconButton
                                disableRipple
                                sx={{
                                    pointerEvents: "auto",
                                    "&:hover": {
                                        backgroundColor: "transparent !important",
                                    },
                                }}
                            >
                                <img
                                    src={infoicon}
                                    alt="info-icon"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        marginLeft: "10px",
                                        filter: currentClient ? "brightness(0)" : ''
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    }
                </MenuItem>

            </Menu>


            <Menu
                anchorEl={clientAnchorEl}
                open={clientMenuOpen}
                onClose={() => {
                    setClientMenuOpen(false);
                    if (selectedClients.length === 0) {
                        setActiveFilter('');
                    }
                }}
                PaperProps={{
                    sx: {
                        padding: 1,
                        width: "280px",
                        height: "282px",
                        overflowY: "hidden",
                        borderRadius: '12px',
                        boxShadow: '0px 8px 16px #00131F29',
                    },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <TextField
                        placeholder="Buscar cliente"
                        variant="outlined"
                        fullWidth={false}
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value.toLowerCase())}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <img
                                        src={clientSearch ? Iconseachred : seachicon}
                                        alt="Buscar"
                                        style={{ width: 24 }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: clientSearch && (
                                <IconButton onClick={() => setClientSearch('')}>
                                    <img src={iconclose} alt="Limpiar" style={{ width: 24 }} />
                                </IconButton>
                            ),
                            sx: {
                                fontFamily: 'Poppins',
                                color: clientSearch ? '#7B354D' : '#000',
                            }
                        }}
                        inputProps={{
                            style: {
                                fontFamily: 'Poppins',
                                color: clientSearch ? '#7B354D' : '#000',
                            }
                        }}
                        sx={{
                            width: '248px',
                            height: '40px',
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                height: '40px',
                                border: '1px solid #9B9295',
                                '& fieldset': {
                                    borderColor: clientSearch ? '#7B354D' : '#9B9295',
                                },
                                '&:hover fieldset': {
                                    borderColor: clientSearch ? '#7B354D' : '#9B9295',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: clientSearch ? '#7B354D' : '#9B9295',
                                },
                            },
                        }}
                    />
                </Box>

                <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                <Box sx={{ height: '126px', overflowY: 'auto' }}>
                    {originalData
                        .filter((c) => (c.nombreCliente || '').toLowerCase()
                            .includes(clientSearch.trim().toLowerCase()))
                        .map((client) => {
                            const id = Number(client.id);
                            const checked = selectedClients.includes(id);
                            return (
                                <MenuItem
                                    key={id}
                                    onClick={() =>
                                        setSelectedClients(prev =>
                                            checked ? prev.filter(x => x !== id) : [...prev, id]
                                        )
                                    }
                                    sx={{ height: "32px", marginLeft: "-12px" }}
                                >
                                    <Checkbox
                                        checked={checked}
                                        checkedIcon={
                                            <Box sx={{ width: 24, height: 24, position: 'relative' }}>
                                                <img src={IconCheckBox1} alt="Seleccionado" style={{ width: 24, height: 24 }} />
                                            </Box>
                                        }
                                    />
                                    <ListItemText
                                        primary={client.nombreCliente}
                                        primaryTypographyProps={{
                                            fontFamily: 'Poppins',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            color: checked ? '#8F4E63' : '#786E71',
                                        }}
                                    />
                                </MenuItem>
                            );
                        })}
                    {originalData.filter(c =>
                        (c.nombreCliente || '').toLowerCase()
                            .includes(clientSearch.trim().toLowerCase())
                    ).length === 0 && (
                            <Box sx={{ marginTop: "60px" }}>
                                <Typography sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins" }}>
                                    No se encontraron resultados.
                                </Typography>
                            </Box>
                        )}
                </Box>


                <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                <Box display="flex" justifyContent="space-between" px={1} pb={1} gap={2.5}>
                    <SecondaryButton
                        onClick={() => {
                            setSelectedClients([]);
                            setClientSearch('');
                            setClientMenuOpen(false);
                            setCurrentPage(0);
                            setActiveFilter('');
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            handleFilterClients();
                            GetClientsAdmin();
                            setClientMenuOpen(false);
                        }}
                        text="APLICAR"
                    />

                </Box>
            </Menu>

            <Menu
                anchorEl={estadoAnchorEl}
                open={estadoMenuOpen}
                onClose={() => setEstadoMenuOpen(false)}
                PaperProps={{
                    sx: {
                        padding: 1,
                        width: "280px",
                        height: "150px",
                        overflowY: "hidden",
                        borderRadius: '12px',
                        boxShadow: '0px 8px 16px #00131F29',
                    },
                }}
            >
                <Box sx={{ height: '65px', overflowY: 'hidden' }}>
                    {['Activo', 'Inactivo'].map((status) => (
                        <MenuItem
                            key={status}
                            onClick={() =>
                                setSelectedStatus((prev) =>
                                    prev.includes(status)
                                        ? prev.filter((s) => s !== status)
                                        : [...prev, status]
                                )
                            }
                            sx={{ height: "32px", marginLeft: "-12px" }}

                        >
                            <Checkbox checked={selectedStatus.includes(status)}
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
                            <ListItemText primary={status}
                                primaryTypographyProps={{
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: selectedStatus.includes(status) ? '#8F4E63' : '#786E71',
                                }}
                            />
                        </MenuItem>
                    ))}
                </Box>

                <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                <Box display="flex" justifyContent="space-between" px={0} pb={0} gap={2.5}>
                    <SecondaryButton
                        onClick={() => {
                            setSelectedStatus([]);
                            setEstadoMenuOpen(false);

                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            setEstadoMenuOpen(false);
                            GetClientsAdmin();
                        }}
                        text="APLICAR"
                    />
                </Box>


            </Menu>


            {/* Modal para añadir o editar cliente */}
            <Dialog open={openClientModal} onClose={handleCloseClientModal} maxWidth="md" fullWidth sx={{ overflowX: "hidden" }}>
                <DialogTitle sx={{
                    fontFamily: 'Poppins', fontSize: '20px', fontWeight: 600,
                    color: '#574B4F', textTransform: 'none', mt: 1, mb: 1, marginLeft: "10px"
                }}>
                    {isEditClient ? 'Editar cliente' : 'Añadir cliente'}
                </DialogTitle>
                <IconButton
                    onClick={() => setOpenClientModal(false)}
                    sx={{
                        position: 'absolute',
                        marginTop: '10px',
                        marginLeft: '854px',
                        zIndex: 10
                    }}
                >
                    <CloseIcon sx={{ color: '#A6A6A6' }} />
                </IconButton>
                <Divider sx={{ width: 'calc(100% + 32px)', marginLeft: '-32px', mb: -1.5 }} />

                <Box
                    display="flex"
                    justifyContent="center"
                    gap="140px"
                    mb={1.5}
                    mt={3}
                >
                    {['Información', 'Tarifas', 'Salas'].map((label, index) => (
                        <Box key={label} textAlign="center">
                            <Box
                                sx={{
                                    width: 28,
                                    height: 28,
                                    border: index < step ? '4px solid' : '2px solid',
                                    borderColor: index <= step ? '#8F4E63' : '#DDD',
                                    borderRadius: '50%',
                                    mx: 'auto',
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {index < step && (
                                    <img
                                        src={index < step ? IconCheckedCircle2 : IconCheckedCircle1}
                                        alt="Completado"
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                        }}
                                    />
                                )}
                            </Box>

                            <Typography
                                fontSize="12px"
                                mt={1}
                                color={
                                    index === step
                                        ? '#8F4E63'
                                        : index < step
                                            ? '#BC94A1'
                                            : '#574B4F66'
                                }
                                fontFamily="Poppins"
                            >
                                {label}
                            </Typography>

                        </Box>
                    ))}

                </Box>
                {/*Guiones fake*/}
                <Box>
                    <Divider
                        sx={{
                            width: '170px',
                            position: "absolute",
                            mt: "-53px",
                            ml: "286px",
                            border: '1.5px solid',
                            borderColor: getStepColor(1),
                        }}
                    />
                </Box>

                <Box sx={{ position: "absolute", mt: "78px", ml: "545px" }}>
                    <Typography
                        fontSize="10px"
                        mt={1}
                        color={getStepColor(2)}
                        fontFamily="Poppins"
                    >
                        Opcional
                    </Typography>
                </Box>

                <Box>
                    <Divider
                        sx={{
                            width: '150px',
                            position: "absolute",
                            mt: "-54px",
                            ml: "484px",
                            border: '2px dashed',
                            borderColor: getStepColor(2),
                        }}
                    />
                </Box>



                <Divider sx={{ width: 'calc(100% + 32px)', marginLeft: '-32px', mb: 0 }} />

                <DialogContent>
                    <Box px={3} pt={1} sx={{ overflowX: "hidden" }}>
                        {step === 0 && (
                            <Box display="flex" flexDirection="column" gap={2} sx={{
                                overflowX: "hidden", justifyContent: "center", alignItems: "left", marginLeft: "25px"
                            }}>
                                <Grid item xs={12} md={6} marginLeft={"10px"} mt={1} mb={1}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            fontSize: "16px",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            opacity: 1,
                                            marginBottom: "4px",
                                            color: "#330F1B"
                                        }}
                                    >
                                        Cliente
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        value={selectedClient?.nombreCliente || ''}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setSelectedClient(prev => ({ ...(prev as Clients), nombreCliente: v }));
                                            setClientNameError(v.trim().length > 0 && !reClientName.test(v));
                                        }}
                                        error={clientNameError}
                                        helperText={
                                            selectedClient?.nombreCliente && selectedClient?.nombreCliente.length > 40
                                                ? "Máximo 40 caracteres"
                                                : selectedClient?.nombreCliente && !/^[a-zA-Z0-9 ]+$/.test(selectedClient?.nombreCliente)
                                                    ? "Solo se permiten caracteres alfabéticos"
                                                    : ""

                                        }
                                        FormHelperTextProps={{
                                            sx: {
                                                fontFamily: 'Poppins', position: "absolute", marginTop: "58px",
                                            }
                                        }}
                                        sx={{
                                            fontFamily: "Poppins", width: "340px",
                                            "& .MuiInputBase-input": {
                                                fontFamily: "Poppins",
                                            },
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
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
                                                                    transform: "translate(-10px, -22px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }}
                                                            >
                                                                <>
                                                                    • Solo caracteres alfanuméricos
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
                                                        <IconButton
                                                            disableRipple
                                                            sx={{
                                                                backgroundColor: "transparent !important",
                                                                "&:hover": {
                                                                    backgroundColor: "transparent !important",
                                                                },
                                                            }}
                                                        >
                                                            <img
                                                                src={
                                                                    selectedClient?.nombreCliente &&
                                                                        (selectedClient?.nombreCliente.length > 40 || !/^[a-zA-Z0-9 ]+$/.test(selectedClient?.nombreCliente))
                                                                        ? infoiconerror
                                                                        : infoicon
                                                                }
                                                                alt="info-icon"
                                                                style={{ width: 24, height: 24 }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>

                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Divider sx={{ width: 'calc(100% - 10px)', marginLeft: '8px', mt: 0.5 }} />
                                <Typography sx={{
                                    color: "#330F1B", fontFamily: "Poppins", fontSize: "18px", fontWeight: 500,
                                    marginLeft: "10px"
                                }}>
                                    Información de contacto
                                </Typography>
                                <Box sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "left"
                                }}>
                                    <Box display="flex" gap={2}>
                                        <Box display="flex" flexDirection="column" mb={2} marginLeft={"10px"} width={"340px"}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    marginBottom: "4px",
                                                    color: "#330F1B"
                                                }}
                                            >
                                                Nombre
                                                <span style={{ color: "#D01247" }}>*</span>
                                            </Typography>
                                            <TextField
                                                value={selectedClient?.firstName || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setSelectedClient(prev => ({ ...(prev as Clients), firstName: v }));
                                                    setFirstNameError(v.trim().length > 0 && !rePersonName.test(v));
                                                }}
                                                error={firstNameError}
                                                helperText={firstNameError ? "Formato inválido" : ""}
                                                sx={{
                                                    fontFamily: "Poppins",
                                                    "& .MuiInputBase-input": {
                                                        fontFamily: "Poppins",
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
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
                                                                <IconButton
                                                                    disableRipple
                                                                    sx={{
                                                                        backgroundColor: "transparent !important",
                                                                        "&:hover": {
                                                                            backgroundColor: "transparent !important",
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={infoicon}
                                                                        alt="info-icon"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                        <Box display="flex" flexDirection="column" mb={2} marginLeft={"20px"} width={"340px"}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    marginBottom: "4px",
                                                    color: "#330F1B"
                                                }}
                                            >
                                                Apellidos
                                                <span style={{ color: "#D01247" }}>*</span>
                                            </Typography>
                                            <TextField
                                                value={selectedClient?.lastName || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setSelectedClient(prev => ({ ...(prev as Clients), lastName: v }));
                                                    setLastNameError(v.trim().length > 0 && !rePersonName.test(v));
                                                }}
                                                error={lastNameError}
                                                helperText={lastNameError ? "Formato inválido" : ""}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
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
                                                                <IconButton
                                                                    disableRipple
                                                                    sx={{
                                                                        backgroundColor: "transparent !important",
                                                                        "&:hover": {
                                                                            backgroundColor: "transparent !important",
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={infoicon}
                                                                        alt="info-icon"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </InputAdornment>
                                                    ),
                                                }}
                                                fullWidth
                                            />
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={2}>
                                        <Box display="flex" flexDirection="column" mb={2} marginLeft={"10px"} width={"340px"}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    marginBottom: "4px",
                                                    color: "#330F1B"
                                                }}
                                            >
                                                Teléfono<span style={{ color: "#D01247" }}>*</span>
                                            </Typography>

                                            <TextField
                                                type="tel"
                                                required
                                                value={selectedClient?.phoneNumber || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                    setSelectedClient(prev => ({ ...(prev as Clients), phoneNumber: value }));
                                                    setPhoneError(value.length > 0 && !rePhone10.test(value));
                                                }}
                                                error={phoneError}
                                                helperText={phoneError ? "Formato inválido" : ""}
                                                /* --- apariencia alineada a otros inputs --- */
                                                fullWidth
                                                sx={{
                                                    mt: 1,
                                                    width: "324px",
                                                    height: "54px",
                                                    background: "#FFFFFF",
                                                    border: "1px solid #9B9295",
                                                    borderRadius: "4px",
                                                    "& .MuiOutlinedInput-root": {
                                                        background: "#FFFFFF",
                                                        height: "54px",
                                                        borderRadius: "4px",
                                                        "& fieldset": {
                                                            borderColor: phoneError ? "#d32f2f" : "#9B9295",
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        fontFamily: "Poppins",
                                                        fontSize: "16px",
                                                        color: "#330F1B",
                                                    },
                                                    "& .MuiFormHelperText-root": {
                                                        marginLeft: 0,
                                                        fontFamily: "Poppins",
                                                        fontSize: "13px",
                                                        color: "#d32f2f",
                                                        fontWeight: 500,
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Tooltip
                                                                title={
                                                                    <Box
                                                                        sx={{
                                                                            backgroundColor: "#FFFFFF",
                                                                            borderRadius: "8px",
                                                                            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                                                                            padding: "8px 12px",
                                                                            fontSize: "14px",
                                                                            fontFamily: "Poppins",
                                                                            color: "#574B4F",
                                                                            whiteSpace: "pre-line",
                                                                            transform: "translate(-10px, -22px)",
                                                                            borderColor: "#00131F3D",
                                                                            borderStyle: "solid",
                                                                            borderWidth: "1px",
                                                                        }}
                                                                    >
                                                                        <>• Solo caracteres numéricos<br />• Debe tener 10 dígitos</>
                                                                    </Box>
                                                                }
                                                                placement="bottom-end"
                                                                componentsProps={{
                                                                    tooltip: { sx: { backgroundColor: "transparent", padding: 0 } },
                                                                }}
                                                            >
                                                                <IconButton disableRipple sx={{ backgroundColor: "transparent !important", "&:hover": { backgroundColor: "transparent !important" } }}>
                                                                    <img
                                                                        src={phoneError ? infoiconerror : infoicon}
                                                                        alt="info-icon"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />


                                        </Box>
                                        <Box display="flex" flexDirection="column" mb={2} marginLeft={"20px"} width={"340px"}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    marginBottom: "4px",
                                                    color: "#330F1B"
                                                }}
                                            >
                                                Extensión

                                            </Typography>
                                            <TextField
                                                value={selectedClient?.extension || ''}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '').slice(0, 5);
                                                    setSelectedClient(prev => ({
                                                        ...(prev as Clients),
                                                        extension: raw === '' ? 0 : Number(raw),
                                                    }));
                                                    setExtError(raw !== '' && !reExt.test(raw)); // por si algo raro se cuela
                                                }}
                                                error={extError}
                                                helperText={extError ? "Formato inválido" : ""}
                                                sx={{
                                                    fontFamily: "Poppins",
                                                    "& .MuiInputBase-input": {
                                                        fontFamily: "Poppins",
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
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
                                                                <IconButton
                                                                    disableRipple
                                                                    sx={{
                                                                        backgroundColor: "transparent !important",
                                                                        "&:hover": {
                                                                            backgroundColor: "transparent !important",
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={infoicon}
                                                                        alt="info-icon"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Box display="flex" gap={2}>
                                        <Box display="flex" flexDirection="column" mb={2} marginLeft={"10px"} width={"340px"}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    marginBottom: "4px",
                                                    color: "#330F1B"
                                                }}
                                            >
                                                Correo electrónico
                                                <span style={{ color: "#D01247" }}>*</span>
                                            </Typography>
                                            <TextField
                                                value={email}
                                                onChange={(e) => {
                                                    const v = e.target.value.trim();
                                                    setEmail(v);
                                                    setEmailError(v.length > 0 && !reEmail.test(v));
                                                    setConfirmEmailError(confirmEmail.length > 0 && v !== confirmEmail);
                                                }}
                                                error={emailError}
                                                helperText={emailError ? "Ingrese un correo electrónico válido" : ""}
                                                sx={{
                                                    fontFamily: "Poppins",
                                                    "& .MuiInputBase-input": {
                                                        fontFamily: "Poppins",
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
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
                                                                            transform: "translate(-10px, -22px)",
                                                                            borderColor: "#00131F3D",
                                                                            borderStyle: "solid",
                                                                            borderWidth: "1px"
                                                                        }}
                                                                    >
                                                                        <>
                                                                            • Ingrese un correo electrónico válido
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
                                                                <IconButton
                                                                    disableRipple
                                                                    sx={{
                                                                        backgroundColor: "transparent !important",
                                                                        "&:hover": {
                                                                            backgroundColor: "transparent !important",
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={infoicon}
                                                                        alt="info-icon"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                        <Box display="flex" flexDirection="column" mb={2} marginLeft={"20px"} width={"340px"}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    marginBottom: "4px",
                                                    color: "#330F1B"
                                                }}
                                            >
                                                Confirmar correo electrónico
                                                <span style={{ color: "#D01247" }}>*</span>
                                            </Typography>
                                            <TextField
                                                value={confirmEmail}
                                                onChange={(e) => {
                                                    const v = e.target.value.trim();
                                                    setConfirmEmail(v);
                                                    setConfirmEmailError(v.length > 0 && (v !== email || !reEmail.test(v)));
                                                }}
                                                error={confirmEmailError}
                                                helperText={confirmEmailError ? "Los correos electrónicos deben coincidir" : ""}
                                                sx={{
                                                    fontFamily: "Poppins",
                                                    "& .MuiInputBase-input": {
                                                        fontFamily: "Poppins",
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
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
                                                                            transform: "translate(-10px, -22px)",
                                                                            borderColor: "#00131F3D",
                                                                            borderStyle: "solid",
                                                                            borderWidth: "1px"
                                                                        }}
                                                                    >
                                                                        <>
                                                                            • Los correos electrónicos deben coincidir
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
                                                                <IconButton
                                                                    disableRipple
                                                                    sx={{
                                                                        backgroundColor: "transparent !important",
                                                                        "&:hover": {
                                                                            backgroundColor: "transparent !important",
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={infoicon}
                                                                        alt="info-icon"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>

                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {step === 1 && (
                            <Box display="flex" flexDirection="column" gap={4}>
                                <Typography fontWeight={500} sx={{ fontSize: '18px', color: '#330F1B', fontFamily: "Poppins" }}>
                                    Tarifas
                                </Typography>

                                <Box
                                    sx={{
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '12px',
                                        padding: '16px',
                                    }}
                                >
                                    <Typography fontWeight={500} sx={{ color: '#330F1B', fontWeight: "18px", mb: 1, fontFamily: "Poppins" }}>
                                        SMS # cortos
                                    </Typography>

                                    <Box display="flex" gap={4} flexWrap="wrap">
                                        {/* Columna tarifa estándar */}
                                        <Box sx={{ flex: 1, minWidth: 280 }}>
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={shortRateType === 'estandar'}
                                                        onChange={() => setShortRateType('estandar')}
                                                        sx={{
                                                            color: shortRateType === 'estandar' ? '#8F4D63' : '#574B4F',
                                                            '&.Mui-checked': {
                                                                color: '#8F4D63',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '16px',
                                                            color: shortRateType === 'estandar' ? '#8F4D63' : '#574B4F',
                                                        }}
                                                    >
                                                        Tarifa estándar
                                                    </Typography>
                                                }
                                            />

                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: shortRateType === 'estandar' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1, ml: 0.5
                                                }}
                                            >
                                                Cantidad de mensajes
                                            </Typography>
                                            <Select
                                                fullWidth
                                                displayEmpty
                                                value={shortStandardQty}
                                                onChange={(e) => {
                                                    const selected = e.target.value as string;
                                                    setShortStandardQty(selected);
                                                    setShortStandardPrice(String(standardShortRates[selected] ?? ''));
                                                }}
                                                disabled={shortRateType !== 'estandar'}
                                                renderValue={(selected) =>
                                                    selected ? parseInt(selected).toLocaleString() : (
                                                        <span style={{ color: '#645E60', fontSize: '12px', fontFamily: 'Poppins' }}>
                                                            Seleccionar cantidad de mensajes
                                                        </span>
                                                    )
                                                }
                                                sx={{
                                                    mt: 1,
                                                    width: '325px',
                                                    height: '40px',
                                                    background: '#FFFFFF',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    fontFamily: 'Poppins',
                                                    fontSize: '14px',
                                                    padding: '0 10px',
                                                    '& .MuiSelect-select': {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        height: '40px',
                                                    },
                                                    '& fieldset': {
                                                        border: 'none',
                                                    },
                                                }}
                                            >
                                                {shortRates.map((option, index) => (
                                                    <MenuItem key={index} value={option.quantity}>
                                                        {parseInt(option.quantity).toLocaleString()}
                                                    </MenuItem>
                                                ))}

                                            </Select>


                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: shortRateType === 'estandar' ? '#330F1B' : '#D0CDCD',
                                                    mt: 3.5, ml: 0.5, mb: -1
                                                }}
                                            >
                                                Tarifa por mensaje
                                            </Typography>
                                            <TextField
                                                value={shortStandardPrice}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    readOnly: true,
                                                }}
                                                disabled={shortRateType !== 'estandar'}
                                                fullWidth
                                                sx={{
                                                    mt: 2,
                                                    width: '324px',
                                                    height: '54px',
                                                    background: '#E5E4E4',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    '& .MuiOutlinedInput-root': {
                                                        background: '#E5E4E4',
                                                        height: '54px',
                                                        borderRadius: '8px',
                                                        '& fieldset': {
                                                            borderColor: '#9B9295',
                                                        },
                                                    },
                                                    '& .MuiInputAdornment-root': {
                                                        color: '#645E60',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '14px'
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#574B4F',
                                                    },
                                                }}
                                            />


                                        </Box>

                                        {/* Columna tarifa personalizada */}
                                        <Box sx={{ flex: 1, minWidth: 280 }}>
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={shortRateType === 'personalizada'}
                                                        onChange={() => setShortRateType('personalizada')}
                                                        sx={{
                                                            color: shortRateType === 'personalizada' ? '#8F4D63' : '#C4B2B9',
                                                            '&.Mui-checked': {
                                                                color: '#8F4D63',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '16px',
                                                            color: shortRateType === 'personalizada' ? '#8F4D63' : '#574B4F',
                                                        }}
                                                    >
                                                        Tarifa personalizada
                                                    </Typography>
                                                }
                                            />

                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: shortRateType === 'personalizada' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1, ml: 0.5
                                                }}
                                            >
                                                Cantidad de mensajes
                                            </Typography>
                                            <TextField
                                                type="text"
                                                value={shortCustomQty}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/[^\d]/g, '');
                                                    setShortCustomQty(v);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (['-', '+', 'e', 'E', '.', ' '].includes(e.key)) e.preventDefault();
                                                }}
                                                onPaste={(e) => {
                                                    const text = (e.clipboardData.getData('text') || '').replace(/[^\d]/g, '');
                                                    e.preventDefault();
                                                    setShortCustomQty(prev => (prev ?? '') + text);
                                                }}
                                                inputProps={{
                                                    inputMode: 'numeric',
                                                    pattern: '[0-9]*',
                                                }}
                                                disabled={shortRateType !== 'personalizada'}
                                                fullWidth
                                                sx={{
                                                    mt: 1,
                                                    width: '324px',
                                                    height: '54px',
                                                    background: '#FFFFFF',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    '& .MuiOutlinedInput-root': {
                                                        background: '#FFFFFF',
                                                        height: '54px',
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#9B9295' },
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#330F1B',
                                                    },
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: shortRateType === 'personalizada' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1.5, ml: 0.5, mb: -1
                                                }}
                                            >
                                                Tarifa por mensaje
                                            </Typography>
                                            <TextField
                                                type="number"
                                                value={selectedClient?.rateForShort ? selectedClient.rateForShort : ''} // '' si es 0
                                                onChange={(e) => {
                                                    let v = e.target.value;

                                                    // permite vacío mientras escribe
                                                    if (v === '') {
                                                        setSelectedClient(prev => ({ ...(prev as Clients), rateForShort: 0 }));
                                                        return;
                                                    }

                                                    // solo dígitos y un punto decimal
                                                    v = v.replace(/[^0-9.]/g, '');
                                                    // elimina puntos extra
                                                    const firstDot = v.indexOf('.');
                                                    if (firstDot !== -1) {
                                                        v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
                                                    }

                                                    const num = parseFloat(v);
                                                    if (!isNaN(num) && num >= 0) {
                                                        setSelectedClient(prev => ({ ...(prev as Clients), rateForShort: num }));
                                                    }
                                                }}
                                                onKeyDown={(e) => {

                                                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
                                                }}

                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    inputProps: {
                                                        min: 0,
                                                        step: 'any',
                                                        style: {
                                                            appearance: 'textfield',
                                                            MozAppearance: 'textfield',
                                                            WebkitAppearance: 'none',
                                                        },
                                                    },
                                                }}
                                                disabled={shortRateType !== 'personalizada'}
                                                fullWidth
                                                sx={{
                                                    mt: 2,
                                                    width: '324px',
                                                    height: '54px',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '54px',
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#9B9295' },
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#330F1B',
                                                        MozAppearance: 'textfield',
                                                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                            WebkitAppearance: 'none',
                                                            margin: 0,
                                                        },
                                                    },
                                                    '& .MuiInputAdornment-root': {
                                                        color: '#645E60',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '14px',
                                                    },
                                                }}
                                            />



                                        </Box>
                                    </Box>
                                </Box>



                                <Box
                                    sx={{
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '12px',
                                        padding: '16px',
                                    }}
                                >
                                    <Typography fontWeight={500} sx={{ color: '#330F1B', fontWeight: "18px", mb: 1, fontFamily: "Poppins" }}>
                                        SMS # largos
                                    </Typography>

                                    <Box display="flex" gap={4} flexWrap="wrap">
                                        {/* Columna tarifa estándar */}
                                        <Box sx={{ flex: 1, minWidth: 280 }}>
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={longRateType === 'estandar'}
                                                        onChange={() => setLongRateType('estandar')}
                                                        sx={{
                                                            color: longRateType === 'estandar' ? '#8F4D63' : '#574B4F',
                                                            '&.Mui-checked': {
                                                                color: '#8F4D63',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '16px',
                                                            color: longRateType === 'estandar' ? '#8F4D63' : '#574B4F',
                                                        }}
                                                    >
                                                        Tarifa estándar
                                                    </Typography>
                                                }
                                            />
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: longRateType === 'estandar' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1, ml: 0.5
                                                }}
                                            >
                                                Cantidad de mensajes
                                            </Typography>
                                            <Select
                                                fullWidth
                                                displayEmpty
                                                value={longStandardQty}
                                                onChange={(e) => {
                                                    const selected = e.target.value as string;
                                                    setLongStandardQty(selected);
                                                    setLongStandardPrice(String(standardLongRates[selected] ?? ''));
                                                }}
                                                disabled={longRateType !== 'estandar'}
                                                renderValue={(selected) =>
                                                    selected ? selected : (
                                                        <span style={{ color: '#645E60', fontSize: '12px', fontFamily: 'Poppins' }}>
                                                            Seleccionar cantidad de mensajes
                                                        </span>
                                                    )
                                                }
                                                sx={{
                                                    mt: 1,
                                                    width: '325px',
                                                    height: '40px',
                                                    background: '#FFFFFF',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    fontFamily: 'Poppins',
                                                    fontSize: '14px',
                                                    padding: '0 10px',
                                                    '& .MuiSelect-select': {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        height: '40px',
                                                    },
                                                    '& fieldset': {
                                                        border: 'none',
                                                    }
                                                }}
                                            >
                                                {longRates.map((option, index) => (
                                                    <MenuItem key={index} value={option.quantity}>
                                                        {parseInt(option.quantity).toLocaleString()}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: longRateType === 'estandar' ? '#330F1B' : '#D0CDCD',
                                                    mt: 3.5, ml: 0.5, mb: -1
                                                }}
                                            >
                                                Tarifa por mensaje
                                            </Typography>
                                            <TextField
                                                value={longStandardPrice}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    readOnly: true,
                                                }}
                                                disabled={longRateType !== 'estandar'}
                                                fullWidth
                                                sx={{
                                                    mt: 2,
                                                    width: '324px',
                                                    height: '54px',
                                                    background: '#E5E4E4',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    '& .MuiOutlinedInput-root': {
                                                        background: '#E5E4E4',
                                                        height: '54px',
                                                        borderRadius: '8px',
                                                        '& fieldset': {
                                                            borderColor: '#9B9295',
                                                        },
                                                    },
                                                    '& .MuiInputAdornment-root': {
                                                        color: '#645E60',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '14px'
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#574B4F',
                                                    },
                                                }}
                                            />

                                        </Box>

                                        {/* Columna tarifa personalizada */}
                                        <Box sx={{ flex: 1, minWidth: 280 }}>
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        checked={longRateType === 'personalizada'}
                                                        onChange={() => setLongRateType('personalizada')}
                                                        sx={{
                                                            color: longRateType === 'personalizada' ? '#8F4D63' : '#C4B2B9',
                                                            '&.Mui-checked': {
                                                                color: '#8F4D63',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '16px',
                                                            color: longRateType === 'personalizada' ? '#8F4D63' : '#574B4F',
                                                        }}
                                                    >
                                                        Tarifa personalizada
                                                    </Typography>
                                                }
                                            />

                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: longRateType === 'personalizada' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1, ml: 0.5
                                                }}
                                            >
                                                Cantidad de mensajes
                                            </Typography>
                                            <TextField
                                                type="text"
                                                value={longCustomQty}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/[^\d]/g, '');
                                                    setLongCustomQty(v);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (['-', '+', 'e', 'E', '.', ' '].includes(e.key)) e.preventDefault();
                                                }}
                                                onPaste={(e) => {
                                                    const text = (e.clipboardData.getData('text') || '').replace(/[^\d]/g, '');
                                                    e.preventDefault();
                                                    setLongCustomQty((prev) => (prev ?? '') + text);
                                                }}
                                                inputProps={{
                                                    inputMode: 'numeric',
                                                    pattern: '[0-9]*',
                                                }}
                                                disabled={longRateType !== 'personalizada'}
                                                fullWidth
                                                sx={{
                                                    mt: 1,
                                                    width: '324px',
                                                    height: '54px',
                                                    background: '#FFFFFF',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    '& .MuiOutlinedInput-root': {
                                                        background: '#FFFFFF',
                                                        height: '54px',
                                                        borderRadius: '8px',
                                                        '& fieldset': {
                                                            borderColor: '#9B9295',
                                                        },
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#330F1B',
                                                    },
                                                }}
                                            />


                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: longRateType === 'personalizada' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1.5, ml: 0.5, mb: -1
                                                }}
                                            >
                                                Tarifa por mensaje
                                            </Typography>
                                            <TextField
                                                type="number"
                                                value={selectedClient?.rateForLong ? selectedClient.rateForLong : ''}
                                                onChange={(e) => {
                                                    let v = e.target.value;
                                                    if (v === '') {
                                                        setSelectedClient(prev => ({ ...(prev as Clients), rateForLong: 0 }));
                                                        return;
                                                    }

                                                    v = v.replace(/[^0-9.]/g, '');
                                                    const firstDot = v.indexOf('.');
                                                    if (firstDot !== -1) {
                                                        v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
                                                    }

                                                    const num = parseFloat(v);
                                                    if (!isNaN(num) && num >= 0) {
                                                        setSelectedClient(prev => ({ ...(prev as Clients), rateForLong: num }));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
                                                }}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    inputProps: {
                                                        min: 0,
                                                        step: 'any',
                                                        style: {
                                                            appearance: 'textfield',
                                                            MozAppearance: 'textfield',
                                                            WebkitAppearance: 'none',
                                                        },
                                                    },
                                                }}
                                                disabled={longRateType !== 'personalizada'}
                                                fullWidth
                                                sx={{
                                                    mt: 2,
                                                    width: '324px',
                                                    height: '54px',
                                                    border: '1px solid #9B9295',
                                                    borderRadius: '8px',
                                                    '& .MuiOutlinedInput-root': {
                                                        height: '54px',
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#9B9295' },
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#330F1B',
                                                        MozAppearance: 'textfield',
                                                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                            WebkitAppearance: 'none',
                                                            margin: 0,
                                                        },
                                                    },
                                                    '& .MuiInputAdornment-root': {
                                                        color: '#645E60',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '14px',
                                                    },
                                                }}
                                            />

                                        </Box>
                                    </Box>
                                </Box>

                            </Box>
                        )}
                        {step === 2 && (
                            <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
                                <Typography fontWeight={500} sx={{ fontSize: '18px', color: '#330F1B', fontFamily: "Poppins" }}>
                                    Elegir cantidad de salas
                                </Typography>

                                <Box display="flex" alignItems="center" gap={2}>
                                    <IconButton
                                        onClick={() => {
                                            if (roomCount > 0) {
                                                const updatedRooms = [...newRooms];
                                                updatedRooms.pop();
                                                setNewRooms(updatedRooms);
                                                setRoomCount(roomCount - 1);
                                            }
                                        }}
                                        disabled={roomCount === 0}
                                        sx={{
                                            border: 0,
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            color: '#7B354D',

                                        }}
                                    >
                                        <img
                                            src={IconMinus4}
                                            alt="Seleccionado"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </IconButton>

                                    <TextField
                                        value={roomCount}
                                        inputProps={{
                                            readOnly: true,
                                            style: {
                                                textAlign: 'center',
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: '#796E71',
                                            }
                                        }}
                                        sx={{
                                            width: '56px',
                                            height: '56px',
                                            border: '1px solid #9B9295',
                                            borderRadius: '8px',
                                            '& .MuiOutlinedInput-root': {
                                                height: '56px',
                                                borderRadius: '8px',
                                                '& fieldset': {
                                                    borderColor: '#9B9295',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#9B9295',
                                                },
                                            },
                                        }}
                                    />

                                    <IconButton
                                        onClick={() => {
                                            if (roomCount < 5) {
                                                setNewRooms([...newRooms, '']);
                                                setRoomCount(roomCount + 1);
                                            }
                                        }}
                                        disabled={roomCount === 5}
                                        sx={{
                                            border: '1px solid #C4B2B9',
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            color: '#7B354D',
                                        }}
                                    >
                                        <img
                                            src={IconPlus4}
                                            alt="Seleccionado"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                    </IconButton>
                                </Box>

                                {newRooms.map((value, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Typography
                                            sx={{
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                color: '#330F1B',
                                            }}
                                        >
                                            Nombre de sala {index + 1}
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            value={value}
                                            onChange={(e) => {
                                                const updated = [...newRooms];
                                                updated[index] = e.target.value;
                                                setNewRooms(updated);
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
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
                                                            <IconButton
                                                                disableRipple
                                                                sx={{
                                                                    paddingTop: '28px',
                                                                    backgroundColor: "transparent !important",
                                                                    "&:hover": {
                                                                        backgroundColor: "transparent !important",
                                                                    },
                                                                }}
                                                            >
                                                                <img
                                                                    src={infoicon}
                                                                    alt="info-icon"
                                                                    style={{ width: 24, height: 24 }}
                                                                />
                                                            </IconButton>
                                                        </Tooltip>

                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                width: '340px',
                                                height: '54px',
                                                borderColor: "#9B9295",
                                                '& .MuiOutlinedInput-root': {
                                                    height: '54px',
                                                    alignItems: 'start',
                                                    '& input': {
                                                        color: '#574B4F',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        letterSpacing: '0.03px',
                                                        paddingTop: '15px'
                                                    },

                                                },
                                            }}
                                        />
                                    </Box>
                                ))}


                            </Box>
                        )}

                    </Box>
                </DialogContent>
                <Divider sx={{ width: 'calc(100% + 32px)', marginLeft: '-32px', mb: -2 }} />

                <Box display="flex" justifyContent="space-between" mt={4} px={3} pb={2}
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}
                >
                    <Box sx={{ display: "flex", gap: 3 }}>
                        {step === 0 && (
                            <SecondaryButton text="Cancelar" onClick={() => setOpenClientModal(false)} />
                        )}

                        {step === 1 && isEditClient && (
                            <SecondaryButton text="Cancelar" onClick={() => setOpenClientModal(false)} />
                        )}
                        {/*isEditClient*/}
                        <Box sx={{}}>
                            {step > 0 && (
                                <SecondaryButton

                                    onClick={() => setStep((prev) => prev - 1)}
                                    text="REGRESAR"
                                />
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                            <MainButton
                                isLoading={isSavingClient}
                                disabled={!isStepValid()}
                                text={
                                    step === 2 || (step === 1 && isEditClient)
                                        ? isEditClient ? 'Guardar cambios' : 'Guardar'
                                        : 'Siguiente'
                                }
                                onClick={() => {
                                    if (step === 0) {
                                        const isEmailValid = validateEmailFormat(email);
                                        const isMatch = email === confirmEmail;

                                        setEmailError(!isEmailValid);
                                        setConfirmEmailError(!isMatch);

                                        if (!isEmailValid || !isMatch) return;
                                    }

                                    if (step === 1 && isEditClient) {
                                        handleSubmit();
                                        return;
                                    }

                                    if (step === 2) {
                                        handleSubmit();
                                    } else {
                                        setStep(step + 1);
                                    }
                                }}
                            />
                            <Box sx={{ mt: -0.2 }}>
                                {isEditClient && step === 0 && (
                                    <SecondaryButton
                                        text="Guardar"
                                        disabled={isSavingClient || !isStepValid()}
                                        onClick={() => handleSubmit()}
                                    />
                                )}
                            </Box>
                        </Box>
                        {/*Guardars*/}
                        <Box sx={{ mt: -0 }}>
                            {!isEditClient && step > 0 && step < 2 && (
                                <MainButton
                                    isLoading={isSavingClient}
                                    text="Guardar"
                                    onClick={() => handleSubmit()}
                                />
                            )}
                        </Box>

                    </Box>
                </Box>

            </Dialog>


            <ModalMain
                isOpen={MainModal}
                Title={MainModalTitle}
                message={MainModalMessage}
                primaryButtonText='Aceptar'
                secondaryButtonText='Cancelar'
                onPrimaryClick={modalAction}
                onSecondaryClick={() => setMainModal(false)}
            />
            <ModalMain
                isOpen={MainModalDelete}
                Title='Eliminar Cliente'
                message='¿Está seguro de que desea eliminar al cliente seleccionado? Esta acción no podrá revertirse.'
                primaryButtonText='Aceptar'
                secondaryButtonText='Cancelar'
                onPrimaryClick={() => handleDeleteClient(selectedClient?.id ?? 0)}
                onSecondaryClick={() => setMainModalDelete(false)}
            />
            <Modal open={rechargeModalOpen} onClose={() => setRechargeModalOpen(false)}>
                <Box sx={{
                    background: '#fff', padding: 4, width: "556px", height: "656px", margin: '100px auto',
                    borderRadius: 2, overflowX: "hidden", overflowY: "hidden"
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: "-5px", marginTop: "-12px" }}>
                        <Typography variant="h6" mb={2} fontFamily="Poppins"
                            sx={{ color: "#574B4F", fontWeight: 600, fontSize: "20px" }}>
                            Recargar Saldo para:
                        </Typography>
                        <Typography variant="h6" mb={2} fontFamily="Poppins"
                            sx={{ color: "#843C55", fontWeight: 600, fontSize: "20px" }}>
                            {selectedClient?.nombreCliente}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => setRechargeModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            marginTop: '-64px',
                            marginLeft: '478px',
                            zIndex: 10
                        }}
                    >
                        <CloseIcon sx={{ color: '#A6A6A6' }} />
                    </IconButton>

                    <Divider sx={{ width: 'calc(100% + 32px)', marginLeft: '-32px', mb: 1, mt: 0.5 }} />

                    <Box sx={{ overflowY: "auto", height: "490px", overflowX: "hidden", width: "515px" }}>
                        <Typography
                            sx={{ color: "#330F1B", fontFamily: "Poppins", fontSize: "16px", marginLeft: "15px" }}
                        >
                            Servicio
                        </Typography>

                        <FormControl fullWidth sx={{ mb: 2, marginLeft: "10px" }}>

                            <Select
                                value={rechargeData.smsType}
                                onChange={(e) => {
                                    const tipo = e.target.value as 'short' | 'long';
                                    setRechargeData(prev => ({
                                        ...prev,
                                        smsType: tipo,
                                        ratePerMessage:
                                            tipo === 'short'
                                                ? selectedClient?.rateForShort ?? 0
                                                : selectedClient?.rateForLong ?? 0
                                    }));
                                }}
                                displayEmpty
                                renderValue={(selected) =>
                                    selected ? selected : (
                                        <span style={{ color: '#786E71', fontSize: '12px', fontFamily: 'Poppins' }}>
                                            SMS # cortos
                                        </span>
                                    )
                                }
                                sx={{
                                    mt: 1,
                                    width: '215px',
                                    height: '40px',
                                    background: '#FFFFFF',
                                    border: '1px solid #9B9295',
                                    borderRadius: '8px',
                                    fontFamily: 'Poppins',
                                    fontSize: '14px',
                                    padding: '0 10px',
                                    '& .MuiSelect-select': {
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '40px',
                                    },
                                    '& fieldset': {
                                        border: 'none',
                                    },
                                }}
                            >
                                <MenuItem value="Corto"
                                    sx={{
                                        fontFamily: 'Poppins', fontSize: '12px',
                                        color: '#645E60', '&:hover': {
                                            backgroundColor: '#F2EBED'
                                        }
                                    }}>
                                    SMS Cortos</MenuItem>
                                <MenuItem value="Largo"
                                    sx={{
                                        fontFamily: 'Poppins', fontSize: '12px',
                                        color: '#645E60', '&:hover': {
                                            backgroundColor: '#F2EBED'
                                        }
                                    }}>
                                    SMS Largos</MenuItem>
                            </Select>
                        </FormControl>


                        <Typography
                            sx={{ color: "#330F1B", fontFamily: "Poppins", fontSize: "16px", marginLeft: "10px" }}
                        >
                            Seleccionar sala(s)
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                height: '140px',
                                overflowY: 'auto',
                                width: '480px', marginLeft: "15px"
                            }}
                        >
                            {getRoomsList().map((room, idx) => (
                                <Box key={idx} sx={{ width: '45%', height: "17px" }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rechargeData.roomsSelected.includes(room)}
                                                onChange={() => handleToggleRoom(room)}
                                                checkedIcon={
                                                    <Box
                                                        sx={{
                                                            width: '24px',
                                                            height: '24px',
                                                            position: 'relative',
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
                                        label={room}
                                        sx={{
                                            '& .MuiFormControlLabel-label': {
                                                fontFamily: 'Poppins',
                                                fontSize: '14px',
                                                color: '#574B4F',
                                            },
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                        <Divider sx={{ width: 'calc(100% - 40px)', marginLeft: '5px', mb: 2, mt: 1 }} />


                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: shortRateType === 'estandar' ? '#330F1B' : '#D0CDCD',
                                mt: 3.5, ml: 0.5, mb: -1
                            }}
                        >
                            Tarifa por mensaje
                        </Typography>
                        <TextField
                            value={rechargeData.ratePerMessage.toFixed(2)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                readOnly: true
                            }}
                            fullWidth
                            margin="normal"
                            sx={{
                                mt: 2, mb: 2,
                                width: '216px',
                                height: '54px',
                                background: '#E5E4E4',
                                border: '1px solid #9B9295',
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-root': {
                                    background: '#E5E4E4',
                                    height: '54px',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: '#9B9295',
                                    },
                                },
                                '& .MuiInputAdornment-root': {
                                    color: '#645E60',
                                    fontFamily: 'Poppins',
                                    fontSize: '14px'
                                },
                                '& input': {
                                    fontFamily: 'Poppins',
                                    fontSize: '16px',
                                    color: '#574B4F',
                                },
                            }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Poppins',
                                        fontSize: '16px',
                                        color: shortRateType === 'estandar' ? '#330F1B' : '#D0CDCD',
                                        mt: 1.5, ml: 0.5, mb: 1
                                    }}
                                >
                                    Monto por servicio
                                </Typography>

                                <TextField
                                    type="number"
                                    fullWidth
                                    sx={{
                                        mt: 1,
                                        width: '216px',
                                        height: '54px',
                                        background: '#FFFFFF',
                                        border: '1px solid #9B9295',
                                        borderRadius: '8px',
                                        '& .MuiOutlinedInput-root': {
                                            background: '#FFFFFF',
                                            height: '54px',
                                            borderRadius: '8px',
                                            '& fieldset': { borderColor: '#9B9295' },
                                        },
                                        '& input': {
                                            fontFamily: 'Poppins',
                                            fontSize: '16px',
                                            color: '#330F1B',
                                            MozAppearance: 'textfield',
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                        },
                                    }}
                                    value={rechargeData.amount === 0 ? '' : rechargeData.amount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Permite vacío, bloquea negativos y letras
                                        if (val === '') {
                                            setRechargeData((prev) => ({ ...prev, amount: 0 }));
                                            return;
                                        }

                                        const clean = val.replace(/[^0-9]/g, '');
                                        const numeric = parseFloat(clean);

                                        if (!isNaN(numeric) && numeric >= 0) {
                                            setRechargeData((prev) => ({ ...prev, amount: numeric }));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                                    }}
                                />

                            </Grid>
                            <Grid item xs={6}>
                                <Typography
                                    sx={{
                                        fontFamily: 'Poppins',
                                        fontSize: '16px',
                                        color: '#330F1B',
                                        mt: 1.5, ml: 0.5, mb: 1
                                    }}
                                >
                                    Total (monto+IVA)
                                </Typography>
                                <TextField
                                    value={`$${((rechargeData.amount || 0) * 1.16).toFixed(2)}`}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                        mt: 1,
                                        width: '216px',
                                        height: '54px',
                                        background: '#FFFFFF',
                                        border: '1px solid #9B9295',
                                        borderRadius: '8px',
                                        '& .MuiOutlinedInput-root': {
                                            background: '#FFFFFF',
                                            height: '54px',
                                            borderRadius: '8px',
                                            '& fieldset': {
                                                borderColor: '#9B9295',
                                            },
                                        },
                                        '& input': {
                                            fontFamily: 'Poppins',
                                            fontSize: '16px',
                                            color: '#330F1B',
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <FormControl component="fieldset" sx={{ mt: 3 }}>
                            <FormLabel component="legend" sx={{
                                fontWeight: 500, fontFamily: 'Poppins',
                                color: "#330F1B", fontSize: "18px", marginLeft: "12px", mb: 0.5
                            }}>
                                Tipo de pago
                            </FormLabel>
                            <FormControl>
                                <RadioGroup
                                    value={rechargeData.paymentType}
                                    onChange={(e) =>
                                        setRechargeData((prev) => ({
                                            ...prev,
                                            paymentType: e.target.value,
                                        }))
                                    }
                                >
                                    {[
                                        { value: 'demo', label: 'Demo' },
                                        { value: 'transferencia', label: 'Transferencia bancaria' },
                                        { value: 'deposito', label: 'Depósito en efectivo' },
                                    ].map((option) => (
                                        <FormControlLabel
                                            key={option.value}
                                            value={option.value}
                                            control={
                                                <Radio
                                                    sx={{
                                                        marginLeft: "15px", mb: -0.5,
                                                        color: '#786F71',
                                                        '&.Mui-checked': {
                                                            color: '#8F4D63',
                                                        },
                                                    }}
                                                />
                                            }
                                            label={option.label}
                                            sx={{
                                                '& .MuiFormControlLabel-label': {
                                                    fontFamily: 'Poppins',
                                                    fontSize: '16px',
                                                    color: rechargeData.paymentType === option.value ? '#8F4D63' : '#786F71',
                                                },
                                            }}
                                        />
                                    ))}
                                </RadioGroup>

                            </FormControl>

                        </FormControl>
                        <Box mt={2}>
                            <Typography sx={{
                                fontWeight: 500, fontFamily: 'Poppins', mb: 1,
                                color: "#330F1B", marginLeft: "10px", fontSize: "16px"
                            }}>
                                Fecha de facturación
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    value={selectedDate ? selectedDate.toLocaleDateString('es-MX') : ''}
                                    onClick={handleOpenDatePicker}
                                    placeholder="Seleccionar fecha"
                                    fullWidth
                                    sx={{
                                        width: "262px", height: "56px", backgroundColor: "#FFFFFF", '& .MuiInputBase-input': {
                                            fontFamily: 'Poppins', fontSize: '16px', color: "#574B4F",
                                        },
                                    }}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <IconButton>
                                                <CalendarTodayIcon sx={{ width: "15px", height: "15px", color: "#8F4D63" }} />
                                            </IconButton>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ width: 'calc(100% + 32px)', marginLeft: '-32px', mb: 1, mt: 0.5 }} />

                    <Box mt={3} display="flex" gap={31.5}>
                        <SecondaryButton text='Cancelar' onClick={() => setRechargeModalOpen(false)} />
                        <MainButton text='Recargar' onClick={handleSaveRecharge} isLoading={isSavingClient} />
                    </Box>
                </Box>
            </Modal >
            <CustomDateTimePicker
                open={datePickerOpen}
                anchorEl={anchorEl2}
                onApply={(date, hour, minute) => {
                    const newDate = new Date(date);
                    newDate.setHours(hour);
                    newDate.setMinutes(minute);
                    handleDateChange(newDate);
                    setRechargeData(prev => ({
                        ...prev,
                        billingDate: newDate.toISOString()
                    }));
                }}
                onClose={() => setDatePickerOpen(false)}
            />

            {
                ShowSnackBar && (
                    <SnackBar
                        message={MessageSnack}
                        buttonText="Cerrar"
                        onClose={() => setShowSnackBar(false)}
                    />
                )
            }

            <ModalError
                isOpen={ShowModalError}
                title={TitleModalError}
                message={MessageModal}
                buttonText="Cerrar"
                onClose={() => setShowModalError(false)}
            />
        </Box >
    );
};

export default Clients;
