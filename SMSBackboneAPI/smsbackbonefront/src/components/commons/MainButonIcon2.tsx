import React from 'react';
import './Common.css'; // Reutilizamos los estilos globales para hover, focus y active.
import PlusIconArrows from '../../assets/PlusIconArrows.svg'; // Import del �cono predeterminado
import CircularProgress from '@mui/material/CircularProgress';

interface MainButtonIconProps {
    text: string;
    onClick?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    width?: string;

    children?: React.ReactNode;
}

const MainButtonIcon2: React.FC<MainButtonIconProps> = ({ text, onClick, isLoading = false, disabled = false, width = "124px" }) => {
    return (
        <button
            className={`main-button ${disabled ? 'disabled' : ''}`}
            onClick={onClick}
            disabled={disabled || isLoading}
            style={{ width: width || "124px" }}
        >
            <img
                src={PlusIconArrows}
                alt="Icono del bot�n"
                className="button-icon"
                style={{ width: 24, height: 24 }}
            />
            {isLoading ? <CircularProgress size={20} thickness={8} style={{ color: '#FFFFFF' }} /> : text.toUpperCase()}
        </button>
    );
};

export default MainButtonIcon2;
