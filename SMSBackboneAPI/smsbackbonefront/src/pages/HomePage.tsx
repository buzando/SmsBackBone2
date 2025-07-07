import React, { useState, useEffect } from 'react';
import { CircularProgress, Button, Grid, Paper, Typography, IconButton, Modal, Box, TextField, Checkbox, FormControlLabel, Divider, InputAdornment, Tooltip, tooltipClasses, TooltipProps, Popper, Radio, RadioGroup } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import { fontFamily, height, letterSpacing, styled, textTransform, width } from '@mui/system';
import { ReactNode } from 'react';
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import BoxEmpty from '../assets/Nousers.svg';
import smsico from '../assets/Icon-sms.svg'
import welcome from '../assets/icon-welcome.svg'
import fast from '../assets/icon-fastsend.svg'
import Secondarybutton from '../components/commons/SecondaryButton'
import axios from "axios";

interface CampaignKPIResponse {
    activeCampaigns: number;
    sentToday: number;
    averagePerDay: number;
    creditConsumption: number;
}


const HomePage: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [phoneNumbers, setPhoneNumbers] = useState([""]);
    const [errors, setErrors] = useState<boolean[]>(Array(phoneNumbers.length).fill(false)); // Array de errores
    const [selectedOption, setSelectedOption] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const phoneRegex = /^[0-9]{10}$/;
    const [showData, setShowData] = useState(false);
    const [openControlModal, setOpenControlModal] = useState(false);
    const [enableButtons, setenableButtons] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState({
        campanasActivas: true,
        smsEnviados: true,
        promedioSMS: true,
        consumoCreditos: true,
        listadoCampanas: true,
        resultadosEnvio: true,
    });
    const [firstname, setFirstname] = useState<string>('');
    const [kpi, setKpi] = useState<CampaignKPIResponse | null>(null);
    const [dataOptions, setDataOptions] = useState<
        { title: string; value: string }[]
    >([]);
    const [campaigns, setcampaigns] = useState<
        { name: string; numeroInicial: number; numeroActual: number }[]
    >([]);
    const [data, setdata] = useState<
        { label: string; value: number; color: string; tooltip: string }[]
    >([]);
    const hasChanges = settings.listadoCampanas || settings.resultadosEnvio;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({
            ...settings,
            [event.target.name]: event.target.checked,
        });
    };

    const handleApplyFilters = async () => {
        const selectedRoom = localStorage.getItem("selectedRoom");
        const roomId = selectedRoom ? JSON.parse(selectedRoom).id : null;

        if (!roomId) return;

        const smsType = selectedOption === 'corto' ? 1 : 2;

        const payload = {
            roomId,
            smsType,
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_DASHBOARDINFO}`, payload);
            const data: CampaignKPIResponse = response.data;

            // Aquí ya no dependes del estado selectedOption
            setKpi(data);
            setDataOptions([
                { title: "Campañas activas", value: (data?.activeCampaigns ?? 0).toString() },
                { title: "SMS enviados hoy", value: (data?.sentToday ?? 0).toString() },
                { title: "Promedio SMS por día", value: `${data?.averagePerDay ?? 0}` }, // sin el %
                { title: "Consumo de créditos", value: `$${(data?.creditConsumption ?? 0).toFixed(2)}` }
            ]);

            setcampaigns(
                response.data.campaigns?.map(c => ({
                    name: c.name,
                    numeroInicial: c.numeroInicial,
                    numeroActual: c.numeroActual
                })) ?? []
            );
            const total = response.data.deliveredCount +
                response.data.notDeliveredCount +
                response.data.waitingCount +
                response.data.failedCount +
                response.data.rejectedCount +
                response.data.notSentCount +
                response.data.exceptionCount +
                response.data.respondedRecords;

            setdata([
                {
                    label: "Recepción",
                    value: total > 0 ? +(response.data.respondedRecords / total * 100).toFixed(1) : 0,
                    color: "#9C6ADE",
                    tooltip: `${response.data.respondedRecords} recibidos (${((response.data.respondedRecords / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "Entregados",
                    value: total > 0 ? +(response.data.deliveredCount / total * 100).toFixed(1) : 0,
                    color: "#4CAF50",
                    tooltip: `${response.data.deliveredCount} entregados (${((response.data.deliveredCount / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "No recibidos",
                    value: total > 0 ? +(response.data.notDeliveredCount / total * 100).toFixed(1) : 0,
                    color: "#FFD700",
                    tooltip: `${response.data.notDeliveredCount} no recibidos (${((response.data.notDeliveredCount / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "En espera",
                    value: total > 0 ? +(response.data.waitingCount / total * 100).toFixed(1) : 0,
                    color: "#00BFFF",
                    tooltip: `${response.data.waitingCount} en espera (${((response.data.waitingCount / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "Entregados-Falla",
                    value: total > 0 ? +(response.data.failedCount / total * 100).toFixed(1) : 0,
                    color: "#FFB6C1",
                    tooltip: `${response.data.failedCount} con falla (${((response.data.failedCount / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "Rechazados",
                    value: total > 0 ? +(response.data.rejectedCount / total * 100).toFixed(1) : 0,
                    color: "#C75C3B",
                    tooltip: `${response.data.rejectedCount} rechazados (${((response.data.rejectedCount / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "No enviados",
                    value: total > 0 ? +(response.data.notSentCount / total * 100).toFixed(1) : 0,
                    color: "#B0BEC5",
                    tooltip: `${response.data.notSentCount} no enviados (${((response.data.notSentCount / total) * 100).toFixed(1)}%)`
                },
                {
                    label: "Excepción",
                    value: total > 0 ? +(response.data.exceptionCount / total * 100).toFixed(1) : 0,
                    color: "#4CAF50",
                    tooltip: `${response.data.exceptionCount} con excepción (${((response.data.exceptionCount / total) * 100).toFixed(1)}%)`
                }
            ]);



        } catch (error) {
            console.error("Error al obtener KPI:", error);
        }
    };


    const handleApply = () => {
        setShowData(true);
        setAnchorEl(null);
        setenableButtons(true);
        handleApplyFilters();
    };
    const handleClear = () => {
        setSelectedOption('');
        setShowData(false);
        setAnchorEl(null);
        setenableButtons(false);
    };


    const isPopperOpen = Boolean(anchorEl);
    const id = isPopperOpen ? 'popper-id' : undefined;


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };


    // Manejar cambios en los inputs
    const handleInputChange = (index: number, value: string) => {
        const updatedPhones = [...phoneNumbers];
        updatedPhones[index] = value;
        setPhoneNumbers(updatedPhones);

        // Validar el número y actualizar errores
        const newErrors = [...errors];
        newErrors[index] = !phoneRegex.test(value);
        setErrors(newErrors);
    };

    // Agregar un nuevo input
    const handleAddInput = () => {
        setPhoneNumbers([...phoneNumbers, ""]);
        setErrors([...errors, false]); // Nuevo campo sin error
    };

    // Eliminar un input (mínimo 1)
    const handleRemoveInput = (index: number) => {
        if (phoneNumbers.length > 1) {
            const updatedPhones = phoneNumbers.filter((_, i) => i !== index);
            const updatedErrors = errors.filter((_, i) => i !== index);
            setPhoneNumbers(updatedPhones);
            setErrors(updatedErrors);
        }
    };

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        // Expresión regular para solo permitir letras, números y espacios
        const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');

        if (filteredValue.length <= 160) {
            setMessage(filteredValue);
        }
    };



    const isFormValid = phoneNumbers.every(phone => phoneRegex.test(phone)) && message.trim().length > 0;

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 2000); // Simula la carga por 2 segundos
        setOpenControlModal(false);
    };


    const CustomTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} arrow placement="bottom" />
    ))(() => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#FFFFFF !important',
            color: '#574B4F !important',
            fontSize: '12px !important',
            border: '1px solid #E0E0E0 !important',
            borderRadius: '4px !important',
            padding: '8px !important',
            maxWidth: '250px !important',
            whiteSpace: 'pre-line !important',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1) !important',
        },
        [`& .${tooltipClasses.arrow}`]: {
            color: '#E0E0E0 !important',
        },
    }));


    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (!userData) {
            navigate("/login");
            return;
        }

        const parsedUserData = JSON.parse(userData);
        setFirstname(parsedUserData.firstName);
    }, []);

    return (
        <div style={{
            padding: '30px',
            maxWidth: "1140px",
            height: '1000px',
            backgroundColor: '#F2F2F2',
            display: 'flex',
            flexDirection: 'column',
            marginTop: "-70px",

        }}>

            {/* Header con título */}
            <Typography variant="h4" component="h1" style={{
                textAlign: 'left', color: '#330F1B', fontFamily: "Poppins",
                fontSize: "26px", opacity: 1, marginTop: "-10px", marginLeft: "15px"
            }}>
                {firstname ? `¡Bienvenido de vuelta, ${firstname}!` : '¡Bienvenido!'}
            </Typography>
            <Typography variant="body1" style={{
                textAlign: 'left', color: '#574B4F', fontFamily: "Poppins",
                fontSize: "18px", opacity: 1, marginBottom: '20px', marginLeft: "15px"
            }}>
                Te mostramos el resumen de tu actividad más reciente.
            </Typography>

            {/* Contenedor de botones alineados */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                {/* Botón de filtro */}
                <Button
                    variant="outlined"
                    sx={buttonStyle}
                    onClick={handleClick}
                    aria-describedby={id}

                >
                    {selectedOption ? `SMS # ${selectedOption.toUpperCase()}` : "CANAL"}
                </Button>
                <Popper id={id} open={isPopperOpen} anchorEl={anchorEl} placement="bottom-start">
                    <Paper sx={{
                        fontFamily: "Poppins",
                        width: '280px',
                        height: '157px',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0px 8px 16px #00131F29',
                        border: "1px solid #C6BFC2",

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
                                            color: selectedOption === 'corto' ? '#8F4D63' : '#807D7E',
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
                                            fontWeight: selectedOption === 'largo' ? 500 : 'normal',
                                            color: selectedOption === 'largo' ? '#8F4D63' : '#807D7E',
                                        }}
                                    >
                                        SMS # largos
                                    </Typography>
                                }
                            />
                        </RadioGroup>
                        <Divider sx={{ width: 'calc(100% + 21px)', marginLeft: '-10px', mb: 2, mt: 0.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                            <SecondaryButton text='Limpiar' onClick={handleClear} />
                            <MainButton text='Aplicar' onClick={handleApply} />
                        </Box>
                    </Paper>
                </Popper>

                {!!enableButtons && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => navigate('/Use')}

                            variant="outlined"
                            style={{
                                border: '1px solid #CCCFD2',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontWeight: 'bold',
                                color: '#8F4D63',
                                background: activeButton === 'uso' ? '#E6C2CD' : '#FFFFFF',
                                borderColor: activeButton === 'uso' ? '#BE93A0' : '#C6BFC2',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#F2E9EC';

                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = activeButton === 'uso' ? '#E6C2CD' : '#FFFFFF';
                                e.currentTarget.style.border = activeButton === 'uso' ? '1px solid #BE93A0' : '1px solid #CCCFD2';
                            }}
                            onMouseDown={() => setActiveButton('uso')}
                            onMouseUp={() => setActiveButton(null)}

                        >
                            USO
                        </Button>

                        <IconButton

                            style={{
                                border: '1px solid #CCCFD2',
                                borderRadius: '8px',
                                color: '#8F4D63',
                                background: activeButton === 'chat' ? '#E6C2CD' : '#FFFFFF',
                                borderColor: activeButton === 'chat' ? '#BE93A0' : '#CCCFD2',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#F2E9EC';

                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = activeButton === 'chat' ? '#E6C2CD' : '#FFFFFF';
                                e.currentTarget.style.border = activeButton === 'chat' ? '1px solid #BE93A0' : '1px solid #CCCFD2';
                            }}
                            onMouseDown={() => setActiveButton('chat')}
                            onMouseUp={() => setActiveButton(null)}
                            onClick={handleOpen}
                        >
                            <img src={fast} alt="Welcome" style={{ width: '24px', height: '24px' }} />
                        </IconButton>


                        <Tooltip title="Editar información" arrow placement="top">
                            <IconButton

                                style={{
                                    border: '1px solid #CCCFD2',
                                    borderRadius: '8px',
                                    color: '#8F4D63',
                                    background: activeButton === 'chat' ? '#E6C2CD' : '#FFFFFF',
                                    borderColor: activeButton === 'chat' ? '#BE93A0' : '#C6BFC2',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#F2E9EC';

                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = activeButton === 'chat' ? '#E6C2CD' : 'transparent';
                                    e.currentTarget.style.border = activeButton === 'chat' ? '1px solid #BE93A0' : '1px solid #CCCFD2';
                                }}
                                onMouseDown={() => setActiveButton('chat')}
                                onMouseUp={() => setActiveButton(null)}
                                onClick={() => setOpenControlModal(true)}
                            >
                                <img src={welcome} alt="Welcome" style={{ width: '24px', height: '24px' }} />
                            </IconButton>
                        </Tooltip>

                    </div>
                )}
            </div>



            {!showData && (
                <Box sx={{ textAlign: 'center', marginTop: '150px', marginLeft: '0px' }}>
                    <Box component="img" src={BoxEmpty} alt="Caja Vacía" sx={{ width: '250px', height: 'auto' }} />
                    <Typography sx={{ marginTop: '10px', color: '#8F4D63', fontWeight: '500', fontFamily: 'Poppins' }}>
                        Seleccione un canal para continuar.
                    </Typography>
                </Box>
            )}

            {showData && selectedOption && (
                <Grid container spacing={3} sx={{ marginTop: '20px', justifyContent: 'center', marginLeft: "15px" }}>
                    {dataOptions.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                elevation={3}
                                sx={{
                                    marginLeft: "-10px",
                                    padding: "20px",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontFamily: "Poppins", color: "#574B4F" }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography variant="h5" sx={{ color: "#8F4D63" }}>
                                    {item.value}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}

                    {settings.listadoCampanas && (
                        <Paper sx={{
                            padding: 2,
                            borderRadius: '8px',
                            marginTop: 2,
                            overflow: 'hidden',
                            width: '100%',
                            marginLeft: '0px',

                        }}>
                            <Typography

                                sx={{
                                    textAlign: 'left',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    lineHeight: '54px',
                                    fontFamily: 'Poppins',
                                    letterSpacing: '0px',
                                    color: '#574B4F',
                                    opacity: 1,
                                    marginBottom: 0.5
                                }}
                            >
                                Campañas activas
                            </Typography>
                            <Box
                                sx={{

                                    display: 'flex',
                                    overflowX: 'auto',
                                    whiteSpace: 'nowrap',
                                    gap: 4,
                                    paddingBottom: 1,
                                    maxWidth: '100%',
                                    '&::-webkit-scrollbar': {
                                        height: '6px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#C6BFC2',
                                        borderRadius: '6px',
                                    },
                                }}
                            >
                                {campaigns.map((campaign, index) => {
                                    const percentage = (campaign.numeroActual / campaign.numeroInicial) * 100;
                                    return (
                                        <Paper
                                            key={index}
                                            sx={{
                                                minWidth: '200px',
                                                maxWidth: '220px',
                                                height: '90px',
                                                padding: 2,
                                                border: '1px solid #D6CED2',
                                                borderRadius: '8px',
                                                textAlign: 'left',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start', // Asegura alineación a la izquierda
                                                justifyContent: 'space-between',
                                                opacity: 1,
                                                position: 'relative', // Necesario para posicionar la línea
                                                '&:not(:last-child)::after': { // Aplica solo a los elementos excepto el último
                                                    content: '""',
                                                    position: 'absolute',
                                                    right: '-18px', // Ajusta la posición de la línea entre elementos
                                                    top: '10%',
                                                    height: '75px',
                                                    width: '2px',
                                                    backgroundColor: '#D6CED2',
                                                },
                                            }}
                                        >
                                            <Typography

                                                sx={{
                                                    textAlign: 'left',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    lineHeight: '16px',
                                                    fontFamily: 'Poppins',
                                                    letterSpacing: '0px',
                                                    color: '#574B4F',
                                                    opacity: 1,
                                                }}
                                            >
                                                {campaign.name}
                                            </Typography>
                                            <Box sx={{ width: '100%', position: 'relative', marginTop: 1 }}>
                                                <Box
                                                    sx={{

                                                        width: '100%',
                                                        height: '8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#E0E0E0',
                                                        position: 'absolute',
                                                    }}
                                                />
                                                <Box
                                                    sx={{

                                                        width: `${percentage}%`,
                                                        height: '8px',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#8F4D63',
                                                        position: 'absolute',
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                sx={{

                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    paddingX: '8px',
                                                    marginTop: '8px', // 🔥 Bajamos el contenido para mejor alineación
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textAlign: 'left',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        lineHeight: '18px',
                                                        fontFamily: 'Poppins',
                                                        letterSpacing: '0px',
                                                        color: '#574B4FCC',
                                                        opacity: 1,
                                                    }}
                                                >
                                                    {Math.round(percentage)}%
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        textAlign: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        lineHeight: '16px',
                                                        fontFamily: 'Poppins, sans-serif',
                                                        letterSpacing: '0px',
                                                        color: '#574B4FCC',
                                                        opacity: 1,
                                                        marginLeft: '5px',
                                                    }}
                                                >
                                                    {campaign.numeroActual}/{campaign.numeroInicial}
                                                </Typography>
                                                <Tooltip title="Consultar" arrow placement="top">
                                                    <IconButton sx={{ padding: '0', marginLeft: '5px' }} onClick={() => navigate('/Campaigns')}>
                                                        <img src={smsico} alt="SMS" style={{ width: '18px', height: '18px' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        </Paper>
                    )}
                    {settings.resultadosEnvio && (
                        <Paper
                            sx={{
                                padding: 2,
                                borderRadius: '8px',
                                marginTop: 2,
                                width: "100%",
                                minHeight: "250px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            {/* Título */}
                            <Typography
                                variant="h6"
                                sx={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    lineHeight: "24px",
                                    fontFamily: "Poppins, sans-serif",
                                    color: "#574B4F",
                                    opacity: 1,
                                    marginBottom: 2,
                                }}
                            >
                                Resultados de envío por día
                            </Typography>

                            {/* Contenedor de estadísticas */}
                            <Box
                                sx={{

                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: 2,
                                    border: "1px solid #E0E0E0",
                                    borderRadius: 2,
                                    background: "#FAFAFA",
                                    minHeight: "80px",
                                }}
                            >
                                {data.map((item, index) => (
                                    <Box key={index} sx={{ textAlign: "center", flex: 1 }}>
                                        <CustomTooltip title={item.tooltip}>
                                            <img src={infoicon} alt="Info" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                        </CustomTooltip>
                                        <Typography sx={{ fontSize: "12px", color: "#574B4F", fontFamily: 'Poppins' }}>
                                            {item.label}:
                                        </Typography>
                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold", color: item.color, fontFamily: 'Poppins' }}>
                                            {item.value}%
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Gráfico de barras con escala */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "center",
                                    height: "160px",
                                    marginTop: 3,
                                    position: "relative",
                                    paddingBottom: 2,
                                }}
                            >
                                {/* Líneas del eje Y */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        left: 0,
                                        bottom: 20, // 🔥 Bajamos la base del eje Y para dar espacio al texto
                                        height: "100%",
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        borderLeft: "2px solid #E0E0E0",
                                        borderBottom: "2px solid #E0E0E0",
                                        paddingLeft: "40px",
                                    }}
                                >
                                    {[100, 80, 60, 40, 20, 0].map((percent) => (
                                        <Box key={percent} sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: "12px",
                                                    fontWeight: "400",
                                                    color: "#8F8F8F",
                                                    lineHeight: "12px",
                                                    marginRight: "10px",
                                                }}
                                            >
                                                {percent}%
                                            </Typography>
                                            <Box sx={{ flexGrow: 1, borderBottom: "1px dashed #E0E0E0" }} />
                                        </Box>
                                    ))}
                                </Box>

                                {/* Contenedor de barras */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        justifyContent: "space-around",
                                        width: "90%",
                                        paddingLeft: "40px",
                                    }}
                                >
                                    {data.map((item, index) => (
                                        <Box key={index} sx={{ textAlign: "center", width: "50px", position: "relative" }}>
                                            <Box
                                                sx={{
                                                    width: "40px",
                                                    height: `${(item.value / 100) * 120}px`, // 🔥 Ajustamos la altura con una escala de 120px
                                                    minHeight: "10px",
                                                    maxHeight: "120px", // 🔥 Evitamos que se salga de la escala
                                                    backgroundColor: item.color,
                                                    borderRadius: "4px",
                                                    transition: "height 0.5s ease-in-out",
                                                    margin: "auto",
                                                }}
                                            />
                                            {/* Nombres correctos debajo del 0% */}
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Poppins',
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                    marginTop: "18px",
                                                    color: "#574B4F",
                                                    position: "absolute",
                                                    bottom: "-35px",
                                                    width: "100%",
                                                }}
                                            >
                                                {[
                                                    "Recibidos",
                                                    "No recibidos",
                                                    "En espera",
                                                    "Entregados-Falla",
                                                    "Rechazados",
                                                    "No enviados",
                                                    "Excepción",
                                                ][index]}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                            </Box>

                            {/* Texto adicional debajo del gráfico */}
                            <Typography
                                sx={{
                                    textAlign: "left",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    lineHeight: "18px",
                                    fontFamily: "Poppins, sans-serif",
                                    letterSpacing: "0px",
                                    color: "#574B4FCC",
                                    opacity: 1,
                                    marginTop: 2,
                                }}
                            >
                                * El cálculo de las tasas se basa en el total de mensajes enviados en el día.
                            </Typography>
                        </Paper>
                    )}

                </Grid>
            )}

            <Modal open={open} onClose={handleClose} aria-labelledby="quick-send-title">
                <Box sx={modalStyle}>

                    <Box sx={headerStyle}>
                        <Typography id="quick-send-title" sx={{
                            marginTop: "-10px",
                            textAlign: 'left',
                            fontWeight: 600,
                            fontSize: '20px',
                            lineHeight: '54px',
                            fontFamily: 'Poppins, sans-serif',
                            letterSpacing: '0px',
                            color: '#574B4F',
                            opacity: 1
                        }}>
                            Envío rápido
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <CloseIcon sx={{
                                position: "absolute",
                                marginTop: "-35px", marginLeft: "0px"
                            }} />
                        </IconButton>
                    </Box>
                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5 }} />

                    <Box sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        maxHeight: 'calc(100% - 120px)',
                        paddingRight: '10px',
                    }}>

                        <Box sx={{ marginBottom: '24px' }}>
                            <Typography variant="body1" sx={{ ...labelStyle, marginBottom: '6px' }}>Teléfono(s)</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                                {phoneNumbers.map((phone, index) => (
                                    <Box key={index} sx={{ width: '100%' }}>
                                        <Box display="flex" alignItems="center" gap={1} sx={{ width: '100%' }}>
                                            <TextField
                                                value={phone}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                error={errors[index]}
                                                helperText={errors[index] ? "Formato inválido" : ""}
                                                FormHelperTextProps={{
                                                    sx: {
                                                        textAlign: 'left',
                                                        fontSize: '10px',
                                                        lineHeight: '18px',
                                                        fontWeight: '500', // "medium" en Poppins
                                                        fontFamily: 'Poppins, sans-serif',
                                                        letterSpacing: '0px',
                                                        color: '#D01247', // 🔥 Color rojo personalizado
                                                        opacity: 1,
                                                        marginLeft: '0px', // 🔥 Lo mueve totalmente a la izquierda
                                                        marginTop: '4px',
                                                    }
                                                }}
                                                sx={{
                                                    width: '232px',
                                                    height: '54px',
                                                    marginBottom: '16px', // 🔥 Espacio extra debajo del input
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: errors[index] ? '#D01247' : '#9B9295CC', // 🔥 Borde rojo en error
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: errors[index] ? '#D01247' : '#574B4F',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: errors[index] ? '#D01247' : '#8F4D63',
                                                        },
                                                        '&.Mui-error fieldset': { // 🔥 Asegurar que se ponga rojo si tiene error
                                                            borderColor: '#D01247 !important',
                                                        }
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (


                                                        <InputAdornment position="end">
                                                            <img
                                                                src={errors[index] ? infoiconerror : infoicon}
                                                                alt="Info"
                                                                style={{ width: "18px", height: "18px" }}
                                                            />
                                                        </InputAdornment>

                                                    ),
                                                }}
                                            />

                                            {index === phoneNumbers.length - 1 && (
                                                <IconButton onClick={handleAddInput} color="primary">
                                                    <AddCircleOutlineIcon />
                                                </IconButton>
                                            )}
                                            {index > 0 && (
                                                <IconButton onClick={() => handleRemoveInput(index)} color="secondary">
                                                    <RemoveCircleOutlineIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Campo de mensaje */}
                        <Typography variant="body1" sx={labelStyle}>Mensaje</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={message}
                            onChange={handleMessageChange}
                            placeholder="Escriba aquí su mensaje."
                            sx={{ ...textFieldStyle, width: '100%' }}  // 🔥 Evita desbordamiento
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <CustomTooltip
                                            title={
                                                <Box>
                                                    <Typography variant="body2">• Solo caracteres alfanuméricos</Typography>
                                                    <Typography variant="body2">• Longitud máxima 160 caracteres</Typography>
                                                </Box>
                                            }
                                            placement="top"
                                        >
                                            <img src={infoicon} alt="Info" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                        </CustomTooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Typography sx={{ textAlign: 'left', fontSize: '10px', fontWeight: '500', color: '#574B4FCC', marginTop: '4px' }}>
                            {message.length}/160 caracteres para que el mensaje se realice en un solo envío.
                        </Typography>

                        {/* Opciones de checkbox */}
                        <Box sx={{ marginTop: '20px', width: '100%' }}>  {/* 🔥 Evita desbordamiento */}
                            <FormControlLabel
                                control={<Checkbox />}
                                label="Concatenar mensajes de más de 160 caracteres"
                                sx={{ '& .MuiTypography-root': { fontSize: '16px', fontWeight: '400', color: '#574B4FCC' } }}
                            />
                            <FormControlLabel
                                control={<Checkbox />}
                                label="Mensaje flash"
                                sx={{ '& .MuiTypography-root': { fontSize: '16px', fontWeight: '400', color: '#574B4FCC' } }}
                            />
                        </Box>
                    </Box>

                    {/* Botones fijos */}
                    <Box sx={buttonContainer}>
                        <SecondaryButton text='Cancelar' onClick={handleClose} />
                        <MainButton text='Enviar' onClick={() => console.log('Enviando...')} disabled={!isFormValid} />
                    </Box>
                </Box>
            </Modal>

            <Modal open={openControlModal} onClose={() => setOpenControlModal(false)} aria-labelledby="dashboard-settings-title">
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "556px",
                        bgcolor: "background.paper",
                        borderRadius: "8px",
                        boxShadow: 24,
                        p: 3,
                    }}
                >
                    {/* Encabezado */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography
                            id="dashboard-settings-title"
                            sx={{
                                textAlign: "left",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: "#574B4F",
                                opacity: 1,
                                fontSize: "20px",
                                fontWeight: "bold",
                            }}
                        >
                            Información visible en el tablero de control
                        </Typography>
                        <IconButton onClick={() => setOpenControlModal(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Lista de opciones */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {/* Opciones deshabilitadas */}
                        <FormControlLabel
                            control={<Checkbox checked disabled />}
                            label="Número de campañas activas"
                            sx={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: "#A0A0A0",
                                opacity: 1,
                                marginBottom: "-10px",
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked disabled />}
                            label="SMS enviados hoy"
                            sx={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: "#A0A0A0",
                                opacity: 1,
                                marginBottom: "-10px",
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked disabled />}
                            label="Promedio de SMS por día"
                            sx={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: "#A0A0A0",
                                opacity: 1,
                                marginBottom: "-10px",
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked disabled />}
                            label="Consumo de créditos"
                            sx={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: "#A0A0A0",
                                opacity: 1,
                                marginBottom: "-10px",
                            }}
                        />

                        {/* Opciones activas */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={settings.listadoCampanas}
                                    onChange={handleChange}
                                    name="listadoCampanas"
                                    sx={{ color: "#8F4D63", "&.Mui-checked": { color: "#8F4D63" } }}
                                />
                            }
                            label="Listado de campañas en curso"
                            sx={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: "#8F4D63",
                                opacity: 1,
                                marginBottom: "-10px",
                            }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={settings.resultadosEnvio}
                                    onChange={handleChange}
                                    name="resultadosEnvio"
                                    sx={{ color: "#8F4D63", "&.Mui-checked": { color: "#8F4D63" } }}
                                />
                            }
                            label="Resultados de envío por día"
                            sx={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                color: "#8F4D63",
                                opacity: 1,
                                marginBottom: "-10px",
                            }}
                        />
                    </Box>
                    <Divider sx={{ my: 2 }} />

                    {/* Botones */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <Secondarybutton text='Cancelar' onClick={() => setOpenControlModal(false)} />
                        <Button
                            variant="contained"
                            disabled={!hasChanges}
                            onClick={handleSave}
                            sx={{
                                borderRadius: "4px",
                                fontWeight: "bold",
                                background: hasChanges ? "#833A53" : "#d3d3d3",
                                border: "1px solid",
                                borderColor: hasChanges ? "#60293C" : "#b3b3b3",
                                color: "white",
                                cursor: hasChanges ? "pointer" : "not-allowed",
                                opacity: hasChanges ? 1 : 0.7,
                                fontSize: "12px",
                                fontFamily: "Poppins, sans-serif",
                                letterSpacing: "1.12px",
                                transition: "all 0.3s ease",
                                width: "180px", // 🔥 Mantiene el ancho original
                                height: "36px", // 🔥 Fija la altura para evitar cambios

                                "&:hover": {
                                    background: hasChanges ? "#90455F" : "#d3d3d3",
                                    boxShadow: hasChanges ? "0px 0px 12px #C17D91" : "none",
                                    borderColor: hasChanges ? "#60293C" : "#b3b3b3",
                                    opacity: 0.85,
                                },

                                "&:active": {
                                    background: hasChanges ? "#6F1E3A" : "#d3d3d3",
                                    borderColor: hasChanges ? "#8D4860" : "#b3b3b3",
                                    opacity: 0.9,
                                },

                                "&:focus": {
                                    background: hasChanges ? "#833A53" : "#d3d3d3",
                                    boxShadow: hasChanges ? "0px 0px 8px #E6C2CD" : "none",
                                    borderColor: hasChanges ? "#60293C" : "#b3b3b3",
                                    opacity: 0.9,
                                    outline: "none",
                                },
                            }}
                        >
                            {isLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                    <CircularProgress size={20} thickness={4} sx={{ color: "white" }} />
                                </Box>
                            ) : (
                                "GUARDAR CAMBIOS"
                            )}
                        </Button>

                    </Box>
                </Box>
            </Modal>
        </div>
    );
};


/* Estilos */

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '570px',  // Nuevo ancho
    height: '579px', // Nuevo alto
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
};

const labelStyle = {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: '18px',
    lineHeight: '18px',
    fontFamily: 'Poppins, sans-serif',
    letterSpacing: '0px',
    color: '#574B4F',
    opacity: 1,
    marginTop: '10px',
};

const textFieldStyle = {
    background: '#FFFFFF',
    border: '1px solid #9B9295CC',
    borderRadius: '4px',
    opacity: 1,
    width: '510px', // Ancho especificado
    height: '130px', // Alto especificado
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '10px',
    '& fieldset': { border: 'none' }
};

const buttonContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
};


const dividerStyle = {
    width: '100%',
    height: '1px',
    backgroundColor: '#E0E0E0',
    marginBottom: '15px',
};
const buttonStyle = {
    marginLeft: "15px",
    background: '#F6F6F6',
    border: '1px solid #C6BFC2',
    borderRadius: '18px',
    padding: '8px 16px',
    fontWeight: 500,
    color: '#330F1B',
    minWidth: "100px", height: "36px",
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
export default HomePage;
