import React, { useState, useContext } from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../hooks/useContextInitialState";
import { getColorRole } from "../types/Types";
import appIcon_svg from "../assets/AppIcon.svg";
import nuxiba_svg from "../assets/nuxiba.svg";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Fab from "@mui/material/Fab";
import Modal from "@mui/material/Modal";
import helpicon from "../assets/Iconoayuda.svg";
import logorq from '../assets/Logo-RQ_2.svg';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseSession from '../assets/Icon-CerrarSesion.svg';
import TermsAndConditions from "../pages/TermsAndConditions";
interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(() => ({
    zIndex: 1200,
}));

type Props = {
    children: React.ReactNode;
};

const AutentificationLayout: React.FC<Props> = (props) => {
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const { contextState, setContextState } = useContext(AppContext);
    const { user } = contextState;

    const [helpModalIsOpen, setHelpModalIsOpen] = useState(false);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const openHelpModal = () => setHelpModalIsOpen(true);
    const closeHelpModal = () => setHelpModalIsOpen(false);
    const [openTerms, setOpenTerms] = useState(false);
    const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(null);
        switch (Number(event.currentTarget.id)) {
            case 2:
                setOpenTerms(true);
                break;
            case 3:
                setContextState({
                    user: {},
                    token: "",
                    expiration: "",
                });
                localStorage.clear();
                navigate("/login");
                break;
            default:
                console.log("Opción no implementada");
                break;
        }
    };

    return (
        <>

            <Box
                sx={{
                    backgroundColor: "#F2F2F2",
                    minHeight: "100vh",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column"
                }}
            >

                <CssBaseline />
                {/* Barra superior */}
                <AppBar position="fixed" sx={{ borderBottom: 1, borderColor: "primary.main" }}>
                    <Toolbar>
                        <Box sx={{ flexGrow: 1, display: "flex" }}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={() => navigate("/")}
                            >
                                <img src={logorq} alt="App Icon" width="170" />
                            </IconButton>
                        </Box>

                        {/* Información del usuario */}
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title={user.userName}>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt={user.userName} sx={{ bgcolor: getColorRole(user.rol) }} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: "45px" }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem id="2" onClick={handleCloseUserMenu}>
                                    <Typography
                                        sx={{
                                            textAlign: 'center',
                                            fontFamily: 'Poppins',
                                            fontSize: "14px",
                                            letterSpacing: '0px',
                                            color: '#574B4F',
                                            opacity: 1,
                                        }}
                                    >
                                        <DescriptionIcon sx={{ fontSize: 20, mr: 1 }} />
                                        Terminos y condiciones
                                    </Typography>
                                </MenuItem>
                                <MenuItem id="3" onClick={handleCloseUserMenu}>
                                    <Typography
                                        sx={{
                                            textAlign: 'center',
                                            fontFamily: 'Poppins',
                                            fontSize: "14px",
                                            letterSpacing: '0px',
                                            color: '#574B4F',
                                            opacity: 1,
                                        }}
                                    >
                                        <img
                                            src={CloseSession}
                                            alt="Room Icon"
                                            style={{
                                                width: '19px',
                                                height: '19px',
                                                marginRight: '10px',
                                                color: '#574B4F',
                                            }}
                                        />
                                        Cerrar Sesión
                                    </Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Contenedor principal */}
                <Container fixed maxWidth={false} sx={{ marginTop: "4.5rem", marginBottom: "8rem", backgroundColor: "#F2F2F2" }}>
                    {props.children}
                </Container>
            </Box>
            {/* Pie de página */}
            <footer>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{
                        position: "fixed",
                        bottom: 0,
                        width: "100%",
                        padding: 1,
                        borderTop: "solid 1px #E6E4E4",
                        background: "#FFFFFF",
                        zIndex: 1200,
                    }}
                >
                    <Typography variant="caption" color="textSecondary" align="left">
                        {"Copyright © "}
                        {new Date().getFullYear()} {" Nuxiba. Todos los derechos reservados."}
                    </Typography>

                    <img src={nuxiba_svg} alt="Nuxiba Logo" width="70" />

                    {/* Botón circular con el icono de ayuda */}
                    <Fab
                        aria-label="help"
                        onClick={openHelpModal}
                        sx={{
                            position: "fixed",
                            bottom: 70,
                            right: 30,
                            zIndex: 1500,
                            width: "60px", // Tamaño personalizado
                            height: "60px", // Tamaño personalizado
                            backgroundColor: "#FFFFFF", // Fondo blanco
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Sombra normal
                            border: "1px solid #D9C5CB", // Borde del botón
                            "&:hover": {
                                background: "#EBE5E7 0% 0% no-repeat padding-box",
                                boxShadow: "0px 8px 16px #00131F14", // Sombra en hover
                                border: "1px solid #D9C5CB", // Borde en hover
                            },
                        }}
                    >
                        <Tooltip
                            title="Ayuda"
                            arrow
                            placement="top" // Aparece arriba
                            sx={{
                                "& .MuiTooltip-tooltip": {
                                    backgroundColor: "#330F1B", // Fondo del tooltip
                                    color: "#FFFFFF", // Texto blanco
                                    fontSize: "12px", // Tamaño de fuente
                                    fontFamily: "Poppins, sans-serif", // Fuente personalizada
                                    fontWeight: "medium", // Peso de texto
                                },
                                "& .MuiTooltip-arrow": {
                                    color: "#330F1B", // Color de la flecha del tooltip
                                },
                            }}
                        >
                            <img
                                src={helpicon} // Usar el ícono importado
                                alt="Ícono de ayuda"
                                style={{
                                    width: "24px", // Tamaño del ícono
                                    height: "24px", // Tamaño del ícono
                                }}
                            />
                        </Tooltip>
                    </Fab>


                </Box>
            </footer>
            {/* Modal de ayuda */}
            <Modal
                open={helpModalIsOpen}
                onClose={closeHelpModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                sx={{
                    backdropFilter: "blur(4px)", // Fondo desenfocado
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo gris semitransparente
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "600px",
                        maxHeight: "600px",
                        bgcolor: "background.paper",
                        borderRadius: "10px",
                        boxShadow: 24,
                        p: 3,
                    }}
                >
                    <Typography
                        id="modal-title"
                        sx={{
                            textAlign: "left",
                            fontFamily: "Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            fontSize: "26px",
                            mb: 1,
                            marginBottom: "20px"
                        }}
                    >
                        Ayuda
                    </Typography>




                    {/* Línea horizontal */}
                    <Box
                        sx={{
                            position: "relative",
                            left: -23,
                            right: 0,
                            width: "599px",
                            height: "1px",
                            backgroundColor: "#E0E0E0",
                            my: 1,
                        }}
                    />

                    <Typography
                        id="modal-description"
                        sx={{
                            textAlign: "left",
                            fontFamily: "Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            fontSize: "18px", // Tamaño ajustado a 18px
                            marginBottom: "20px",
                            marginTop: "20px",
                        }}
                    >
                        Por favor, contáctenos:
                    </Typography>

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}> {/* Reducir espacio entre columnas */}
                        {/* Horarios de atención */}
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: "Poppins",
                                    color: "#330F1B",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5, // Reducir margen inferior
                                }}
                            >
                                Horarios de atención
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins", // Reducir espacio entre líneas
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5, // Reducir margen entre elementos
                                }}
                            >
                                Lunes a viernes
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins", // Reducir espacio entre líneas
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                }}
                            >
                                Teléfono: 55 1107 8510 Opción 3
                            </Typography>
                        </Box>

                        {/* Línea de emergencia */}
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: "Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5, // Reducir margen inferior
                                }}
                            >
                                Línea de emergencia
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins", // Reducir espacio entre líneas
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5, // Reducir margen entre elementos
                                }}
                            >
                                Lunes a viernes 21:00-07:00
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                }}
                            >
                                Teléfono: 55 5437 6175
                            </Typography>
                        </Box>
                    </Box>

                    {/* Línea horizontal */}
                    <Box
                        sx={{
                            borderBottom: "1px solid #E6E4E4",
                            my: 1,
                        }}
                    />

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5,
                                }}
                            >
                                Sábado
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5,
                                }}
                            >
                                9:00-18:00 CST
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                }}
                            >
                                Teléfono: 55 1107 8510 Opción 3
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: "Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                    mb: 0.5,
                                }}
                            >
                                Sábado y domingo
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    marginBottom: "10px",
                                    marginTop: "10px",
                                }}
                            >
                                Teléfono: 55 5437 6175
                            </Typography>
                        </Box>
                    </Box>

                    {/* Línea horizontal */}
                    <Box
                        sx={{
                            borderBottom: "1px solid #E6E4E4",
                            my: 1,
                        }}
                    />

                    <Box>
                        <Typography
                            sx={{
                                font: "normal normal normal 14px/20px Poppins",
                                color: "#574B4F",
                                marginBottom: "10px",
                                marginTop: "10px",
                                mb: 0.5,
                            }}
                        >
                            Domingo
                        </Typography>
                        <Typography
                            sx={{
                                font: "normal normal normal 14px/20px Poppins",
                                color: "#574B4F",
                                marginBottom: "10px",
                                marginTop: "10px",
                                mb: 0.5,
                            }}
                        >
                            9:00-15:00 CST
                        </Typography>
                        <Typography
                            sx={{
                                font: "normal normal normal 14px/20px Poppins",
                                color: "#574B4F",
                                marginBottom: "10px",
                                marginTop: "10px",
                            }}
                        >
                            Teléfono: 55 1107 8510 Opción 3
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            borderBottom: "1px solid #E6E4E4",
                            my: 1,
                        }}
                    />

                    <Typography
                        sx={{
                            fontFamily: "Poppins",
                            color: "#574B4F",
                            marginBottom: "10px",
                            marginTop: "10px",
                            mb: 1,
                        }}
                    >
                        Soporte: cwsoporte@nuxiba.com
                    </Typography>

                    <Box sx={{ textAlign: "right", mt: 2 }}>
                        <IconButton
                            onClick={closeHelpModal}
                            sx={{
                                position: "absolute",
                                top: 2,
                                right: 8,
                                color: "#C0C0C0",
                            }}
                        >
                            ✕
                        </IconButton>

                    </Box>
                </Box>
            </Modal>
            <Modal
                open={openTerms}
                onClose={() => setOpenTerms(false)}
                aria-labelledby="terms-and-conditions"
                aria-describedby="terms-and-conditions-content"
                sx={{
                    backdropFilter: "blur(4px)",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
            >
                <Box
                    sx={{
                        background: "#FFFFFF 0% 0% no-repeat padding-box",
                        boxShadow: "0px 8px 16px #00131F14",
                        border: "1px solid #E6E4E4",
                        borderRadius: "8px",
                        opacity: 1,
                        width: "80%",
                        maxWidth: "800px",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        p: 4,
                    }}
                >
                    {/* Botón de cerrar (✕) */}
                    <IconButton
                        onClick={() => setOpenTerms(false)}
                        sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            color: "#C0C0C0",
                            "&:hover": { color: "#7B354D" },
                        }}
                    >
                        ✕
                    </IconButton>

                    {/* Título */}
                    <Typography
                        sx={{
                            textAlign: "left",
                            font: "normal normal medium 26px/55px Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            mb: 2,
                        }}
                    >
                        Términos y Condiciones
                    </Typography>

                    {/* Texto */}
                    <Typography
                        sx={{
                            textAlign: "left",
                            font: "normal normal normal 16px/22px Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                        }}
                    >
                        Aparte del crédito disponible en su cuenta, no establecemos un tope en el número de mensajes que puede enviar a través de nuestro servicio.
                        Se evaluará si su comportamiento se alinea con los términos y esencia del acuerdo firmado entre las partes, y CENTERNEXT se reserva el derecho
                        de finalizar el servicio en cualquier momento si su comportamiento viola lo establecido dentro del acuerdo firmado.
                        <br /><br />
                        Nos esforzaremos por entregar sus mensajes tan rápido como sea posible, pero existen condiciones de demoras derivadas de congestiones o tráfico alto
                        en la red. A pesar de estos retrasos, el mensaje podría mostrarse como “entregado”.
                        <br /><br />
                        <strong>Se compromete a utilizar los servicios únicamente:</strong>
                        <br />
                        • Siguiendo estos términos y condiciones.<br />
                        • Con fines estrictamente apegados a la ley.<br />
                        • Respetando todas las leyes y normativas aplicables, tanto locales como internacionales.<br />
                        • Para los objetivos por los que fueron creados.
                        <br /><br />
                        <strong>Al emplear nuestros servicios, deberá evitar:</strong>
                        <br />
                        • Enviar mensajes SMS no solicitados o spam.<br />
                        • Engañar, estafar, suplantar o crear una identidad falsa.<br />
                        • Alterar los detalles de origen o modificar comunicaciones sin autorización.<br />
                        • Enviar mensajes ofensivos, abusivos o con contenido ilegal.<br />
                        • Participar en fraudes o esquemas piramidales.<br />
                        • Infringir derechos de propiedad intelectual o privacidad de terceros.<br />
                        • Usar el servicio con fines comerciales sin autorización.<br />
                        • Transmitir virus, malware o código malicioso.<br />
                        • Afectar sistemas, redes o servicios, incluyendo los de CENTERNEXT.
                        <br /><br />
                        <strong>Uso del Servicio API</strong>
                        <br />
                        Hemos habilitado la posibilidad de que las empresas o los individuos se conecten a nuestro servidor para facilitar el envío de mensajes de texto
                        directamente a nuestro sistema de SMS. Nos reservamos el derecho de aprobar o rechazar conexiones de clientes y APIs según nuestro propio criterio.
                        <br /><br />
                        Proporcionaremos especificaciones para las conexiones API y nos esforzaremos por mantenerlas actualizadas. Estas especificaciones pueden estar incompletas
                        y sujetas a cambios sin previo aviso. Es su responsabilidad revisarlas periódicamente.
                        <br /><br />
                        Para todos los servicios de mensajería SMS, le proporcionaremos un nombre de usuario y contraseña. La seguridad, accesos y uso indebido son responsabilidad
                        del usuario. CENTERNEXT queda exento de cualquier uso inapropiado realizado por las cuentas del cliente.
                        <br /><br />
                        Las transacciones de pago se gestionan a través de Openpay, propiedad de BBVA, y están sujetas a sus términos. CENTERNEXT no se hace responsable por errores
                        o fallas imputables al servicio de Openpay.
                    </Typography>
                </Box>
            </Modal>


        </>
    );
};

export default AutentificationLayout;