import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Divider,
    Tabs,
    Popper,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    MenuItem,
    Checkbox,
    ListItemText,
    CircularProgress
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DatePicker from '../components/commons/DatePicker';
import BoxEmpty from '../assets/Nousers.svg';
import boxopen from '../assets/NoResultados.svg';
import backarrow from '../assets/MoveTable.svg';
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import IconCSV from '../assets/IconCSV.svg';
import IconExcel from '../assets/IconExcel.svg';
import IconPDF from '../assets/IconPDF.svg';
import Tooltip from "@mui/material/Tooltip";

import axios from 'axios';
import dayjs from 'dayjs';

import { saveAs } from 'file-saver';
import { unparse } from 'papaparse';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';

interface Reports {
    id: number,
    Fecha: Date,
    Telefono: string,
    Sala: string,
    Campana: string,
    Idcampana: number,
    Usuario: string,
    Idmensaje: number,
    Mensaje: string,
    Estado: string,
    Fecharecepcion: Date,
    Costo: number,
    Tipo: string,
    Resultado: string,
}

interface ReporteGlobal {
    Date: string;
    Phone: string;
    Room: string;
    Campaign: string;
    CampaignId: number;
    User: string;
    MessageId: number;
    Message: string;
    Status: string;
    ReceivedAt: string;
    Cost: string;
    Type: string;
    SentAt?: string;
}

interface ReporteSMS {
    messageId: number;
    message: string;
    campaignName: string;
    campaignId: number;
    userName: string;
    roomName: string;
    phoneNumber: string;
    status?: string;
    responseMessage?: string;
    sentAt?: string;
    UserId: number;
}

interface Campaign {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
}

type DateRangeType = {
    start: Date;
    end: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
};

