import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link as LinkDom } from 'react-router-dom';
import {
    Container, Typography, Box, TextField, Button, Link, Paper, Stepper, StepConnector,
    Step,
    StepLabel,
    Checkbox,
    FormControlLabel, InputAdornment,
    Tooltip,
    IconButton,
} from '@mui/material';
import InfoIcon from "@mui/icons-material/Info";
import PublicLayout from '../components/PublicLayout';
import axios from 'axios';
import Radio from "@mui/material/Radio";
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import RadioGroup from "@mui/material/RadioGroup";
import Countdown from 'react-countdown';
import CircularProgress from '@mui/material/CircularProgress';
import { Modal } from "@mui/material";
import "../chooseroom.css"
import { height, margin, styled, width } from "@mui/system";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'

const TermsAndConditions: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0); // Estado del paso actual
    const [SendType, setSendType] = useState('');
    const [token, settoken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [enableTwoFactor, setEnableTwoFactor] = useState(false); // Checkbox para 2FA
    const navigate = useNavigate();
    const [resendAttempts, setResendAttempts] = useState(0); // Contador de reenvíos
    const maxResendAttempts = 5; // Límite de reenvíos
    const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isCodeValid, setIsCodeValid] = useState(true);
    const [authCode, setAuthCode] = useState<string[]>(Array(6).fill(""));
    const [countdownTime, setCountdownTime] = useState(60000);
    const [codeExpired, setCodeExpired] = useState(false);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [phoneDigits, setPhoneDigits] = useState<string[]>(Array(4).fill(""));
    const [isPhoneDigitsValid, setIsPhoneDigitsValid] = useState(false);
    const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
    const [messageError, setMessageError] = useState("");
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const steps = [
        "Ingresar correo",
        "Seleccionar canal",
        "Validar identidad",
        "Verificar código",
        "Crear nueva contraseña",
    ];
    const isEmailValid = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const startCountdown = () => {
        setCountdownTime(60000); // Reinicia a 1 minuto
        setCodeExpired(false); // Restablece el estado de expiración
        setStartTime(Date.now());
    };
    const handleResendToken = async () => {
        if (isResendDisabled) return; // Evita reenviar si ya está bloqueado

        setIsResendDisabled(true);
        setCodeExpired(false);
        setStartTime(Date.now());

        try {
            await SendToken(); // Llama a la función que reenvía el token
        } catch (error) {
            console.error("Error al reenviar el token:", error);
        } finally {
            setTimeout(() => setIsResendDisabled(false), 60000); // Desbloquea tras 1 minuto
        }
    };

    const showErrorModal = (message: string) => {
        setMessageError(message);
        setIsErrorModalOpen(true);
    };

    // Función para cerrar el modal de error
    const closeErrorModal = () => {
        setIsErrorModalOpen(false);
    };

    const checkLockout = async () => {
        const usuario = localStorage.getItem("userData");
        if (!usuario) return;

        const obj = JSON.parse(usuario);

        if (obj.lockoutEnabled) {
            const lockoutEnd = new Date(obj.lockoutEndDateUtc);
            const now = new Date();
            setLoading(true);

            if (now < lockoutEnd) {
                // Si el bloqueo aún está vigente, calcular tiempo restante
                setLockoutEndTime(lockoutEnd);
                setActiveStep(5); // Ir al Step 4 directamente
            } else {
                // Si el bloqueo expiró, resetear valores en el usuario
                const userObj = { ...obj }; // Clonar objeto usuario
                try {
                    userObj.lockoutEnabled = false;
                    const data = {
                        Id: userObj.id,
                        email: userObj.email,
                        lockoutEnabled: userObj.lockoutEnabled,
                        lockoutEndDateUtc: null,
                    };

                    const headers = {
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Headers": "X-Requested-With",
                        "Access-Control-Allow-Origin": "*",
                    };

                    const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_LOCKOUT_USER}`;
                    await axios.post(apiEndpoint, data, { headers });

                    userObj.lockoutEnabled = false;
                    userObj.lockoutEndDateUtc = null;
                    localStorage.setItem("userData", JSON.stringify(userObj));
                } catch (error) {
                    console.error("Error al registrar el desbloqueo:", error);
                }
            }
        }
        setLoading(false);
    };


    useEffect(() => {
        checkLockout();
    }, []);


    const handleSendNewPassword = async () => {

        try {

            const data = {
                Email: email,
                NewPassword: password,
                TwoFactorAuthentication: enableTwoFactor
            };

            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*"
            };

            const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_NEWPASSWORD_USER}`;
            const response = await axios.post(apiEndpoint, data, {
                headers
            });
            if (response.status === 200) {
                const { user, token, expiration } = await response.data;
                setLoading(false);
                localStorage.setItem('token', token);
                localStorage.setItem('expirationDate', expiration);
                localStorage.setItem('userData', JSON.stringify(user));
                navigate('/chooseroom');
            }
        } catch (error) {
            console.error("Error al registrar el desbloqueo:", error);
            showErrorModal("Hubo un problema al cambiar su contraseña intente más tarde");
        }

    };

    function onChangeValue(event: React.ChangeEvent<HTMLInputElement>) {
        setSendType(event.target.value);
        return true;
    }


    const SendToken = async (event?: React.FormEvent) => {
        event?.preventDefault();
        setLoading(true);
        if (resendAttempts + 1 >= maxResendAttempts) {
            // Activar bloqueo
            const currentDate = new Date();
            const lockoutDuration = 30; // En minutos
            const lockoutEnd = new Date(currentDate.getTime() + lockoutDuration * 60000);
            // Actualizar lockout en JSON del usuario
            const usuario = localStorage.getItem("userData");
            if (usuario) {
                const userObj = JSON.parse(usuario);
                userObj.lockoutEnabled = true;
                userObj.lockoutEndDateUtc = lockoutEnd.toISOString();
                localStorage.setItem("userData", JSON.stringify(userObj));


                try {

                    const data = {
                        Id: userObj.id, // ID del usuario, asegurarte de que esté presente en el JSON almacenado.
                        email: userObj.email, // Email del usuario.
                        lockoutEnabled: userObj.lockoutEnabled, // Indica que el bloqueo está habilitado.
                        lockoutEndDateUtc: lockoutEnd.toISOString(), // Fecha y hora en formato ISO 8601.
                    };

                    // Definir encabezados
                    const headers = {
                        'Content-Type': 'application/json',
                        "Access-Control-Allow-Headers": "X-Requested-With",
                        "Access-Control-Allow-Origin": "*",
                    };

                    const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_LOCKOUT_USER}`;
                    await axios.post(apiEndpoint, data, {
                        headers
                    });
                } catch (error) {
                    console.error("Error al registrar el desbloqueo:", error);
                    showErrorModal("Hubo un problema general, Intente más tarde");
                }
            }


            setLockoutEndTime(lockoutEnd);
            setActiveStep(5);


        }
        else {


            const usuario = localStorage.getItem("userData");

            const obj = JSON.parse(usuario!);
            let dato = "";
            if (SendType == "SMS") {
                dato = obj.phonenumber;
                if (activeStep === 1) {
                    setActiveStep(2);
                    return;
                }
            }
            if (SendType == "EMAIL") {
                dato = obj.email;
            }
            try {
                const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_AUTENTIFICATION_ENDPOINT}?dato=${dato}&tipo=${SendType}&reason=Code`;
                const response = await axios.get(
                    request
                );

                if (response.status === 200) {
                    settoken(response.data);
                    setActiveStep(3);
                    startCountdown();
                    setResendAttempts(resendAttempts + 1);
                }
                setLoading(false);
            }
            catch (error) {
                console.error("Error al registrar el desbloqueo:", error);
                showErrorModal("Hubo un problema al mandar su token");
            }

        }
    }



    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);


        try {


            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GETUSERBYEMAIL_USER + email}`;
            const response = await axios.get(
                request
            );

            if (response.status === 200) {
                setActiveStep(1);
                localStorage.setItem('userData', JSON.stringify(response.data));
                checkLockout();
            }
            setLoading(false);
        }
        catch {
            setErrorMessage(
                "Tu correo no se encuentra en el sistema. ¿Desea registrarte?"
            );
        }

    }

    const handleCodeChange = (index: number, value: string) => {
        if (/^\d$/.test(value) || value === "") {
            const newCode = [...authCode];
            newCode[index] = value;
            setAuthCode(newCode);

            // Enfocar automáticamente el siguiente cuadro
            if (value && index < authCode.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };


    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && index > 0 && !authCode[index]) {
            inputRefs.current[index - 1]?.focus();
        }
    };


    const Return = async (event: React.FormEvent) => {
        event.preventDefault();
        setActiveStep(0);
        setCountdownTime(60000);
        return true;
    }

    const ValidateToken = async (event?: React.FormEvent) => {
        event?.preventDefault();

        if (countdownTime === 0) { // Verificar si el contador expiró
            setCodeExpired(true); // Mostrar mensaje de expiración
            return;
        }


        if (authCode.join("") != token) {
            setIsCodeValid(false);
        } else {
            setIsCodeValid(true);
            setActiveStep(4);
        }
        return true;
    }

    const handlePhoneDigitsChange = (index: number, value: string) => {
        if (/^\d$/.test(value) || value === "") {
            const updatedDigits = [...phoneDigits];
            updatedDigits[index] = value;
            setPhoneDigits(updatedDigits);

            // Mover el foco automáticamente al siguiente campo
            if (value !== "" && index < phoneDigits.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }

            // Resetear estado de error al escribir
            setIsPhoneDigitsValid(true);
            setHasAttemptedValidation(false);
        }
    };

    const handleValidatePhoneDigits = () => {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const phoneNumber = userData?.phonenumber || "";

        // Verificar si los 4 últimos dígitos coinciden
        const isValid = phoneDigits.join("") === phoneNumber.slice(-4);

        setIsPhoneDigitsValid(isValid);
        setHasAttemptedValidation(true);

        if (isValid) {
            setActiveStep(3); // Avanzar al Step 2 si es válido
        }
    };

    const isPasswordValid = (password: string): boolean => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password)
        );
    };

    const handleAccept = () => {
        setIsErrorModalOpen(false);
        navigate("/login"); // Redirige a la página de login
    };

    // Estilo personalizado para los conectores
    const CustomStepConnector = styled(StepConnector)(() => ({
        "& .MuiStepConnector-line": {
            borderColor: "#DADADA",
            borderTopWidth: 3,

        },
    }));

    // Íconos personalizados para los pasos
    const CustomStepIcon = styled("div")(({ active, completed }) => ({
        width: 24,
        height: 24,
        borderRadius: "50%",
        border: `2px solid ${active || completed ? "#833A53" : "#DADADA"}`,
        backgroundColor: active || completed ? "#833A53" : "transparent",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "14px",
    }));

    return (
        <Box
            sx={{
                backgroundColor: "#F2F2F2", // Fondo gris
                minHeight: "100vh", // Asegura que cubra toda la pantalla
                width: "100%",
                display: "flex",
                flexDirection: "column",

            }}
        >

            <PublicLayout>
                <Container maxWidth="sm" fixed sx={{ marginTop: "71px", marginBottom: 8 }}>
                    <Typography

                        align="center"
                        gutterBottom
                        sx={{
                            textAlign: "center",
                            fontStyle: "normal",
                            fontVariant: "normal",
                            fontWeight: "500",
                            lineHeight: "55px",
                            fontFamily: "Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            fontSize: "28px",
                        }}
                    >
                        Recuperación de la cuenta
                    </Typography>

                    <Box sx={{ width: "100%", marginBottom: 4 }}>
                        <Stepper
                            activeStep={activeStep}
                            connector={<CustomStepConnector />}
                            alternativeLabel
                            sx={{ gap: "40px" }}
                        >
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <CustomStepIcon
                                                active={activeStep === index}
                                                completed={activeStep > index}
                                            >
                                                {activeStep >= index ? "✓" : ""}
                                            </CustomStepIcon>
                                        )}
                                    >
                                        {/* Texto debajo del paso */}
                                        <Typography
                                            sx={{
                                                textAlign: "center",
                                                font: "normal normal 600 14px/22px Poppins",
                                                color: activeStep === index
                                                    ? "#833A53"
                                                    : activeStep > index
                                                        ? "#833A53"
                                                        : "#DADADA",
                                                marginTop: 1,
                                            }}
                                        >
                                            {label}
                                        </Typography>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Box padding={1}>
                        {activeStep === 0 && (
                            <Paper elevation={10} sx={{ width: '100%', borderRadius: '10px', height: '300px' }}>
                                <Box sx={{
                                    margin: '20px', // Mantener el margen
                                    paddingX: '20px', // Padding horizontal
                                    paddingY: '40px', // Incrementar el padding vertical para mayor espacio interno
                                    height: '100%', // Ajustar el contenido a la altura del Paper
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between', // Espacio uniforme entre elementos
                                }}>
                                    <Typography
                                        sx={{
                                            textAlign: "left",
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "500",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: "#330F1B",
                                            opacity: 1,
                                            fontSize: "16px",
                                            marginBottom: "8px", // Espaciado inferior normal
                                            marginTop: "-10px", // Subir el texto al borde superior
                                        }}
                                    >
                                        Ingrese el correo electrónico asociado para localizar su cuenta.
                                    </Typography>
                                    <Box
                                        sx={{
                                            marginTop: "12px", // Espaciado adicional para bajar el Typography y el input
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                textAlign: "left",
                                                font: "normal normal medium 16px/54px",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: "#330F1B",
                                                opacity: 1,
                                                fontSize: "16px",
                                                marginBottom: "12px", // Espaciado entre el título y el input
                                            }}
                                        >
                                            Correo Electrónico
                                        </Typography>
                                        <TextField
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            variant="outlined"
                                            fullWidth
                                            required
                                            /*Fuente del campo de texto*/
                                            sx={{
                                                fontFamily: "Poppins",
                                                "& .MuiInputBase-input": {
                                                    fontFamily: "Poppins",
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    "& fieldset": {
                                                        borderColor: "#DADADA", // Color de borde normal
                                                    },
                                                    "&:hover fieldset": {
                                                        borderColor: "#9B9295", // Color de borde al pasar el mouse
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#9B9295", // Color de borde cuando el campo está enfocado
                                                        borderWidth: "1px",

                                                    },
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
                                                                        transform: "translate(2px, -15px)",
                                                                        borderColor: "#00131F3D",
                                                                        borderStyle: "solid",
                                                                        borderWidth: "1px"
                                                                    }}
                                                                >
                                                                    <>
                                                                        • Ingrese su correo registrado <br />
                                                                        en el sistema
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
                                                            <IconButton>
                                                                <img src={infoicon} style={{ width: 24, height: 24 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                    {errorMessage && (
                                        <Typography variant="body2" color="error" sx={{ marginTop: 1 }}>
                                            {errorMessage}{" "}
                                            <Link component={LinkDom} to="/register" color="primary">
                                                Registrarte
                                            </Link>
                                        </Typography>
                                    )}

                                    {/* Línea horizontal */}
                                    <Box
                                        sx={{
                                            borderTop: "1px solid #DADADA",
                                            position: "relative",
                                            left: -40,
                                            right: 0,
                                            width: "535px",
                                            height: "1px",
                                            backgroundColor: "red",
                                            my: 1,
                                            marginBottom: "-35px",
                                            marginTop: "35px",
                                        }}
                                    />



                                    <Box
                                        sx={{
                                            borderTop: "0px solid #DADADA", // Línea gris claro
                                            marginTop: "32px", // Mayor separación del contenido superior
                                            paddingTop: "8px", // Menor separación con los botones
                                            //Cambios para anchura de linea

                                        }}
                                    >
                                        {/* Botones */}
                                        <Box display="flex" justifyContent="space-between" pt={2}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate("/")}
                                                sx={{
                                                    border: "1px solid #CCCFD2",
                                                    borderRadius: "4px",
                                                    color: "#833A53",
                                                    fontFamily: "Poppins",
                                                    fontStyle: "normal",
                                                    fontVariant: "normal",
                                                    letterSpacing: "1.12px",
                                                    fontSize: "14px",
                                                    lineHeight: "54px",
                                                    fontWeight: "600",
                                                    height: "38px",
                                                    backgroundColor: "transparent",
                                                    "&:hover": {
                                                        backgroundColor: "#f3e6eb",

                                                    },
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    fontFamily: "Poppins",
                                                    backgroundColor: "#833A53",
                                                    color: "#FFFFFF",
                                                    padding: "10px 20px",
                                                    textTransform: "uppercase",
                                                    height: "38px",
                                                    letterSpacing: "1.12px",
                                                    fontStyle: "normal",
                                                    fontVariant: "normal",
                                                    fontWeight: "500",
                                                    "&:hover": {
                                                        backgroundColor: "#A54261",
                                                    },
                                                }}
                                                onClick={handleSubmit}
                                                disabled={!isEmailValid(email) || loading}
                                            >
                                                {loading ? <CircularProgress size={24} thickness={8} sx={{ color: "#FFFFFF", }} /> : "Enviar"}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        )}

                        {activeStep === 1 && (
                            <Box
                                sx={{
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    maxWidth: "500px",
                                    textAlign: "center",
                                    marginTop: "20px",
                                    backgroundColor: "#FFFFFF"
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    gutterBottom
                                    sx={{
                                        textAlign: "left",
                                        font: "normal normal normal 16px/20px Poppins",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                    }}
                                >
                                    Seleccione el canal por el cual prefiere recibir su código de autenticación
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginTop: "20px",
                                    }}
                                >
                                    <RadioGroup
                                        row
                                        value={SendType}
                                        onChange={onChangeValue}
                                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                                    >
                                        <FormControlLabel
                                            value="SMS"
                                            control={<Radio sx={{
                                                fontFamily: "Poppins",
                                                color: "#574B4F",
                                                "&.Mui-checked": {
                                                    color: "#8F4D63",
                                                },
                                            }} />}
                                            label="SMS"
                                            sx={{
                                                fontFamily: "Poppins",
                                                color: SendType === "SMS" ? "#8F4D63" : "#574B4F",
                                                fontWeight: SendType === "SMS" ? "bold" : "normal",
                                                transition: "color 0.3s ease",
                                            }}
                                            componentsProps={{
                                                typography: {
                                                    sx: {
                                                        fontFamily: "Poppins",
                                                    },
                                                },
                                            }}
                                        />
                                        <FormControlLabel
                                            value="EMAIL"
                                            control={<Radio sx={{
                                                fontFamily: "Poppins",
                                                color: "#574B4F",
                                                "&.Mui-checked": {
                                                    color: "#8F4D63",
                                                },
                                            }} />}
                                            label="Correo electrónico"
                                            sx={{
                                                fontFamily: "Poppins",
                                                color: SendType === "EMAIL" ? "#8F4D63" : "#574B4F",
                                                fontWeight: SendType === "EMAIL" ? "bold" : "normal",
                                                transition: "color 0.3s ease",
                                            }}
                                            componentsProps={{
                                                typography: {
                                                    sx: {
                                                        fontFamily: "Poppins",
                                                    },
                                                },
                                            }}
                                        />
                                    </RadioGroup>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        onClick={SendToken}
                                        sx={{
                                            textAlign: "center",
                                            fontFamily: "Poppins",
                                            FontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "500",
                                            letterSpacing: "1.12px",
                                            color: "#FFFFFF",
                                            textTransform: "uppercase",
                                            opacity: 1,
                                            backgroundColor: "#833A53",
                                            height: "40px",
                                            padding: "0 20px",
                                        }}
                                    >

                                        Enviar
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {activeStep === 2 && (
                            <Box
                                sx={{
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    maxWidth: "500px",
                                    textAlign: "center",
                                    marginTop: "20px",
                                    backgroundColor: "#FFFFFF"
                                }}
                            >
                                <Typography variant="body1" gutterBottom sx={{
                                    textAlign: 'left',
                                    font: 'normal normal medium 16px/54px Poppins',
                                    fontFamily: "Poppins",
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    marginBottom: "-5px",
                                    opacity: 1,
                                }} >
                                    Ingresa los 4 últimos dígitos del teléfono configurado
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "10px",
                                        marginTop: "18px",
                                        height: "75px",

                                    }}
                                >
                                    {phoneDigits.map((digit, index) => (
                                        <TextField
                                            key={index}
                                            value={digit}
                                            type="text"
                                            inputProps={{
                                                maxLength: 1,
                                                style: {
                                                    textAlign: "center",
                                                    font: "normal normal medium 26px/54px Poppins",
                                                    fontFamily: "Poppins",
                                                    fontSize: "26px",
                                                    width: "54px",
                                                    height: "19px",
                                                    margin: "0 3px",
                                                    marginTop: "1px",
                                                    letterSpacing: "0px",
                                                    color: "#330F1B",
                                                    opacity: 1,

                                                },
                                            }}
                                            inputRef={(el) => (inputRefs.current[index] = el)} // Asignar referencia
                                            onChange={(e) => handlePhoneDigitsChange(index, e.target.value)} // Manejar cambios
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !digit && index > 0) {
                                                    inputRefs.current[index - 1]?.focus(); // Enfocar cuadro anterior
                                                }
                                            }}
                                            error={hasAttemptedValidation && !isPhoneDigitsValid} // Mostrar error solo después de intentar validar
                                            sx={{ width: "50px", height: "50px" }}
                                        />
                                    ))}
                                </Box>

                                {hasAttemptedValidation && !isPhoneDigitsValid && (
                                    <Typography variant="body2" color="error" sx={{ marginTop: 2, fontFamily: "Poppins", }}>
                                        Los dígitos ingresados son incorrectos. Por favor, inténtalo nuevamente.
                                    </Typography>
                                )}

                                {/* Línea horizontal */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        left: -23,
                                        right: 0,
                                        width: "500px",
                                        height: "1px",
                                        backgroundColor: "#E0E0E0",
                                        my: 1,
                                    }}
                                />


                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: "20px",
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setActiveStep(1);
                                            setIsPhoneDigitsValid(true);
                                            setLoading(false);
                                        }}
                                        sx={{
                                            border: "1px solid #60293C",
                                            borderRadius: "4px",
                                            color: "#833A53",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                backgroundColor: "#f3e6eb",
                                            },
                                        }}
                                    >
                                        Regresar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            handleValidatePhoneDigits();
                                            SendToken();
                                        }}
                                        disabled={
                                            phoneDigits.some(
                                                digit => digit === '' ||
                                                    phoneDigits.join('') !== JSON.parse(localStorage.getItem('userData') || '{}')?.phonenumber?.slice(-4)
                                            )
                                        }
                                        sx={{
                                            background: '#833A53 0% 0% no-repeat padding-box',
                                            border: '1px solid #60293C',
                                            borderRadius: '4px',
                                            opacity: 0.9,
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        Validar
                                    </Button>
                                </Box>
                            </Box>

                        )}

                        {activeStep === 3 && (
                            <Box
                                sx={{
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    maxWidth: "600px",
                                    width: "90%",
                                    textAlign: "center",
                                    marginTop: "20px",
                                    backgroundColor: "#FFFFFF",
                                }}
                            >
                                {/* Parte 1: Reenviar código */}

                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: "left",
                                        font: "normal normal 600 16px/20px Poppins",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        opacity: 1,
                                    }}
                                >
                                    ¿El código no fue recibido o caduco?{" "}
                                    <Link
                                        component="button"
                                        onClick={handleResendToken}
                                        disabled={isResendDisabled} // Deshabilita el botón si está bloqueado
                                        sx={{
                                            fontWeight: "bold",

                                            cursor: isResendDisabled ? "not-allowed" : "pointer", // Cambia el cursor si está bloqueado
                                            color: isResendDisabled ? "#ccc" : "#8F4D63", // Cambia el color si está bloqueado
                                            textTransform: "none",
                                            "&:hover": {
                                                backgroundColor: "transparent", // Evita que cambie de color al hacer hover
                                            },
                                        }}
                                    >
                                        {isResendDisabled ? "Espere un minuto para otro Reenvio" : "Reenviar"}
                                    </Link>
                                </Typography>

                                <Box
                                    sx={{
                                        borderBottom: "2px solid #ddd",

                                        marginTop: "10px",
                                    }}
                                />


                                <Typography
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "left", // Alineación a la izquierda
                                        font: "normal normal normal 14px/54px Poppins",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#8F4D63",
                                        opacity: 1,
                                        marginTop: "1px", // Separación del texto superior
                                    }}
                                >
                                    <span>Tiempo de expiración del código:</span>
                                    <Countdown
                                        date={startTime + countdownTime} // Recalcula la fecha final según `startTime`
                                        renderer={({ minutes, seconds, completed }) => {
                                            if (completed) {
                                                setCodeExpired(true); // Mostrar mensaje de expiración
                                                return <span>00:00</span>;
                                            }
                                            return (
                                                <span>
                                                    {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                                                </span>
                                            );
                                        }}
                                    />





                                </Typography>



                                {/* Parte 2: Cajas de texto y contador */}

                                <Typography
                                    variant="body1"
                                    fontFamily={"Poppins"}
                                    gutterBottom
                                    sx={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        fontWeight: "500", // Medium weight
                                        fontSize: "16px", // Font size
                                        lineHeight: "54px",
                                        letterSpacing: "0px",
                                        color: isCodeValid ? "black" : "#D01247",
                                        opacity: 1,
                                        marginTop: "-18px",

                                    }}
                                >
                                    Código
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between 10px",
                                        marginTop: "1px",
                                        margin: "0 -4px",
                                        gap: "10px",
                                    }}
                                >
                                    {authCode.map((digit, index) => (
                                        <TextField
                                            key={index}
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
                                            inputRef={(el) => (inputRefs.current[index] = el)}
                                            inputProps={{
                                                maxLength: 1,
                                                style: {
                                                    textAlign: "center",
                                                    fontFamily: "Poppins",
                                                    fontSize: "26px",
                                                    height: "27px",
                                                    marginTop: "-8px"
                                                },
                                            }}
                                            error={!isCodeValid}
                                            sx={{
                                                width: "54px",
                                                height: "56px",
                                                margin: "0 3px",

                                            }}
                                        />
                                    ))}
                                </Box>
                                {!isCodeValid && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: !codeExpired ? "red" : "inherit",
                                            marginTop: "15px",
                                        }}
                                    >
                                        "Código Inválido"
                                    </Typography>
                                )}
                                {codeExpired && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "red",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            textAlign: "left",
                                            marginTop: "16px",
                                        }}
                                    >
                                        El tiempo para validar el código expiró. Por favor, solicite un nuevo código.
                                    </Typography>
                                )}

                                {/* Línea horizontal */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        left: -23,
                                        right: 0,
                                        width: "485px",
                                        height: "1px",
                                        backgroundColor: "#E0E0E0",
                                        my: 1,
                                    }}
                                />



                                {/* Parte 3: Botones */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
                                    <Button variant="outlined" onClick={Return} sx={{
                                        border: "1px solid #60293C",
                                        borderRadius: "4px",
                                        color: "#833A53",
                                        backgroundColor: "transparent",
                                        "&:hover": {
                                            backgroundColor: "#f3e6eb",
                                        },
                                    }}
                                    >
                                        Regresar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={ValidateToken}
                                        disabled={authCode.some((digit) => digit === "") || codeExpired} // Desactiva si faltan dígitos o expiró el tiempo
                                        sx={{
                                            background: "#833A53 0% 0% no-repeat padding-box",
                                            border: "1px solid #60293C",
                                            borderRadius: "4px",
                                            opacity: 0.9,
                                            color: "#FFFFFF",
                                            "&:hover": {
                                                backgroundColor: "#60293C",
                                            },
                                        }}
                                    >
                                        Validar
                                    </Button>

                                </Box>
                            </Box>

                        )}
                        {activeStep === 4 && (
                            <Paper elevation={10} sx={{ width: '100%', borderRadius: '20px' }}>
                                <Box sx={{ margin: '20px', paddingX: '20px', paddingY: '30px' }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            textAlign: "left",
                                            font: "normal normal normal 16px/20px Poppins",
                                            fontFamily: "Poppins",
                                            letterSpacing: "0px",
                                            color: "#330F1B",
                                            opacity: 1,
                                        }}
                                    >
                                        Ingrese una nueva contraseña
                                    </Typography>
                                    <TextField

                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={!isPasswordValid(password) && password.length > 0}
                                        helperText={
                                            !isPasswordValid(password) && password.length > 0
                                                ? "Debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número."
                                                : ""
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
                                                                    transform: "translate(-1px, -15px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }}
                                                            >
                                                                <>
                                                                    • Ingrese mínimo 8 carácteres.
                                                                    <br />
                                                                    • Ingrese una letra mayúscula.
                                                                    <br />
                                                                    • Ingrese una letra minúscula.
                                                                    <br />
                                                                    • Ingrese un número.
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
                                                            sx={{
                                                                padding: 0,
                                                                backgroundColor: 'transparent',
                                                                '&:hover': {
                                                                    backgroundColor: 'transparent',
                                                                },
                                                            }}
                                                        >
                                                            <img src={!isPasswordValid(password) && password.length > 0 ? infoiconerror : infoicon}></img>
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField

                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        variant="outlined"
                                        fullWidth
                                        required
                                        error={confirmPassword.length > 0 && confirmPassword !== password}
                                        helperText={
                                            confirmPassword.length > 0 && confirmPassword !== password
                                                ? "La confirmación no coincide con la nueva contraseña."
                                                : ""
                                        }

                                        sx={{ marginTop: 3, fontFamily: "Poppins", }}


                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={enableTwoFactor}
                                                onChange={(e) => setEnableTwoFactor(e.target.checked)}
                                                color="primary"
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
                                        }
                                        label="Habilitar verificación en 2 pasos"
                                        sx={{
                                            '& .MuiFormControlLabel-label': {
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '14px',
                                                color: '#574B4FCC',
                                            },
                                        }}
                                    />
                                    <Box display="flex" justifyContent="space-between" pt={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setActiveStep(1);
                                                setIsPhoneDigitsValid(true);
                                                setLoading(false);
                                            }}
                                            sx={{
                                                border: "1px solid #60293C",
                                                borderRadius: "4px",
                                                color: "#833A53",
                                                backgroundColor: "transparent",
                                                "&:hover": {
                                                    backgroundColor: "#f3e6eb",
                                                },
                                            }}
                                        >
                                            Regresar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSendNewPassword}
                                            disabled={
                                                !isPasswordValid(password) ||
                                                password !== confirmPassword ||
                                                password === "" ||
                                                confirmPassword === ""
                                            }
                                            sx={{
                                                background: "#833A53 0% 0% no-repeat padding-box",
                                                border: "1px solid #60293C",
                                                fontFamily: "Poppins",
                                                borderRadius: "4px",
                                                opacity: 0.9,
                                                color: "#FFFFFF",
                                            }}
                                        >
                                            Validar
                                        </Button>

                                    </Box>
                                </Box>
                            </Paper>

                        )}
                        {activeStep === 5 && (
                            <Box
                                sx={{
                                    fontFamily: "Poppins",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    maxWidth: "500px",
                                    textAlign: "center",
                                    marginTop: "20px",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{
                                        fontFamily: "Poppins",
                                        margin: "5px",
                                        marginBottom: "5px",
                                        marginTop: "5px",
                                        textAlign: "left",
                                        width: "100%",
                                    }}
                                >
                                    Se ha llegado al límite de envíos de código,
                                    el ingreso a la cuenta quedará bloqueado por :

                                    <Box component="span" sx={{ color: "#f44336", fontWeight: "bold", marginRight: "5px" }}>
                                        <Countdown
                                            date={lockoutEndTime || new Date()}
                                            renderer={({ hours, minutes, seconds, completed }) =>
                                                completed ? (
                                                    <span>¡El bloqueo ha terminado! Intente nuevamente.</span>
                                                ) : (
                                                    <span>
                                                        0{hours}:{minutes}:{seconds}
                                                    </span>
                                                )}
                                        />
                                    </Box>
                                    minutos.
                                </Typography>

                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    sx={{
                                        fontFamily: "Poppins",
                                        margin: "5px",
                                        marginBottom: "5px",
                                        marginTop: "5px",
                                        textAlign: "left",
                                        width: "100%",
                                    }}
                                >
                                    Inténtelo más tarde
                                </Typography>
                            </Box>
                        )}


                    </Box>
                    <Modal
                        open={isErrorModalOpen}
                        onClose={closeErrorModal}
                        aria-labelledby="error-modal-title"
                        aria-describedby="error-modal-description"
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 400,
                                bgcolor: "background.paper",
                                border: "2px solid #ccc",
                                borderRadius: "8px",
                                boxShadow: 24,
                                p: 4,
                            }}
                        >
                            <Typography id="error-modal-title" variant="h6" component="h2">
                                Error en la recuperación de cuenta
                            </Typography>
                            <Typography id="error-modal-description" sx={{ mt: 2 }}>
                                {messageError}
                            </Typography>
                            <Button
                                onClick={handleAccept}
                                sx={{
                                    background: "#833A53 0% 0% no-repeat padding-box",
                                    border: "1px solid #60293C",
                                    borderRadius: "4px",
                                    opacity: 0.9,
                                    color: "#FFFFFF",
                                    width: "100%",
                                    "&:hover": { backgroundColor: "#60293C", },
                                }}
                            >
                                Aceptar
                            </Button>
                        </Box>
                    </Modal>
                </Container>

            </PublicLayout>
        </Box>

    );
};

export default TermsAndConditions;
