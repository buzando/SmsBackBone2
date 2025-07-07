import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from 'react-router-dom';

const PrivacyNotice: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', marginLeft: '40px', maxWidth: '1140px', minHeight: '150vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1, ml: '-28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, height: 24, transform: 'rotate(270deg)', display: 'block' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#330F1B', fontFamily: 'Poppins', fontSize: '26px' }}>
                    Aviso de Privacidad
                </Typography>
            </Box>

            <Typography paragraph>Con fundamento en los artículos 15 y 16 de la Ley Federal de Protección de Datos Personales en Posesión de Particulares hacemos de su conocimiento lo siguiente:</Typography>
            <Typography paragraph>CENTERNEXT CLOUD SERVICES S. A. DE C. V., con domicilio ubicado en: Eugenia 197-4D, Narvarte Poniente, Benito Juárez, 03020 CDMX, México, es el responsable de sus datos personales.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Departamento de Datos Personales</Typography>
            <Typography paragraph>El departamento de Datos Personales es designado por CENTERNEXT CLOUD SERVICES S. A. DE C. V., para el trámite de solicitudes de los titulares, para el ejercicio de sus derechos derivados o inherentes a los datos personales.</Typography>
            <Typography paragraph>Datos de Contacto: Eugenia 197-4D, Narvarte Poniente, Benito Juárez, 03020 CDMX, México. Teléfono: 5511078510</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Titular de los Datos Personales</Typography>
            <Typography paragraph>Es la persona física a quien corresponden los datos personales.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Fines de Recabación y Uso de Datos Personales</Typography>
            <Typography paragraph>Los datos personales serán utilizados para las siguientes finalidades:</Typography>
            <ul>
                <li>Proveer los servicios y productos requeridos por usted.</li>
                <li>Informar sobre cambios o nuevos productos o servicios.</li>
                <li>Dar cumplimiento a obligaciones contraídas con nuestros clientes.</li>
                <li>Evaluar la calidad del servicio y realizar estudios internos.</li>
                <li>Enviar publicidad.</li>
                <li>Fines mercadotécnicos, publicitarios o de prospección comercial.</li>
            </ul>

            <Typography variant="h6" sx={{ mt: 2 }}>Identificación de los Datos Personales</Typography>
            <Typography paragraph>Se recaban: Nombre completo, nombre del comercio, teléfono, correo electrónico, ID de redes sociales, firma, dirección, datos fiscales, RFC y/o CURP. No se recaban datos personales sensibles.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Consentimiento</Typography>
            <Typography paragraph>El titular consentirá el tratamiento de sus Datos Personales si no externa su negativa a través de los datos de contacto.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Procedimiento para Limitar el Uso o Divulgación de sus Datos Personales</Typography>
            <Typography paragraph>La solicitud debe incluir: nombre, domicilio, correo electrónico, documentos de identidad, descripción clara de los datos a limitar y cualquier otro elemento necesario. El departamento tendrá 20 días hábiles para resolver y 15 días hábiles para hacer efectiva la resolución.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Acceso, Rectificación, Cancelación u Oposición del Uso de Datos</Typography>
            <Typography paragraph>La solicitud debe contener los mismos elementos mencionados anteriormente. Los plazos son iguales: 20 días hábiles para resolver y 15 días hábiles para ejecutar. El procedimiento es gratuito, salvo gastos de envío.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Procedimiento para Revocar el Consentimiento</Typography>
            <Typography paragraph>El titular puede solicitar revocar el consentimiento otorgado, enviando una solicitud con los datos y documentos requeridos. El departamento responderá en 20 días hábiles y hará efectiva la revocación en 15 días hábiles.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Transferencia de Datos Personales</Typography>
            <Typography paragraph>CENTERNEXT CLOUD SERVICES, S.A. DE C.V. no comercializa datos personales a terceros. Las transferencias solo se darán bajo mandato judicial o consentimiento expreso.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Permiso de Transferencia de sus Datos Personales</Typography>
            <Typography paragraph>Los datos pueden transferirse a instituciones públicas, clientes o usarse en medios informativos internos (sin datos personales). Se requiere consentimiento expreso del titular.</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>Quejas y Denuncias</Typography>
            <Typography paragraph>Si considera que sus derechos han sido vulnerados, puede acudir al Instituto Federal de Acceso a la Información Pública y Datos Personales (IFAI). Más información en www.ifai.org.mx</Typography>

            <Box sx={{ height: '200px' }} />
        </div>
    );
};

export default PrivacyNotice;
