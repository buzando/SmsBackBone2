import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Button, Typography, Divider, Box, Popper, Paper, RadioGroup, FormControlLabel, Radio, MenuItem, Checkbox, ListItemText, TextField, InputAdornment, Icon } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BoxEmpty from '../assets/Nousers.svg';
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import DatePicker from '../components/commons/DatePicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';
import NoResult from '../assets/NoResultados.svg';
import IconPDF from '../assets/IconPDF.svg';
import IconLeft from '../assets/icon-punta-flecha-bottom.svg'
import { useNavigate } from 'react-router-dom';
import axios from "../components/commons/AxiosInstance";
import seachicon from '../assets/icon-lupa.svg';
import Iconseachred from "../assets/Iconseachred.svg";
import iconclose from '../assets/icon-close.svg';
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { color } from 'd3-color';
import { overflow } from 'html2canvas/dist/types/css/property-descriptors/overflow';
import { useSelectedRoom } from "../hooks/useSelectedRoom";

interface UseResponse {
    creditsUsed: number;
    messagesSent: number;
    totalRecharges: number;
    lastRecharge: {
        credits: number;
        date: string;
    };
    chartData: { date: string; value: number }[];
}


const Use: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOption, setSelectedOption] = useState("corto");
    const [loading, setLoading] = useState(false);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (ignoreNextFilterClickRef.current) {
            ignoreNextFilterClickRef.current = false;
            return;
        }

        if (datePickerOpen) {
            setDatePickerOpen(false);
            return;
        }

        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const [noResults, setNoResults] = useState(false);
    const [buttonText, setButtonText] = useState("CORTOS");
    const [selectedDates, setSelectedDates] = useState<{ start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number } | null>(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [data, setData] = useState(false);
    const [searchingData, setSearchingData] = useState(true);
    const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        closeAllFilters();
        setAnchorEl(event.currentTarget);
        setDatePickerOpen(true);
    };


    const handleCancelDatePicker = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            ignoreNextFilterClickRef.current = false;
        }

        setDatePickerOpen(false);
        setAnchorEl(null);
    };

    const selectedRoom = useSelectedRoom();

    const fetchCampaigns = async (roomId: number) => {
        const smsType = selectedOption === "largo" ? 2 : 1; // 1 = corto, 2 = largo
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_GET_CAMPAIGNSUSE}`, {
                params: { roomId, smsType }
            });
            setCampaigns(response.data || []);
        } catch (error) {
            console.error("Error al obtener campañas:", error);
        }
    };

    const fetchUsers = async (roomId: number) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_GET_USERSUSE}`, {
                params: { roomId }
            });
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };


    useEffect(() => {
        if (!selectedRoom?.id) return;
        fetchUsers(selectedRoom.id);
        fetchCampaigns(selectedRoom.id);

    }, [selectedRoom?.id, selectedOption]);


    const closeAllFilters = () => {
        setAnchorEl(null);

        setDatePickerOpen(false);

        setCampaignMenuOpen(false);
        setAnchorElC(null);

        setUserMenuOpen(false);
        setUserAnchorEl(null);
    };

    const [campaignMenuOpen, setCampaignMenuOpen] = useState(false);
    const [anchorElC, setAnchorElC] = useState<HTMLElement | null>(null);
    const [selectedCampaigns, setSelectedCampaigns] = useState<{ id: number; name: string }[]>([]);
    const [campaignSearch, setCampaignSearch] = useState('');
    const [campaignData, setCampaignData] = useState<string[]>([]);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userAnchorEl, setUserAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<{ id: number; name: string }[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [detalleResumen, setDetalleResumen] = useState<{ title: string; value: string }[]>([]);
    const [dataChart, setdataChart] = useState<{ date: string; value: number }[]>([]);
    const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
    const [campaigns, setCampaigns] = useState<{ id: number; name: string }[]>([]);
    const ignoreNextFilterClickRef = useRef(false);


    const closeSmsPopper = () => setAnchorEl(null);

    const closeCampaignPopper = () => {
        setCampaignMenuOpen(false);
        setAnchorElC(null);
    };

    const closeUserPopper = () => {
        setUserMenuOpen(false);
        setUserAnchorEl(null);
    };

    const handleClearSms = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            ignoreNextFilterClickRef.current = true;
        }

        setSelectedOption("corto");
        setButtonText("CORTOS");
        closeSmsPopper();
    };

    const handleClearCampaigns = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        ignoreNextFilterClickRef.current = true;
        handleClearSelection();
        setCampaignSearch("");
        closeCampaignPopper();
    };

    const handleClearUsers = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        ignoreNextFilterClickRef.current = true;
        handleClearUserSelection();
        setUserSearch("");
        closeUserPopper();
    };


    const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        closeAllFilters();
        setCampaignMenuOpen(false);
        setDatePickerOpen(false);
        if (userMenuOpen) {
            setUserMenuOpen(false);
            setUserAnchorEl(null);
        } else {
            setUserAnchorEl(event.currentTarget);
            setUserMenuOpen(true);
        }
    };
    const navigate = useNavigate();

    const handleUserSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserSearch(event.target.value.toLowerCase());
    };

    const handleUserSelection = (user: { id: number; name: string }) => {
        const exists = selectedUsers.some((u) => u.id === user.id);
        setSelectedUsers(exists ? selectedUsers.filter((u) => u.id !== user.id) : [...selectedUsers, user]);
    };

    const handleSelectAllUsers = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users);
        }
    };


    const handleClearUserSelection = () => {
        setSelectedUsers([]);
        setUserMenuOpen(false);
        setUserAnchorEl(null);
        setUserSearch('');
    };



    const handleCampaignClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        closeAllFilters();
        setUserMenuOpen(false);
        setUserAnchorEl(null);

        setDatePickerOpen(false);

        if (campaignMenuOpen) {
            setCampaignMenuOpen(false);
            setAnchorElC(null);
        } else {
            setAnchorElC(event.currentTarget);
            setCampaignMenuOpen(true);
        }
    };


    const handleCampaignSelection = (campaign: { id: number; name: string }) => {
        const exists = selectedCampaigns.some((c) => c.id === campaign.id);
        setSelectedCampaigns(exists ? selectedCampaigns.filter((c) => c.id !== campaign.id) : [...selectedCampaigns, campaign]);
    };


    const handleSelectAllCampaigns = () => {
        if (selectedCampaigns.length === campaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(campaigns);
        }
    };

    const handleClearSelection = () => {
        setSelectedCampaigns([]);
        setCampaignMenuOpen(false);
        setAnchorElC(null);
        setCampaignSearch('');
    };


    const handleApplySelection = () => {
        setCampaignMenuOpen(false);
        setCampaignData(selectedCampaigns.map(c => c.name));
    };

    const handleApplyUsers = () => {
        setUserMenuOpen(false);
        setUserAnchorEl(null);

        ignoreNextFilterClickRef.current = true;
    };


    const handleApply = () => {
        if (selectedOption === "largo") {
            setButtonText("LARGOS");
        } else {
            setButtonText("CORTOS");
        }
        setAnchorEl(null);
    };

    const handleDateSelectionApply = (
        start: Date,
        end: Date,
        startHour: number,
        startMinute: number,
        endHour: number,
        endMinute: number
    ) => {
        const newDates = { start, end, startHour, startMinute, endHour, endMinute };

        setSelectedDates(newDates);
        setDatePickerOpen(false);
        setAnchorEl(null);
        setSearchingData(false);
        setLoading(true);

        fetchData(newDates);
    };



    const formatDateRange = () => {
        if (!selectedDates) return 'FECHA';

        return `${format(selectedDates.start, "dd MMM", { locale: es })} - ${format(selectedDates.end, "dd MMM", { locale: es })}`;
    };

    const open = Boolean(anchorEl);
    const id = open ? 'sms-popper' : undefined;

    const fetchData = async (
        datesOverride?: {
            start: Date;
            end: Date;
            startHour: number;
            startMinute: number;
            endHour: number;
            endMinute: number;
        }
    ) => {
        const datesToUse = datesOverride ?? selectedDates;

        // ✅ si no hay fechas o no hay sala, corta PERO apaga loading
        if (!datesToUse || !selectedRoom?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const request = `${import.meta.env.VITE_API_GET_USE}`;

            const response = await axios.post(request, {
                RoomId: selectedRoom.id,
                SmsType: selectedOption,
                StartDate: datesToUse.start,
                EndDate: datesToUse.end,
                campaignIds: selectedCampaigns.map((c) => c.id),
                userIds: selectedUsers.map((u) => u.id),
            });

            const result = response.data;

            const hasAnyData =
                (result?.creditsUsed ?? 0) > 0 ||
                (result?.messagesSent ?? 0) > 0 ||
                (result?.totalRecharges ?? 0) > 0 ||
                (result?.lastRecharge?.credits ?? 0) > 0 ||
                (Array.isArray(result?.chartData) &&
                    result.chartData.some((p: any) => (p?.value ?? 0) > 0));

            setNoResults(!hasAnyData);
            setData(hasAnyData);
            setSearchingData(false);

            setDetalleResumen([
                { title: "Total de créditos gastados:", value: result.creditsUsed.toLocaleString() },
                { title: "Total de mensajes enviados:", value: result.messagesSent.toLocaleString() },
                { title: "Total de recargas realizadas:", value: result.totalRecharges.toString() },
                {
                    title: "Última recarga realizada:",
                    value: `Créditos ${result.lastRecharge.credits.toLocaleString()}\nFecha ${result.lastRecharge.date}`,
                },
            ]);

            setdataChart(result.chartData);
            setData(true);
        } catch (error) {
            console.error("Error al cargar datos de uso:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1350px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 500, fontFamily: 'Poppins', fontSize: '26px', color: '#330F1B' }}>
                    Uso
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", backgroundColor: "#F2F2F2", height: "700px" }}>
                <Divider sx={{ marginTop: '15px', marginBottom: '15px' }} />

                {/* Botones de filtro */}
                <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {/* Botón con Popper */}
                    <Button
                        variant="outlined"
                        sx={buttonStyle}
                        onClick={handleClick}
                        aria-describedby={id}
                    >
                        {buttonText}
                    </Button>

                    {/* Popper para mostrar opciones */}
                    <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start">
                        <Paper sx={{
                            width: '280px',
                            height: '157px',
                            padding: '10px',
                            borderRadius: '8px',
                            boxShadow: '0px 8px 16px #00131F29',
                            border: "1px solid #C6BFC2"
                        }}>
                            <RadioGroup
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            >
                                <FormControlLabel
                                    value="corto"
                                    control={
                                        <Radio
                                            sx={{
                                                marginLeft: "8px",
                                                marginTop: "-3px",
                                                marginBottom: "-10px",
                                                fontFamily: "Poppins",
                                                color: "#000000",
                                                "&.Mui-checked": {
                                                    color: "#8F4D63",
                                                },
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 24,
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            sx={{
                                                marginBottom: "-8px",
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: selectedOption === 'corto' ? 500 : 'normal',
                                                color: selectedOption === 'corto' ? '#8F4D63' : '#574B4F',
                                            }}
                                        >
                                            SMS # cortos
                                        </Typography>
                                    }
                                />

                                <FormControlLabel
                                    value="largo"
                                    control={
                                        <Radio
                                            sx={{
                                                marginLeft: "8px",

                                                color: "#000000",
                                                "&.Mui-checked": {
                                                    color: "#8F4D63",
                                                },
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 24,
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            sx={{

                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: selectedOption === 'largo'
                                                    ? 500 : 'normal',
                                                color: selectedOption === 'largo' ? '#8F4D63' : '#574B4F',
                                            }}
                                        >
                                            SMS # largos
                                        </Typography>
                                    }
                                />
                            </RadioGroup>
                            <Divider sx={{ width: 'calc(100% + 21px)', marginLeft: '-10px', mb: 2, mt: 0.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <SecondaryButton text='Limpiar' onClick={handleClearSms} />
                                <MainButton text='Aplicar' onClick={handleApply} />
                            </Box>
                        </Paper>
                    </Popper>

                    <Button
                        variant="outlined"
                        sx={buttonStyle}
                        onClick={handleDateClick}
                    >
                        {formatDateRange()}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleCampaignClick}
                        sx={buttonStyle}
                    >
                        CAMPAÑA
                    </Button>
                    <Popper open={campaignMenuOpen} anchorEl={anchorElC} placement="bottom-start"
                        sx={{}}
                    >
                        <Paper
                            sx={{
                                padding: 1,
                                width: "290px",
                                height: "282px",
                                overflow: "hidden",
                                borderRadius: '12px',
                                boxShadow: '0px 8px 16px #00131F29',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1 }}>
                                <TextField
                                    placeholder="Buscar campaña"
                                    variant="outlined"
                                    fullWidth
                                    value={campaignSearch}
                                    onChange={(e) => setCampaignSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img
                                                    src={campaignSearch ? Iconseachred : seachicon}
                                                    alt="Buscar"
                                                    style={{ marginRight: 0, width: 24 }}
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: campaignSearch && (
                                            <IconButton onClick={() => setCampaignSearch('')} sx={{ marginRight: "-10px" }}>
                                                <img src={iconclose} alt="Limpiar" style={{ width: 24 }} />
                                            </IconButton>
                                        ),
                                        sx: {
                                            fontFamily: 'Poppins', fontSize: "16px", fontWeight: 400,
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
                            <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />
                            <Box sx={{ height: '126px', overflowY: 'auto' }}>
                                {/* Checkbox de "Seleccionar todo" */}
                                {campaigns.filter(c => c.name.toLowerCase().includes(campaignSearch)).length > 0 && (
                                    <MenuItem onClick={handleSelectAllCampaigns}
                                        sx={{ height: "30px", marginLeft: "-16px" }}
                                    >
                                        <Checkbox checked={selectedCampaigns.length === campaigns.length}
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
                                            } />

                                        <ListItemText primary="Seleccionar todo"
                                            primaryTypographyProps={{
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: selectedCampaigns.length === campaigns.length ? '#8F4E63' : '#786E71',
                                            }}
                                        />
                                    </MenuItem>
                                )}
                                {/* Lista de campañas */}
                                {campaigns.filter((campaign) => campaign.name.toLowerCase().includes(campaignSearch)).map((campaign) => (
                                    <MenuItem key={campaign.id} value={campaign.id} onClick={() => handleCampaignSelection(campaign)}
                                        sx={{ height: "30px", marginLeft: "-16px" }}
                                    >
                                        <Checkbox checked={selectedCampaigns.includes(campaign)}
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
                                            } />
                                        <ListItemText primary={campaign.name}
                                            primaryTypographyProps={{
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: selectedCampaigns.includes(campaign) ? '#8F4E63' : '#786E71',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        />
                                    </MenuItem>
                                ))}

                                {/* Mostrar mensaje si no hay resultados */}
                                {campaigns.filter((campaign) => campaign.name.toLowerCase().includes(campaignSearch)).length === 0 && (
                                    <Box sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins", mt: "95px" }}>
                                        <img src={NoResult} alt="No resultados" style={{ width: '120px', position: "absolute", marginLeft: "48px", marginTop: "-90px" }} />
                                        No se encontraron resultados.
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />
                            <Box display="flex" justifyContent="space-between" px={1} pb={1} gap={2.5}>
                                <Button
                                    variant="outlined"
                                    onClick={handleClearSelection}
                                    sx={{
                                        color: '#833A53',
                                        borderColor: '#CCCFD2',
                                        fontFamily: 'Poppins',
                                        letterSpacing: "1.12px",
                                        '&:hover': {
                                            backgroundColor: '#BE93A066',
                                            borderColor: '#CCCFD2',
                                        },
                                    }}
                                >
                                    LIMPIAR
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleApplySelection();
                                        fetchData();
                                    }}
                                    style={{ backgroundColor: '#833A53', color: '#fff' }}
                                >
                                    APLICAR
                                </Button>
                            </Box>
                        </Paper>
                    </Popper>
                    <Button
                        variant="outlined"
                        sx={buttonStyle}
                        onClick={handleUserClick}>
                        USUARIO
                    </Button>
                    {/* Popper de Usuarios */}
                    <Popper open={userMenuOpen} anchorEl={userAnchorEl} placement="bottom-start">
                        <Paper sx={{
                            padding: 1,
                            width: "290px",
                            height: "282px",
                            overflow: "hidden",
                            borderRadius: '12px',
                            boxShadow: '0px 8px 16px #00131F29',
                        }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1 }}>
                                <TextField
                                    placeholder="Buscar usuario"
                                    variant="outlined"
                                    fullWidth
                                    value={userSearch}
                                    onChange={handleUserSearchChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img
                                                    src={userSearch ? Iconseachred : seachicon}
                                                    alt="Buscar"
                                                    style={{ marginRight: 4, width: 24 }}
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: userSearch && (
                                            <IconButton onClick={() => setUserSearch('')} sx={{ marginRight: "-10px" }}>
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
                            <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />
                            <Box sx={{ height: '126px', overflowY: 'auto' }}>
                                {users.filter((user) => user.name.toLowerCase().includes(userSearch)).length > 0 && (
                                    <MenuItem onClick={handleSelectAllUsers}
                                        sx={{ height: "30px", marginLeft: "-16px" }}>
                                        <Checkbox checked={selectedUsers.length === users.length}
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
                                            } />
                                        <ListItemText
                                            primary="Seleccionar todo"
                                            primaryTypographyProps={{
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: selectedUsers.length === users.length ? '#8F4E63' : '#786E71',
                                            }}
                                        />

                                    </MenuItem>
                                )}
                                {users.filter((user) => user.name.toLowerCase().includes(userSearch)).map((user) => (
                                    <MenuItem key={user.id} value={user.id} onClick={() => handleUserSelection(user)}
                                        sx={{ height: "30px", marginLeft: "-16px" }}
                                    >
                                        <Checkbox checked={selectedUsers.includes(user)}
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
                                            } />
                                        <ListItemText primary={user.name}
                                            primaryTypographyProps={{
                                                fontFamily: 'Poppins',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: selectedUsers.includes(user) ? '#8F4E63' : '#786E71',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        />
                                    </MenuItem>
                                ))}
                                {users.filter((user) => user.name.toLowerCase().includes(userSearch)).length === 0 && (
                                    <Box sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins", mt: "95px" }}>
                                        <img src={NoResult} alt="No resultados" style={{ width: '120px', position: "absolute", marginLeft: "48px", marginTop: "-90px" }} />
                                        No se encontraron resultados.
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />
                            <Box display="flex" justifyContent="space-between" px={1} pb={1} gap={2.5}>
                                <Button variant="outlined" onClick={handleClearUserSelection}
                                    sx={{
                                        color: '#833A53',
                                        borderColor: '#CCCFD2',
                                        fontFamily: 'Poppins',
                                        letterSpacing: "1.12px",
                                        '&:hover': {
                                            backgroundColor: '#BE93A066',
                                            borderColor: '#CCCFD2',
                                        },
                                    }}
                                >
                                    LIMPIAR
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleApplyUsers();
                                        fetchData();
                                    }}
                                    style={{ backgroundColor: '#833A53', color: '#fff' }}
                                >
                                    APLICAR
                                </Button>
                            </Box>
                        </Paper>
                    </Popper>

                    {!loading && data && (
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                mb: "0px",
                                px: "10px",
                            }}
                        >
                            <Tooltip
                                title="Exportar a PDF"
                                placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: "arrow",
                                            options: { padding: 8 },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: "Poppins",
                                            backgroundColor: "#322D2E",
                                            color: "#FFFFFF",
                                            fontSize: "12px",
                                            borderRadius: "4px",
                                            padding: "6px 10px",
                                        },
                                    },
                                    arrow: {
                                        sx: { color: "#322D2E" },
                                    },
                                }}
                            >
                                <IconButton
                                    sx={{
                                        width: "40px",
                                        height: "40px",
                                        "&:hover": {
                                            backgroundColor: "transparent",
                                        },
                                    }}

                                >
                                    <img src={IconPDF} alt="pdf" style={{ width: 24 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                </Box>
                <DatePicker
                    open={datePickerOpen}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    onApply={handleDateSelectionApply}
                    onClose={handleCancelDatePicker}
                />


                <Divider sx={{ marginBottom: '20px', marginTop: "-5px" }} />
                {loading && (
                    <Box sx={loadingStyle}>
                        <CircularProgress sx={{ color: '#8F4D63' }} size={80} />
                    </Box>
                )}

                {!loading && data && (
                    <>
                        <Paper sx={paperStyle}>
                            <Typography variant="h6" sx={{
                                textAlign: 'left',
                                fontSize: '16px',
                                fontWeight: '500',
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '0px',
                                color: '#574B4F',
                                opacity: 1,
                                marginBottom: '10px'
                            }}>
                                Detalle de consumo
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 14, // controla separación entre elementos
                                }}
                            >
                                {detalleResumen.map((item, index) => (
                                    <Box key={index} sx={boxStyle}>
                                        <Typography sx={titleBoxStyle}>{item.title}</Typography>
                                        <Typography sx={valueBoxStyle}>{item.value}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                        <Paper sx={graphPaperStyle}>
                            <Typography variant="h6" sx={graphTitleStyle}>
                                Promedio de consumo
                            </Typography>
                            <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#574B4F', opacity: 0.8, fontFamily: "Poppins" }}>
                                Información de los últimos 20 días
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={dataChart}>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#833A53" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#833A53" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date"
                                        tick={{ fontFamily: 'Poppins', fontSize: "10px", fill: '#574B4F' }}
                                    />
                                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`}
                                        tick={{ fontFamily: 'Poppins', fontSize: "12px", fill: '#574B4F' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            fontFamily: 'Poppins',
                                            fontSize: '15px',
                                            color: '#574B4F',
                                            borderRadius: '6px', minWidth: "100px", minHeight: "40px",
                                            border: '1px solid #C6BFC2',
                                            boxShadow: '0px 8px 16px rgba(0, 19, 31, 0.16)',
                                        }}
                                        itemStyle={{
                                            fontFamily: 'Poppins',
                                            color: '#8F4D63',
                                        }}
                                        labelStyle={{
                                            fontFamily: 'Poppins',
                                            fontWeight: 500,
                                            color: '#574B4F',
                                        }}
                                    />

                                    {/* Línea con Sombreado */}
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#833A53"
                                        strokeWidth={2}
                                        fill="url(#colorGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>


                        </Paper>
                    </>
                )}
                {/* Imagen de vacío y mensaje */}
                {searchingData && (
                    <Box sx={emptyContainerStyle}>
                        <Box component="img" src={BoxEmpty} alt="Caja Vacía"
                            sx={{ width: '220px', height: 'auto', marginTop: "60px" }} />

                        <Typography sx={{ marginTop: '10px', color: '#8F4D63', fontWeight: '500', fontFamily: 'Poppins' }}>
                            Seleccione un rango para comenzar.
                        </Typography>

                    </Box>
                )}
                {!loading && noResults && (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            height: '320px',
                            backgroundColor: '#F2F2F2',
                            mt: 3,
                        }}
                    >
                        <img
                            src={NoResult}
                            alt="Sin información"
                            style={{
                                width: '280px',
                                height: '200px',
                                marginBottom: '16px',
                            }}
                        />

                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '14px',
                                color: '#7B354D',
                                fontWeight: 500,
                                textAlign: 'center',
                                maxWidth: '360px',
                            }}
                        >
                            No hay información para mostrar con los filtros seleccionados.
                        </Typography>
                    </Box>
                )}


            </Box>
        </Box>
    );
};

/* 🎨 Estilos */
const buttonStyle = {
    background: '#F6F6F6',
    border: '1px solid #C6BFC2',
    borderRadius: '18px',
    padding: '8px 28px',
    fontWeight: 500,
    color: '#330F1B',
    minWidth: "96px",
    height: "36px",
    textTransform: "uppercase",
    fontFamily: "Poppins",
    letterSpacing: "1.12px",
    opacity: 0.8,
    whiteSpace: "nowrap",

    '&:hover': {
        background: '#F2F2F2',
        border: '1px solid #8F4E63CC',
        color: "#8F4E63"
    },
    '&:active': {
        background: '#FFFFFF',
        border: '1px solid #8F4E63CC',
    }
};

const boxStyle = {
    background: '#D7CED21A',
    border: '1px solid #D6CED2',
    borderRadius: '10px',
    padding: '15px',
    width: '197px',
    height: '133px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const titleBoxStyle = {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: 'Poppins, sans-serif',
    lineHeight: '18px',
    letterSpacing: '0px',
    color: '#574B4F',
    opacity: 0.8, marginBottom: "10px"
};

const valueBoxStyle = {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 500,
    fontFamily: 'Poppins, sans-serif',
    lineHeight: '18px',
    letterSpacing: '0px',
    color: '#833A53',
    opacity: 1
};

const paperStyle = {
    background: '#FFFFFF',
    boxShadow: '4px 4px 4px #E1E4E6',
    border: '1px solid #E6E4E44D',
    padding: '20px',
    borderRadius: '10px',
    width: '1250px',
    height: '212px'
};

const emptyContainerStyle = { textAlign: 'center', marginTop: '50px' };
const loadingStyle = { display: 'flex', justifyContent: 'center', marginTop: '50px' };

const graphPaperStyle = {
    background: '#FFFFFF',
    boxShadow: '4px 4px 4px #E1E4E6',
    border: '1px solid #E6E4E44D',
    padding: '20px',
    borderRadius: '10px',
    width: '1250px',
    height: '330px',
    marginTop: '20px'
};

const graphTitleStyle = {
    textAlign: 'left',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: 'Poppins, sans-serif',
    letterSpacing: '0px',
    color: '#574B4F',
    opacity: 1,
    marginBottom: '5px'
};

export default Use;
