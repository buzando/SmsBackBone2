import { useState, useContext, ChangeEvent, useRef } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { AppContext } from '../hooks/useContextInitialState';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Divider, Modal, Fade, Backdrop } from '@mui/material';
import PublicLayout from '../components/PublicLayout';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'

type RegisterFormData = {
    client: string;
    firstName: string;
    lastName: string;
    phone: string;
    extension: string;
    email: string;
    emailConfirmation: string;
    sms: boolean;
    llamada: boolean;
    password: string;
    [key: string]: string | boolean; // Firma de índice
};

const Register: React.FC = () => {
    const { setContextState } = useContext(AppContext);
    const [formData, setFormData] = useState<RegisterFormData>({
        client: "",
        firstName: "",
        lastName: "",
        phone: "",
        extension: "",
        email: "",
        emailConfirmation: "",
        sms: false,
        llamada: false,
        password: "",
    });



    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({
        phone: false,
        email: false,
        emailConfirmation: false,
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
    });

    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [hasPasswordInput, setHasPasswordInput] = useState(false);
    const termsContainerRef = useRef<HTMLDivElement>(null);
    const handleScroll = () => {
        const container = termsContainerRef.current;
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;


            // Margen amplio para tolerancia
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;

            setIsButtonEnabled(isAtBottom);
        }
    };


    const handleOpenErrorModal = () => {
        setErrorModalOpen(true);
    };

    const handleErrorModalClose = () => {
        setErrorModalOpen(false);
    };


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsButtonEnabled(false);
        try {
            const data = {
                client: formData.client,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                extension: formData.extension,
                emailConfirmation: formData.emailConfirmation,
                sms: formData.sms,
                llamada: formData.llamada,
                Password: password,// Incluye la contraseña en el payload
            };

            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*"
            };
            const response = await axios.post(
                `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_REGISTER_ACCOUNT_ENDPOINT
                }`,
                data,
                { headers },
            );


            if (response.status === 200) {
                const { user, token, expiration } = await response.data;
                setContextState({ user, token, expiration });
                localStorage.setItem('token', token);
                localStorage.setItem('expirationDate', expiration);
                localStorage.setItem('userData', JSON.stringify(user));
                navigate('/chooseroom');
            }
        } catch (error) {
            setIsButtonEnabled(true);
            handleOpenErrorModal();
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (!hasPasswordInput) {
            setHasPasswordInput(true); // Activar la bandera solo la primera vez que se escribe
        }
        validatePassword(value);
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const validatePassword = (password: string) => {
        const errors = {
            minLength: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
        };
        setPasswordErrors(errors);
    };

    const arePasswordsValid = (): boolean => {
        return (
            Object.values(passwordErrors).every((valid) => valid) &&
            password === confirmPassword
        );
    };


    const isFormValid = () => {
        const requiredFields: (keyof RegisterFormData)[] = [
            'client',
            'firstName',
            'lastName',
            'phone',
            'email',
            'emailConfirmation',
        ];

        const allFieldsFilled = requiredFields.every((field) => {
            const value = formData[field];
            return typeof value === 'string' && value.trim() !== '';
        });

        const noErrors = !Object.values(errors).some((error) => error);

        return allFieldsFilled && noErrors;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        // Validar correos y teléfono
        const newErrors = { ...errors };
        if (name === 'email' || name === 'emailConfirmation') {
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            newErrors[name] = !emailRegex.test(value);
        }
        if (name === 'phone') {
            newErrors.phone = !/^\d{10}$/.test(value);
        }

        setErrors(newErrors);

        // Actualización del estado
        setFormData((prevState: RegisterFormData) => ({
            ...prevState,
            [name]: value,
        }));
    };


    const handleOpenModal = () => {
        setModalOpen(true);
        setTimeout(() => initializeScrollListener(), 0); // Espera el renderizado del modal
    };
    const handleModalClose = () => {
        setModalOpen(false);
        removeScrollListener(); // Elimina el evento de scroll al cerrar el modal
    };
    const initializeScrollListener = () => {
        setTimeout(() => {
            const container = termsContainerRef.current;
            if (container) {

                container.addEventListener("scroll", handleScroll);
            }
        }, 0); // Espera el siguiente ciclo de renderizado
    };

    const removeScrollListener = () => {
        const container = termsContainerRef.current;
        if (container) {

            container.removeEventListener("scroll", handleScroll);
        }
    };





    return (
        //Color del fondo
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#F2F2F2",
                height: "755px", overflowY: "hidden"
            }}
        >
            <PublicLayout>
                <Container maxWidth="md">
                    <Box mt={4}>
                        <Typography
                            sx={{
                                fontStyle: "normal",
                                fontVariant: "normal",
                                fontWeight: "500",
                                fontSize: "26px",
                                lineHeight: "55px",
                                fontFamily: "Poppins",
                                color: "#330F1B",
                                opacity: 1,
                                mt: -2.5
                            }}>
                            Registro
                        </Typography>

                        <Divider sx={{ marginBottom: 3 }} />
                        <Paper elevation={3} sx={{ padding: 4, borderRadius: "12px", display: "flex", flexDirection: "column", height: "auto" }}>
                            <Typography
                                sx={{
                                    position: "absolute",
                                    marginLeft: "470px",
                                    fontStyle: "normal",
                                    fontVariant: "normal",
                                    fontWeight: "398",
                                    fontSize: "14px",
                                    lineHeight: "22px",
                                    fontFamily: "Poppins",
                                    letterSpacing: "0px",
                                    color: "#330F1B",
                                    opacity: 0.7,
                                    marginBottom: 3,
                                }}
                            >
                                *El asterisco indica los campos obligatorios.
                            </Typography>
                            <Grid container
                                spacing={2}
                                sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    maxHeight: "450px",
                                    paddingRight: 2,
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#d9d9d9 transparent",
                                    "&::-webkit-scrollbar": { width: "8px" },
                                    "&::-webkit-scrollbar-thumb": { background: "#d9d9d9", borderRadius: "4px" },
                                }}>


                                {/* Client - Solo en la parte superior */}
                                <Grid item xs={12} md={6}>

                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal medium 16px/54px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            opacity: 1,
                                            marginBottom: "4px",
                                            color: !formData.client || (formData.client.length <= 40 && /^[a-zA-Z0-9 ]+$/.test(formData.client))
                                                ? "#330F1B"
                                                : "#D01247",
                                        }}
                                    >
                                        Cliente
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="client"
                                        value={formData.client}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={
                                            !!(formData.client && (formData.client.length > 40 || !/^[a-zA-Z0-9 ]+$/.test(formData.client)))
                                        }
                                        helperText={
                                            formData.client && formData.client.length > 40
                                                ? "Máximo 40 caracteres"
                                                : formData.client && !/^[a-zA-Z0-9 ]+$/.test(formData.client)
                                                    ? "Solo se permiten caracteres alfabéticos"
                                                    : ""

                                        }
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
                                                                    formData.client &&
                                                                        (formData.client.length > 40 || !/^[a-zA-Z0-9 ]+$/.test(formData.client))
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

                                <Grid item xs={12} />

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            fontSize: "16px",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: formData.firstName && !/^[a-zA-Z0-9 ]+$/.test(formData.firstName) ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px"
                                        }}
                                    >
                                        Nombre
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={!!(formData.firstName && !/^[a-zA-Z0-9 ]+$/.test(formData.firstName))}
                                        helperText={
                                            formData.firstName && !/^[a-zA-Z0-9 ]+$/.test(formData.firstName)
                                                ? "Solo se permiten caracteres alfabéticos"
                                                : ""
                                        }

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
                                                                    formData.firstName &&
                                                                        !/^[a-zA-Z0-9 ]+$/.test(formData.firstName)
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

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal medium 16px/54px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: formData.lastName && !/^[a-zA-Z0-9 ]+$/.test(formData.lastName) ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Apellido Paterno
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={!!(formData.lastName && !/^[a-zA-Z0-9 ]+$/.test(formData.lastName))}
                                        helperText={
                                            formData.lastName && !/^[a-zA-Z0-9 ]+$/.test(formData.lastName)
                                                ? "Solo se permiten caracteres alfabéticos"
                                                : ""
                                        }

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
                                                                    formData.lastName &&
                                                                        !/^[a-zA-Z0-9 ]+$/.test(formData.lastName)
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

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            fontSize: "16px",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: errors.phone ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Telefono
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={errors.phone}
                                        helperText={errors.phone ? "Formato Inválido" : ""}

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
                                                                    • Longitud exacta de 10<br />
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
                                                            <img src={errors.phone ? infoiconerror : infoicon} alt="info-icon" style={{ width: 24, height: 24 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                        inputProps={{
                                            maxLength: 10,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal medium 16px/54px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color:
                                                formData.extension && !/^\d{1,5}$/.test(formData.extension)
                                                    ? "#D01247"
                                                    : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Extensión

                                    </Typography>
                                    <TextField
                                        name="extension"
                                        value={formData.extension}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        error={!!(formData.extension && !/^\d{1,5}$/.test(formData.extension))}
                                        helperText={
                                            formData.extension && !/^\d{1,5}$/.test(formData.extension)
                                                ? "Solo números con máximo 5 dígitos."
                                                : ""
                                        }
                                        fullWidth

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
                                                                    • Longitud máxima de 5<br />
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
                                                                    formData.extension && !/^\d{1,5}$/.test(formData.extension)
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
                                        inputProps={{
                                            maxLength: 5,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "16px",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: errors.email ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Correo electrónico
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={errors.email}
                                        helperText={errors.email ? "Fomarto inválido" : ""}

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
                                                                    • Debe contener un formato válido<br />
                                                                    • Ejemplo: usuario@dominio.com
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
                                                            <img src={errors.email ? infoiconerror : infoicon} alt="info-icon" style={{ width: 24, height: 24 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal medium 16px/54px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: errors.emailConfirmation ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Correo electrónico para envío de usuario
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="emailConfirmation"
                                        value={formData.emailConfirmation}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={errors.emailConfirmation}
                                        helperText={errors.emailConfirmation ? "Ingrese un correo válido" : ""}

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
                                                                    • Debe coincidir con el correo electrónico<br />
                                                                    • Ejemplo: usuario@dominio.com
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
                                                            <img src={errors.emailConfirmation ? infoiconerror : infoicon} alt="info-icon" style={{ width: 24, height: 24 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal medium 16px/54px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: hasPasswordInput && !Object.values(passwordErrors).every((valid) => valid) ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Contraseña
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="password"
                                        type="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={hasPasswordInput && !Object.values(passwordErrors).every((valid) => valid)}
                                        helperText={
                                            hasPasswordInput && (
                                                <>
                                                    {!passwordErrors.minLength && (
                                                        <Typography variant="caption" color="error">
                                                            • La contraseña debe tener al menos 8 caracteres.
                                                        </Typography>
                                                    )}
                                                    {!passwordErrors.uppercase && (
                                                        <Typography variant="caption" color="error">
                                                            <br />• Debe contener al menos una letra mayúscula.
                                                        </Typography>
                                                    )}
                                                    {!passwordErrors.lowercase && (
                                                        <Typography variant="caption" color="error">
                                                            <br />• Debe contener al menos una letra minúscula.
                                                        </Typography>
                                                    )}
                                                    {!passwordErrors.number && (
                                                        <Typography variant="caption" color="error">
                                                            <br />• Debe contener al menos un número.
                                                        </Typography>
                                                    )}
                                                </>
                                            )
                                        }
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
                                                                • Mínimo 8 caracteres.
                                                                <br />
                                                                • Una letra mayúscula.
                                                                <br />
                                                                • Una letra minúscula.
                                                                <br />
                                                                • Un número.
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
                                                            <img src={hasPasswordInput && !Object.values(passwordErrors).every((valid) => valid) ? infoiconerror : infoicon} alt="info-icon" style={{ width: 24, height: 24 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal medium 16px/54px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: (confirmPassword && confirmPassword !== password) ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Confirmar Contraseña
                                        <span style={{ color: "#D01247" }}>*</span>
                                    </Typography>
                                    <TextField
                                        name="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={!!(confirmPassword && confirmPassword !== password)}
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
                                                                {confirmPassword && confirmPassword !== password
                                                                    ? "• Las contraseñas no coinciden"
                                                                    : "• Las contraseñas coinciden"}
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
                                                            <img src={(confirmPassword && confirmPassword !== password) ? infoiconerror : infoicon} alt="info-icon" style={{ width: 24, height: 24 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    {password && confirmPassword && !arePasswordsValid() && (
                                        <Typography variant="caption" color="#D01247" sx={{ marginBottom: 2 }}>
                                            Asegúrate de cumplir con los requisitos de contraseña y que coincidan.
                                        </Typography>
                                    )}
                                </Grid>

                                {/* Services */}
                                {/* <Grid item xs={12}>
                                    <Typography sx={{
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "500",
                                        fontSize: "16px",
                                        fontFamily: "Poppins",
                                        color: "#330F1B",
                                        opacity: 1,
                                        marginBottom: "-6px"
                                    }}>
                                        Servicios<span style={{ color: "red" }}>*</span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontFamily: "Poppins",
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.sms}
                                                    sx={{
                                                        borderRadius: '2px',
                                                        color: '#91898C',
                                                        '&.Mui-checked': { color: '#833A53' },
                                                    }}
                                                    onChange={(e) =>
                                                        setFormData((prevState) => ({
                                                            ...prevState,
                                                            sms: e.target.checked,
                                                        }))
                                                    }

                                                />

                                            }
                                            label="SMS"
                                            sx={{
                                                fontFamily: "Poppins, sans-serif",
                                                color: "#91898C", // Color del texto por defecto
                                                "& .Mui-checked + span": { color: "#833A53" }, // Color del texto cuando está seleccionado
                                            }}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.llamada}
                                                    disabled={true} // Deshabilita el checkbox
                                                    sx={{
                                                        color: '#91898C',
                                                        '&.Mui-checked': { color: '#833A53' },

                                                    }}
                                                    onChange={(e) =>
                                                        setFormData((prevState) => ({
                                                            ...prevState,
                                                            llamada: e.target.checked,
                                                        }))
                                                    }
                                                />
                                            }
                                            label="Llamada"
                                            sx={{
                                                fontFamily: "Poppins, sans-serif",
                                                color: "#91898C", // Color del texto por defecto
                                                "& .Mui-checked + span": { color: "#833A53" }, // Color del texto cuando está seleccionado
                                            }}

                                        />
                                    </Box>
                                </Grid> */}

                            </Grid>
                            <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2, mt: 0.5 }} />
                            {/* Buttons */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", paddingTop: 0, backgroundColor: "white", position: "sticky", mb: -1.8 }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => navigate('/')} sx={{
                                        border: "1px solid #CCCFD2",
                                        borderRadius: "4px",
                                        color: "#833A53",
                                        backgroundColor: "transparent",
                                        fontVariant: "normal",
                                        letterSpacing: "1.12px",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        fontFamily: "Poppins",
                                        opacity: 1,
                                        "&:hover": {
                                            backgroundColor: "#f3e6eb",
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            color: "#833A53",
                                            letterSpacing: "1.12px",
                                            opacity: 1,
                                        },
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Box display="flex" flexDirection="column" alignItems="flex-start">
                                    {/* Botón de registro */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!isFormValid() || !arePasswordsValid()}
                                        onClick={handleOpenModal}
                                        sx={{
                                            background: "#833A53 0% 0% no-repeat padding-box",
                                            border: "1px solid #D4D1D1",
                                            borderRadius: "4px",
                                            opacity: 1,
                                            fontVariant: "normal",
                                            fontWeight: "500",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            letterSpacing: "1.12px",
                                            color: "#FFFFFF", // Letra blanca
                                        }}
                                    >
                                        Registrarse
                                    </Button>
                                </Box>


                            </Box>

                        </Paper>
                    </Box>
                    {/* Modal de términos y condiciones */}
                    <Modal
                        open={modalOpen}
                        onClose={handleModalClose}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{
                            timeout: 500,
                        }}
                    >

                        <Fade in={modalOpen}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "971px",
                                    maxHeight: "704p",
                                    bgcolor: "background.paper",
                                    boxShadow: 24,
                                    p: 4,
                                    borderRadius: "12px",
                                }}
                            >
                                <IconButton
                                    onClick={handleModalClose}
                                    sx={{
                                        position: "absolute",
                                        top: 6,
                                        right: 12,
                                        color: "#C6BFC2",
                                        fontSize: "18px",
                                    }}
                                >
                                    ✕
                                </IconButton>
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "550",
                                        fontSize: "26px",
                                        lineHeight: "55px",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        marginBottom: 2,
                                        marginTop: -1,
                                    }}
                                >
                                    Términos y condiciones

                                </Typography>
                                <Divider sx={{ width: 'calc(100% + 64px)', marginBottom: 2, marginTop: -1, marginLeft: "-32px" }} />
                                <Box
                                    ref={termsContainerRef}
                                    sx={{
                                        maxHeight: "430px",
                                        overflowY: "auto",
                                        paddingRight: 2,
                                        scrollbarWidth: "thin",
                                        scrollbarColor: "#d9d9d9 transparent",
                                        "&::-webkit-scrollbar": {
                                            width: "8px",
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: "transparent",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            background: "#d9d9d9",
                                            borderRadius: "4px",
                                        },
                                        "&::-webkit-scrollbar-button": {
                                            display: "none",
                                        },
                                    }}
                                >
                                    <Typography sx={{
                                        textAlign: "left",
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "500",
                                        fontSize: "16px",
                                        lineHeight: "22px",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                    }} paragraph>
                                        Aparte del crédito disponible en su cuenta, no establecemos un tope en el número de mensajes que puede enviar a través de nuestro servicio.
                                    </Typography>
                                    <Typography component="ul" variant="body1" sx={{
                                        textAlign: "left",
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "500",
                                        fontSize: "16px",
                                        lineHeight: "22px",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,

                                    }}>
                                        <li>Siguiendo estos términos y condiciones.</li>
                                        <li>Con fines estrictamente apegados a la ley.</li>
                                        <li>Respetando todas las leyes y normativas aplicables, tanto locales como internacionales.</li>
                                        <li>Para los objetivos por los que fueron creados.</li>
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "500",
                                        fontSize: "16px",
                                        lineHeight: "22px",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,

                                    }} paragraph>
                                        Al emplear nuestros servicios, deberá evitar:
                                    </Typography>
                                    <Typography component="ul" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} variant="body1">
                                        <li>Enviar mensajes SMS no solicitados o spam.</li>
                                        <li>Alterar los detalles de origen en cualquier mensaje electrónico.</li>
                                        <li>
                                            Enviar mensajes que sean difamatorios, discriminatorios, obscenos, ofensivos,
                                            amenazantes, abusivos, acosadores, dañinos, o violentos.
                                        </li>
                                        <li>Participar en fraudes o esquemas piramidales.</li>
                                        <li>Transmitir códigos maliciosos como virus o troyanos.</li>
                                        <li>Violar la privacidad de terceros.</li>
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        Además de los términos ya establecidos, esta sección es aplicable si se emplea nuestro servicio de API.
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        Hemos habilitado la posibilidad de que las empresas o los individuos se conecten a nuestro servidor para facilitar el envío de mensajes de texto directamente a nuestro sistema de SMS.
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        Nos reservamos el derecho de aprobar o rechazar conexiones de clientes y APIs según nuestro propio criterio.
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        Promovemos activamente las políticas contra el envío de spam (mensajes no solicitados).
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        Proporcionaremos especificaciones para las conexiones API y nos esforzaremos por mantenerlas actualizadas. Estas especificaciones pueden estar incompletas y estar sujetas a cambios sin previo aviso.
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        Para todos los servicios de mensajería SMS, le proporcionaremos un nombre de usuario y contraseña. Cualquier medida de seguridad adicional, incluyendo pero no limitado a la gestión de accesos y contraseñas, uso indebido, etc., quedará bajo responsabilidad del usuario.
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        fontSize: "16px",
                                    }} paragraph>
                                        EL CLIENTE será responsable totalmente de la gestión de las contraseñas y acceso al sistema donde se utiliza el servicio de SMS. CENTERNEXT quedará exento de cualquier uso inapropiado o indebido realizado por cuentas que gestionan el SMS.
                                    </Typography>
                                </Box>
                                <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mt: 2 }} />
                                <Box display="flex" justifyContent="space-between" mt={3.8}
                                    sx={{
                                        marginBottom: "-6px"

                                    }}>
                                    <Button variant="outlined" onClick={handleModalClose}
                                        sx={{
                                            border: "1px solid #CCCFD2",
                                            borderRadius: "4px",
                                            color: "#833A53",
                                            backgroundColor: "transparent",
                                            fontVariant: "normal",
                                            letterSpacing: "1.12px",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            height: "36px",
                                            width: "116px",
                                            opacity: 1,
                                            marginRight: "20px",
                                            marginTop: "-5px",
                                            "&:hover": {
                                                backgroundColor: "#f3e6eb",
                                                fontStyle: "normal",
                                                fontVariant: "normal",
                                                fontWeight: "600",
                                                fontSize: "14px",
                                                fontFamily: "Poppins",
                                                color: "#833A53",
                                                letterSpacing: "1.12px",
                                                opacity: 1,
                                            },
                                        }}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={!isButtonEnabled}
                                        sx={{
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "500",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            letterSpacing: "1.12px",
                                            height: "36px",
                                            width: "114px",
                                            color: "#FFFFFF",
                                            opacity: 0.9,
                                            marginLeft: "20px",
                                            marginTop: "-5px",
                                            backgroundColor: "#833A53",

                                            padding: "10px 20px",
                                            textTransform: "uppercase",

                                            "&:hover": {
                                                backgroundColor: "#A54261",
                                                fontStyle: "normal",
                                                fontVariant: "normal",
                                                fontWeight: "600",
                                                fontSize: "14px",
                                                fontFamily: "Poppins",
                                                letterSpacing: "1.12px",
                                                color: "#FFFFFF",
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        Aceptar
                                    </Button>
                                </Box>
                            </Box>
                        </Fade>
                    </Modal>

                    <Modal
                        open={errorModalOpen}
                        onClose={handleErrorModalClose}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{
                            timeout: 500,
                        }}
                    >
                        <Fade in={errorModalOpen}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "310px",
                                    left: "38%",
                                    width: "480px",
                                    height: "228px",
                                    bgcolor: "#FFFFFF",
                                    boxShadow: "0px 0px 16px #00131F52",
                                    borderRadius: "8px",
                                    opacity: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    p: 3,
                                }}
                            >
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "600",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#574B4F",
                                        opacity: 1,
                                        fontSize: "20px",
                                        lineHeight: "22px",
                                        marginBottom: 2,
                                    }}
                                >
                                    Error al realizar registro
                                </Typography>
                                <Typography
                                    sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                    }}
                                >
                                    Algo salió mal. Inténtelo de nuevo o regrese más tarde.
                                </Typography>
                                <Box display="flex" justifyContent="flex-end" mt={3}>
                                    <Button
                                        variant="text"
                                        onClick={handleErrorModalClose}
                                        sx={{
                                            border: "1px solid #CCCFD2",
                                            borderRadius: "4px",
                                            color: "#833A53",
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            opacity: 1,
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                backgroundColor: "#f3e6eb",
                                            },
                                        }}>
                                        Cerrar
                                    </Button>
                                </Box>
                            </Box>
                        </Fade>
                    </Modal>


                </Container>
            </PublicLayout>
        </Box>
    );
};
export default Register;
