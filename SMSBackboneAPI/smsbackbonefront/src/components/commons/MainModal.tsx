import React from "react";
import "./Common.css";
import SecondaryButton from "./SecondaryButton";
import PrimaryButton from "./MainButton";

interface MainModalProps {
    isOpen: boolean;
    message: string;
    Title: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    onPrimaryClick: () => void;
    onSecondaryClick: () => void;
}

const MainModal: React.FC<MainModalProps> = ({
    isOpen,
    Title,
    message,
    primaryButtonText,
    secondaryButtonText,
    onPrimaryClick,
    onSecondaryClick,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-error-overlay">
            <div className="modal-error-content">
                <h2 className="modal-error-title">{Title}</h2>
                <p className="modal-error-message">{message}</p>
                <div className="modal-error-footer">
                    <SecondaryButton text={secondaryButtonText} onClick={onSecondaryClick} />
                    <PrimaryButton text={primaryButtonText} onClick={onPrimaryClick} />
                </div>
            </div>
        </div>
    );
};

export default MainModal;
