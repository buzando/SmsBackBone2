import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress';

type props = {
    label: string;
    loading: boolean;
}
const ButtonLoading: React.FC<props> = ({ label, loading }) => {

    return (
        <Box sx={{ marginLeft: 1, position: "relative" }}>
            <Button
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                    backgroundColor: loading ? "#F0F0F0" : "#833A53", // Cambia el color según el estado
                    border: "none", // Elimina el borde
                    borderRadius: "4px",
                    opacity: loading ? 1 : 0.9, // Ajusta opacidad si está deshabilitado
                    color: loading ? "#A0A0A0" : "#FFFFFF", // Cambia el color del texto en estado deshabilitado
                    width: "250px", // Ancho fijo en píxeles
                    height: "50px", // Altura fija para un diseño uniforme
                    padding: "10px 20px", // Espaciado interno
                    fontSize: "16px", // Ajusta el tamaño del texto
                    fontWeight: "bold", // Negrita para que sea más destacado
                    textTransform: "uppercase", // Texto en mayúsculas
                    "&:hover": {
                        backgroundColor: !loading ? "#732d57" : undefined, // Hover solo si no está deshabilitado
                    },
                    margin: "0 auto", // Centrar horizontalmente si es necesario
                }}
                type="submit">
                {loading ? (
                    <CircularProgress size={24} sx={{ color: "#A0A0A0" }} />
                ) : (
                    label
                )}
            </Button>
        </Box>
    )
}

export default ButtonLoading;
