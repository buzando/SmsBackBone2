import React from 'react';
import './Common.css'; // Archivo CSS global para los estilos comunes

interface SecondaryButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
}

const TertiaryButton: React.FC<SecondaryButtonProps> = ({ text, onClick, disabled = false }) => {
    return (
        <button
            className={`tertiary-button ${disabled ? 'disabled' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

export default TertiaryButton;
