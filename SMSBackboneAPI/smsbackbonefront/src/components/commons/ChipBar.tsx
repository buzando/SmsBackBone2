import React from "react";
import { Box, Typography, Button } from "@mui/material";

type ChipBarProps = {
    message: string;
    buttonText: string;
    onClose: () => void; // Función para manejar el cierre
};

const ChipBar: React.FC<ChipBarProps> = ({ message, buttonText, onClose }) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1F1B1C",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: "8px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                maxWidth: "400px",
                width: "100%",
                position: "fixed",
                bottom: "60px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
            }}
        >
            <Typography
                sx={{
                    textAlign: "left",
                    fontStyle: "normal",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontFamily: "Poppins",
                    letterSpacing: "0px",
                    color: "#DEDADA",
                    opacity: 1,
                    marginRight: "16px",
                }}
            >
                {message}
            </Typography>
            <Button
                onClick={onClose}
                sx={{
                    color: "#D4718D",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "12px",
                    "&:hover": {
                        backgroundColor: "transparent",
                    },
                }}
            >
                {buttonText}
            </Button>
        </Box>
    );
};

export default ChipBar;
