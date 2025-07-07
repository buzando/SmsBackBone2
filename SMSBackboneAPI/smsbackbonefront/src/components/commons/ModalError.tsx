import React from "react";
import "./Common.css";
import SecondaryButton from "./SecondaryButton";

interface ModalErrorProps {
    isOpen: boolean;
    title: string;
    message: string;
    buttonText: string;
    onClose: () => void;
}

const ModalError: React.FC<ModalErrorProps> = ({
    isOpen,
    title,
    message,
    buttonText,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-error-overlay">
            <div className="modal-error-content">
                <h2 className="modal-error-title">{title}</h2>
                <p className="modal-error-message">{message}</p>
                <div className="modal-error-footer">
                    <SecondaryButton text={buttonText} onClick={onClose} />
                </div>
            </div>
        </div>
    );
};

export default ModalError;
