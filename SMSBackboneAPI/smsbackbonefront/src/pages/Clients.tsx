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
import axios from 'axios';
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
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Thrashicon from '../assets/Icon-trash-Card.svg'
import SnackBar from "../components/commons/ChipBar";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'

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



const Clients: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<'cliente' | ''>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
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
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
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

    const handleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === clientsList.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(clientsList.map((n) => n.id));
        }
    };

    const GetClientsAdmin = async () => {
        setLoading(true);

        try {
            const request = `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_GET_CLIENTSADMIN}`;
            const response = await axios.get<Clients[]>(request);

            if (response.status === 200) {
                const fetchedClient = response.data;
                const uniqueClients: Clients[] = [
                    ...new Map(fetchedClient.map((item: Clients) => [item.nombreCliente, item])).values()
                ];
                setClientsList(uniqueClients);
                setOriginalData(uniqueClients);
                setClientsList(uniqueClients.slice(0, 50));

            }
        } catch {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        GetClientsAdmin();
    }, []);


    const handleExportClick = (
        format: 'csv' | 'xlsx' | 'pdf',
        setThisLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setThisLoading(true);
        setTimeout(() => {
            exportClients(format, () => setThisLoading(false));
        }, 1000);
    };

    const exportClients = async (
        format: 'csv' | 'xlsx' | 'pdf',
        onComplete?: () => void
    ) => {
        const MAX_RECORDS_LOCAL = 100000;
        const data = clientsList;

        try {
            if (data.length <= MAX_RECORDS_LOCAL) {
                const cleanData = data.map(item => ({
                    "Fecha de alta": item.creationDate,
                    "Cliente": item.nombreCliente,
                    "Nombre": item.firstName,
                    "Apellidos": item.lastName,
                    "Teléfono": item.phoneNumber,
                    "Extensión": item.extension || '',
                    "Correo electrónico": item.email,
                    "Tarifa SMS # Cortos": item.rateForShort,
                    "Tarifa SMS # Largos": item.rateForLong,
                    "Salas": item.roomName,
                    "Estatus": item.estatus,
                    "Créditos Globales": item.totalCredits,
                    "Créditos SMS # Cortos": item.totalShortSmsCredits,
                    "Créditos SMS # Largos": item.totalLongSmsCredits
                }));


                if (format === 'csv') {
                    const csv = unparse(cleanData);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    saveAs(blob, 'DescargaClientes.csv');
                } else if (format === 'xlsx') {
                    const worksheet = XLSX.utils.json_to_sheet(cleanData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'NumerosDID');
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                    const blob = new Blob([excelBuffer], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    saveAs(blob, 'DescargaClientes.xlsx');
                } else if (format === 'pdf') {
                    const input = document.querySelector('table');
                    if (!input) return;

                    const clone = input.cloneNode(true) as HTMLElement;
                    clone.style.position = 'absolute';
                    clone.style.top = '-9999px';
                    document.body.appendChild(clone);

                    const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
                    document.body.removeChild(clone);

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                    pdf.save('DescargaClientes.pdf');
                }
            } else {
                const payload = { Formato: format };
                const response = await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_EXPORT_NUMBERS}`,
                    payload,
                    { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }
                );

                const blob = new Blob([response.data], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `NumerosDID.${format}`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            setTitleModalError('Error al generar el reporte');
            setMessageModal('Intentelo màs tarde');
            setShowModalError(true);
        } finally {
            onComplete?.();
        }
    };

    const goToFirstPage = () => setCurrentPage(1);

    const goToLastPage = () => setCurrentPage(totalPages);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


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
            appliedClientIds.length === 0 || appliedClientIds.includes(client.id)
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
            shortRateQty: shortRateType === 'estandar' ? shortStandardQty : null,
            longRateQty: longRateType === 'estandar' ? longStandardQty : null,
            roomNames: newRooms.filter((r) => r.trim() !== ''),
        };

        try {
            const urlBase = import.meta.env.VITE_SMS_API_URL;
            const endpoint = `${urlBase}${import.meta.env.VITE_API_UPDATE_CREATE_CLIENT}`


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
            setMainModal(false);
        } catch (error) {
            setTitleModalError('Error al agregar el cliente');
            setMessageModal('Intentelo màs tarde');
            setShowModalError(true);
        }
        finally {
            setOpenClientModal(false);
            setIsSavingClient(false);
        }
    };

    const standardShortRates: Record<string, number> = {
        "1–999": 0.2819,
        "1,000": 0.2702,
        "2,000": 0.2584,
        "3,000": 0.2526,
        "4,000": 0.2467,
        "6,000": 0.2408,
    };

    const standardLongRates: Record<string, number> = {
        "1": 0.150,
        "1,000": 0.125,
        "2,000": 0.100,
        "4,000": 0.080,
        "5,000": 0.075,
        "8,000": 0.070,
    };

    const validateEmailFormat = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };


    const handleDeactivateClient = async (id: number) => {
        const newStatus = currentClient?.estatus === 1 ? 0 : 1;
        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_DEACTIVATE_CLIENT}${id}`;
            await axios.get(requestUrl);

            setClientsList(prev =>
                prev.map(client =>
                    client.id === id
                        ? { ...client, estatus: newStatus }
                        : client
                )
            );
            setShowSnackBar(true);
            setMessageSnack('Cliente desactivado correctamente');
            setMainModal(false);

        } catch (error) {
            setTitleModalError('Error al desactivar el cliente');
            setMessageModal('Intentelo màs tarde');
            setShowModalError(true);
        }
    };

    const handleOpenDeactivateModal = () => {
        if (menuRowId === null) return;

        setMainModalTitle("¿Estás seguro que deseas dar de baja este cliente?");
        setMainModalMessage("El cliente ya no podrá iniciar sesión, pero su información permanecerá en el sistema.");
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
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_DELETE_CLIENT}${id}`;
            await axios.get(requestUrl);

            GetClientsAdmin();
            setMainModalDelete(false);
            setShowSnackBar(true);
            setMessageSnack('Cliente Eliminado correctamente');
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
                billingDate: rechargeData.billingDate
            };

            const url = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_RECHARGE_CLIENT}`;
            const response = await axios.post(url, payload);

            if (response.status === 200) {
                setRechargeModalOpen(false);
                GetClientsAdmin();
                setShowSnackBar(true);
                setMessageSnack('Recarga Exitosa');
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
            .filter(c => selectedClients.includes(c.nombreCliente))
            .map(c => c.id);

        setAppliedClientIds(selectedClientIds);
        setClientMenuOpen(false);
        setCurrentPage(1);
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


                            const count = selectedClients.length;


                            const labelDisplay = count > 0 ? `${count} ${label}` : label;

                            return (
                                <Box
                                    key={label}
                                    onClick={(e) => {
                                        if (label === 'CLIENTE') {
                                            setClientAnchorEl(e.currentTarget);
                                            setClientMenuOpen(true);
                                        }
                                        if (label === 'ESTADO') {
                                            setEstadoAnchorEl(e.currentTarget);
                                            setEstadoMenuOpen(true);
                                        }
                                        setActiveFilter(label.toLowerCase() as any);
                                    }}
                                    sx={{
                                        px: '16px',
                                        py: '6px',
                                        border: '1px solid',
                                        borderColor: showClientHighlight ? '#7B354D' : '#CFCFCF',
                                        borderRadius: '50px',
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        backgroundColor: showClientHighlight ? '#F6EEF1' : '#FFFFFF',
                                        color: showClientHighlight ? '#7B354D' : '#9B9295',
                                        transition: 'all 0.2s ease-in-out',
                                        userSelect: 'none',
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
                        {(currentPage - 1) * itemsPerPage + 1}–
                        {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                    </Typography>

                    {/* Flechas + Exportaciones */}
                    <Box display="flex" alignItems="center" gap={1} height={"25px"} marginBottom={"-5px"} marginTop={"-5px"}>
                        <Box sx={{ marginRight: "750px" }}>
                            <Tooltip title="Primera página">
                                <IconButton onClick={goToFirstPage} disabled={currentPage === 1}>
                                    <Box
                                        display="flex"
                                        gap="0px"
                                        alignItems="center"
                                        sx={{
                                            opacity: currentPage === 1 ? 0.3 : 1
                                        }}
                                    >
                                        <img src={backarrow} style={{ width: 24, marginRight: "-16px" }} />
                                        <img src={backarrow} style={{ width: 24 }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Página Anterior">
                                <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                                    <img src={backarrow} style={{ width: 24, opacity: currentPage === 1 ? 0.3 : 1, marginLeft: "-18px" }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Siguiente página">
                                <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    <img src={backarrow} style={{
                                        width: 24, transform: 'rotate(180deg)', marginRight: "-28px", marginLeft: "-28px",
                                        opacity: currentPage === totalPages ? 0.3 : 1
                                    }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Ultima Página">
                                <IconButton onClick={goToLastPage} disabled={currentPage === totalPages}>
                                    <Box
                                        display="flex"
                                        gap="0px"
                                        alignItems="center"
                                        sx={{
                                            opacity: currentPage === 1 ? 0.3 : 1
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
                            minHeight: '400px',
                            backgroundColor: '#F9F9F9',
                            padding: 4,
                            borderRadius: '12px',
                            border: '1px solid #E0E0E0',
                            mt: 2,
                        }}
                    >
                        <img src={BoxEmpty} alt="Caja vacía" style={{ width: '220px', marginBottom: '16px' }} />
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
                ) : paginatedData.length === 0 ? (
                    // Caja abierta - no hay coincidencias con los filtros
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            minHeight: '465px',
                            backgroundColor: '#FFFFFF',
                            padding: 4,
                            borderRadius: '12px',
                            border: '1px solid #E0E0E0',
                        }}
                    >
                        <img src={NoResult} alt="No resultados" style={{ width: '220px', marginBottom: '16px' }} />
                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: '#7B354D',
                                fontWeight: 500,
                            }}
                        >
                            No se encontraron resultados
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
                            maxHeight: "465px"
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
                                    <td style={{
                                        position: 'sticky', textAlign: "center",
                                        right: -2,
                                        background: '#fff', borderLeft: '1px solid #E0E0E0',
                                        boxShadow: '-2px 0 4px -2px rgba(0, 0, 0, 0.1)',
                                        padding: '3.5px', width: '66px', height: "30px", whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F",
                                    }}>
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((Client) => (
                                    <tr key={Client.id} style={{ borderBottom: '1px solid #E0E0E0', height: "51px" }}>
                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 14px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.creationDate}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.nombreCliente}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.firstName}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.lastName}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.phoneNumber}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px', maxWidth: '100px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.extension}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 46px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.email}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.rateForShort}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.rateForLong}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 24px', maxWidth: '100px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.roomName}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 28px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.estatus}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.totalCredits}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{Client.totalShortSmsCredits}</td>

                                        <td style={{
                                            whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 26px',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F",
                                            fontSize: "13px"

                                        }}>{Client.totalLongSmsCredits}</td>

                                        <td style={{
                                            position: 'sticky', textAlign: "center",
                                            right: -2,
                                            background: '#fff', borderLeft: '1px solid #E0E0E0',
                                            boxShadow: '-2px 0 4px -2px rgba(0, 0, 0, 0.1)',
                                            padding: '3.5px', width: '66px', height: "51px", whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>
                                            <IconButton onClick={(event) => handleMenuOpen(event, Client.id)}>
                                                <MoreVertIcon />
                                            </IconButton>
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
                        borderRadius: "8px",
                        '&:hover': {
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
                        '&:hover': {
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <img
                        src={IconSuS} alt="Recarga"
                        style={{ width: '24px', height: '24px', marginRight: "9px", color: "#574B4FE6" }}
                    />
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4FE6" }}>
                        Recargar
                    </Typography>
                </MenuItem>

                {currentClient?.estatus === 0 ? (
                    <MenuItem onClick={() => {
                        handleActivateClient();
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
                            '&:hover': {
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
                        '&:hover': {
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
                                backgroundColor: "transparent !important",
                                pointerEvents: "auto",
                                "&:hover": {
                                    backgroundColor: "transparent !important",
                                },
                            }}
                        >
                            <img
                                src={infoicon}
                                alt="info-icon"
                                style={{ width: 24, height: 24, marginLeft: "10px" }}
                            />
                        </IconButton>
                    </Tooltip>

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
                                        src={seachicon}
                                        alt="Buscar"
                                        style={{
                                            width: 24,
                                            filter: clientSearch ? 'invert(14%) sepia(58%) saturate(1253%) hue-rotate(316deg) brightness(90%) contrast(95%)' : 'none'
                                        }}
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
                    {clientsList
                        .filter((c) => c.nombreCliente.toLowerCase().includes(clientSearch))
                        .map((client) => (
                            <MenuItem
                                key={client.id}
                                onClick={() =>
                                    setSelectedClients((prev) =>
                                        prev.includes(client.nombreCliente)
                                            ? prev.filter((c) => c !== client.nombreCliente)
                                            : [...prev, client.nombreCliente]
                                    )
                                }
                                sx={{ height: "32px", marginLeft: "-12px" }}
                            >
                                <Checkbox checked={selectedClients.includes(client.nombreCliente)}
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
                                <ListItemText
                                    primary={client.nombreCliente}
                                    primaryTypographyProps={{
                                        fontFamily: 'Poppins',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        color: selectedClients.includes(client.nombreCliente) ? '#8F4E63' : '#786E71',
                                    }}
                                />
                            </MenuItem>
                        ))}
                    {clientsList.filter((c) => c.nombreCliente.toLowerCase().includes(clientSearch)).length === 0 && (
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
                            setClientsList(originalData.slice(0, 50));
                            setCurrentPage(1);
                            setActiveFilter('');
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={handleFilterClients}
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
                    {['Habilitado', 'Inhabilitado'].map((status) => (
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
                            setStatusMenuOpen(false);
                            setNumbersData(originalData);
                            setCurrentPage(1);
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            const filtered = originalData.filter((item) =>
                                selectedStatus.length === 0 ||
                                selectedStatus.includes(item.Estatus) // ajusta el campo si es necesario
                            );
                            setNumbersData(filtered);
                            setStatusMenuOpen(false);
                            setCurrentPage(1);
                        }}
                        text="APLICAR"
                    />
                </Box>


            </Menu>


            {/* Modal para añadir o editar cliente */}
            <Dialog open={openClientModal} onClose={() => setOpenClientModal(false)} maxWidth="md" fullWidth sx={{ overflowX: "hidden" }}>
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

                <Box display="flex" justifyContent="space-around" mb={1.5} mt={3}>
                    {['Información', 'Tarifas', 'Salas'].map((label, index) => (
                        <Box key={label} textAlign="center">
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    border: '2px solid',
                                    borderColor: index <= step ? '#7B3F61' : '#DDD',
                                    borderRadius: '50%',
                                    mx: 'auto',
                                    backgroundColor: index < step ? '#7B3F61' : 'transparent',
                                }}
                            />
                            <Typography
                                fontSize="12px"
                                mt={1}
                                color={index === step ? '#7B3F61' : '#B7AEB0'}
                                fontFamily={"Poppins"}
                            >
                                {label} {index > 0 && <span style={{ fontSize: '10px' }}>(Opcional)</span>}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ width: 'calc(100% + 32px)', marginLeft: '-32px', mb: 0 }} />

                <DialogContent>
                    <Box px={3} pt={1} sx={{ overflowX: "hidden" }}>
                        {step === 0 && (
                            <Box display="flex" flexDirection="column" gap={2} sx={{ overflowX: "hidden" }}>
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
                                        onChange={(e) => setSelectedClient({ ...selectedClient, nombreCliente: e.target.value })}
                                        error={
                                            !!(selectedClient?.nombreCliente && (selectedClient?.nombreCliente.length > 40 || !/^[a-zA-Z0-9 ]+$/.test(selectedClient?.nombreCliente)))
                                        }
                                        helperText={
                                            selectedClient?.nombreCliente && selectedClient?.nombreCliente.length > 40
                                                ? "Máximo 40 caracteres"
                                                : selectedClient?.nombreCliente && !/^[a-zA-Z0-9 ]+$/.test(selectedClient?.nombreCliente)
                                                    ? "Solo se permiten caracteres alfabéticos"
                                                    : ""

                                        }
                                        FormHelperTextProps={{
                                            sx: {
                                                fontFamily: 'Poppins', position: "absolute", marginTop: "58px"
                                            }
                                        }}
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
                                }}
                                >Información de contacto</Typography>

                                <Box display="flex" gap={2}>
                                    <Box display="flex" flexDirection="column" mb={2} marginLeft={"10px"}>
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
                                            onChange={(e) => setSelectedClient({ ...selectedClient, firstName: e.target.value })}
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
                                    <Box display="flex" flexDirection="column" mb={2} marginLeft={"20px"}>
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
                                            onChange={(e) => setSelectedClient({ ...selectedClient, lastName: e.target.value })}
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
                                            fullWidth
                                        />
                                    </Box>
                                </Box>
                                <Box display="flex" gap={2}>
                                    <Box display="flex" flexDirection="column" mb={2} marginLeft={"10px"}>
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
                                            Teléfono
                                            <span style={{ color: "#D01247" }}>*</span>
                                        </Typography>
                                        <TextField
                                            value={selectedClient?.phoneNumber || ''}
                                            onChange={(e) => setSelectedClient({ ...selectedClient, phoneNumber: e.target.value })}
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
                                    <Box display="flex" flexDirection="column" mb={2} marginLeft={"20px"}>
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
                                            onChange={(e) => setSelectedClient({ ...selectedClient, extension: e.target.value })}
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
                                    <Box display="flex" flexDirection="column" mb={2} marginLeft={"10px"}>
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
                                                setEmail(e.target.value);
                                                setEmailError(!validateEmailFormat(e.target.value));
                                            }}
                                            error={emailError}
                                            helperText={emailError ? 'Formato inválido' : ''}
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
                                    <Box display="flex" flexDirection="column" mb={2} marginLeft={"20px"}>
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
                                                setConfirmEmail(e.target.value);
                                                setConfirmEmailError(e.target.value !== email);
                                            }}
                                            error={confirmEmailError}
                                            helperText={confirmEmailError ? 'Los correos no coinciden' : ''}
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
                                                    },
                                                }}
                                            >
                                                <MenuItem value="1–999" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    1–999
                                                </MenuItem>
                                                <MenuItem value="1,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    1,000
                                                </MenuItem>
                                                <MenuItem value="2,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    2,000
                                                </MenuItem>
                                                <MenuItem value="3,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    3,000
                                                </MenuItem>
                                                <MenuItem value="4,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    4,000
                                                </MenuItem>
                                                <MenuItem value="6,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    6,000
                                                </MenuItem>
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
                                                value={shortCustomQty}
                                                onChange={(e) => setShortCustomQty(e.target.value)}
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
                                                    color: shortRateType === 'personalizada' ? '#330F1B' : '#D0CDCD',
                                                    mt: 1.5, ml: 0.5, mb: -1
                                                }}
                                            >
                                                Tarifa por mensaje
                                            </Typography>
                                            <TextField
                                                type="number"
                                                value={selectedClient?.rateForShort || ''}
                                                onChange={(e) =>
                                                    setSelectedClient({
                                                        ...selectedClient,
                                                        rateForShort: parseFloat(e.target.value)
                                                    })
                                                }
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    inputProps: {
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
                                                        '& fieldset': {
                                                            borderColor: '#9B9295',
                                                        },
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#330F1B',
                                                    },
                                                    '& .MuiInputAdornment-root': {
                                                        color: '#645E60',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '14px'
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
                                                <MenuItem value="1" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    1</MenuItem>
                                                <MenuItem value="1,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    1,000</MenuItem>
                                                <MenuItem value="2,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    2,000</MenuItem>
                                                <MenuItem value="4,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    4,000</MenuItem>
                                                <MenuItem value="5,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    5,000</MenuItem>
                                                <MenuItem value="8,000" sx={{
                                                    fontFamily: 'Poppins', fontSize: '12px',
                                                    color: '#645E60', '&:hover': {
                                                        backgroundColor: '#F2EBED'
                                                    }
                                                }}>
                                                    8,000</MenuItem>
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
                                                value={longCustomQty}
                                                onChange={(e) => setLongCustomQty(e.target.value)}
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
                                                type='number'
                                                value={selectedClient?.rateForLong || ''}
                                                onChange={(e) =>
                                                    setSelectedClient({ ...selectedClient, rateForLong: parseFloat(e.target.value) })
                                                }
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
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
                                                        '& fieldset': {
                                                            borderColor: '#9B9295',
                                                        },
                                                    },
                                                    '& input': {
                                                        fontFamily: 'Poppins',
                                                        fontSize: '16px',
                                                        color: '#330F1B',
                                                    },
                                                    '& .MuiInputAdornment-root': {
                                                        color: '#645E60',
                                                        fontFamily: 'Poppins',
                                                        fontSize: '14px'
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
                                            border: '1px solid #C4B2B9',
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

                    <SecondaryButton text="Cancelar" onClick={() => setOpenClientModal(false)} />


                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ mt: -0.2 }}>
                            {step > 0 && (
                                <SecondaryButton

                                    onClick={() => setStep((prev) => prev - 1)}
                                    text="REGRESAR"
                                />
                            )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>


                            <MainButton
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
                                {isEditClient && step == 0 && (
                                    <SecondaryButton text="Guardar"
                                        onClick={() => handleSubmit()}
                                    />
                                )}
                            </Box>
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
                                    value={rechargeData.amount}
                                    onChange={(e) =>
                                        setRechargeData((prev) => ({
                                            ...prev,
                                            amount: parseFloat(e.target.value) || 0,
                                        }))
                                    }
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
                                            <IconButton position="end">
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
