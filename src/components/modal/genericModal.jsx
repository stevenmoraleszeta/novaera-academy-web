import React from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';

const GenericModal = ({ isOpen, onClose, title, message, type, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modalContent">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modalButtons">
                    <button onClick={type === 'alert' ? onClose : onConfirm} className="saveButton">
                        {type === 'alert' ? 'Aceptar' : <><FaCheck /> Confirmar</>}
                    </button>
                    {type === 'confirm' && (
                        <button onClick={onClose} className="cancelButton">
                            <FaTimes /> Cancelar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenericModal;