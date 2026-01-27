import React, { useState, useEffect, useRef } from "react";
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
import seachicon from '../assets/icon-lupa.svg';
import Iconseachred from "../assets/Iconseachred.svg";
import iconclose from '../assets/icon-close.svg';
import axios from "../components/commons/AxiosInstance";
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { unparse } from 'papaparse';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import ClickAwayListener from '@mui/material/ClickAwayListener';


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
    const campaignPopperRef = useRef<HTMLDivElement | null>(null);
    const userPopperRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
    };


    const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setCampaignMenuOpen(false);
        setUserMenuOpen(false);
        setDatePickerOpen(true);
    };

    // Cierra el DatePicker sin aplicar cambios
    const handleCancelDatePicker = () => {
        setDatePickerOpen(false);
    };



    // Abre o cierra el menú de campañas
    const handleCampaignClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setUserMenuOpen(false);
        setDatePickerOpen(false);
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


    // Abre o cierra el menú de usuarios
    const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setUserMenuOpen(false);
        setDatePickerOpen(false);
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

    const selectedRoom = useSelectedRoom();


    const getUsers = async () => {
        try {
            const selectedRoom = JSON.parse(localStorage.getItem('selectedRoom') || '{}');
            const roomId = selectedRoom?.id;

            if (!roomId) return;

            const response = await axios.get(`${import.meta.env.VITE_API_GET_USERSUSE}`, {
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

            const response = await axios.get(`${import.meta.env.VITE_API_GET_ALLCAMPAIGNSUSE}`, {
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
        handleReport(selectedDates!);
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
                CampaignIds: selectedCampaigns.length ? selectedCampaigns.map(c => c.id) : null,
                UserIds: selectedUsers.length ? selectedUsers.map(u => u.id) : null,
                Page: currentPage + 1
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_GET_REPORT}`,
                payload
            );
            if (response.data) {
                settotalCount(response.data.totalCount);
                settotalXPage(response.data.totalXPage);
                if (selectedSmsOption === "Global") {
                    setReportData(transformPascalCase(response.data.reportGlobalResponseLists || []));
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
    const handleNextPage = () => setCurrentPage(currentPage + 1);
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
                StartDate: formatDateToLocalString(selectedDates!.start),
                EndDate: formatDateToLocalString(selectedDates!.end),
                CampaignIds: selectedCampaigns.length ? selectedCampaigns : null,
                UserIds: selectedUsers.length ? selectedUsers : null,
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Cierra menú de campañas si se hace clic fuera del botón y fuera del Popper
            if (
                campaignMenuOpen &&
                anchorElC &&
                !anchorElC.contains(target) &&
                !campaignPopperRef.current?.contains(target)
            ) {
                setCampaignMenuOpen(false);
            }

            // Cierra menú de usuarios si se hace clic fuera del botón y fuera del Popper
            if (
                userMenuOpen &&
                userAnchorEl &&
                !userAnchorEl.contains(target) &&
                !userPopperRef.current?.contains(target)
            ) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [campaignMenuOpen, userMenuOpen, anchorElC, userAnchorEl]);


    return (
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1180px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
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
                    sx={{
                        color: '#5A2836',
                        fontFamily: 'Poppins',
                        fontSize: '26px',
                    }}
                >
                    Reportes
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px" }}>
                <Divider sx={{ mt: 2, mb: 0, maxWidth: "1180px" }} />
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
                <Divider sx={{ mt: 1, mb: 2, marginTop: "-5px", maxWidth: "1180px" }} />

                {/* Filtros de Fecha, Campaña y Usuario */}

                <Box display="flex" gap={2} mb={4} marginBottom={2}>
                    <Button disabled={selectedSmsOption === "SMS"} variant="outlined" sx={buttonStyle} onClick={handleDateClick}>
                        {selectedDates ? `${selectedDates.start.toLocaleDateString()} - ${selectedDates.end.toLocaleDateString()}` : 'FECHA'}
                    </Button>

                    {/* Mostrar solo si no es "Global" */}
                    {selectedSmsOption !== "Global" && (
                        <>
                            <Button disabled={selectedSmsOption === "SMS"} variant="outlined" sx={buttonStyle} onClick={handleCampaignClick}>
                                {selectedCampaigns.length > 0
                                    ? `${selectedCampaigns.length} campaña${selectedCampaigns.length > 1 ? 's' : ''}`
                                    : 'CAMPAÑA'}
                            </Button>
                            <Button disabled={selectedSmsOption === "SMS"} variant="outlined" sx={buttonStyle} onClick={handleUserClick}>
                                {selectedUsers.length > 0
                                    ? `${selectedUsers.length} usuario${selectedUsers.length > 1 ? 's' : ''}`
                                    : 'USUARIO'}
                            </Button>
                        </>
                    )}
                </Box>

                {/* Popper Campañas */}
                <Popper open={campaignMenuOpen} anchorEl={anchorElC} placement="bottom-start">
                    <Paper ref={campaignPopperRef} sx={{
                        padding: 1,
                        width: "280px",
                        height: "282px",
                        overflowY: "hidden",
                        borderRadius: '12px',
                        boxShadow: '0px 8px 16px #00131F29', overflowX: "hidden"
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1 }}>
                            <TextField
                                placeholder="Buscar"
                                value={campaignSearch}
                                onChange={(e) => setCampaignSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <img
                                                src={campaignSearch ? Iconseachred : seachicon}
                                                alt="Buscar"
                                                style={{ width: 24 }}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: campaignSearch && (
                                        <IconButton onClick={() => setCampaignSearch('')}>
                                            <img src={iconclose} alt="Limpiar" style={{ width: 24 }} />
                                        </IconButton>
                                    ),
                                    sx: {
                                        fontFamily: 'Poppins',
                                        color: campaignSearch ? '#7B354D' : '#000',
                                    }
                                }}
                                inputProps={{
                                    style: {
                                        fontFamily: 'Poppins',
                                        color: campaignSearch ? '#7B354D' : '#000',
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
                                            borderColor: campaignSearch ? '#7B354D' : '#9B9295',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: campaignSearch ? '#7B354D' : '#9B9295',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: campaignSearch ? '#7B354D' : '#9B9295',
                                        },
                                    },
                                }}
                            />
                        </Box>

                        {/* Línea horizontal*/}
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                        <Box sx={{ height: '126px', overflowY: 'auto' }}>
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
                                <MenuItem key={c.id} disableRipple
                                    sx={{ height: "32px", marginLeft: "-12px" }}>
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
                            {campaigns.filter((c) => c.name.toLowerCase().includes(campaignSearch)).length === 0 && (
                                <Box sx={{ marginTop: "60px" }}>
                                    <Typography sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins" }}>
                                        No se encontraron resultados.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Línea horizontal arriba de los botones */}
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                        <Box display="flex" justifyContent="space-between" px={1} pb={1} gap={2.5}>
                            <Button variant="outlined" onClick={() => {
                                setSelectedCampaigns([]);
                                setCurrentPage(0);
                                if (selectedDates) {
                                    handleReport(selectedDates);
                                }
                                setCampaignMenuOpen(false);
                            }}
                                sx={{
                                    backgroundColor: '#FFFFFF',
                                    color: '#833A53',
                                    borderColor: '#CCCFD2',
                                    width: '116px', height: "36px",
                                    fontFamily: 'Poppins',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    letterSpacing: "1.12px",
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#EDD5DC99',
                                    }
                                }}
                            >LIMPIAR
                            </Button>



                            <Button variant="contained"
                                onClick={() => {
                                    setCurrentPage(0);
                                    setCampaignMenuOpen(false);
                                    if (selectedDates) {
                                        handleReport(selectedDates);
                                    }
                                }}
                                sx={{
                                    backgroundColor: '#833A53',
                                    color: '#FFFFFF',
                                    borderColor: '#60293C',
                                    width: '109px', height: "36px",
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
                    <Paper
                        sx={{
                            padding: 1,
                            width: "280px",
                            height: "282px",
                            overflowY: "hidden",
                            borderRadius: '12px',
                            boxShadow: '0px 8px 16px #00131F29', overflowX: "hidden"
                        }}
                        ref={userPopperRef}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1 }}>
                            <TextField
                                placeholder="Buscar"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <img
                                                src={userSearch ? Iconseachred : seachicon}
                                                alt="Buscar"
                                                style={{ width: 24 }}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: userSearch && (
                                        <IconButton onClick={() => setUserSearch('')}>
                                            <img src={iconclose} alt="Limpiar" style={{ width: 24 }} />
                                        </IconButton>
                                    ),
                                    sx: {
                                        fontFamily: 'Poppins',
                                        color: userSearch ? '#7B354D' : '#000',
                                    }
                                }}
                                inputProps={{
                                    style: {
                                        fontFamily: 'Poppins',
                                        color: userSearch ? '#7B354D' : '#000',
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
                                            borderColor: userSearch ? '#7B354D' : '#9B9295',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: userSearch ? '#7B354D' : '#9B9295',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: userSearch ? '#7B354D' : '#9B9295',
                                        },
                                    },
                                }}
                            />
                        </Box>
                        {/* Línea horizontal*/}
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                        <Box sx={{ height: '126px', overflowY: 'auto' }}>
                            {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                                <MenuItem key={u.id} onClick={() => handleUserSelection(u)}
                                    sx={{ height: "32px", marginLeft: "-12px" }}>
                                    <Checkbox
                                        checked={selectedUsers.includes(u)}
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
                                    <ListItemText primary={u.name}
                                        primaryTypographyProps={{
                                            fontFamily: 'Poppins',
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            color: selectedUsers.includes(u) ? '#8F4E63' : '#786E71',
                                        }}
                                    />
                                </MenuItem>
                            ))}
                            {users.filter((c) => c.name.toLowerCase().includes(userSearch)).length === 0 && (
                                <Box sx={{ marginTop: "60px" }}>
                                    <Typography sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins" }}>
                                        No se encontraron resultados.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                        <Box display="flex" justifyContent="space-between" px={1} pb={1} gap={2.5}>
                            <Button variant="outlined" onClick={() => {
                                setSelectedUsers([]);
                                setCurrentPage(0);
                                if (selectedDates) {
                                    handleReport(selectedDates);
                                }
                                setUserMenuOpen(false);
                            }}

                                sx={{
                                    backgroundColor: '#FFFFFF',
                                    color: '#833A53',
                                    borderColor: '#CCCFD2',
                                    width: '116px', height: "36px",
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
                                    setCurrentPage(0);
                                    setUserMenuOpen(false);
                                    if (selectedDates) {
                                        handleReport(selectedDates);
                                    }

                                }}
                                sx={{
                                    backgroundColor: '#833A53',
                                    color: '#FFFFFF',
                                    borderColor: '#60293C',
                                    width: '109px', height: "36px",
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

                <Divider sx={{ mb: 4, maxWidth: "1180px" }} />


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
                            <IconButton sx={{ p: 0 }} onClick={handleFirstPage} disabled={currentPage === 0}>
                                <Box display="flex" alignItems="center" >
                                    <img src={backarrow} alt="<<" style={{ marginRight: '-16px', opacity: currentPage === 0 ? 0.1 : 3 }} />
                                    <img src={backarrow} alt="<<" style={{ opacity: currentPage === 0 ? 0.1 : 3 }} />
                                </Box>
                            </IconButton>

                            {/* Página anterior (flecha izquierda) */}
                            <IconButton sx={{ p: 0 }} onClick={handlePreviousPage} disabled={currentPage === 0}>
                                <img src={backarrow} alt="<" style={{ opacity: currentPage === 0 ? 0.1 : 3 }} />
                            </IconButton>

                            {/* Página siguiente (flecha derecha volteada) */}
                            <IconButton sx={{ p: 0 }} onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                                <img
                                    src={backarrow}
                                    alt=">"
                                    style={{ transform: 'scaleX(-1)', opacity: currentPage >= totalPages - 1 ? 0.1 : 3 }}
                                />
                            </IconButton>

                            {/* Última página (doble flecha derecha) */}
                            <Box display="flex" alignItems="center">
                                <IconButton sx={{ p: 0 }} onClick={handleLastPage} disabled={currentPage >= totalPages - 1}>

                                    <img
                                        src={backarrow}
                                        alt=">>"
                                        style={{ transform: 'scaleX(-1)', marginRight: '-4px', opacity: currentPage >= totalPages - 1 ? 0.1 : 3 }}
                                    />
                                </IconButton>
                                <IconButton sx={{ p: 0 }} onClick={handleLastPage} disabled={currentPage >= totalPages - 1}>
                                    <img
                                        src={backarrow}
                                        alt=">>"
                                        style={{ transform: 'scaleX(-1)', marginLeft: '-12px', opacity: currentPage >= totalPages - 1 ? 0.1 : 1 }}


                                    />

                                </IconButton>
                            </Box>
                            {/* Botones de CSV / Excel y PDF */}
                            <Box sx={{ display: "flex", justifyContent: "flex-end", flex: 1, marginLeft: "770px", gap: 2 }}>
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
                            maxWidth: "1180px", maxHeight: "400px", marginBottom: "150px"
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
                            width: '1180px',
                            maxWidth: '100%',
                            padding: '20px',
                            marginTop: '5px',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            height: '360px',
                            maxHeight: '100%',

                        }}


                    >
                        <table style={{ maxWidth: "1180px", borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
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
                            width: '1180px',
                            maxWidth: '100%',
                            padding: '20px',
                            marginTop: '5px',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            height: '360px',
                            maxHeight: '100%',
                        }}
                    >
                        <table style={{ maxWidth: "1180px", borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
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
                            width: '1180px',
                            maxWidth: '100%',
                            padding: '20px',
                            marginTop: '5px',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            height: '360px',
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
                            width: '1180px',
                            maxWidth: '100%',
                            padding: '20px',
                            marginTop: '5px',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            height: '360px',
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
                            width: '1180px',
                            maxWidth: '100%',
                            padding: '20px',
                            marginTop: '5px',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            height: '360px',
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

            </Box>

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
    fontWeight: 500,
    letterSpacing: "1.12px",
    height: "36px",
    fontFamily: 'Poppins',
    color: '#330F1B',
    opacity: 1,
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
