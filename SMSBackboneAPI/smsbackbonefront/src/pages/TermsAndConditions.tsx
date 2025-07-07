import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from 'react-router-dom';
const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();
    return (
     <div style={{ padding: '20px', marginLeft: '40px', maxWidth: '1140px', minHeight: '170vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1, ml: '-28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, height: 24, transform: 'rotate(270deg)', display: 'block' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#330F1B', fontFamily: 'Poppins', fontSize: '26px' }}>Términos y Condiciones</Typography>
            </Box>

            <Typography variant="body1" paragraph sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>
                Aparte del crédito disponible en su cuenta, no establecemos un tope en el número de mensajes que puede enviar a través de nuestro servicio. Se evaluará si su comportamiento se alinea con los términos y esencia del acuerdo firmado entre las partes, y CENTERNEXT se reserva el derecho de finalizar el servicio en cualquier momento si su comportamiento viola lo establecido dentro del acuerdo firmado.
            </Typography>

            <Typography variant="body1" paragraph sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>
                Nos esforzaremos por entregar sus mensajes tan rápido como sea posible, pero existen condiciones de demoras derivado de congestiones o tráfico alto en la red. A pesar de estos retrasos, el mensaje podría mostrarse como “entregado”.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>Se compromete a utilizar los servicios únicamente:</Typography>
            <List>
                <ListItem><ListItemText primary="Siguiendo estos términos y condiciones." /></ListItem>
                <ListItem><ListItemText primary="Con fines estrictamente apegados a la ley." /></ListItem>
                <ListItem><ListItemText primary="Respetando todas las leyes y normativas aplicables, tanto locales como internacionales." /></ListItem>
                <ListItem><ListItemText primary="Para los objetivos por los que fueron creados." /></ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>Al emplear nuestros servicios, deberá evitar:</Typography>
            <List>
                <ListItem><ListItemText primary="Enviar mensajes SMS no solicitados o spam." /></ListItem>
                <ListItem><ListItemText primary="Engañar, estafar, suplantar o crear una identidad falsa." /></ListItem>
                <ListItem><ListItemText primary="Modificar comunicaciones recibidas sin clarificar los cambios." /></ListItem>
                <ListItem><ListItemText primary="Alterar los detalles de origen en cualquier mensaje." /></ListItem>
                <ListItem><ListItemText primary="Enviar mensajes ofensivos, amenazantes, abusivos o con contenido ilegal." /></ListItem>
                <ListItem><ListItemText primary="Participar en fraudes o esquemas piramidales." /></ListItem>
                <ListItem><ListItemText primary="Infringir derechos de propiedad intelectual." /></ListItem>
                <ListItem><ListItemText primary="Afectar sistemas, redes o servicios, incluyendo los de CENTERNEXT." /></ListItem>
                <ListItem><ListItemText primary="Violar la seguridad de sistemas, redes o servicios." /></ListItem>
                <ListItem><ListItemText primary="Transmitir códigos maliciosos como virus o troyanos." /></ListItem>
                <ListItem><ListItemText primary="Recolectar información sin consentimiento o violar la privacidad de terceros." /></ListItem>
                <ListItem><ListItemText primary="Reproducir, copiar, vender o revender servicios sin autorización." /></ListItem>
                <ListItem><ListItemText primary="Transmitir contenido sin contar con los derechos necesarios." /></ListItem>
                <ListItem><ListItemText primary="Acceder sin autorización mediante hacking o minería de contraseñas." /></ListItem>
                <ListItem><ListItemText primary="Promover actividades ilegales o peligrosas." /></ListItem>
                <ListItem><ListItemText primary="Usar el servicio para fines comerciales sin autorización." /></ListItem>
                <ListItem><ListItemText primary="Asistir a terceros en cualquiera de estas acciones prohibidas." /></ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>Uso del Servicio API</Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>
                Hemos habilitado la posibilidad de que las empresas o los individuos se conecten a nuestro servidor para facilitar el envío de mensajes de texto directamente a nuestro sistema de SMS. Nos reservamos el derecho de aprobar o rechazar conexiones de clientes y APIs según nuestro propio criterio.
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>
                Proporcionaremos especificaciones para las conexiones API y nos esforzaremos por mantenerlas actualizadas. Estas especificaciones pueden estar incompletas y sujetas a cambios sin previo aviso. Es su responsabilidad revisarlas periódicamente.
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>
                Para todos los servicios de mensajería SMS, le proporcionaremos un nombre de usuario y contraseña. La seguridad, accesos y uso indebido son responsabilidad del usuario. CENTERNEXT queda exento de cualquier uso inapropiado realizado por las cuentas del cliente.
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left', font: 'normal normal normal 16px/20px Poppins', letterSpacing: '0px', color: '#330F1B' }}>
                Las transacciones de pago se gestionan a través de Openpay, propiedad de BBVA, y están sujetas a sus términos. CENTERNEXT no se hace responsable por errores o fallas imputables al servicio de Openpay.
            </Typography>
        </div>
    );
};

export default TermsAndConditions;
