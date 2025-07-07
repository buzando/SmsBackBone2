import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Tooltip,
    Modal,
} from "@mui/material";
import axios from "axios";
import { Divider } from "@mui/material";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import { InputAdornment } from "@mui/material";
import ChipBar from "../components/commons/ChipBar";
import CircularProgress from "@mui/material/CircularProgress";

const ManageAccount: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        alternateEmail: "",
        password: "",
        confirmPassword: "",
        email: "",
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showChipBarAdd, setshowChipBarAdd] = useState(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const [loading, setLoading] = useState(false);

    // Load user data from localStorage
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsedData = JSON.parse(userData);
            setFormData({
                firstName: parsedData.firstName || "",
                lastName: parsedData.lastName || "",
                phone: parsedData.phonenumber || "",
                email: parsedData.email || "",
                alternateEmail: parsedData.secondaryEmail || "",
                password: "", // For security reasons, do not prefill passwords
                confirmPassword: "", // For security reasons, do not prefill passwords
            });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Restringir el número de teléfono solo a números
        if (name === "phone" && !/^[0-9]*$/.test(value)) return;

        setFormData({ ...formData, [name]: value });

        // Validar la contraseña en tiempo real
        if (name === "password") {
            if (!value || passwordRegex.test(value)) {
                setPasswordError("");
            } else {
                setPasswordError(
                    "La contraseña debe tener mínimo 8 caracteres, una letra mayúscula, una letra minúscula y un número."
                );
            }
        }

        // Validar la confirmación de contraseña en tiempo real
        if (name === "confirmPassword") {
            if (!value || value === formData.password) {
                setConfirmPasswordError("");
            } else {
                setConfirmPasswordError("Las contraseñas no coinciden.");
            }
        }
    };



    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (formData.password !== formData.confirmPassword) {
            setModalMessage("Las contraseñas no coinciden");
            setModalOpen(true);
            return;
        }
        if (!validateEmail(formData.alternateEmail)) {
            setModalMessage("El correo alternativo no es válido");
            setModalOpen(true);
            return;
        }
        setLoading(true); // Activa el estado de carga
        try {

            const data = {
                FirstName: formData.firstName,
                LastName: formData.lastName,
                Email: formData.email,
                ConfirmationEmail: formData.alternateEmail,
                PhoneNumber: formData.phone,
                Password: formData.password,
            };

            // Make POST request
            const headers = {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*",
            };

            const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_UPDATE_USER}`; // Cambiar por el endpoint real de actualización
            const response = await axios.post(apiEndpoint, data, { headers });

            if (response.status === 200) {

                setshowChipBarAdd(true); // Mostrar ChipBar para edición exitosa
                setTimeout(() => setshowChipBarAdd(false), 3000);
            }



        } catch {
            setModalMessage("Error al actualizar usuario");
            setModalOpen(true);
        }
        finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };

    return (
        <Box p={6} maxWidth={800} sx={{marginTop: "-100px", textAlign: 'center'}} >
            <Typography
                sx={{
                    textAlign: "left",
                    font: "normal normal medium 26px/55px Poppins",
                    letterSpacing: "0px",
                    color: "#330F1B",
                    opacity: 1,
                    fontSize: "26px",
                }}
            >
                Editar cuenta
            </Typography>

            <Divider sx={{ mb: 3, backgroundColor: "#CCC" }} />
            <Paper sx={{ p: 3 }}>
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                        <Typography
                            sx={{
                                textAlign: "left",
                                font: "normal normal medium 16px/54px Poppins",
                                letterSpacing: "0px",
                                color: "black",
                                opacity: 1,
                                fontSize: "16px",
                            }}
                        >
                            Nombre
                        </Typography>
                        <TextField
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Nombre del usuario">
                                            <img
                                                src={
                                                    formData.firstName.trim() === ""
                                                        ? infoiconerror // Mostrar ícono de error si está vacío
                                                        : infoicon // Ícono normal si no hay error
                                                }
                                                alt="Info"
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            sx={{
                                textAlign: "left",
                                font: "normal normal medium 16px/54px Poppins",
                                letterSpacing: "0px",
                                color: "black",
                                opacity: 1,
                                fontSize: "16px",
                            }}
                        >
                            Apellido
                        </Typography>
                        <TextField
                            label=""
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Apellido del usuario">
                                            <img
                                                src={
                                                    formData.firstName.trim() === ""
                                                        ? infoiconerror // Mostrar ícono de error si está vacío
                                                        : infoicon // Ícono normal si no hay error
                                                }
                                                alt="Info"
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            sx={{
                                textAlign: "left",
                                font: "normal normal medium 16px/54px Poppins",
                                letterSpacing: "0px",
                                color: "black",
                                opacity: 1,
                                fontSize: "16px",
                            }}
                        >
                            Teléfono
                        </Typography>
                        <TextField
                            label=""
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Introduzca 10 valores numericos">
                                            <img
                                                src={
                                                    formData.firstName.trim() === ""
                                                        ? infoiconerror // Mostrar ícono de error si está vacío
                                                        : infoicon // Ícono normal si no hay error
                                                }
                                                alt="Info"
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Box></Box>
                    <Box>
                        <Typography
                            sx={{
                                textAlign: "left",
                                font: "normal normal medium 16px/54px Poppins",
                                letterSpacing: "0px",
                                color: "black",
                                opacity: 1,
                                fontSize: "16px",
                            }}
                        >
                            Correo Alternativo
                        </Typography>
                        <TextField
                            label=""
                            name="alternateEmail"
                            value={formData.alternateEmail}
                            onChange={handleChange}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Introduzca un correo electronico valido">
                                            <img
                                                src={
                                                    formData.firstName.trim() === ""
                                                        ? infoiconerror // Mostrar ícono de error si está vacío
                                                        : infoicon // Ícono normal si no hay error
                                                }
                                                alt="Info"
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <Box></Box>
                    <Box>
                        <Typography
                            sx={{
                                textAlign: "left",
                                font: "normal normal medium 16px/54px Poppins",
                                letterSpacing: "0px",
                                color: "black",
                                opacity: 1,
                                fontSize: "16px",
                            }}
                        >
                            Contraseña
                        </Typography>
                        <TextField
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!passwordError}
                            helperText={passwordError}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Introduzca una contraseña valida">
                                            <img
                                                src={
                                                    passwordError
                                                        ? infoiconerror // Mostrar ícono de error si está vacío
                                                        : infoicon // Ícono normal si no hay error
                                                }
                                                alt="Info"
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />

                    </Box>
                    <Box>
                        <Typography
                            sx={{
                                textAlign: "left",
                                font: "normal normal medium 16px/54px Poppins",
                                letterSpacing: "0px",
                                color: "black",
                                opacity: 1,
                                fontSize: "16px",
                            }}
                        >
                            Confirma Contraseña
                        </Typography>

                        <TextField
                            label="Confirmar contraseña"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={!!confirmPasswordError}
                            helperText={confirmPasswordError}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Introduzca una contraseña valida">
                                            <img
                                                src={
                                                    confirmPasswordError
                                                        ? infoiconerror // Mostrar ícono de error si está vacío
                                                        : infoicon // Ícono normal si no hay error
                                                }
                                                alt="Info"
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>


                </Box>
                <Typography variant="body2" color="textSecondary" mt={2}>
                    *El asterisco indica los campos obligatorios.
                </Typography>
               
            </Paper>
            <Box
                display="flex"
                justifyContent="flex-end"
                mt={3}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={
                        !formData.firstName ||
                        !formData.lastName ||
                        !formData.phone ||
                        !formData.alternateEmail
                    }
                    sx={{
                        position: "relative",
                        backgroundColor: "#8D4B62",
                        color: "#fff",
                        "&:hover": {
                            backgroundColor: "#6F3C4F",
                        },
                    }}
                >
                    {loading ? (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: "#fff",
                                position: "absolute",
                            }}
                        />
                    ) : (
                        "Guardar cambios"
                    )}
                </Button>
            </Box>

            {/* Modal de error */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 24,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        Error al registrar usuario!
                    </Typography>
                    <Typography>{modalMessage}</Typography>
                    <Box display="flex" justifyContent="flex-end" mt={3}>
                        <Button
                            sx={{
                                color: "#8F4D63", // Color del texto
                                fontWeight: "bold", // Negrita
                                backgroundColor: "transparent", // Fondo transparente
                                border: "none", // Sin bordes
                                fontSize: "16px", // Tamaño del texto
                                letterSpacing: "2px", // Espaciado entre letras
                                textTransform: "uppercase", // Texto en mayúsculas
                                boxShadow: "none", // Sin sombra
                                '&:hover': {
                                    backgroundColor: "transparent", // Fondo transparente en hover
                                    textDecoration: "underline", // Subrayado en hover
                                },
                            }}
                            onClick={() => setModalOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {showChipBarAdd && (
                <ChipBar
                    message="La cuenta ha sido editado correctamente."
                    buttonText="Cerrar"
                    onClose={() => setshowChipBarAdd(false)}
                />
            )}
        </Box>
    );
};

export default ManageAccount;
