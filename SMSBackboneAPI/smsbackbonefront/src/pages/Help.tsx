import React from 'react';
import { Box, Divider, Typography } from '@mui/material';

const Help: React.FC = () => {
    return (
        <Box sx={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#4a4a4a', marginTop: "-68px", marginLeft: "45px", overflow: "hidden" }}>
            <Typography variant="h4" sx={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'Poppins' }}>
                Ayuda
            </Typography>

            <hr style={{
                border: 'none',
                height: '1px',
                backgroundColor: '#dcdcdc',
                marginBottom: '20px'
            }} />

            <Typography variant="h6" sx={{ marginBottom: '20px', fontWeight: 'bold', fontFamily: 'Poppins' }}>
                Por favor, contáctenos:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <Box sx={{ flex: '1 1 45%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Poppins' }}>
                        Horarios de atención
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        <strong>Lunes a viernes</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '30px', fontFamily: 'Poppins' }}>
                        Teléfono: 55 1107 8510 Opción 3
                        <Divider sx={{ my: 2, width: '875px', position: 'absolute' }} /> {/*/Linea*/}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        <strong>Sábado</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        9:00-18:00 CST
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '30px', fontFamily: 'Poppins' }}>
                        Teléfono: 55 1107 8510 Opción 3
                        <Divider sx={{ my: 2, width: '875px', position: 'absolute' }} /> {/*/Linea*/}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        <strong>Domingo</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        9:00-15:00 CST
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        Teléfono: 55 1107 8510 Opción 3
                        <Divider sx={{ my: 2, width: '875px', position: 'absolute' }} /> {/*/Linea*/}
                    </Typography>
                </Box>

                <Box sx={{ flex: '1 1 53%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '20px', marginTop: '-45px', fontFamily: 'Poppins' }}>
                        Línea de emergencia
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        <strong>Lunes a viernes</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        21:00 - 07:00
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '40px', fontFamily: 'Poppins' }}>
                        Teléfono: 55 5437 6175
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        <strong>Sábado y domingo</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '10px', fontFamily: 'Poppins' }}>
                        Teléfono: 55 5437 6175
                    </Typography>
                </Box>
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Poppins' }}>
                Soporte: cwsoporte@nuxiba.com
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: '100px', fontFamily: 'Poppins', overflow: "hidden" }}>
                Dirección: Eugenia 197, Narvarte Poniente, Benito Juárez, 03020 Ciudad de México, CDMX
            </Typography>
        </Box>


    );
};

export default Help;
