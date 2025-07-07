import React, { useState, useEffect } from 'react';
import { IconButton, Button, Typography, Divider, Box, Popper, Paper, RadioGroup, FormControlLabel, Radio, MenuItem, Checkbox, ListItemText, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BoxEmpty from '../assets/Nousers.svg';
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import DatePicker from '../components/commons/DatePicker';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import CircularProgress from '@mui/material/CircularProgress';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import ClearIcon from '@mui/icons-material/Clear';
import IconLeft from '../assets/icon-punta-flecha-bottom.svg'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import seachicon from '../assets/icon-lupa.svg';
import iconclose from '../assets/icon-close.svg';
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';

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
        if (!datePickerOpen) { // Solo permite abrirlo si el DatePicker está cerrado
            setAnchorEl(anchorEl ? null : event.currentTarget);
        }
    };
    const [buttonText, setButtonText] = useState("SMS # CORTOS");
    const [selectedDates, setSelectedDates] = useState<{ start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number } | null>(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [data, setData] = useState(false); // Nueva variable para simular datos disponibles
    const [searchingData, setSearchingData] = useState(true);
    const handleDateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget); // Asegurar que el anchor es el botón de fecha
        setDatePickerOpen(true);
    };

    const handleCancelDatePicker = () => {
        setDatePickerOpen(false); // Cierra el DatePicker
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
    const [shouldFetch, setShouldFetch] = useState(false);
    const handleUserClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (userMenuOpen) {
            setUserMenuOpen(false);     // Cierra si ya está abierto
            setUserAnchorEl(null);      // Limpia el ancla
        } else {
            setUserAnchorEl(event.currentTarget);
            setUserMenuOpen(true);      // Abre si estaba cerrado
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
    };



    const handleCampaignClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (campaignMenuOpen) {
            setCampaignMenuOpen(false);  // Cierra si ya está abierto
            setAnchorElC(null);          // Limpia el ancla
        } else {
            setAnchorElC(event.currentTarget);
            setCampaignMenuOpen(true);   // Abre si estaba cerrado
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
    };


    const handleApplySelection = () => {
        setCampaignMenuOpen(false);
        setCampaignData(selectedCampaigns.map(c => c.name));
    };

    const handleApply = () => {
        // Cambiar el texto del botón basado en la selección
        if (selectedOption === "largo") {
            setButtonText("SMS # LARGOS");
        } else {
            setButtonText("SMS # CORTOS");
        }
        setAnchorEl(null); // Cerrar el Popper
    };

    const handleDateSelectionApply = (start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number) => {
        const newDates = { start, end, startHour, startMinute, endHour, endMinute };
        setSelectedDates(newDates);
        setDatePickerOpen(false);
        setAnchorEl(null);
        setSearchingData(false);
        setLoading(true);
        fetchData();
    };


    const formatDateRange = () => {
        if (!selectedDates) return 'FECHA';
        return `${format(selectedDates.start, "dd MMM", { locale: es })}, ${String(selectedDates.startHour).padStart(2, '0')}:${String(selectedDates.startMinute).padStart(2, '0')} - ${format(selectedDates.end, "d MMM", { locale: es })} ${String(selectedDates.endHour).padStart(2, '0')}:${String(selectedDates.endMinute).padStart(2, '0')}`;
    };

    const open = Boolean(anchorEl);
    const id = open ? 'sms-popper' : undefined;

    const fetchData = async () => {
        if (!selectedDates) return;

        setLoading(true);
        try {
            const request = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_USE}`;
            const selectedRoom = localStorage.getItem("selectedRoom");
            const roomId = selectedRoom ? JSON.parse(selectedRoom).id : null;
            const response = await axios.post(request, {
                "RoomId": roomId,
                "SmsType": selectedOption,
                "StartDate": selectedDates.start,
                "EndDate": selectedDates.end,
                "campaignIds": selectedCampaigns.map(c => c.id),
                "userIds": selectedUsers.map(u => u.id),
            });

            const result = response.data;

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


    useEffect(() => {
        const selectedRoom = localStorage.getItem("selectedRoom");
        if (!selectedRoom) return;

        const roomId = JSON.parse(selectedRoom).id;
        const smsType = selectedOption === "largo" ? 2 : 1; // 1 = corto, 2 = largo

        const fetchCampaigns = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_CAMPAIGNSUSE}`, {
                    params: { roomId, smsType }
                });
                setCampaigns(response.data || []);
            } catch (error) {
                console.error("Error al obtener campañas:", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_USERSUSE}`, {
                    params: { roomId }
                });
                setUsers(response.data || []);
            } catch (error) {
                console.error("Error al obtener usuarios:", error);
            }
        };

        fetchCampaigns();
        fetchUsers();
    }, [selectedOption]); // si el tipo de SMS cambia, vuelve a cargar campañas



    return (
        <Box sx={{ padding: '20px', maxWidth: '1180px', marginTop: "-80px", marginLeft: "16px", minHeight: "650px", overflow: "hidden" }}>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 500, fontFamily: 'Poppins', fontSize: '26px', color: '#330F1B' }}>
                    Uso
                </Typography>
            </Box>
            <Divider sx={{ marginTop: '10px', marginBottom: '20px' }} />

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
                                            fontWeight: selectedOption === 'largos' ? 500 : 'normal',
                                            color: selectedOption === 'largos' ? '#8F4D63' : '#574B4F',
                                        }}
                                    >
                                        SMS # largos
                                    </Typography>
                                }
                            />
                        </RadioGroup>
                        <Divider sx={{ width: 'calc(100% + 21px)', marginLeft: '-10px', mb: 2, mt: 0.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <SecondaryButton text='Limpiar' onClick={() => setSelectedOption("corto")} />
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
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
                                                src={seachicon}
                                                alt="Buscar"
                                                style={{
                                                    width: 24,
                                                    filter: campaignSearch ? 'invert(14%) sepia(58%) saturate(1253%) hue-rotate(316deg) brightness(90%) contrast(95%)' : 'none'
                                                }}
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
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />
                        <Box sx={{ height: '126px', overflowY: 'auto' }}>
                            {/* Checkbox de "Seleccionar todo" */}
                            {campaigns.filter(c => c.name.toLowerCase().includes(campaignSearch)).length > 0 && (
                                <MenuItem onClick={handleSelectAllCampaigns}
                                    sx={{ height: "32px", marginLeft: "-12px" }}
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
                                    sx={{ height: "32px", marginLeft: "-12px" }}
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
                                        }}
                                    />
                                </MenuItem>
                            ))}

                            {/* Mostrar mensaje si no hay resultados */}
                            {campaigns.filter((campaign) => campaign.name.toLowerCase().includes(campaignSearch)).length === 0 && (
                                <Box sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins" }}>
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
                                style={{ backgroundColor: '#8d406d', color: '#fff' }}
                            >
                                APLICAR
                            </Button>
                        </Box>
                    </Paper>
                </Popper>
                <Button variant="outlined" sx={buttonStyle} onClick={handleUserClick}>USUARIO</Button>
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
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
                                                src={seachicon}
                                                alt="Buscar"
                                                style={{
                                                    width: 24,
                                                    filter: userSearch ? 'invert(14%) sepia(58%) saturate(1253%) hue-rotate(316deg) brightness(90%) contrast(95%)' : 'none'
                                                }}
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
                        <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />
                        <Box sx={{ height: '126px', overflowY: 'auto' }}>
                            {users.filter((user) => user.name.toLowerCase().includes(userSearch)).length > 0 && (
                                <MenuItem onClick={handleSelectAllUsers}
                                    sx={{ height: "32px", marginLeft: "-12px" }}>
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
                                    sx={{ height: "32px", marginLeft: "-12px" }}
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
                                        }}
                                    />
                                </MenuItem>
                            ))}
                            {users.filter((user) => user.name.toLowerCase().includes(userSearch)).length === 0 && (
                                <Typography sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins" }}>
                                    No se encontraron resultados.
                                </Typography>
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
                                    handleApplySelection();
                                    fetchData();
                                }}
                                style={{ backgroundColor: '#8d406d', color: '#fff' }}
                            >
                                APLICAR
                            </Button>
                        </Box>
                    </Paper>
                </Popper>
            </Box>
            <DatePicker
                open={datePickerOpen}
                anchorEl={anchorEl}
                placement="bottom-start"
                onApply={handleDateSelectionApply}
                onClose={handleCancelDatePicker}
            />

            <Divider sx={{ marginBottom: '20px' }} />
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
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
                        <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#574B4F', opacity: 0.8 }}>
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
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                <Tooltip />

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
                        sx={{ width: '220px', height: 'auto' }} />

                    <Typography sx={{ marginTop: '10px', color: '#8F4D63', fontWeight: '500', fontFamily: 'Poppins' }}>
                        Seleccione un rango para comenzar.
                    </Typography>

                </Box>
            )}
        </Box>
    );
};

/* 🎨 Estilos */
const buttonStyle = {
    background: '#FFFFFF',
    border: '1px solid #C6BFC2',
    borderRadius: '18px',
    padding: '8px 16px',
    fontWeight: 500,
    color: '#330F1B',
    minWidth: "96px", height: "36px",
    textTransform: "uppercase",
    fontFamily: "Poppins",
    letterSpacing: "1.12px",
    opacity: 1,
    '&:hover': {
        background: '#F2E9EC',
        border: '1px solid #BE93A066',
    },
    '&:active': {
        background: '#E6C2CD',
        border: '1px solid #BE93A0',
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
    opacity: 0.8
};

const valueBoxStyle = {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600',
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
    width: '892px',
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
    width: '892px',
    height: '280px',
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
