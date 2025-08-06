import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, MenuItem, Typography, Paper, Box, IconButton, Divider } from '@mui/material';
import SecondaryButton from '../components/commons/SecondaryButton';
import MainButton from '../components/commons/MainButton';
import InfoIcon from '@mui/icons-material/Info';
import axios from "../components/commons/AxiosInstance";
import ChipBar from "../components/commons/ChipBar";
import ModalError from "../components/commons/ModalError"
import MainModal from "../components/commons/MainModal"
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import infoicon from '../assets/Icon-info.svg';
import infoiconerror from '../assets/Icon-infoerror.svg';

const BillingInformation: React.FC = () => {
    const navigate = useNavigate();

    const [businessName, setBusinessName] = useState('');
    const [rfc, setRfc] = useState('');
    const [taxRegime, setTaxRegime] = useState('');
    const [cfdi, setCfdi] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [rfcError, setRfcError] = useState(false);
    const [postalCodeError, setPostalCodeError] = useState(false);
    const [businessNameError, setBusinessNameError] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [Modal, setModal] = useState(false);
    const [personType, setPersonType] = useState('');
    const [street, setStreet] = useState('');
    const [extNumber, setExtNumber] = useState('');
    const [intNumber, setIntNumber] = useState('');
    const [colony, setColony] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [errors] = useState({
        businessName: false,
        rfc: false,
        taxRegime: false,
        cfdi: false,
        postalCode: false,
    });
    const [showChipBarAdd, setshowChipBarAdd] = useState(false);
    const handleSave = async () => {
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.id) {
            console.error("No se encontró el ID del usuario.");
            return;
        }
        try {
            const requestUrl = `${import.meta.env.VITE_API_ADD_USERS_BILLING}`;
            const Billing = {
                Email: obj.userName,
                PersonType: personType,
                BusinessName: businessName,
                TaxId: rfc,
                taxRegime: taxRegime,
                Cfdi: cfdi,
                PostalCode: postalCode,
                Street: street,
                ExtNumber: extNumber,
                IntNumber: intNumber,
                Colony: colony,
                City: city,
                State: state
            };


            const response = await axios.post(requestUrl, Billing);

            if (response.status === 200) {
                setshowChipBarAdd(true);
                setTimeout(() => setshowChipBarAdd(false), 3000);

            }
        } catch {
            setErrorModal(true);
        }
    };

    useEffect(() => {
        const fetchBillingData = async () => {
            const usuario = localStorage.getItem("userData");
            if (!usuario) {
                navigate('/Login');
                return;
            }
            const obj = JSON.parse(usuario);
            if (!obj?.userName) {
                navigate('/Login');
                return;
            }
            try {
                const requestUrl = `${import.meta.env.VITE_API_GET_USERS_BILLING + obj.userName}`;
                const response = await axios.get(requestUrl);
                // Supongamos que la respuesta tiene la información en response.data
                const billingData = response.data;
                if (billingData) {
                    setPersonType(billingData.personType || "");
                    setBusinessName(billingData.businessName || "");
                    setRfc(billingData.taxId || "");
                    setTaxRegime(billingData.taxRegime || "");
                    setCfdi(billingData.cfdi || "");
                    setPostalCode(billingData.postalCode || "");
                    setStreet(billingData.street || "");
                    setExtNumber(billingData.extNumber || "");
                    setIntNumber(billingData.intNumber || "");
                    setColony(billingData.colony || "");
                    setCity(billingData.city || "");
                    setState(billingData.state || "");
                }

            } catch (error) {
                console.error("Error al traer los datos de facturación", error);
            }
        };

        fetchBillingData();
    }, []);


    const handleCancel = () => {
        setBusinessName("");
        setRfc("");
        setTaxRegime("");
        setCfdi("");
        setPostalCode("");
        setModal(false);
    };

    const handleRfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setRfc(value);

        // Regex para validar el RFC
        const rfcRegex = /^([A-ZÑ&]{3,4})?(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{2})([A\d])?$/;
        setRfcError(!rfcRegex.test(value)); // Si no pasa el regex, se muestra error
    };

    const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Verificar que solo sean números y longitud de 5
        if (/^\d{0,5}$/.test(value)) {
            setPostalCode(value);
            setPostalCodeError(value.length !== 5);
        }
    };

    const validateBusinessName = (value: string) => {
        const trimmedValue = value.trim();

        if (!trimmedValue || trimmedValue.length < 3 || trimmedValue.length > 255) {
            return false; // Marca el error como true si no cumple las condiciones
        }

        const regex = /^[a-zA-ZÁÉÍÓÚÑáéíóúñ\s.,&-]*$/;
        return regex.test(trimmedValue); // Devuelve true si es válido, false si no
    };


    const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBusinessName(value);

        // Validar y actualizar el estado de error
        setBusinessNameError(!validateBusinessName(value));
    };

    return (

        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1180px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 500, fontFamily: 'Poppins', fontSize: '26px', color: '#330F1B' }}>
                    Datos de facturación
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", }}>
                <Divider sx={{ marginBottom: "17px", marginTop: "18px", mb: 3.5 }} />
                <Box
                    style={{
                        backgroundColor: '#FFFFFF',
                        padding: '20px',
                        borderRadius: '8px',
                        minWidth: '850px',
                        maxHeight: '500px',
                        overflowY: 'auto',
                    }}
                >
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <Typography
                                style={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    marginBottom: '4px',
                                    color: businessNameError ? '#D01247' : '#330F1B',
                                    opacity: 1,

                                }}
                            >
                                Nombre o razón social
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={businessName}
                                onChange={handleBusinessNameChange}
                                fullWidth
                                error={businessNameError}
                                helperText={businessNameError ? "Formato Invalido" : ""}
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
                                                            Razon social fiscal valida
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
                                                        src={businessNameError ? infoiconerror : infoicon}
                                                        alt="info-icon"
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <Typography
                                style={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: rfcError ? '#D01247' : '#330F1B',
                                    opacity: 1,
                                    marginBottom: '4px',
                                }}
                            >
                                RFC
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={rfc}
                                onChange={handleRfcChange}
                                fullWidth
                                error={rfcError} // Marca el campo como error si no es válido
                                helperText={rfcError ? 'Formato Invalido' : ''}
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
                                                            • Solo caracteres numéricos<br />
                                                            • Longitud min. 14 dígitos,<br />
                                                            máx. 19 dígitos
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
                                                        src={rfcError ? infoiconerror : infoicon}
                                                        alt="info-icon"
                                                        style={{ width: 24, height: 24 }}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                        </InputAdornment>
                                    ),
                                }}
                                style={{
                                    width: '400px',
                                    height: '54px',
                                    borderColor: rfcError ? '#D01247' : undefined,
                                }}
                                inputProps={{
                                    maxLength: 13,
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <Typography
                                style={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    marginBottom: '4px',
                                    color: errors.taxRegime ? '#D01247' : '#000000',
                                    opacity: 1,
                                }}
                            >
                                Régimen fiscal
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={taxRegime}
                                onChange={(e) => setTaxRegime(e.target.value)}
                                select
                                sx={{
                                    width: '400px',
                                    height: '40px',
                                    mt: 1,
                                    background: '#FFFFFF',
                                    border: '1px solid #9B9295',
                                    borderRadius: '8px',
                                    '& .MuiSelect-select': {
                                        fontFamily: 'Poppins',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '40px',
                                        paddingLeft: '12px',
                                        paddingTop: "7px", color: "#645E60",
                                    },
                                    '& fieldset': {
                                        border: 'none',
                                    },
                                }}

                            >
                                <MenuItem value="601" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>General de Ley Personas Morales</MenuItem>
                                <MenuItem value="603" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Personas Morales con Fines no Lucrativos</MenuItem>
                                <MenuItem value="605" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Sueldos y Salarios e Ingresos Asimilados a Salarios</MenuItem>
                                <MenuItem value="606" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Arrendamiento</MenuItem>
                                <MenuItem value="607" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Régimen de Enajenación o Adquisición de Bienes</MenuItem>
                                <MenuItem value="608" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Demás Ingresos</MenuItem>
                                <MenuItem value="621" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Régimen de Incorporación Fiscal</MenuItem>
                                <MenuItem value="612" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Actividades Empresariales y Profesionales</MenuItem>
                                <MenuItem value="622" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</MenuItem>
                                <MenuItem value="620" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Opcional para Grupos de Sociedades</MenuItem>
                                <MenuItem value="623" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Coordinados</MenuItem>
                                <MenuItem value="624" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Hidrocarburos</MenuItem>
                                <MenuItem value="625" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Actividades Empresariales con Ingresos a través de Plataformas Tecnológicas</MenuItem>
                                <MenuItem value="626" sx={{
                                    fontFamily: 'Poppins', fontSize: '12px',
                                    color: '#645E60', '&:hover': {
                                        backgroundColor: '#F2EBED'
                                    }
                                }}>Régimen Simplificado de Confianza</MenuItem>
                            </TextField>


                        </div>

                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <Typography
                                style={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    marginBottom: '4px',
                                    color: errors.cfdi ? '#D01247' : '#000000',
                                    opacity: 1,
                                }}
                            >
                                CFDI
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={cfdi}
                                onChange={(e) => setCfdi(e.target.value)}
                                style={{ width: '400px', height: '54px' }}
                                select
                            >
                                <MenuItem value="G01">G01 - Adquisición de mercancías</MenuItem>
                                <MenuItem value="G02">G02 - Devoluciones, descuentos o bonificaciones</MenuItem>
                                <MenuItem value="G03">G03 - Gastos en general</MenuItem>
                                <MenuItem value="I01">I01 - Construcciones</MenuItem>
                                <MenuItem value="I02">I02 - Mobiliario y equipo de oficina por inversiones</MenuItem>
                                <MenuItem value="I03">I03 - Equipo de transporte</MenuItem>
                                <MenuItem value="I04">I04 - Equipo de cómputo y accesorios</MenuItem>
                                <MenuItem value="I05">I05 - Dados, troqueles, moldes, matrices y herramental</MenuItem>
                                <MenuItem value="I06">I06 - Comunicaciones telefónicas</MenuItem>
                                <MenuItem value="I07">I07 - Comunicaciones satelitales</MenuItem>
                                <MenuItem value="I08">I08 - Otra maquinaria y equipo</MenuItem>
                                <MenuItem value="D01">D01 - Honorarios médicos, dentales y gastos hospitalarios</MenuItem>
                                <MenuItem value="D02">D02 - Gastos médicos por incapacidad o discapacidad</MenuItem>
                                <MenuItem value="D03">D03 - Gastos funerarios</MenuItem>
                                <MenuItem value="D04">D04 - Donativos</MenuItem>
                                <MenuItem value="D05">D05 - Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)</MenuItem>
                                <MenuItem value="D06">D06 - Aportaciones voluntarias al SAR</MenuItem>
                                <MenuItem value="D07">D07 - Primas por seguros de gastos médicos</MenuItem>
                                <MenuItem value="D08">D08 - Gastos de transportación escolar obligatoria</MenuItem>
                                <MenuItem value="D09">D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones</MenuItem>
                                <MenuItem value="D10">D10 - Pagos por servicios educativos (colegiaturas)</MenuItem>
                                <MenuItem value="P01">P01 - Por definir</MenuItem>
                            </TextField>

                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', maxWidth: '128px' }}>
                        <Typography
                            style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                marginBottom: '4px',
                                color: postalCodeError ? '#D01247' : '#330F1B',
                                opacity: 1,
                            }}
                        >
                            Código postal
                            <span style={{ color: "#D01247" }}>*</span>
                        </Typography>
                        <TextField
                            value={postalCode}
                            onChange={handlePostalCodeChange}
                            fullWidth
                            error={postalCodeError}
                            helperText={postalCodeError ? 'Formato Invalido' : ''}
                            sx={{
                                width: '128px', // Cambiar el ancho del input
                                height: '54px',
                                borderColor: postalCodeError ? '#D01247' : undefined,
                                fontFamily: "Poppins",
                                "& .MuiInputBase-input": {
                                    fontFamily: "Poppins",
                                },
                            }}
                            inputProps={{
                                maxLength: 5,
                            }}
                        />
                    </div>
                    {/* Tipo de persona */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', maxWidth: '400px' }}>
                        <div style={{ flex: 1 }}>
                            <Typography
                                style={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: '#330F1B',
                                }}
                            >
                                Tipo de persona
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                select
                                value={personType}
                                onChange={(e) => setPersonType(e.target.value)}
                                fullWidth
                                SelectProps={{ displayEmpty: true }}
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Selecciona física o moral" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            >
                                <MenuItem value="">
                                    <span style={{ fontStyle: "normal", color: "#645E60" }}>Seleccionar</span>
                                </MenuItem>
                                <MenuItem value="fisica">Persona Física</MenuItem>
                                <MenuItem value="moral">Persona Moral</MenuItem>
                            </TextField>
                        </div>
                    </div>

                    {/* Calle, Número exterior, Número interior */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 2 }}>
                            <Typography style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: '#330F1B',
                            }}>
                                Calle
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Nombre de la calle" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: '#330F1B',
                            }}>
                                Número exterior
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={extNumber}
                                onChange={(e) => setExtNumber(e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Número exterior del domicilio" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: '#330F1B',
                            }}>
                                Número interior
                            </Typography>
                            <TextField
                                value={intNumber}
                                onChange={(e) => setIntNumber(e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Número interior (opcional)" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            />
                        </div>
                    </div>

                    {/* Colonia y Ciudad */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                color: '#330F1B',
                            }}>
                                Colonia
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={colony}
                                onChange={(e) => setColony(e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Nombre de la colonia" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                marginBottom: '4px',
                                color: '#330F1B',
                            }}>
                                Ciudad
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Ciudad o municipio" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <Typography style={{
                                textAlign: "left",
                                fontSize: "16px",
                                fontFamily: "Poppins",
                                letterSpacing: "0px",
                                marginBottom: '4px',
                                color: '#330F1B',
                            }}>
                                Estado
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Estado de la república" arrow>
                                            <InputAdornment position="end">
                                                <InfoIcon style={{ color: '#6a6a6a' }} />
                                            </InputAdornment>
                                        </Tooltip>
                                    ),
                                }}
                            />
                        </div>

                        <div style={{ width: '128px' }}>
                            <Typography
                                style={{
                                    textAlign: "left",
                                    fontSize: "16px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    marginBottom: '4px',
                                    color: postalCodeError ? '#D01247' : '#330F1B',
                                }}
                            >
                                Código postal
                                <span style={{ color: "#D01247" }}>*</span>
                            </Typography>
                            <TextField
                                value={postalCode}
                                onChange={handlePostalCodeChange}
                                error={postalCodeError}
                                helperText={postalCodeError ? 'Formato inválido' : ''}
                                fullWidth
                                InputProps={{
                                    style: { height: '54px' },
                                }}
                                inputProps={{
                                    maxLength: 5,
                                }}
                            />
                        </div>
                    </div>

                    <Typography
                        style={{
                            textAlign: 'left',
                            font: 'normal normal normal 14px/22px Poppins',
                            letterSpacing: '0px',
                            color: '#330F1B',
                            opacity: 0.3,
                            fontSize: '14px',
                            marginTop: '10px',
                        }}
                    >
                        *El asterisco indica los campos obligatorios.
                    </Typography>
                </Box>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '16px',
                        marginTop: '30px',
                        maxWidth: '850px',
                        width: '100%',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        paddingLeft: '20px', // 💥 Alineación con el contenido del Paper
                        boxSizing: 'border-box',
                    }}
                >
                    <SecondaryButton onClick={() => setModal(true)} text="CANCELAR" />
                    <MainButton onClick={handleSave} text="GUARDAR" />
                </div>

                {showChipBarAdd && (
                    <ChipBar
                        message="Los datos de facturación han sido agregados correctamente"
                        buttonText="Cerrar"
                        onClose={() => setshowChipBarAdd(false)}
                    />
                )}
            </Box>
            <ModalError
                isOpen={errorModal}
                title="Error al añadir datos de facturación"
                message="Algo salió mal. Inténtelo de nuevo o regrese más tarde."
                buttonText="Cerrar"
                onClose={() => setErrorModal(false)}
            />
            <MainModal
                isOpen={Modal}
                Title="Cancelación"
                message="¿Está seguro de que desea cancelar? los datos ingresados no serán almacenados"
                primaryButtonText="Aceptar"
                secondaryButtonText="Cancelar"
                onPrimaryClick={handleCancel}
                onSecondaryClick={() => setModal(false)}
            />
        </Box>

    );
};

export default BillingInformation;
