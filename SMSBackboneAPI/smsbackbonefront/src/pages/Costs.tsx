import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const Costs: React.FC = () => {
    return (
        <Box sx={{ padding: '20px', maxWidth: '610px', marginTop: '-70px', height: "670px", overflowY: "hidden", overflowX: "hidden" }}>
            {/* Título */}
            <Typography sx={{
                textAlign: 'left',
                fontFamily: 'Poppins',
                letterSpacing: '0px',
                color: '#330F1B',
                opacity: 1,
                fontSize: '26px',
                fontWeight: 'bold',
            }}>
                Costos totales
            </Typography>

            <Divider sx={{ margin: '10px 0' }} />

            {/* Sección SMS */}
            <Typography sx={{
                textAlign: 'left',
                fontFamily: 'Poppins',
                letterSpacing: '0px',
                color: '#330F1B',
                opacity: 1,
                fontSize: '18px',
                fontWeight: 'bold',
            }}>
                SMS
            </Typography>
            <Typography sx={{
                textAlign: 'left',
                fontFamily: 'Poppins',
                letterSpacing: '0px',
                color: '#330F1B',
                opacity: 1,
                fontSize: '14px',
            }}>
                Costos para México <span style={{ color: '#574B4F', fontWeight: 'bold' }}>Envíos</span> $0.065 por mensaje
            </Typography>

            <Divider sx={{ margin: '10px 0' }} />

            {/* Sección Números de Teléfono */}
            <Typography sx={{
                textAlign: 'left',
                fontFamily: 'Poppins',
                letterSpacing: '0px',
                color: '#330F1B',
                opacity: 1,
                fontSize: '18px',
                fontWeight: 'bold',
            }}>
                Números de teléfono
            </Typography>
            <Typography sx={{
                textAlign: 'left',
                fontFamily: 'Poppins',
                letterSpacing: '0px',
                color: '#330F1B',
                opacity: 1,
                fontSize: '14px',
            }}>
                Costos para México <span style={{ color: '#574B4F', fontWeight: 'bold' }}>Número virtual</span> $20.00 por mes
            </Typography>
        </Box>
    );
};

export default Costs;
