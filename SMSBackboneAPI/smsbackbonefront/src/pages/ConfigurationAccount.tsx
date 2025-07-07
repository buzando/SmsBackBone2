import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Paper,
    TextField,
    Typography,
    Tooltip,
    InputAdornment,
    Modal,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import { AppContext } from "../hooks/useContextInitialState";
const ConfigurationAccount: React.FC = () => {
    const { setContextState } = useContext(AppContext);
    const [searchParams] = useSearchParams();
    const emailFromURL = searchParams.get("email"); // Obtener el email de la URL
    const navigate = useNavigate();
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        user: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        if (emailFromURL) {
            fetchUserData(emailFromURL);
        } else {
            navigate("/login");
        }
    }, [emailFromURL, navigate]);

    const fetchUserData = async (email: string) => {
        try {
            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GETUSERBYEMAIL_USER + email}`;
            const response = await axios.get(
                request
            );

            if (response.status === 200) {
                setFormData({
                    user: response.data.client || "Usuario Ejemplo",
                    firstName: response.data.firstName || "",
                    lastName: response.data.lastName || "",
                    email: response.data.email || "",
                    phone: response.data.phonenumber || "",
                });
            }
        } catch  {
            setErrorMessage("Error de conexión con el servidor.");

            setErrorModalOpen(true); // Mostrar modal de error
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {

            // Datos del formulario que se enviarán en el POST
            const data = {
                FirstName: formData.firstName,
                LastName: formData.lastName,
                Email: formData.email,
                PhoneNumber: formData.phone,
            };

            // Configuración de headers
            const headers = {
                "Content-Type": "application/json",
                "Access-Control-Allow-Headers": "X-Requested-With",
                "Access-Control-Allow-Origin": "*",
            };

            const apiEndpoint = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_FINISHREGISTER_USERS}`;
            const response = await axios.post(apiEndpoint, data, { headers });

            if (response.status === 200) {
                const { user, token, expiration } = await response.data;
                setContextState({ user, token, expiration });
                localStorage.setItem('token', token);
                localStorage.setItem('expirationDate', expiration);
                localStorage.setItem('userData', JSON.stringify(user));
                navigate('/Autentification');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {

                setErrorMessage("Ocurrió un error al guardar los cambios. Inténtelo de nuevo.");
            }

            setErrorModalOpen(true); // Mostrar modal de error
        }
    };



    return (
        <Container maxWidth="md">
            <Box mt={4}>
                <Typography variant="h4" fontWeight="bold" mb={3}>
                    Configuración de la cuenta
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Paper elevation={3} sx={{ p: 4, borderRadius: "12px" }}>
                    {loading ? (
                        <Typography align="center">Cargando...</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Usuario */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Cliente (No editable)"
                                    value={formData.user}
                                    InputProps={{ readOnly: true }}
                                    fullWidth
                                />
                            </Grid>

                            {/* Nombre y Apellido */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nombre"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title="Introduce tu nombre.">
                                                    <InfoOutlinedIcon color="action" />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Apellido"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title="Introduce tu apellido.">
                                                    <InfoOutlinedIcon color="action" />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Correo y Teléfono */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Correo electrónico"
                                    name="email"
                                    value={formData.email}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title="Correo electrónico asociado a la cuenta.">
                                                    <InfoOutlinedIcon color="action" />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Teléfono"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    fullWidth
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Tooltip title="Introduce tu número de teléfono.">
                                                    <InfoOutlinedIcon color="action" />
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Nota */}
                            <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">
                                    *El asterisco indica los campos obligatorios.
                                </Typography>
                            </Grid>

                            {/* Botones */}
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="space-between">
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => navigate("/")}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSaveChanges}
                                        disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.email}
                                    >
                                        Guardar Cambios
                                    </Button>

                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </Paper>
            </Box>
            <Modal
                open={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" textAlign="center" fontWeight="bold" mb={2}>
                        ¡Cambios guardados!
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                        Los cambios se han guardado correctamente.
                    </Typography>
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Button
                            variant="contained"
                            onClick={() => setSuccessModalOpen(false)}
                        >
                            Aceptar
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Modal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" textAlign="center" fontWeight="bold" mb={2}>
                        Error
                    </Typography>
                    <Typography variant="body1" textAlign="center" color="error">
                        {errorMessage}
                    </Typography>
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setErrorModalOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </Container>

    );
};

export default ConfigurationAccount;
