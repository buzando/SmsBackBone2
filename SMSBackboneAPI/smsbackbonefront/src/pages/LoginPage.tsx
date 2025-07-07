import { useState, useContext, useEffect } from 'react';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { AppContext } from '../hooks/useContextInitialState';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link as LinkDom } from 'react-router-dom';
import ButtonLoadingSubmit from '../components/commons/MainButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import Link from '@mui/material/Link';
import AppIconByNuxiba from '../assets/conect.svg';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import "../Logincss.css";
import InputAdornment from "@mui/material/InputAdornment";
import infoicon from '../assets/Icon-info.svg';
import infoiconerror from '../assets/Icon-infoerror.svg';
import Iconeyeslash from '../assets/Iconeyeslash.svg';
import Iconeyesopen from '../assets/Iconeyesopen.svg';
import logored from '../assets/Logo_Red-Quantum.svg';

type errorObj = {
    code: string;
    description: string;
};

type UnconfirmeEmail = {
    sending: boolean;
    isUnconfirmed: boolean;
    email: string;
    isMailSent: boolean;
};


const Login: React.FC = () => {
    const { setContextState } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [emailErr, setEmailErr] = useState(true);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageAlert, setMessageAlert] = useState('Correo o contraseña inválidos');
    const [openAlert, setOpenAlert] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [disabled, setdisabled] = useState(false);
    const [passwordErr, setPasswordErr] = useState(true);
    const [showPasswordu, setShowPasswordu] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPasswordu((prev) => !prev);
    };

    const [UnconfirmedEmail, setUnconfirmedEmail] = useState<UnconfirmeEmail>({
        sending: false,
        isUnconfirmed: false,
        email: '',
        isMailSent: false,
    });
    const navigate = useNavigate();



    useEffect(() => {
        const token = localStorage.getItem('token');

        const isLogin = !!token;

        if (isLogin) {
            navigate('/Autentification');
        }
    }, []);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value; // Convertir a mayúsculas automáticamente
        setEmail(value);

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValidEmail = emailRegex.test(value);

        // Actualizar el estado de error dependiendo de si es válido o no
        setEmailErr(isValidEmail);

        // Deshabilitar el botón si el email no es válido
        setdisabled(!(isValidEmail && passwordErr));

        if (isValidEmail) {
            setLoading(false);
        }
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setPassword(value);

        const isValidPassword = value.length >= 8;
        setPasswordErr(isValidPassword);

        // Deshabilitar el botón si email o contraseña son inválidos
        setdisabled(!(isValidPassword && emailErr));
    };



    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setUnconfirmedEmail({
            sending: false,
            isUnconfirmed: false,
            email: '',
            isMailSent: false,
        });

        try {


            const data = {
                email,
                password,
            };

            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*"
            };


            const response = await axios.post(
                `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_LOGIN_ENDPOINT}`,
                data,
                { headers },
            );

            if (response.status === 200) {
                const { user, token, expiration } = await response.data;
                setLoading(false);
                // root or admin
                setContextState({ user, token, expiration });
                localStorage.setItem('token', token);
                localStorage.setItem('expirationDate', expiration);
                localStorage.setItem('userData', JSON.stringify(user));
                navigate('/Autentification');

            }
        } catch (error) {
            setLoading(false);
            setSpinner(false);
            if (axios.isAxiosError(error)) {
                const axiosError: AxiosError = error;
                if (axiosError.response) {
                    console.log('Error de respuesta:', axiosError.response);
                    console.log('Código de estado:', axiosError.response.status);
                    const responseObj = axiosError.response.data as errorObj;
                    switch (responseObj.code) {
                        case 'UnconfirmedEmail':
                            setMessageAlert(
                                'El correo electrónico no está confirmado, confírmelo primero',
                            );
                            setUnconfirmedEmail({
                                sending: false,
                                isUnconfirmed: true,
                                email: email,
                                isMailSent: false,
                            });
                            break;
                        case 'BadCredentials':
                            setMessageAlert('Credenciales inválidas');
                            break;
                        case 'UserLocked':
                            setMessageAlert('El usuario ha sido bloqueado');
                            break;
                    }
                    setOpenAlert(true);
                } else {
                    console.log('Error de solicitud:', axiosError.message);
                    setMessageAlert('Error de solicitud: ' + axiosError.message);
                    setOpenAlert(true);
                }
            } else {
                console.log('Error de conexión en el servidor -> ', error);
                setMessageAlert('Ocurrio un error de conexión con el servidor');
                setOpenAlert(true);
            }
        }
    };
    const onTryToSendEmailConfirmation = async (event: React.FormEvent) => {
        event.preventDefault();
        setUnconfirmedEmail((prevState) => ({
            ...prevState,
            sending: true,
        }));
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_SEND_CONFIRMATION_EMAIL + UnconfirmedEmail.email}&type=confirmation&reason=confirmation`,
            );

            if (response.status === 200) {
                const { success, message } = await response.data;
                console.log(success, ' - ', message);
                setUnconfirmedEmail((prevState) => ({
                    ...prevState,
                    isMailSent: true,
                    sending: false,
                }));
                setOpenAlert(false);
            }
        } catch (error) {
            setLoading(false);
            if (axios.isAxiosError(error)) {
                const axiosError: AxiosError = error;
                if (axiosError.response) {
                    console.log('Error de respuesta:', axiosError.response);
                    console.log('Código de estado:', axiosError.response.status);
                    const responseObj = axiosError.response.data as errorObj;
                    switch (responseObj.code) {
                        case 'InvalidUser':
                            setMessageAlert(
                                'No se encontraron coincidencias con el correo electrónico',
                            );
                            break;
                        case 'ConfirmationUnset':
                            setMessageAlert(
                                'No se pudo enviar el correo electrónico de confirmación',
                            );
                            break;
                    }
                    setOpenAlert(true);
                } else {
                    console.log('Error de solicitud:', axiosError.message);
                    setMessageAlert('Error de solicitud: ' + axiosError.message);
                    setOpenAlert(true);
                }
            } else {
                console.log('Error de conexión en el servidor -> ', error);
                setMessageAlert('Ocurrio un error de conexión con el servidor');
                setOpenAlert(true);
            }
        }
    };

    return (
        <Grid container spacing={0} sx={{ minHeight: '100vh' }}>
            <Grid item xs={12} lg={6}>
                {spinner && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                        }}
                    >
                        <CircularProgress
                            size={50}
                            thickness={8}
                        />
                    </Box>
                )}
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <form onSubmit={handleSubmit} id="formlogin">
                        <Paper elevation={0} sx={{ width: '100%', borderRadius: '20px' }}>
                            <Box sx={{ margin: '20px', paddingX: '20px', paddingY: '30px' }}>
                                <Typography
                                    align="center"
                                    sx={{
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "500",
                                        fontSize: "28px",
                                        fontFamily: "Poppins",
                                        color: "#330F1B",
                                        letterSpacing: "1px",
                                        marginBottom: "59px",
                                    }}
                                >
                                    ¡Bienvenida!
                                </Typography>
                                <Typography

                                    sx={{
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "500",
                                        fontFamily: "Poppins",
                                        fontSize: "22px",
                                        letterSpacing: "0px",
                                        color: "#330F1B",
                                        opacity: 1,
                                        marginBottom: "40px",
                                    }}
                                >
                                    Inicio de sesión
                                </Typography>
                                <Box>
                                    <Typography
                                        sx={{
                                            textAlign: 'left',
                                            fontFamily: 'Poppins',
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "500",
                                            fontSize: '16px',
                                            lineHeight: '20px',
                                            letterSpacing: '0px',
                                            color: !emailErr ? "#D01247" : "#330F1B",
                                            opacity: 1,
                                        }}
                                    >
                                        Correo electrónico
                                    </Typography>
                                    <TextField
                                        value={email}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                        fullWidth
                                        margin="dense"
                                        error={!emailErr}
                                        helperText={
                                            <span style={{
                                                minHeight: "17px", display: "inline-block",
                                                fontFamily: 'Poppins',
                                                fontSize: "12px",
                                                color: "#D01247",
                                                marginTop: "2px", marginBottom: "6px",
                                            }}>
                                                {!emailErr ? "Ingresa un correo electrónico válido" : " "}
                                            </span>
                                        }
                                        InputProps={{
                                            sx: {
                                                marginBottom: "-0px",
                                                "& input": {
                                                    backgroundColor: "transparent !important",
                                                },
                                                "& input:focus": {
                                                    backgroundColor: "transparent !important",
                                                    boxShadow: "none !important",
                                                    outline: "none !important",
                                                },
                                                fontStyle: "normal",
                                                fontVariant: "normal",
                                                fontWeight: "500",
                                                fontSize: "16px",
                                                lineHeight: "54px",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0.3px",
                                                color: "#574B4F",
                                                opacity: 1,
                                            },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Tooltip title={
                                                        <Box
                                                            sx={{
                                                                backgroundColor: "#FFFFFF",
                                                                borderRadius: "8px",
                                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                                padding: "8px 12px",
                                                                fontSize: "14px",
                                                                fontFamily: "Poppins",
                                                                color: "#574B4F",
                                                                transform: "translate(-10px, -22px)",
                                                            }}
                                                        >
                                                            <>
                                                                · Solo caracteres tales <br />
                                                                · Longitud máxima de 40 <br />
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
                                                                src={!emailErr ? infoiconerror : infoicon}
                                                                alt="info-icon"
                                                                style={{ width: 24, height: 24 }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />

                                </Box>

                                <Box>
                                    <Typography
                                        sx={{
                                            textAlign: 'left',
                                            fontFamily: 'Poppins',
                                            fontWeight: '500',
                                            fontSize: '16px',
                                            lineHeight: '20px',
                                            letterSpacing: '0px',
                                            color: !passwordErr ? "#D01247" : "#330F1B",
                                            marginTop: "-8px",
                                            marginBottom: "-8px",
                                            opacity: 1,
                                        }}
                                    >
                                        Contraseña
                                    </Typography>
                                    <TextField
                                        type={showPasswordu ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        variant="outlined"
                                        fullWidth
                                        margin="normal"
                                        error={!passwordErr}
                                        helperText={
                                            <span style={{
                                                minHeight: "20px", display: "inline-block",
                                                fontFamily: 'Poppins',
                                                fontSize: "12px",
                                                color: "#D01247"
                                            }}>
                                                {!passwordErr ? "Ingresa una contraseña válida" : " "}
                                            </span>
                                        }
                                        InputProps={{
                                            sx: {
                                                "& input": {
                                                    backgroundColor: "transparent !important",
                                                },
                                                "& input:focus": {
                                                    backgroundColor: "transparent !important",
                                                    boxShadow: "none !important",
                                                    outline: "none !important",
                                                },
                                                fontStyle: "normal",
                                                fontVariant: "normal",
                                                fontWeight: "500",
                                                fontSize: "16px",
                                                lineHeight: "54px",
                                                fontFamily: "Poppins",
                                                letterSpacing: "0.3px",
                                                color: "#574B4F",
                                                opacity: 1,
                                            },
                                            endAdornment: (
                                                <InputAdornment position="end">

                                                    <Tooltip title={

                                                        <Box
                                                            sx={{
                                                                backgroundColor: "#FFFFFF",
                                                                borderRadius: "8px",
                                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                                padding: "8px 12px",
                                                                fontSize: "14px",
                                                                transform: "translate(-10px, -22px)",
                                                                fontFamily: "Poppins",
                                                                color: "#000000",
                                                                whiteSpace: "pre-line",
                                                            }}
                                                        >
                                                            <>
                                                                •Ver / Ocultar contraseña <br />
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
                                                        <IconButton onClick={togglePasswordVisibility}
                                                            disableRipple
                                                            sx={{
                                                                backgroundColor: "transparent !important",
                                                                "&:hover": {
                                                                    backgroundColor: "transparent !important",
                                                                },
                                                            }}
                                                        >
                                                            <img
                                                                alt={!showPasswordu ? "Iconeyeslash" : "Iconeyesopen"}
                                                                src={!showPasswordu ? Iconeyeslash : Iconeyesopen}
                                                                style={{ width: 24, height: 24 }}
                                                            />
                                                        </IconButton>
                                                    </Tooltip>

                                                </InputAdornment>
                                            ),
                                        }}
                                        required
                                    />

                                </Box>

                                <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={2}>
                                    <ButtonLoadingSubmit
                                        text="Ingresar"
                                        isLoading={loading}
                                        disabled={disabled} // Depende de emailErr y passwordErr
                                    />

                                    <Link
                                        component={LinkDom}
                                        variant="caption"
                                        to={'/password_reset'}
                                        sx={{
                                            textAlign: 'center',
                                            textDecoration: 'underline',
                                            fontStyle: "normal",
                                            fontVariant: "normal",
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            lineHeight: "54px",
                                            fontFamily: "Poppins",
                                            letterSpacing: '0px',
                                            color: '#8F4D63',
                                            opacity: 1,
                                        }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </Box>

                                <Box sx={{ width: '100%', marginTop: 1 }}>
                                    <Collapse in={openAlert}>
                                        <Alert
                                            severity="error"
                                            action={
                                                <Box>
                                                    {UnconfirmedEmail.isUnconfirmed && (
                                                        <Tooltip
                                                            title={`Reenviar correo de confirmación a ${UnconfirmedEmail.email}`}
                                                        >
                                                            {UnconfirmedEmail.sending ? (
                                                                <CircularProgress size={20}></CircularProgress>
                                                            ) : (
                                                                <Button
                                                                    color="inherit"
                                                                    size="small"
                                                                    onClick={onTryToSendEmailConfirmation}
                                                                >
                                                                    REENVIAR
                                                                </Button>
                                                            )}
                                                        </Tooltip>
                                                    )}
                                                    <IconButton
                                                        aria-label="close"
                                                        color="inherit"
                                                        size="small"
                                                        onClick={() => {
                                                            setOpenAlert(false);
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Box>
                                            }
                                            sx={{ mb: 2 }}
                                        >
                                            {messageAlert}
                                        </Alert>
                                    </Collapse>
                                </Box>
                                <Box sx={{ marginTop: 0 }}>
                                    <Collapse in={UnconfirmedEmail.isMailSent}>
                                        <Alert
                                            severity="success"
                                            sx={{ mb: 2 }}
                                            action={
                                                <IconButton
                                                    aria-label="close"
                                                    color="inherit"
                                                    size="small"
                                                    onClick={() => {
                                                        setUnconfirmedEmail((prevState) => ({
                                                            ...prevState,
                                                            isMailSent: false,
                                                        }));
                                                    }}
                                                >
                                                    <CloseIcon fontSize="inherit" />
                                                </IconButton>
                                            }
                                        >
                                            Correo de confirmación enviado a "{UnconfirmedEmail.email}
                                            "
                                        </Alert>
                                    </Collapse>
                                </Box>

                                <Divider />
                                <Box display="flex" justifyContent="center" marginTop={1}>
                                    <Typography variant="caption" marginRight={1} sx={{
                                        textAlign: 'center',
                                        font: 'normal normal 600 14px/54px Poppins',
                                        letterSpacing: '0px',
                                        color: '#330F1B',
                                    }}>
                                        ¿Aún no tienes una cuenta?
                                    </Typography>
                                    <Link component={LinkDom} variant="caption" to={'/register'} sx={{
                                        textAlign: 'center',
                                        textDecoration: 'underline',
                                        font: 'normal normal 600 14px/54px Poppins',
                                        letterSpacing: '0px',
                                        color: '#8F4D63',
                                    }}>
                                        Registrate
                                    </Link>
                                </Box>

                                <Typography
                                    sx={{
                                        position: "fixed",
                                        bottom: "10px",
                                        right: "9%",
                                        fontStyle: "normal",
                                        fontVariant: "normal",
                                        fontWeight: "400",
                                        fontSize: "12px",
                                        lineHeight: "22px",
                                        fontFamily: "Poppins",
                                        letterSpacing: "0px",
                                        color: "#FFFFFF",
                                        opacity: 0.7,
                                        zIndex: 1300
                                    }}
                                >
                                    Copyright © 2024 Nuxiba. Todos los derechos reservados. Se prohíbe el uso no autorizado.
                                </Typography>


                                <Typography
                                    variant="caption"
                                    align="center"
                                    display="block"
                                    mt={2}
                                >
                                    {import.meta.env.PACKAGE_VERSION}
                                </Typography>
                            </Box>
                        </Paper>
                    </form>


                </Box>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', lg: 'block' } }}>
                <Box
                    sx={{
                        background:
                            'transparent linear-gradient(311deg, #0B0029 0%, #B9A0A8 100%) 0% 0% no-repeat padding-box;',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <img src={logored} alt="Nuxiba Logo" width="410" />
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
