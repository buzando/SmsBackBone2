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
    Divider,
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
import IconCheckedCircle1 from "../assets/IconCheckedCircle1.svg";
import IconCheckedCircle2 from "../assets/IconCheckedCircle2.svg";
import Iconeyeslash from '../assets/Iconeyeslash.svg';
import Iconeyesopen from '../assets/Iconeyesopen.svg';
import ModalError from "../components/commons/ModalError";

const TermsAndConditions: React.FC = () => {
    const [ShowModalError, setShowModalError] = useState(false);
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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            setShowModalError(true);
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
                setShowModalError(true);
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
                "Ingresa un correo electrónico válido"
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
            borderColor: "transparent",
            borderTopWidth: 3,

        },
    }));

    // Íconos personalizados para los pasos
    const CustomStepIcon = ({ active, completed }) => {
        return (
            <Box
                sx={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {active ? (
                    <img src={IconCheckedCircle1} alt="Paso actual" style={{ width: 28, height: 28 }} />
                ) : completed ? (
                    <img src={IconCheckedCircle2} alt="Paso completado" style={{ width: 28, height: 28 }} />
                ) : (
                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: "2px solid #BCB7B8",
                            backgroundColor: "transparent",
                        }}
                    />
                )}
            </Box>
        );
    };

    return (
        <Box
            sx={{
                backgroundColor: "#F2F2F2",
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >

            <PublicLayout>
                <Container fixed sx={{ marginTop: "50px", backgroundColor: "#F2F2F2", width: "844px", height: "500px" }}>
                    <Typography
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
                            fontSize: "28px", mb: "20px", ml: "-30px"
                        }}
                    >
                        Recuperación de la cuenta
                    </Typography>

                    <Box sx={{
                        height:
                            activeStep === 5
                                ? '141px'
                                : activeStep === 4
                                    ? '527px'
                                    : '422px',
                        width: '844px',
                        background: '#FFFFFF 0% 0% no-repeat padding-box',
                        border: '2px solid #E6E4E4CC',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center', marginLeft: "-24px"
                    }}>
                        {activeStep !== 5 && (
                            <Box sx={{ width: "815px", height: "63px", mt: -4.5, marginLeft: "-10px" }}>
                                <Stepper
                                    activeStep={activeStep}
                                    connector={<CustomStepConnector />}
                                    alternativeLabel
                                    sx={{ gap: "35px", mt: "-30px" }}
                                >
                                    {steps.map((label, index) => (
                                        <Step key={label}>
                                            <StepLabel
                                                StepIconComponent={(props) => (
                                                    <CustomStepIcon active={activeStep === index} completed={activeStep > index} />
                                                )}
                                            >
                                                {/* Texto debajo del paso */}
                                                <Typography
                                                    sx={{
                                                        textAlign: "center", fontFamily: "Poppins", mt: "-5px",
                                                        fontSize: "12px", fontWeight: 500, whiteSpace: 'nowrap',
                                                        color:
                                                            activeStep === index
                                                                ? "#833A53"
                                                                : activeStep > index
                                                                    ? "#8F4E6399"
                                                                    : "#BCB7B8",
                                                    }}
                                                >
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                                {/*Lineas impostor*/}
                                <Box>
                                    <Divider
                                        sx={{
                                            width: '135px',
                                            position: "absolute",
                                            mt: "-44px",
                                            ml: "78px",
                                            border: '1.5px solid',
                                            borderColor: activeStep > 0 ? "#8F4E63" : "#BCB7B8",
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Divider
                                        sx={{
                                            width: '134.5px',
                                            position: "absolute",
                                            mt: "-44px",
                                            ml: "240px",
                                            border: '1.5px solid',
                                            borderColor: activeStep > 1 ? "#8F4E63" : "#BCB7B8",
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Divider
                                        sx={{
                                            width: '134.5px',
                                            position: "absolute",
                                            mt: "-44px",
                                            ml: "402px",
                                            border: '1.5px solid',
                                            borderColor: activeStep > 2 ? "#8F4E63" : "#BCB7B8",
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Divider
                                        sx={{
                                            width: '155px',
                                            position: "absolute",
                                            mt: "-44px",
                                            ml: "564px",
                                            border: '1.5px solid',
                                            borderColor: activeStep > 3 ? "#8F4E63" : "#BCB7B8",
                                        }}
                                    />
                                </Box>

                            </Box>
                        )}
                        {activeStep !== 5 && (
                            <Divider sx={{ width: 'calc(100% + 0px)', marginLeft: '-0px', mt: "-15px" }} />
                        )}
                        <Box padding={0}>
                            {activeStep === 0 && (
                                <Box sx={{ width: '840px', height: '220px', borderColor: "#FFFFFF" }}>
                                    <Box sx={{
                                        padding: "40px",
                                        height: '200px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}>
                                        <Typography
                                            sx={{
                                                textAlign: "center",
                                                fontStyle: "normal",
                                                fontVariant: "normal",
                                                fontWeight: "500",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: "#330F1B",
                                                opacity: 1,
                                                fontSize: "16px",
                                                marginBottom: "8px",
                                                marginTop: "-10px",
                                            }}
                                        >
                                            Ingrese el correo electrónico asociado para localizar su cuenta.
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginTop: "12px",
                                            }}
                                        >
                                            <Box sx={{ alignSelf: "center", marginLeft: "-230px" }}>
                                                <Typography
                                                    sx={{
                                                        textAlign: "left",
                                                        fontWeight: 500,
                                                        fontFamily: "Poppins",
                                                        letterSpacing: "0px",
                                                        color: errorMessage ? "#D01247" : "#330F1B",
                                                        opacity: 1,
                                                        fontSize: "16px",
                                                        marginBottom: "10px",
                                                    }}
                                                >
                                                    Correo Electrónico
                                                </Typography>
                                            </Box>
                                            <TextField
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                variant="outlined"
                                                fullWidth
                                                required
                                                sx={{
                                                    width: "380px", border: "1px solid", borderColor: errorMessage ? "#D01247" : "#9B9295",
                                                    borderRadius: "5px",
                                                    fontFamily: "Poppins",
                                                    "& .MuiInputBase-input": {
                                                        fontFamily: "Poppins",
                                                    },
                                                    "& .MuiOutlinedInput-root": {
                                                        "& fieldset": {
                                                            borderColor: "#DADADA",
                                                        },
                                                        "&:hover fieldset": {
                                                            borderColor: "#9B9295",
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            borderColor: "#9B9295",
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
                                                                <IconButton
                                                                    disableRipple
                                                                    sx={{
                                                                        '&:hover': {
                                                                            backgroundColor: 'transparent', // sin hover
                                                                        },
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={errorMessage ? infoiconerror : infoicon}
                                                                        alt="info"
                                                                        style={{ width: 24, height: 24 }}
                                                                    />
                                                                </IconButton>

                                                            </Tooltip>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                        {errorMessage && (
                                            <Typography variant="body2" color="#D01247"
                                                sx={{
                                                    marginTop: "130px", marginLeft: "200px", letterSpacing: "0.1px",
                                                    position: "absolute", fontSize: "12px", fontFamily: "Poppins",
                                                }}>
                                                {errorMessage}{" "}
                                                <Link component={LinkDom} to="/register" color="#330F1B"
                                                    sx={{ fontSize: "12px", fontFamily: "Poppins", letterSpacing: "0.1px" }}
                                                >
                                                    Registrate
                                                </Link>
                                            </Typography>
                                        )}

                                        {/* Línea horizontal */}
                                        <Divider sx={{ width: 'calc(100% + 80px)', marginLeft: '-40px', mt: 9.5 }} />


                                    </Box>
                                    {/* Botones */}
                                    <Box display="flex" pt={3} gap={72} alignContent={"center"} justifyContent={"center"} mt={4.5}>
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
                            )}

                            {activeStep === 1 && (
                                <Box
                                    sx={{
                                        padding: "20px",
                                        width: "839px",
                                        textAlign: "center",
                                        marginTop: "45px",
                                        backgroundColor: "#FFFFFF"
                                    }}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center", mt: -6
                                    }}>
                                        <Typography
                                            variant="body1"
                                            gutterBottom
                                            sx={{
                                                textAlign: "left",
                                                fontSize: "16px",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: "#330F1B",
                                                opacity: 1, whiteSpace: 'nowrap', marginLeft: "-14px", marginBottom: "25px", marginTop: "10px"
                                            }}
                                        >
                                            Seleccione el medio por el cual prefiere restablecer su cuenta.
                                        </Typography>

                                        <RadioGroup
                                            row
                                            value={SendType}
                                            onChange={onChangeValue}
                                            sx={{
                                                display: "flex", gap: 0,
                                                flexDirection: "column",
                                                alignItems: "left",
                                                justifyContent: "left", marginLeft: "-315px"
                                            }}
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
                                                    color: SendType === "SMS" ? "#8F4D63" : "#807D7E",
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
                                                    color: SendType === "EMAIL" ? "#8F4D63" : "#807D7E",
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

                                    </Box>
                                    <Divider sx={{ width: 'calc(100% + 42px)', marginLeft: '-21px', marginTop: "80px", marginBottom: "-15px" }} />

                                    <Box display="flex" gap={73} alignContent={"center"} justifyContent={"center"}
                                        sx={{ backgroundColor: "#FFFFFF", position: "absolute", marginTop: "44px" }}
                                    >
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
                                        maxWidth: "800px",
                                        textAlign: "center",
                                        marginTop: "30px",
                                        backgroundColor: "#FFFFFF"
                                    }}
                                >
                                    <Box sx={{ maxWidth: "512px", }}>
                                        <Typography variant="body1" gutterBottom sx={{
                                            textAlign: 'center',
                                            fontSize: '16px',
                                            fontFamily: "Poppins",
                                            color: '#330F1B',
                                            marginTop: "40px"
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
                                                            fontWeight: 500,
                                                            fontFamily: "Poppins",
                                                            fontSize: "26px",
                                                            width: "54px",
                                                            height: "19px",
                                                            margin: "0 3px",
                                                            marginTop: "1px",
                                                            letterSpacing: "0px",
                                                            color: "#330F1B",

                                                        },
                                                    }}
                                                    style={{ backgroundColor: "#F2F2F2", border: "1px solid #9B9295", width: "54px", height: "55px", borderRadius: "8px" }}
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
                                    </Box>
                                    {/* Línea horizontal */}

                                    <Divider sx={{ width: 'calc(100% + 403px)', marginLeft: '-201px', mb: -3.5, mt: 8 }} />

                                    <Box display="flex" gap={73} alignContent={"center"} justifyContent={"center"}
                                        sx={{ backgroundColor: "#FFFFFF", position: "absolute", marginTop: "50px", marginLeft: "-173px" }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setActiveStep(1);
                                                setIsPhoneDigitsValid(true);
                                                setLoading(false);
                                            }}
                                            sx={{
                                                border: "1px solid #CCCFD2",
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
                                                border: '1px solid #D0CDCD',
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
                                        backgroundColor: "#FFFFFF", marginTop: "-30px"
                                    }}
                                >
                                    {/* Parte 1: Reenviar código */}
                                    <Box sx={{ width: "408px", height: "26px", mt: 5 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                textAlign: "left",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: "#330F1B",
                                                opacity: 1,
                                                fontSize: "16px"
                                            }}
                                        >
                                            ¿El código no fue recibido o caduco?{" "}
                                            <Link
                                                component="button"
                                                onClick={handleResendToken}
                                                disabled={isResendDisabled}
                                                sx={{
                                                    fontWeight: 500,
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    opacity: 1,
                                                    fontSize: "16px", position: "absolute",
                                                    cursor: isResendDisabled ? "not-allowed" : "pointer",
                                                    color: isResendDisabled ? "#ccc" : "#8F4D63",
                                                    textTransform: "none",
                                                    "&:hover": {
                                                        backgroundColor: "transparent",
                                                    },
                                                }}
                                            >
                                                {isResendDisabled ? "Espere un minuto para otro Reenvio" : "Reenviar"}
                                            </Link>
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ width: 'calc(100% + 434px)', marginLeft: '-217px', mt: 1.5 }} />

                                    <Box sx={{ width: "296px", height: "24px" }}>
                                        <Typography
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "left",
                                                font: "normal normal normal 14px/54px Poppins",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: "#8F4D63",
                                                opacity: 1,
                                                marginTop: "1px",
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
                                    </Box>


                                    {/* Parte 2: Cajas de texto y contador */}
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start', marginTop: "25px"
                                    }}>
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
                                                gap: "12px",
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
                                                            height: "25px",
                                                            marginTop: "0px", backgroundColor: "rgba(229, 228, 228, 0.3)",
                                                            borderRadius: "6px", borderColor: "#9B9295"
                                                        },
                                                    }}
                                                    error={!isCodeValid}
                                                    sx={{
                                                        width: "54px",
                                                        height: "56px",
                                                        margin: "0 0px",
                                                        "& .MuiOutlinedInput-root": {
                                                            backgroundColor: "rgba(229, 228, 228, 0.3)",
                                                            borderRadius: "6px",
                                                            "& fieldset": {
                                                                border: "1px solid #9B9295",
                                                            },
                                                            "&:hover fieldset": {
                                                                border: "1px solid #9B9295",
                                                            },
                                                            "&.Mui-focused fieldset": {
                                                                border: "1px solid #9B9295",
                                                            },
                                                        },
                                                        "& input": {
                                                            color: "#330F1B",
                                                        },

                                                    }}
                                                />
                                            ))}
                                        </Box>
                                        {!isCodeValid && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: !codeExpired ? "red" : "red",
                                                    marginTop: "102px", position: "absolute", fontFamily: "Poppins", fontSize: "12px"
                                                }}
                                            >
                                                Código Inválido
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
                                                    marginTop: "116px", position: "absolute"
                                                }}
                                            >
                                                El tiempo para validar el código expiró. Por favor, solicite un nuevo código.
                                            </Typography>
                                        )}
                                    </Box>
                                    {/* Línea horizontal */}
                                    <Divider sx={{ width: 'calc(100% + 432px)', marginLeft: '-216px', marginTop: "40px", marginBottom: "-10px" }} />


                                    {/* Parte 3: Botones */}
                                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "28px", position: "absolute", gap: 74, ml: "-190px" }}>
                                        <Button variant="outlined" onClick={Return} sx={{
                                            border: "1px solid #CCCFD2",
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
                                                border: "1px solid #D0CDCD",
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
                                <Box sx={{ backgroundColor: "#FFFFFF", marginTop: "25px", }}>
                                    <Box sx={{
                                        width: "468px", height: "214px"
                                    }}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                textAlign: "center",
                                                fontSize: "16px",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0px",
                                                color: "#330F1B",
                                                opacity: 1,
                                            }}
                                        >
                                            Ingrese una contraseña nueva para recuperar su cuenta
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", width: "380px", marginLeft: "35px", mt: 3 }}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    color: !isPasswordValid(password) && password.length > 0 ? "#D01247" : "#330F1B",
                                                    opacity: 1, mb: 1.5
                                                }}
                                            >
                                                Nueva contraseña
                                            </Typography>
                                            <TextField
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                variant="outlined"
                                                fullWidth
                                                required
                                                error={!isPasswordValid(password) && password.length > 0}
                                                helperText={
                                                    !isPasswordValid(password) && password.length > 0
                                                        ? "Ingresa una contraseña válida."
                                                        : ""
                                                }
                                                FormHelperTextProps={{
                                                    sx: {
                                                        fontFamily: 'Poppins', position: "absolute", mt: "58px",
                                                    },
                                                }}
                                                sx={{
                                                    marginBottom: "20px",
                                                    '& .MuiInputBase-input': {
                                                        fontFamily: 'Poppins',
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                sx={{
                                                                    padding: 0, mr: 2,
                                                                    backgroundColor: 'transparent',
                                                                    '&:hover': {
                                                                        backgroundColor: 'transparent',
                                                                    },
                                                                }}
                                                            >
                                                                <img src={showPassword ? Iconeyesopen : Iconeyeslash} alt="Ver/Ocultar" />
                                                            </IconButton>
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
                                        </Box>

                                        <Box sx={{ display: "flex", flexDirection: "column", width: "380px", marginLeft: "35px", mt: 1.5 }}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: "16px",
                                                    fontFamily: "Poppins",
                                                    letterSpacing: "0px",
                                                    color: confirmPassword.length > 0 && confirmPassword !== password ? "#D01247" : "#330F1B",
                                                    opacity: 1,
                                                }}
                                            >
                                                Confirmar contraseña
                                            </Typography>
                                            <TextField
                                                type={showConfirmPassword ? "text" : "password"}
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
                                                FormHelperTextProps={{
                                                    sx: {
                                                        fontFamily: 'Poppins', position: "absolute", mt: "58px"
                                                    },
                                                }}
                                                sx={{
                                                    marginTop: 1.5,
                                                    '& .MuiInputBase-input': {
                                                        fontFamily: 'Poppins',
                                                    },
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                sx={{
                                                                    padding: 0, mr: 1,
                                                                    backgroundColor: 'transparent',
                                                                    '&:hover': {
                                                                        backgroundColor: 'transparent',
                                                                    },
                                                                }}
                                                            >
                                                                <img src={showConfirmPassword ? Iconeyesopen : Iconeyeslash} alt="Ver/Ocultar" />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: "66px", position: "absolute", ml: "45px" }}>
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
                                            label="Habilitar verificación en dos pasos"
                                            sx={{
                                                '& .MuiFormControlLabel-label': {
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '14px',
                                                    color: enableTwoFactor ? '#8F4D63' : '#574B4FCC',
                                                },
                                            }}
                                        />
                                    </Box>
                                    {/* Línea horizontal */}
                                    <Divider sx={{ width: 'calc(100% + 373px)', marginLeft: '-187px', marginTop: "110px", marginBottom: "-25px" }} />
                                    <Box display="flex" justifyContent="space-between" pt={2} gap={74} sx={{ position: "absolute", marginLeft: "-160px", mt: 3 }}>
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
                                                border: "1px solid #D0CDCD",
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

                            )}
                            {activeStep === 5 && (
                                <Box
                                    sx={{
                                        fontFamily: "Poppins",
                                        textAlign: "center", height: "154px"
                                    }}
                                >
                                    <Typography
                                        gutterBottom
                                        sx={{
                                            padding: "20px",
                                            fontSize: "16px", color: "#330F1B",
                                            fontFamily: "Poppins",
                                            textAlign: "left", mt: 1, ml: "-68px",
                                        }}
                                    >
                                        Se ha llegado al límite de envíos de código,
                                        el ingreso a la cuenta quedará bloqueado por <br></br>

                                        <Box component="span" sx={{ color: "#f44336", fontWeight: 500, position: "absolute", marginTop: "-23px", marginLeft: "742px" }}>
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
                                        gutterBottom
                                        sx={{
                                            padding: "5px",
                                            fontSize: "16px", color: "#330F1B",
                                            fontFamily: "Poppins",
                                            textAlign: "left", ml: "-51px"
                                        }}
                                    >
                                        Inténtelo más tarde
                                    </Typography>
                                </Box>
                            )}

                        </Box>
                    </Box>
                    <ModalError
                        isOpen={ShowModalError}
                        title='Ocurrió un problema'
                        message='Intente más tarde'
                        buttonText='Aceptar'
                        onClose={() => setShowModalError(false)}

                    />

                </Container>

            </PublicLayout>
        </Box >

    );
};

export default TermsAndConditions;
