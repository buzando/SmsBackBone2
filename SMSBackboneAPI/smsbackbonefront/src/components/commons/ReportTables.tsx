// ReportTables.tsx
import React from 'react';
import { Box } from '@mui/material';

// Tipo de datos para reportes
export interface Reports {
    id: number;
    Fecha: Date;
    Telefono: string;
    Sala: string;
    Campana: string;
    Idcampana: number;
    Usuario: string;
    Idmensaje: number;
    Mensaje: string;
    Estado: string;
    Fecharecepcion: Date;
    Costo: number;
    Tipo: string;
}

export const datasets: Record<string, Reports[]> = {
    "Mensajes entrantes": [/* ...datos de prueba */],
    "Mensajes enviados": [/* ...datos de prueba */],
    "Mensajes no enviados": [/* ...datos de prueba */],
    "Mensajes rechazados": [/* ...datos de prueba */]
};

export const ReportTables = ({ tableRef }: { tableRef?: React.RefObject<HTMLDivElement> }) => {

    const data: Reports[] = [
        {
            id: 1,
            Fecha: new Date('2025-03-25T10:00:00'),
            Telefono: '3001234567',
            Sala: 'Atención al Cliente',
            Campana: 'Campaña Marzo',
            Idcampana: 101,
            Usuario: 'jdoe',
            Idmensaje: 5001,
            Mensaje: 'Mensaje enviado correctamente',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:01:00'),
            Costo: 30,
            Tipo: 'SMS'
        },
        {
            id: 2,
            Fecha: new Date('2025-03-25T10:05:00'),
            Telefono: '3017654321',
            Sala: 'Soporte Técnico',
            Campana: 'Campaña Marzo',
            Idcampana: 101,
            Usuario: 'asmith',
            Idmensaje: 5002,
            Mensaje: 'Tu caso ha sido actualizado',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:06:00'),
            Costo: 25,
            Tipo: 'SMS'
        },
        {
            id: 3,
            Fecha: new Date('2025-03-25T10:10:00'),
            Telefono: '3025551234',
            Sala: 'Ventas',
            Campana: 'Promoción Primavera',
            Idcampana: 102,
            Usuario: 'mjordan',
            Idmensaje: 5003,
            Mensaje: 'Nueva oferta disponible',
            Estado: 'Fallido',
            Fecharecepcion: new Date('2025-03-25T10:11:00'),
            Costo: 0,
            Tipo: 'SMS'
        },
        {
            id: 4,
            Fecha: new Date('2025-03-25T10:15:00'),
            Telefono: '3039876543',
            Sala: 'Cobranza',
            Campana: 'Recordatorio de Pago',
            Idcampana: 103,
            Usuario: 'lrojas',
            Idmensaje: 5004,
            Mensaje: 'Tu factura vence mañana',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:16:00'),
            Costo: 20,
            Tipo: 'SMS'
        },
        {
            id: 5,
            Fecha: new Date('2025-03-25T10:20:00'),
            Telefono: '3043217890',
            Sala: 'Marketing',
            Campana: 'Campaña Abril',
            Idcampana: 104,
            Usuario: 'eperez',
            Idmensaje: 5005,
            Mensaje: 'No te pierdas nuestras novedades',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:21:00'),
            Costo: 28,
            Tipo: 'SMS'
        },
        {
            id: 6,
            Fecha: new Date('2025-03-25T10:25:00'),
            Telefono: '3051237894',
            Sala: 'Atención al Cliente',
            Campana: 'Campaña Abril',
            Idcampana: 104,
            Usuario: 'lvalencia',
            Idmensaje: 5006,
            Mensaje: 'Gracias por contactarnos',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:26:00'),
            Costo: 30,
            Tipo: 'SMS'
        },
        {
            id: 7,
            Fecha: new Date('2025-03-25T10:30:00'),
            Telefono: '3069871234',
            Sala: 'Soporte Técnico',
            Campana: 'Campaña Especial',
            Idcampana: 105,
            Usuario: 'mcastillo',
            Idmensaje: 5007,
            Mensaje: 'Se ha creado tu ticket',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:31:00'),
            Costo: 32,
            Tipo: 'SMS'
        },
        {
            id: 8,
            Fecha: new Date('2025-03-25T10:35:00'),
            Telefono: '3076543210',
            Sala: 'Ventas',
            Campana: 'Promoción de Pascua',
            Idcampana: 106,
            Usuario: 'gfernandez',
            Idmensaje: 5008,
            Mensaje: 'Oferta válida por 24h',
            Estado: 'Fallido',
            Fecharecepcion: new Date('2025-03-25T10:36:00'),
            Costo: 0,
            Tipo: 'SMS'
        },
        {
            id: 9,
            Fecha: new Date('2025-03-25T10:40:00'),
            Telefono: '3083216547',
            Sala: 'Cobranza',
            Campana: 'Alerta de Pago',
            Idcampana: 107,
            Usuario: 'nruiz',
            Idmensaje: 5009,
            Mensaje: 'Tu saldo está vencido',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:41:00'),
            Costo: 27,
            Tipo: 'SMS'
        },
        {
            id: 10,
            Fecha: new Date('2025-03-25T10:45:00'),
            Telefono: '3091122334',
            Sala: 'Marketing',
            Campana: 'Campaña Verano',
            Idcampana: 108,
            Usuario: 'adominguez',
            Idmensaje: 5010,
            Mensaje: '¡Prepárate para el verano!',
            Estado: 'Entregado',
            Fecharecepcion: new Date('2025-03-25T10:46:00'),
            Costo: 30,
            Tipo: 'SMS'
        }
    ];

    return (
        <Box
            ref={tableRef}
            sx={{
                background: '#FFFFFF',
                border: '1px solid #E6E4E4',
                borderRadius: '8px',
                width: '1500px',
                maxWidth: '100%',
                padding: '20px',
                marginTop: '5px',
                overflowX: 'auto',
                overflowY: 'hidden',
            }}
        >
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: "-15px", tableLayout: 'auto' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #E6E4E4' }}>
                        {[
                            'Fecha', 'Teléfono', 'Sala', 'Campaña', 'Id de Campaña',
                            'Usuario', 'Id de Mensaje', 'Mensaje', 'Estado',
                            'Fecha de Recepción', 'Costo', 'Tipo'
                        ].map((header, index) => (
                            <th key={index} style={{
                                textAlign: 'left',
                                padding: '10px',
                                fontFamily: 'Poppins, sans-serif',
                                letterSpacing: '0px',
                                color: '#330F1B',
                                fontSize: '13px',
                                backgroundColor: '#FFFFFF'
                            }}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E6E4E4', height: '50px' }}>
                            <td>{new Date(row.Fecha).toLocaleString()}</td>
                            <td>{row.Telefono}</td>
                            <td>{row.Sala}</td>
                            <td>{row.Campana}</td>
                            <td>{row.Idcampana}</td>
                            <td>{row.Usuario}</td>
                            <td>{row.Idmensaje}</td>
                            <td>{row.Mensaje}</td>
                            <td>{row.Estado}</td>
                            <td>{new Date(row.Fecharecepcion).toLocaleString()}</td>
                            <td>{row.Costo}</td>
                            <td>{row.Tipo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    );
};
