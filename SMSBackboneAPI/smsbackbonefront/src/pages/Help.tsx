import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from 'react-router-dom';


const Help: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Box p={3} sx={{ marginTop: "-80px", maxWidth: "1350px", minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                    onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img
                        src={ArrowBackIosNewIcon}
                        alt="Regresar"
                        style={{
                            width: 24,
                            height: 24,
                            transform: 'rotate(270deg)',
                            display: 'block'
                        }}
                    />
                </IconButton>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: '500',
                        color: '#330F1B',
                        fontFamily: 'Poppins',
                        fontSize: '26px',
                    }}
                >
                    Ayuda
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", }}>
                <Divider sx={{ marginBottom: '17px', marginTop: '16px' }} />
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
        </Box>


    );
};

export default Help;