const Reports: React.FC = () => {
    const [Reports, setReports] = useState<Reports[] | null | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("SMS");

    // Estados para DatePicker
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDates, setSelectedDates] = useState<DateRangeType | null>(null);

    // Estados para el Popper de Campañas
    const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
    const [anchorElC, setAnchorElC] = useState<HTMLElement | null>(null);
    const [selectedCampaigns, setSelectedCampaigns] = useState<Campaign[]>([]);
    const [campaignSearch, setCampaignSearch] = useState('');

    // Estados para el Popper de Usuarios
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userAnchorEl, setUserAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const tableRef = React.useRef<HTMLDivElement>(null);
    const [filteredReports, setFilteredReports] = useState<ReporteGlobal[] | null>([]);
    const [filteredReportsSms, setFilteredReportsSms] = useState<ReporteSMS[] | null>(null);
    const [reportData, setReportData] = useState<ReporteGlobal[] | undefined | null>(undefined);
    const [reportDatasms, setReportDatasms] = useState<ReporteSMS[] | undefined | null>(undefined);
    const [users, setUsers] = useState<User[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, settotalCount] = useState(0);
    const [totalXPage, settotalXPage] = useState(0);
    const navigate = useNavigate();


    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };


    const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setDatePickerOpen(true);
    };

    // Cierra el DatePicker sin aplicar cambios
    const handleCancelDatePicker = () => {
        setDatePickerOpen(false);
    };



    // Abre o cierra el menú de campañas
    const handleCampaignClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (campaignMenuOpen) {
            setCampaignMenuOpen(false);
            setAnchorElC(null);
        } else {
            setAnchorElC(event.currentTarget);
            setCampaignMenuOpen(true);
        }
    };


    const handleCampaignSelection = (campaign: Campaign) => {
        setSelectedCampaigns((prev) => {
            const exists = prev.some((c) => c.id === campaign.id);
            if (exists) {
                return prev.filter((c) => c.id !== campaign.id);
            } else {
                return [...prev, campaign];
            }
        });
    };

    const handleSelectAllCampaigns = () => {
        setSelectedCampaigns(
            selectedCampaigns.length === campaigns.length ? [] : campaigns
        );
    };


    const handleClearCampaignSelection = () => {
        if (selectedSmsOption === "Global") {
            setCampaignMenuOpen(false);
            return;
        }


        setSelectedCampaigns([]);
        setCampaignSearch('');

        setFilteredReportsSms(null);

        handleFilter();

        setCampaignMenuOpen(false);
    };

    useEffect(() => {
        if (selectedCampaigns.length === 0) {
            setFilteredReportsSms(null);
        }
        if (selectedUsers.length === 0) {
            setFilteredReportsSms(null);
        }
    }, [selectedCampaigns, selectedUsers]);

    // Abre o cierra el menú de usuarios
    const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (userMenuOpen) {
            setUserMenuOpen(false);
            setUserAnchorEl(null);
        } else {
            setUserAnchorEl(event.currentTarget);
            setUserMenuOpen(true);
        }
    };

    const handleUserSelection = (user: User) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.some((u) => u.id === user.id)
                ? prevSelected.filter((u) => u.id !== user.id)
                : [...prevSelected, user]
        );
    };
    const handleSelectAllUsers = () => {
        setSelectedUsers(
            selectedUsers.length === users.length ? [] : users
        );
    };


    const handleClearUserSelection = () => {
        if (selectedSmsOption === "Global") {
            setUserMenuOpen(false);
            return;
        }

        setSelectedUsers([]);
        setUserSearch('');

        setFilteredReportsSms(null);

        handleFilter();

        setUserMenuOpen(false);
    };


    //Estado para submenu SMS
    const [smsMenuOpen, setSmsMenuOpen] = useState(false);
    const [smsAnchorEl, setSmsAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedSmsOption, setSelectedSmsOption] = useState<string>("SMS");
    const smsOptions = [
        "SMS",
        "Global",
        "Mensajes entrantes",
        "Mensajes enviados",
        "Mensajes no enviados",
        "Mensajes rechazados"
    ];
    //Función abrir /cerrar SMS
    const handleSmsClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setSmsAnchorEl(event.currentTarget);
        setSmsMenuOpen((prev) => !prev);
    };

    const handleSmsOptionSelect = (option: string) => {
        setSelectedSmsOption(option);
        setSmsMenuOpen(false);
        setSelectedDates(null);
        setReports(undefined);
    };


    const getUsers = async () => {
        try {
            const selectedRoom = JSON.parse(localStorage.getItem('selectedRoom') || '{}');
            const roomId = selectedRoom?.id;

            if (!roomId) return;

            const response = await axios.get(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_USERSUSE}`, {
                params: { roomId }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    useEffect(() => {
        getUsers();
        getCampaigns();
    }, []);

    const getCampaigns = async () => {
        try {
            const selectedRoom = JSON.parse(localStorage.getItem('selectedRoom') || '{}');
            const roomId = selectedRoom?.id;

            if (!roomId) return;

            const response = await axios.get(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_ALLCAMPAIGNSUSE}`, {
                params: { roomId }
            });
            setCampaigns(response.data);
        } catch (error) {
            console.error("Error al obtener campañas:", error);
        }
    };

    const formatDateToLocalString = (date: Date) => {
        return date.getFullYear() +
            '-' + (date.getMonth() + 1).toString().padStart(2, '0') +
            '-' + date.getDate().toString().padStart(2, '0') +
            ' ' + date.getHours().toString().padStart(2, '0') +
            ':' + date.getMinutes().toString().padStart(2, '0') +
            ':' + date.getSeconds().toString().padStart(2, '0');
    };

    useEffect(() => {
        handleReport();
    }, [currentPage]);



    const handleReport = async (dates?: DateRangeType) => {
        const selectedRoom = localStorage.getItem("selectedRoom");
        if (!selectedRoom) {
            console.error("No se encontró la sala seleccionada.");
            return;
        }

        const roomId = JSON.parse(selectedRoom).id;

        setLoading(true);
        try {
            const payload = {
                ReportType: selectedSmsOption,
                SubType: "",
                RoomId: roomId,
                StartDate: formatDateToLocalString(dates!.start),
                EndDate: formatDateToLocalString(dates!.end),
                CampaignIds: selectedCampaigns.length ? selectedCampaigns : null,
                UserIds: selectedUsers.length ? selectedUsers : null,
                Page: currentPage + 1
            };

            const response = await axios.post(
                `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_REPORT}`,
                payload
            );
            if (response.data) {
                settotalCount(response.data.totalCount);
                settotalXPage(response.data.totalXPage);
                if (selectedSmsOption === "Global") {
                    setReportData(transformPascalCase(response.data.reportGlobalResponseLists || [])); // para reporte Global
                } else {
                    setReportDatasms(response.data.reportDeliveryList || []);
                }
            }
            else {
                setReportData(null);
            }
        } catch (error) {
            console.error("Error al obtener el reporte:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / totalXPage);

    const handleFirstPage = () => setCurrentPage(0);
    const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    const handleLastPage = () => setCurrentPage(totalPages - 1);
    const transformPascalCase = (data: any[]) => {
        return data.map(item => ({
            Campaign: item.campaign,
            CampaignId: item.campaignId,
            Cost: item.cost,
            Date: item.date,
            Message: item.message,
            MessageId: item.messageId,
            Phone: item.phone,
            ReceivedAt: item.receivedAt,
            Room: item.room,
            Status: item.status,
            Type: item.type,
            User: item.user,
        }));
    };


    const handleDateSelectionApply = async (
        start: Date,
        end: Date,
        startHour: number,
        startMinute: number,
        endHour: number,
        endMinute: number
    ) => {

        const startDateTime = new Date(start);
        startDateTime.setHours(startHour);
        startDateTime.setMinutes(startMinute);
        startDateTime.setSeconds(0);

        const endDateTime = new Date(end);
        endDateTime.setHours(endHour);
        endDateTime.setMinutes(endMinute);
        endDateTime.setSeconds(0);

        const updatedDates = {
            start: startDateTime,
            end: endDateTime,
            startHour,
            startMinute,
            endHour,
            endMinute
        };

        setSelectedDates(updatedDates);
        setDatePickerOpen(false);
        setAnchorEl(null);
        setLoading(true);

        try {
            await handleReport(updatedDates);
        } catch (error) {
            console.error("Error al cargar reporte:", error);
            setReports(null);
        } finally {
            setLoading(false);
        }
    };



    {/*Spinner*/ }
    const handleExportClick = async (
        format: 'csv' | 'xlsx' | 'pdf',
        setThisLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setThisLoading(true);
        try {
            await new Promise<void>((resolve) => {
                exportReport2(format, () => {
                    resolve();
                });
            });
        } finally {
            setThisLoading(false);
        }
    };

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
            {/* Spinner de fondo */}
            <CircularProgress
                variant="determinate"
                value={100}
                size={24}
                thickness={8}
                sx={{
                    color: '#D6C4CB',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                }}
            />

            {/* Spinner (color principal) */}
            <CircularProgress
                size={24}
                thickness={8}
                sx={{
                    color: '#7B354D',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    animationDuration: '1s',
                }}
            />

            {/* Centro blanco */}
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


    const [isExportingCSV, setIsExportingCSV] = useState(false);
    const [isExportingXLSX, setIsExportingXLSX] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const anyExporting = isExportingCSV || isExportingXLSX || isExportingPDF;


    const exportReport2 = async (
        format: 'pdf' | 'xlsx' | 'csv',
        callback: () => void
    ) => {
        try {
            const selectedRoom = localStorage.getItem("selectedRoom");
            if (!selectedRoom) {
                return;
            }

            const roomId = JSON.parse(selectedRoom).id;
            const payload = {
                ReportType: selectedSmsOption,
                Format: format,
                RoomId: roomId,
                StartDate: formatDateToLocalString(selectedDates.start),
                EndDate: formatDateToLocalString(selectedDates.end),
                CampaignIds: selectedCampaigns.length ? selectedCampaigns : null,
                UserIds: selectedUsers.length ? selectedUsers : null,
                PageOrigin: "Reportes"
            };

            const response = await axios.post(
                `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GETREPORTS_ALL}`,
                payload
            );

            if (response.data?.success && response.data?.downloadUrl) {
                const fileUrl = `${import.meta.env.VITE_SMS_API_URL}${response.data.downloadUrl}`;

                // Paso 2: Descargar el archivo ya generado (GET)
                const fileResponse = await axios.get(fileUrl, { responseType: 'blob' });

                const blob = new Blob([fileResponse.data]);
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = response.data.fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                console.error("Error: No se generó el archivo.");
            }
        } catch (error) {
            console.error(`Error al exportar reporte a ${format}:`, error);
        } finally {
            callback();
        }
    };



    const exportReport = async (format: 'csv' | 'xlsx' | 'pdf',
        onComplete?: () => void
    ) => {
        const MAX_RECORDS_LOCAL = 100000;
        try {
            const dataToExport = selectedSmsOption === "Global"
                ? reportData
                : (reportData!.length > 0 ? reportData : reportDatasms);

            if ((dataToExport?.length ?? 0) <= MAX_RECORDS_LOCAL) {
                // === LOCAL EXPORT ===

                const cleanData = dataToExport!.map((item: ReporteGlobal | ReporteSMS) => {
                    const isGlobal = 'Cost' in item;

                    return isGlobal
                        ? {
                            Fecha: new Date((item as ReporteGlobal).Date).toLocaleString(),
                            Telefono: (item as ReporteGlobal).Phone,
                            Sala: (item as ReporteGlobal).Room,
                            Campana: (item as ReporteGlobal).Campaign,
                            Idcampana: (item as ReporteGlobal).CampaignId,
                            Usuario: (item as ReporteGlobal).User,
                            Idmensaje: (item as ReporteGlobal).MessageId,
                            Mensaje: (item as ReporteGlobal).Message,
                            Estado: (item as ReporteGlobal).Status,
                            Fecharecepcion: new Date((item as ReporteGlobal).SentAt ?? '').toLocaleString(),
                            Costo: (item as ReporteGlobal).Cost,
                            Tipo: (item as ReporteGlobal).Type,
                        }
                        : {
                            Fecha: new Date((item as ReporteSMS).sentAt ?? '').toLocaleString(),
                            Telefono: (item as ReporteSMS).phoneNumber,
                            Sala: (item as ReporteSMS).roomName,
                            Campana: (item as ReporteSMS).campaignName,
                            Idcampana: (item as ReporteSMS).campaignId,
                            Usuario: (item as ReporteSMS).userName,
                            Idmensaje: (item as ReporteSMS).messageId,
                            Mensaje: (item as ReporteSMS).message,
                            Estado: (item as ReporteSMS).status ?? '',
                            Fecharecepcion: '', // o repetir SentAt si aplica
                            Costo: '',
                            Tipo: '',
                        };
                });
                if (format === 'csv') {
                    const csv = unparse(cleanData);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    saveAs(blob, 'Reporte.csv');
                } else if (format === 'xlsx') {
                    const worksheet = XLSX.utils.json_to_sheet(cleanData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                    const blob = new Blob([excelBuffer], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    saveAs(blob, 'Reporte.xlsx');
                }
                else if (format === 'pdf') {
                    const input = tableRef.current;
                    if (!input) return;

                    // 🔄 Crear un clon oculto para capturar sin afectar la vista
                    const clone = input.cloneNode(true) as HTMLDivElement;
                    clone.style.position = 'absolute';
                    clone.style.top = '-9999px';
                    clone.style.left = '-9999px';
                    clone.style.overflow = 'visible';
                    clone.style.width = 'fit-content';
                    clone.style.maxWidth = 'none';

                    document.body.appendChild(clone);

                    const canvas = await html2canvas(clone, {
                        scale: 2,
                        useCORS: true
                    });

                    document.body.removeChild(clone); // 🧹 Limpieza

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    const imgProps = pdf.getImageProperties(imgData);
                    const imgWidth = pdfWidth;
                    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                    let position = 0;

                    if (imgHeight < pdfHeight) {
                        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    } else {
                        const canvasHeight = canvas.height;
                        const pageHeightPx = (pdfHeight * canvas.height) / imgHeight;

                        const pageCanvas = document.createElement('canvas');
                        const pageCtx = pageCanvas.getContext('2d')!;
                        pageCanvas.width = canvas.width;
                        pageCanvas.height = pageHeightPx;

                        let pageCount = 0;

                        for (let offset = 0; offset < canvasHeight; offset += pageHeightPx) {
                            pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
                            pageCtx.drawImage(canvas, 0, -offset);
                            const pageImg = pageCanvas.toDataURL('image/png');
                            if (pageCount > 0) pdf.addPage();
                            pdf.addImage(pageImg, 'PNG', 0, 0, imgWidth, pdfHeight);
                            pageCount++;
                        }
                    }

                    pdf.save('Reporte.pdf');
                    return;
                }


            }
            else {
                const payload = {
                    // Cambia esto según los filtros seleccionados
                    FechaInicio: selectedDates?.start,
                    FechaFin: selectedDates?.end,
                    Campanas: selectedCampaigns,
                    Usuarios: selectedUsers,
                    Tipo: selectedTab,
                    Formato: format
                };

                const headers = {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Headers": "X-Requested-With",
                    "Access-Control-Allow-Origin": "*"
                };

                const response = await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}` + `${import.meta.env.VITE_API_GET_REPORTS}`,
                    payload,
                    { headers }
                );

                // Crea un enlace para descargar el archivo
                const blob = new Blob([response.data], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Reporte.${format === 'xlsx' ? 'xlsx' : format}`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error) {
            console.error("Error exportando reporte:", error);
        }
        finally {
            onComplete?.();
        }
    };

    const handleFilter = () => {
        if (selectedSmsOption === "Global") {
            setFilteredReports((reportData ?? []) as ReporteGlobal[]);
            return;
        }

        // Para reportes SMS
        let resultado = [...(reportDatasms ?? [])];

        if (selectedUsers.length > 0) {
            const selectedUserIds = selectedUsers.map(u => u.id);
            resultado = resultado.filter(r => selectedUserIds.includes(r.UserId));
        }

        if (selectedCampaigns.length > 0) {
            const selectedCampaignIds = selectedCampaigns.map(c => c.id);
            resultado = resultado.filter(r => selectedCampaignIds.includes(r.campaignId));
        }
        if (resultado.length > 0) {

            setFilteredReportsSms(resultado as ReporteSMS[]);
        } else {
            setFilteredReportsSms(null);
        }

    };


    useEffect(() => {

        setSelectedCampaigns([]);
        setSelectedUsers([]);

        setReportData(undefined);
        setReportDatasms(undefined);
    }, [selectedSmsOption]);

    const getStatusText = (code: string | number): string => {
        switch (Number(code)) {
            case 0: return "Enviando";
            case 1: return "Entregado";
            case 2: return "No entregado";
            case 3: return "No enviado";
            case 4: return "Fallido";
            case 5: return "Excepción";
            case 6: return "Fuera de horario";
            default: return "Desconocido";
        }
    };


    return (
        <Box p={4} sx={{ padding: '10px', marginLeft: "35px", marginTop: '-60px', }}>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: '0px', mb: 1 }}>
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
                    Reportes
                </Typography>
            </Box>

            <Divider sx={{ mt: 2, mb: 0, maxWidth: "1140px" }} />
            <Tabs value={selectedTab} onChange={handleTabChange} >
                <Box
                    onClick={handleSmsClick}
                    sx={{
                        height: "43px",
                        minWidth: "109px",
                        px: 2,
                        fontFamily: "Poppins",
                        fontStyle: "normal",
                        fontWeight: "500",
                        opacity: 1,
                        fontSize: "16px",
                        lineHeight: "25px",
                        color: selectedSmsOption !== "SMS" || smsMenuOpen ? "#864058 !important" : "#574B4F !important",
                        backgroundColor: selectedSmsOption !== "SMS" || smsMenuOpen ? "#EDD5DC99" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        "&:hover": {
                            backgroundColor: "#EDD5DC99 !important",
                            color: "#864058 !important"
                        }
                    }} >
                    {selectedSmsOption === "SMS" ? "SMS" : `SMS - ${selectedSmsOption}`}
                </Box>

                <Popper open={smsMenuOpen} anchorEl={smsAnchorEl} placement="bottom-start">
                    <Paper sx={{ width: 379 }}>
                        {smsOptions
                            .filter((option) => option !== "SMS")
                            .map((option) => (

                                <MenuItem
                                    key={option}
                                    selected={option === selectedSmsOption}
                                    onClick={() => handleSmsOptionSelect(option)}
                                    sx={{
                                        fontFamily: "Poppins",
                                        color: "#84797C",
                                        fontSize: "16px",
                                        "&:hover": {
                                            backgroundColor: "#F2EBED"
                                        }
                                    }}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                    </Paper>
                </Popper>

            </Tabs>
            <Divider sx={{ mt: 1, mb: 2, marginTop: "-5px", maxWidth: "1140px" }} />

            {/* Filtros de Fecha, Campaña y Usuario */}
            <Box display="flex" gap={2} mb={4} marginBottom={2}>
                <Button disabled={selectedSmsOption === "SMS"} variant="outlined" sx={buttonStyle} onClick={handleDateClick}>
                    {selectedDates ? `${selectedDates.start.toLocaleDateString()} - ${selectedDates.end.toLocaleDateString()}` : 'FECHA'}
                </Button>

                {/* Mostrar solo si no es "Global" */}
                {selectedSmsOption !== "Global" && (
                    <>
                        <Button disabled={selectedSmsOption === "SMS"} variant="outlined" sx={buttonStyle} onClick={handleCampaignClick}>  {selectedCampaigns.length > 0
                            ? `${selectedCampaigns.length} campaña${selectedCampaigns.length > 1 ? 's' : ''}`
                            : 'CAMPAÑA'}</Button>
                        <Button disabled={selectedSmsOption === "SMS"} variant="outlined" sx={buttonStyle} onClick={handleUserClick}> {selectedUsers.length > 0
                            ? `${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''}`
                            : 'USUARIO'}</Button>
                    </>
                )}
            </Box>


            {/* Popper Campañas */}
            <Popper open={campaignMenuOpen} anchorEl={anchorElC} placement="bottom-start">
                <Paper sx={{ width: 280, p: 2 }}>
                    <TextField
                        placeholder="Buscar"
                        value={campaignSearch}
                        onChange={(e) => setCampaignSearch(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: campaignSearch ? '#7B354D' : '#9B9295',
                                '& fieldset': {
                                    borderColor: campaignSearch ? '#7B354D' : '#9B9295',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#7B354D',
                                },
                            },
                            input: {
                                fontFamily: 'Poppins',
                                height: '10px',
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: campaignSearch ? '#7B354D' : '#B0A7AA' }} />
                                </InputAdornment>
                            ),
                            endAdornment: campaignSearch && (
                                <IconButton onClick={() => setCampaignSearch('')}>
                                    <ClearIcon sx={{ color: '#7B354D' }} />
                                </IconButton>
                            ),
                        }}
                    />


                    {/* Línea horizontal*/}
                    <Divider sx={{ my: 1.5, bgcolor: '#dcdcdc', marginBottom: "10px", marginTop: "15px", }} />
                    <div style={{
                        position: 'absolute',
                        top: '74px',
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundColor: '#dcdcdc',
                    }}>
                    </div>

                    <Box sx={{ maxHeight: 140, overflowY: 'auto' }}>
                        {/* <MenuItem onClick={handleSelectAllCampaigns}>
                            <Checkbox checked={selectedCampaigns.length === campaigns.length}
                                sx={{
                                    marginBottom: "-10px",
                                    marginTop: "-10px",
                                    marginLeft: "-20px",
                                    color: '#6C3A52',
                                    '&.Mui-checked': { color: '#6C3A52' },

                                }}
                            />
                            <ListItemText primary="Seleccionar todo"
                                primaryTypographyProps={{ fontFamily: 'Poppins', fontWeight: "500" }}
                            />
                        </MenuItem> */}
                        {campaigns.filter(c => c.name.toLowerCase().includes(campaignSearch.toLowerCase())).map(c => (
                            <MenuItem key={c.id} disableRipple sx={{ height: "32px", marginLeft: "-12px" }}>
                                <Checkbox
                                    checked={selectedCampaigns.some(sc => sc.id === c.id)}
                                    onChange={() => handleCampaignSelection(c)}
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
                                    primary={c.name}
                                    primaryTypographyProps={{
                                        fontFamily: 'Poppins',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        color: selectedCampaigns.some(s => s.id === c.id) ? '#8F4E63' : '#786E71',
                                    }}
                                />
                            </MenuItem>
                        ))}

                    </Box>

                    {/* Línea horizontal arriba de los botones */}
                    <div style={{
                        position: 'absolute',
                        top: '245px', // ajusta según el contenido anterior
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundColor: '#dcdcdc',
                    }}>
                    </div>

                    <Box display="flex" justifyContent="space-between" sx={{ mt: 4.5 }}>
                        <Button variant="outlined" onClick={handleClearCampaignSelection}
                            sx={{
                                backgroundColor: '#FFFFFF',
                                color: '#833A53',
                                borderColor: '#CCCFD2',
                                width: '116px',
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '14px',
                                letterSpacing: "1.12px",
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#EDD5DC99',
                                }
                            }}

                        >LIMPIAR</Button>



                        <Button variant="contained"
                            onClick={() => {
                                setCampaignMenuOpen(false);
                                handleFilter();
                            }}
                            sx={{
                                backgroundColor: '#833A53',
                                color: '#FFFFFF',
                                borderColor: '#60293C',
                                width: '109px',
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '14px',
                                letterSpacing: "1.12px",
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#A54261',
                                }
                            }}
                        >APLICAR</Button>
                    </Box>
                </Paper>
            </Popper>

            {/* Popper Usuarios */}
            <Popper open={userMenuOpen} anchorEl={userAnchorEl} placement="bottom-start">
                <Paper sx={{ width: 280, p: 2 }}>
                    <TextField
                        placeholder="Buscar"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: userSearch ? '#7B354D' : '#9B9295',
                                '& fieldset': {
                                    borderColor: userSearch ? '#7B354D' : '#9B9295',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#7B354D',
                                },
                            },
                            input: {
                                fontFamily: 'Poppins',
                                height: '10px',
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: userSearch ? '#7B354D' : '#B0A7AA' }} />
                                </InputAdornment>
                            ),
                            endAdornment: userSearch && (
                                <IconButton onClick={() => setUserSearch('')}>
                                    <ClearIcon sx={{ color: '#7B354D' }} />
                                </IconButton>
                            ),
                        }}
                    />

                    {/* Línea horizontal*/}
                    <Divider sx={{ my: 1.5, bgcolor: '#dcdcdc', marginBottom: "10px", marginTop: "15px", }} />
                    <div style={{
                        position: 'absolute',
                        top: '74px',
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundColor: '#dcdcdc',
                    }}>
                    </div>

                    <Box sx={{ maxHeight: 140, overflowY: 'auto', }}>
                        {/* <MenuItem onClick={handleSelectAllUsers}>
                            <Checkbox checked={selectedUsers.length === users.length}
                                sx={{
                                    marginBottom: "-10px",
                                    marginTop: "-10px",
                                    marginLeft: "-20px",
                                    
                                    color: '#6C3A52',
                                    '&.Mui-checked': { color: '#6C3A52' },

                                }}
                            />
                            <ListItemText primary="Seleccionar todo"
                                primaryTypographyProps={{ fontFamily: 'Poppins' }}
                            />
                        </MenuItem> */}
                        {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                            <MenuItem key={u.id} onClick={() => handleUserSelection(u)}>
                                <Checkbox checked={selectedUsers.includes(u)}
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
                                        marginBottom: "-10px",
                                        marginTop: "-10px",
                                        marginLeft: "-20px",
                                        color: '#786E71',
                                        '&.Mui-checked': { color: '#6C3A52' },

                                    }}
                                />
                                <ListItemText primary={u.name}
                                    primaryTypographyProps={{
                                        fontFamily: 'Poppins',
                                        color: selectedUsers.includes(u) ? '#8F4E63' : '#786E71',
                                    }}
                                />
                            </MenuItem>
                        ))}
                    </Box>


                    <div style={{
                        position: 'absolute',
                        top: '245px',
                        left: 0,
                        right: 0,
                        height: '1px',
                        backgroundColor: '#dcdcdc',
                    }}>
                    </div>


                    <Box display="flex" justifyContent="space-between" sx={{ mt: 4.5 }}>
                        <Button variant="outlined" onClick={handleClearUserSelection}
                            sx={{
                                backgroundColor: '#FFFFFF',
                                color: '#833A53',
                                borderColor: '#CCCFD2',
                                width: '116px',
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '14px',
                                letterSpacing: "1.12px",
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#EDD5DC99',
                                }
                            }}

                        >LIMPIAR</Button>
                        <Button variant="contained"
                            onClick={() => {
                                setUserMenuOpen(false);
                                handleFilter();
                            }}
                            sx={{
                                backgroundColor: '#833A53',
                                color: '#FFFFFF',
                                borderColor: '#60293C',
                                width: '109px',
                                fontFamily: 'Poppins',
                                fontWeight: 500,
                                fontSize: '14px',
                                letterSpacing: "1.12px",
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#A54261',
                                }
                            }}

                        >APLICAR</Button>
                    </Box>
                </Paper>
            </Popper>

            <Divider sx={{ mb: 4, maxWidth: "1140px" }} />


            {selectedDates?.start && selectedDates?.end && (
                <Box display="flex" gap={2} alignItems="center" mb={3} sx={{ marginTop: "-15px", marginBottom: "20px", }}>
                    <Typography sx={{
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        color: "#6F565E",
                        fontSize: "14px",
                        marginLeft: "5px", position: "absolute"

                    }}>
                        {currentPage + 1}-{totalPages} de {totalCount}
                    </Typography>

                    <Box display="flex" gap={1} ml={10}>
                        {/* Primera página (doble flecha izquierda) */}
                        <IconButton sx={{ p: 0 }} disabled>
                            <Box display="flex" alignItems="center" >
                                <img src={backarrow} alt="<<" style={{ marginRight: '-16px', opacity: 0.4 }} />
                                <img src={backarrow} alt="<<" style={{ opacity: 0.4 }} />
                            </Box>
                        </IconButton>

                        {/* Página anterior (flecha izquierda) */}
                        <IconButton sx={{ p: 0 }} onClick={handleFirstPage} disabled={currentPage === 0}>
                            <img src={backarrow} alt="<" style={{ opacity: 0.4 }} />
                        </IconButton>

                        {/* Página siguiente (flecha derecha volteada) */}
                        <IconButton sx={{ p: 0 }} onClick={handlePreviousPage} disabled={currentPage === 0}>
                            <img
                                src={backarrow}
                                alt=">"
                                style={{ transform: 'scaleX(-1)', opacity: 0.4 }}
                            />
                        </IconButton>

                        {/* Última página (doble flecha derecha) */}
                        <Box display="flex" alignItems="center">
                            <IconButton sx={{ p: 0 }} onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>

                                <img
                                    src={backarrow}
                                    alt=">>"
                                    style={{ transform: 'scaleX(-1)', marginRight: '-4px', opacity: 0.4 }}
                                />
                            </IconButton>
                            <IconButton sx={{ p: 0 }} onClick={handleLastPage} disabled={currentPage >= totalPages - 1}>
                                <img
                                    src={backarrow}
                                    alt=">>"
                                    style={{ transform: 'scaleX(-1)', marginLeft: '-12px', opacity: 0.4 }}

                                />

                            </IconButton>
                        </Box>
                        {/* Botones de CSV / Excel y PDF */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", flex: 1, marginLeft: "810px", gap: 2 }}>
                            <IconButton sx={{ p: 0, opacity: !isExportingCSV && anyExporting ? 0.3 : 1 }}
                                onClick={() => handleExportClick('csv', setIsExportingCSV)}
                                disabled={anyExporting && !isExportingCSV}
                            >
                                <Tooltip title="Exportar a CSV" placement="top"
                                    arrow
                                    PopperProps={{
                                        modifiers: [
                                            {
                                                name: 'arrow',
                                                options: {
                                                    padding: 8,
                                                },
                                            },
                                        ],
                                    }}
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                fontFamily: 'Poppins',
                                                backgroundColor: '#322D2E',
                                                color: '#FFFFFF',
                                                fontSize: '12px',
                                                borderRadius: '4px',
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
                                    {isExportingCSV ? (
                                        <DualSpinner />
                                    ) : (
                                        <img src={IconCSV} alt="csv" style={{ transform: 'rotate(0deg)' }} />
                                    )}
                                </Tooltip>
                            </IconButton>

                            <IconButton sx={{ p: 0, opacity: !isExportingXLSX && anyExporting ? 0.3 : 1 }}
                                onClick={() => handleExportClick('xlsx', setIsExportingXLSX)}
                                disabled={anyExporting && !isExportingXLSX}
                            >


                                <Tooltip title="Exportar a Excel"
                                    placement="top"
                                    arrow

                                    PopperProps={{
                                        modifiers: [
                                            {
                                                name: 'arrow',
                                                options: {
                                                    padding: 8,
                                                },
                                            },
                                        ],
                                    }}
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                fontFamily: 'Poppins',
                                                backgroundColor: '#322D2E',
                                                color: '#FFFFFF',
                                                fontSize: '12px',
                                                borderRadius: '4px',
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
                                    {isExportingXLSX ? (
                                        <DualSpinner />
                                    ) : (
                                        <img src={IconExcel} alt="xlsx" style={{ transform: 'rotate(0deg)' }} />
                                    )}
                                </Tooltip>
                            </IconButton>


                            <IconButton sx={{ p: 0, opacity: !isExportingPDF && anyExporting ? 0.3 : 1 }}
                                onClick={() => handleExportClick('pdf', setIsExportingPDF)}
                                disabled={anyExporting && !isExportingPDF}
                            >
                                <Tooltip title="Exportar a PDF"
                                    placement="top"
                                    arrow

                                    PopperProps={{
                                        modifiers: [
                                            {
                                                name: 'arrow',
                                                options: {
                                                    padding: 8,
                                                },
                                            },
                                        ],
                                    }}
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                fontFamily: 'Poppins',
                                                backgroundColor: '#322D2E',
                                                color: '#FFFFFF',
                                                fontSize: '12px',
                                                borderRadius: '4px',
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
                                    {isExportingPDF ? (
                                        <DualSpinner />
                                    ) : (
                                        <img src={IconPDF} alt="pdf" style={{ transform: 'rotate(0deg)' }} />
                                    )}
                                </Tooltip>
                            </IconButton>



                        </Box>

                    </Box>
                </Box>
            )}



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
            ) : (reportData === undefined && reportDatasms === undefined) ? (

                <Box>

                    <Card sx={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 5, textAlign: "center",
                        maxWidth: "1140px", maxHeight: "400px", marginBottom: "150px"
                    }}>
                        <CardContent>
                            <Box component="img" src={BoxEmpty} alt="Caja Vacía" sx={{ width: '200px', height: "400px" }} />
                            <Typography mt={2} sx={{
                                color: '#8F4D63', fontWeight: '500', fontFamily: 'Poppins',
                                fontSize: '14px', position: "absolute", marginLeft: "-100px", marginTop: "-100px"
                            }}>
                                Seleccione un canal del menú superior para comenzar.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            ) : (reportData === null && reportDatasms === undefined) ? (

                <Box
                    sx={{
                        background: '#FFFFFF',
                        border: '1px solid #E6E4E4',
                        borderRadius: '8px',
                        width: '892px',
                        height: '512px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '20px'
                    }}
                >
                    <img src={boxopen} alt="No results" style={{ width: '150px', height: '150px', }} />
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
            ) : selectedSmsOption === "Global" ? (


                <Box
                    ref={tableRef}
                    sx={{
                        background: '#FFFFFF',
                        border: '1px solid #E6E4E4',
                        borderRadius: '8px',
                        width: '1140px',
                        maxWidth: '100%',
                        padding: '20px',
                        marginTop: '5px',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        height: '500px',
                        maxHeight: '100%',

                    }}


                >
                    <table style={{ maxWidth: "1140px", borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
                        {/* Encabezados */}
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E6E4E4', }}>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF',
                                    opacity: 1,
                                }}>
                                    Fecha
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Teléfono
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Sala
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Campaña
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Id de Campaña
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Usuario
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Id de Mensaje
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Mensaje
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Estado
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Fecha de Recepción
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Costo
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Tipo
                                </th>
                            </tr>
                        </thead>

                        {/* Datos */}
                        {Array.isArray(reportData) && reportData.length > 0 && (
                            <tbody>

                                {reportData.map((recarga, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #E6E4E4', height: '50px' }}>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',

                                        }}>
                                            {new Date(recarga.Date).toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.Phone}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.Room}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.Campaign}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.CampaignId}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.User}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.MessageId}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.Message}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {getStatusText(recarga.Status)}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {new Date(recarga.Date).toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.Cost ?? 0}
                                        </td>
                                        <td style={{
                                            padding: '10px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '13px',
                                            color: '#574B4F',
                                            letterSpacing: "0.03",
                                            textAlign: 'left',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {recarga.Type}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </Box>
            ) : selectedSmsOption === "Mensajes entrantes" ? (
                <Box
                    ref={tableRef}
                    sx={{
                        background: '#FFFFFF',
                        border: '1px solid #E6E4E4',
                        borderRadius: '8px',
                        width: '1140px',
                        maxWidth: '100%',
                        padding: '20px',
                        marginTop: '5px',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        height: '500px',
                        maxHeight: '100%',
                    }}
                >
                    <table style={{ maxWidth: "1140px", borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E6E4E4' }}>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF',
                                    opacity: 1,
                                }}>
                                    Fecha
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Teléfono
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Sala
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Campaña
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Id de campaña
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Usuario
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Id de mensaje
                                </th>
                                <th style={{
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Mensaje
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredReportsSms && filteredReportsSms.length > 0 ? filteredReportsSms : reportDatasms ?? []).map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E6E4E4', height: '50px' }}>
                                    <td style={cellStyle}>
                                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : ''}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.phoneNumber}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.roomName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.userName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.messageId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>


                    </table>
                </Box>

            ) : selectedSmsOption === "Mensajes enviados" ? (
                <Box
                    ref={tableRef}
                    sx={{
                        background: '#FFFFFF',
                        border: '1px solid #E6E4E4',
                        borderRadius: '8px',
                        width: '1140px',
                        maxWidth: '100%',
                        padding: '20px',
                        marginTop: '5px',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        height: '500px',
                        maxHeight: '100%',
                    }}
                >
                    <table style={{ width: '83%', borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E6E4E4' }}>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Fecha
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Teléfono de destinatario
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Campaña
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    ID de campaña
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Usuario
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Resultado
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Fecha de recepción
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    ID de mensaje
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Mensaje
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredReportsSms !== null ? filteredReportsSms : reportDatasms ?? []).map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E6E4E4', height: '50px' }}>
                                    <td style={cellStyle}>
                                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : ''}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.phoneNumber}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.userName}
                                    </td>
                                    <td style={cellStyle}>
                                        Envio Exitoso
                                    </td>
                                    <td style={cellStyle}>
                                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : ''}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.messageId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            ) : selectedSmsOption === "Mensajes no enviados" ? (
                <Box
                    ref={tableRef}
                    sx={{
                        background: '#FFFFFF',
                        border: '1px solid #E6E4E4',
                        borderRadius: '8px',
                        width: '1140px',
                        maxWidth: '100%',
                        padding: '20px',
                        marginTop: '5px',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        height: '500px',
                        maxHeight: '100%',
                    }}
                >
                    <table style={{ width: '83%', borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E6E4E4' }}>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Fecha
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Usuario
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Sala
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Campaña
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Teléfono de destinatario
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Resultado
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Razón
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    ID de mensaje
                                </th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Mensaje
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredReportsSms && filteredReportsSms.length > 0 ? filteredReportsSms : reportDatasms ?? []).map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E6E4E4', height: '50px' }}>
                                    <td style={cellStyle}>
                                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : ''}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.phoneNumber}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.userName}
                                    </td>
                                    <td style={cellStyle}>
                                        No enviado
                                    </td>
                                    <td style={cellStyle}>
                                        {item.status === '2'
                                            ? 'No entregado'
                                            : item.status === '3'
                                                ? 'Sin Carrier Disponible'
                                                : item.status}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : ''}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.messageId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>

            ) : selectedSmsOption === "Mensajes rechazados" ? (
                <Box
                    ref={tableRef}
                    sx={{
                        background: '#FFFFFF',
                        border: '1px solid #E6E4E4',
                        borderRadius: '8px',
                        width: '1140px',
                        maxWidth: '100%',
                        padding: '20px',
                        marginTop: '5px',
                        overflowX: 'auto',
                        overflowY: 'auto',
                        height: '500px',
                        maxHeight: '100%',
                    }}
                >
                    <table style={{ width: '83%', borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E6E4E4' }}>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Fecha</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Teléfono</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Usuario</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Sala</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Campaña</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Resultado</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Razón</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    ID de mensaje</th>
                                <th style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: "500",
                                    textAlign: 'left',
                                    padding: '10px',
                                    fontFamily: 'Poppins, sans-serif',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    fontSize: '13px',
                                    backgroundColor: '#FFFFFF'
                                }}>
                                    Mensaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredReportsSms !== null ? filteredReportsSms : reportDatasms ?? []).map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E6E4E4', height: '50px' }}>
                                    <td style={cellStyle}>
                                        {item.sentAt ? new Date(item.sentAt).toLocaleString() : ''}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.phoneNumber}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.userName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.roomName}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.campaignName}
                                    </td>
                                    <td style={cellStyle}>
                                        Error
                                    </td>
                                    <td style={cellStyle}>
                                        {item.status === '4'
                                            ? 'Fallo en envio de Carrier'
                                            : item.status === '5'
                                                ? 'Excepción no controlada'
                                                : item.status}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.messageId}
                                    </td>
                                    <td style={cellStyle}>
                                        {item.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            ) : (null)}



            {/* Componente de selección de fechas */}
            <DatePicker
                open={datePickerOpen}
                anchorEl={anchorEl}
                onApply={handleDateSelectionApply}
                onClose={handleCancelDatePicker}
            />
        </Box>
    );
};

// Estilo para los botones de filtros
const buttonStyle = {
    background: '#F6F6F6',
    border: '1px solid #C6BFC2',
    borderRadius: '18px',
    padding: '8px 16px',
    fontWeight: '500',
    letterSpacing: "1.12px",
    height: "36px",
    fontFamily: 'Poppins',
    color: '#8F4D63',
    opacity: 1,
    textTransform: 'none',
    '&:hover': {
        background: '#F2E9EC',
        border: '1px solid #BE93A066',
    },
    '&:active': {
        background: '#E6C2CD',
        border: '1px solid #BE93A0',
    }
};

const headerStyle = {
    textAlign: 'left',
    padding: '10px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
    color: '#330F1B',
    backgroundColor: '#FFFFFF',
};

const cellStyle = {
    padding: '10px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
    color: '#574B4F',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

export default Reports;
