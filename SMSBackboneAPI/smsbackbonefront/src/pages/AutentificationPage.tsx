import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Countdown from 'react-countdown';
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from '@mui/material/CircularProgress';
import ButtonLoadingSubmit from '../components/commons/MainButton';
import axios from "axios";
import "../chooseroom.css"



const Autentification: React.FC = () => {
    const [SendType, setSendType] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, settoken] = useState('');
    const [isCodeValid, setIsCodeValid] = useState(true);
    const [countdownTime, setCountdownTime] = useState(60000);
    const [step, setStep] = useState(1);
    const [authCode, setAuthCode] = useState<string[]>(Array(6).fill(""));
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [resendAttempts, setResendAttempts] = useState(0); // Contador de reenvíos
    const maxResendAttempts = 5; // Límite de reenvíos
    const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);
    const [codeExpired, setCodeExpired] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [buttonLoading, setButtonLoading] = useState(false);
    const [greencode, setGreenCode] = useState(false);
    useEffect(() => {
        const checkLockout = async () => {
            const usuario = localStorage.getItem("userData");
            if (!usuario) return;

            const obj = JSON.parse(usuario);
            if (obj.rol === 'Root' || obj.rol === 'Telco') {
                navigate('/');
            }
            if (obj.twoFactorAuthentication) {
                  navigate('/chooseroom');
            }

            if (obj.lockoutEnabled) {
                const lockoutEnd = new Date(obj.lockoutEndDateUtc);
                const now = new Date();
                setLoading(true);

                if (now < lockoutEnd) {
                    // Si el bloqueo aún está vigente, calcular tiempo restante
                    setLockoutEndTime(lockoutEnd);
                    setStep(3); // Ir al Step 3 directamente
                } else {
                    // Si el bloqueo expiró, resetear valores en el usuario
                    const userObj = { ...obj }; // Clonar objeto usuario para modificarlo
                    try {
                        userObj.lockoutEnabled = false;
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

                        const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_LOCKOUT_USER}`; // Cambia por tu endpoint real
                        await axios.post(apiEndpoint, data, {
                            headers
                        });
                    } catch (error) {
                        console.error("Error al registrar el desbloqueo:", error);
                    }

                    userObj.lockoutEnabled = false;
                    userObj.lockoutEndDateUtc = null;
                    localStorage.setItem("userData", JSON.stringify(userObj));
                    setLoading(false);
                }
            }
        };

        checkLockout(); // Llamar la función async
    }, []);


    function onChangeValue(event: React.ChangeEvent<HTMLInputElement>) {
        setSendType(event.target.value);
    }

    const handleCodeChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            // Permitir solo un número
            const newCode = [...authCode];
            newCode[index] = value;
            setAuthCode(newCode);

            // Saltar al siguiente cuadro automáticamente
            if (value && index < authCode.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
        //const target = event.target as HTMLInputElement;

        if (event.key === "Backspace" && !authCode[index] && index > 0) {
            // Retroceder al cuadro anterior si está vacío
            inputRefs.current[index - 1]?.focus();
        }
    };
    const Return = async (event: React.FormEvent) => {
        event.preventDefault();
        setStep(1);
        setCountdownTime(60000);
        return true;
    }
    const navigate = useNavigate();

    const ValidateToken = async (event: React.FormEvent) => {
        event.preventDefault();
        setButtonLoading(true); 
        if (countdownTime === 0) { // Verificar si el contador expiró
            setCodeExpired(true); // Mostrar mensaje de expiración
            setButtonLoading(false);
            return;
        }


        if (authCode.join("") != token) {
            setIsCodeValid(false);
            setButtonLoading(false);
        } else {
            setIsCodeValid(true);
            setGreenCode(true);
            setTimeout(() => {
                navigate('/chooseroom'); // Redirigir después de la animación
            }, 2000);
        }
        return true;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isResendDisabled) return;
        if (resendAttempts !== 0) {

        setIsResendDisabled(true); 
        }


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

                    const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_LOCKOUT_USER}`; // Cambia por tu endpoint real
                    await axios.post(apiEndpoint, data, {
                        headers
                    });
                } catch (error) {
                    console.error("Error al registrar el bloqueo:", error);
                }

            }


            setLockoutEndTime(lockoutEnd);
            setStep(3);


        }
        else {


            const usuario = localStorage.getItem("userData");

            const obj = JSON.parse(usuario!);
            let dato = "";
            if (SendType == "SMS") {
                dato = obj.phonenumber;
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
                    setStep(2); setStartTime(Date.now()); 
                    setCountdownTime(60000);
                    setResendAttempts(resendAttempts + 1);
                }
                setLoading(false);
            }
            catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 400) {
                    setErrorModalOpen(true); // Mostrar el modal en caso de error BadRequest
                } else {
                    console.error("Error inesperado:", error);
                }
            }
            finally {
                setTimeout(() => setIsResendDisabled(false), 60000);
            }

        }
    }



    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                height: "90vh",
                padding: "30px",
                textAlign: "center",
                backgroundColor: "#F2F2F2"
            }}
        >
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    textAlign: "center", // Centrado del texto
                    fontFamily: "Poppins", // Fuente personalizada
                    fontWeight: "500", // Peso "medium"
                    fontSize: "28px", // Tamaño de la fuente
                    lineHeight: "54px", // Altura de línea
                    letterSpacing: "0px", // Sin espaciado adicional
                    color: "#330F1B", // Color del texto
                    opacity: 1, // Transparencia del texto
                }}
            >
                Autentificación de cuenta
            </Typography>

            {step === 1 ? (
                <Box
                    sx={{
                        border: "1px solid #ccc",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "8px",
                        padding: "30px",
                        maxWidth: "550px",
                        width: "100%",
                        textAlign: "center",
                        marginTop: "20px",
                    }}
                >
                    <Typography
                        variant="body1"
                        gutterBottom
                        sx={{
                            textAlign: "left",
                            font: "normal normal normal 16px/20px Poppins",
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
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "20px",
                                padding: "0 20px",
                                "& .MuiFormControlLabel-root": {
                                    color: "#330F1B", // Color por defecto del texto
                                    "& .MuiRadio-root.Mui-checked + span": {
                                        color: "#833A53", // Cambia el color del texto al seleccionar
                                    },
                                },
                            }}
                        >
                            <FormControlLabel
                                value="SMS"
                                control={
                                    <Radio
                                        sx={{
                                            fontFamily: "Poppins",
                                            color: "#833A53",
                                            "&.Mui-checked": {
                                            color: "#833A53"

                                            },
                                        }}
                                    />
                                }
                                
                                label="SMS"
                                sx={{
                                    fontFamily: "Poppins",
                                    textAlign: "left",
                                    color: SendType === "SMS" ? "#8F4D63" : "#574B4F", // Cambia el color del texto
            fontWeight: SendType === "SMS" ? "bold" : "normal", // Opcional: hacer negrita la opción seleccionada
            transition: "color 0.3s ease", // Suaviza la transición del color
                                }}
                            />
                            <FormControlLabel
                                value="EMAIL"
                                control={
                                    <Radio
                                        sx={{
                                            fontFamily: "Poppins",
                                            color: "#833A53",
                                            "&.Mui-checked": {
                                            color: "#833A53",
                                            },
                                        }}
                                    />
                                }
                                label="Correo electrónico"
                                
                                sx={{
                                    fontFamily: "Poppins",
                                    textAlign: "right",
                                    color: SendType === "SMS" ? "#8F4D63" : "#574B4F", // Cambia el color del texto
            fontWeight: SendType === "SMS" ? "bold" : "normal", // Opcional: hacer negrita la opción seleccionada
            transition: "color 0.3s ease", // Suaviza la transición del color
                                }}
                            />
                        </RadioGroup>



                        <ButtonLoadingSubmit
                        text='Aceptar'
                        isLoading={loading}
                        disabled={loading || SendType === ""}
                        onClick={handleSubmit}
                        


                        
                        />

                        


                    </Box>
                </Box>
            ) : step === 2 ? (
                <Box
                        sx={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "20px",
                            maxWidth: "504px",
                            maxHeight: "328px",
                            width: "90%",
                            textAlign: "center",
                            marginTop: "10px",
                            backgroundColor: "#FFFFFF",
                        }}
                >
                    {/* Parte 1: Reenviar código */}
                    <Box
                            sx={{
                                borderBottom: "1px solid #ddd",
                                paddingBottom: "8px",
                                marginBottom: "8px",
                            }}
                    >
                            <Typography variant="body2" sx={{
                                textAlign: "left",
                                font: "normal normal 600 16px/20px Poppins",
                                letterSpacing: "0px",
                                opacity: 1,
                                marginBottom: "16px",
                            }}>
                            ¿El código no fue recibido o caduco?{" "}
                            <Link
                                component="button"
                                onClick={handleSubmit}
                                    disabled={isResendDisabled} // Deshabilita el botón si está bloqueado
                                    sx={{
                                        fontWeight: "bold",
                                        cursor: isResendDisabled ? "not-allowed" : "pointer", // Cambia el cursor si está bloqueado
                                        color: isResendDisabled ? "#ccc" : "#8F4D63", // Cambia el color si está bloqueado
                                        

                                        // Evita que cambie de color al hacer hover
                                        textTransform: "none","&:hover": {backgroundColor: "transparent"},
                                    }}
                            >
                                    {isResendDisabled ? "Espere un minuto para otro Reenvio" : "Reenviar"}
                            </Link>
                         

                        </Typography>
                    </Box>

                    {/* Parte 2: Cajas de texto y contador */}
                    <Box
                        sx={{
                            paddingBottom: "15px",
                            marginBottom: "5px",
                            marginTop: "-15px",
                            
                        }}
                        >
                            <Typography sx={{
                                display: "flex",
                                alignItems: "center",// Centra horizontalmente.
                                color: "#f44336", // Rojo.
                                fontWeight: "bold",
                                marginTop: "0px", // Sin margen superior
                                marginBottom: "0px", // Sin margen inferior
                            }}
                            >
                                <span
                                    style={{
                                        textAlign: "left",
                                        fontFamily: "Poppins",
                                        fontWeight: "normal",
                                        fontSize: "14px",
                                        lineHeight: "54px",
                                        letterSpacing: "0px",
                                        color: "#8F4D63",
                                        opacity: 1,
                                    }}
                                >
                                    Tiempo de expiración de código:
                                </span>
                                <span
                                    style={{
                                        fontFamily: "Poppins",
                                        fontWeight: "500", // Medium weight to match text
                                        fontSize: "14px",
                                        lineHeight: "54px",
                                        letterSpacing: "0px",
                                        color: "#8F4D63",
                                        opacity: 1,
                                    }}
                                >
                                    <Countdown
                                        date={startTime + countdownTime}
                                        renderer={({ minutes, seconds }) => (
                                            <span>
                                                {minutes.toString().padStart(2, "0")}:
                                                {seconds.toString().padStart(2, "0")}
                                            </span>
                                        )}
                                    />
                                </span>

                            </Typography>
                            <Typography
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
                            //Contenedores para el Código
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
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        inputRef={(el) => (inputRefs.current[index] = el)}
                                        inputProps={{
                                            maxLength: 1,
                                            style: { 
                                                textAlign: "center", 
                                                fontFamily: "Poppins", 
                                                fontSize: "26px",
                                                marginTop: "-8px"
                                                },
                                            
                                        }}
                                        error={!isCodeValid}
                                        sx={{
                                            width: "54px",
                                            height: "56px",
                                            margin: "0 3px",
                                            marginTop: "-5px",
                                            border: `2px solid ${greencode ? "#28A745" : isCodeValid ? "#9B9295" : "#D01247"}`, // Verde si es correcto, rojo si es incorrecto
                                            borderRadius: "6px",
                                            opacity: 1,
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                border: "none",
                                            },
                                        }}
                                    />
                                ))}
                        </Box>
                            {!isCodeValid && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        margin: "5px",
                                        color: codeExpired ? "black" : "#D01247",
                                        marginBottom: "-4px",
                                        marginTop: "5px",
                                        textAlign: "left",
                                        width: "100%",
                                    }}
                                >
                                    Código Inválido
                                </Typography>
                            )}
                            {codeExpired && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#D01247",
                                        fontSize: "14px",
                                        marginTop: "40px",
                                    }}
                                >
                                    El tiempo para validar el código expiró. Por favor, solicite un nuevo código.
                                </Typography>
                            )}
                    </Box>
                        <hr style={{ width: '500px', border: '1px solid #ccc', 
                                    margin: '10px 0', backgroundColor: "#C6BFC2", 
                                    marginLeft: "-19px"}} />
                    {/* Parte 3: Botones */}
                    <Box sx={{ display: "flex", justifyContent: "space-between",
                             marginTop: "6px" }}>
                            <Button variant="outlined" onClick={Return} sx={{
                                color: "#833A53",
                                border: "1px solid #CCCFD2",
                                borderRadius: "4px",
                                opacity: 1,
                                "&:hover": {
                                    color: "#FFFFFF",
                                },
                            }}>
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
                                        backgroundColor: "#60293C"
                                    },
                                }}
                            >
                                {buttonLoading ? (
                                    <CircularProgress 
                                    size={24}
                                    thickness={8} 
                                    sx={{ color: "#FFFFFF",  }} />
                                ) : (
                                    "Validar"
                                )}
                        </Button>
                    </Box>
                </Box>
            ) : step === 3 ? (
                        <Box
                            sx={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "20px",
                                maxWidth: "610px",
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

            ) : null}

            {/* Modal de error */}
            <Dialog
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                aria-labelledby="error-dialog-title"
                aria-describedby="error-dialog-description"
            >
                <DialogTitle id="error-dialog-title">
                    {"Error al enviar el código de verificación"}
                </DialogTitle>
                <DialogContent>
                    <Typography id="error-dialog-description">
                        Algo salió mal, inténtelo de nuevo o más tarde.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setErrorModalOpen(false)}
                        color="primary"
                        variant="outlined"
                        sx={{ color: "red" }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>



        </Box>
    );
};

export default Autentification;