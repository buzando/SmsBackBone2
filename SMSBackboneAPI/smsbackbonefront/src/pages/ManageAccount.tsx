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
import axios from "../components/commons/AxiosInstance";
import { Divider } from "@mui/material";
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import { InputAdornment } from "@mui/material";
import ChipBar from "../components/commons/ChipBar";
import CircularProgress from "@mui/material/CircularProgress";
import SecondaryButton from "../components/commons/SecondaryButton";
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
    const [initialData, setInitialData] = useState<typeof formData | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [showChipBarAdd, setshowChipBarAdd] = useState(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const [loading, setLoading] = useState(false);

    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [altEmailError, setAltEmailError] = useState("");

    const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const parsedData = JSON.parse(userData);
            const loaded = {
                firstName: parsedData.firstName || "",
                lastName: parsedData.lastName || "",
                phone: parsedData.phonenumber || "",
                email: parsedData.email || "",
                alternateEmail: parsedData.secondaryEmail || "",
                password: "",
                confirmPassword: "",
            };
            setFormData(loaded);
            setInitialData(loaded); // <- importante para comparar
        }
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "phone") {
            const digits = value.replace(/\D/g, "").slice(0, 10); // solo 10 dígitos
            setFormData({ ...formData, phone: digits });
            setPhoneError(digits.length === 10 ? "" : "Debe contener 10 dígitos.");
            return;
        }

        if (name === "firstName") {
            setFormData({ ...formData, firstName: value });
            setFirstNameError(value.trim() && !nameRegex.test(value) ? "Solo letras y espacios." : "");
            return;
        }

        if (name === "lastName") {
            setFormData({ ...formData, lastName: value });
            setLastNameError(value.trim() && !nameRegex.test(value) ? "Solo letras y espacios." : "");
            return;
        }

        if (name === "alternateEmail") {
            setFormData({ ...formData, alternateEmail: value });
            setAltEmailError(value.trim() && !validateEmail(value) ? "Formato de correo inválido." : "");
            return;
        }

        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            if (!value || passwordRegex.test(value)) setPasswordError("");
            else setPasswordError("8+ caracteres, 1 mayúscula, 1 minúscula y 1 número.");
        }
        if (name === "confirmPassword") {
            setConfirmPasswordError(!value || value === formData.password ? "" : "Las contraseñas no coinciden.");
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

            const apiEndpoint = `${import.meta.env.VITE_API_UPDATE_USER}`;
            const response = await axios.post(apiEndpoint, data, { headers });

            if (response.status === 200) {
                setshowChipBarAdd(true);
                setTimeout(() => setshowChipBarAdd(false), 3000);
                setInitialData(formData);
                setFormData(fd => ({ ...fd, password: "", confirmPassword: "" }));
            }



        } catch {
            setModalMessage("Error al actualizar usuario");
            setModalOpen(true);
        }
        finally {
            setLoading(false); // Desactiva el estado de carga
        }
    };

    const requiredOk =
        !!formData.firstName && !!formData.lastName && !!formData.phone && !!formData.alternateEmail;

    const namesOk = !firstNameError && !lastNameError && nameRegex.test(formData.firstName) && nameRegex.test(formData.lastName);
    const phoneOk = /^\d{10}$/.test(formData.phone);
    const emailOk = !altEmailError && validateEmail(formData.alternateEmail);

    const isDirty =
        initialData !== null && JSON.stringify(formData) !== JSON.stringify(initialData);

    const saveDisabled =
        loading || !isDirty || !requiredOk || !namesOk || !phoneOk || !emailOk || !!passwordError || !!confirmPasswordError;


    const handleCancel = () => {
        if (initialData) {
            setFormData(initialData);
            setPasswordError("");
            setConfirmPasswordError("");
        }
    };


    return (
        <Box p={6} maxWidth={800} sx={{ marginTop: "-100px", textAlign: 'center' }} >
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
                            <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={!!firstNameError}
                            helperText={firstNameError}
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
                            <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            label=""
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={!!lastNameError}
                            helperText={lastNameError}
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
                            <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            label=""
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            error={!!phoneError}
                            helperText={phoneError}
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
                            <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            label=""
                            name="alternateEmail"
                            value={formData.alternateEmail}
                            onChange={handleChange}
                            error={!!altEmailError}
                            helperText={altEmailError}
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
                justifyContent="space-between"
                alignItems="center"
                mt={3}
            >


                <SecondaryButton
                    text="Cancelar"
                    onClick={handleCancel}
                    disabled={loading || !isDirty}
                />


                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={saveDisabled}
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
