import React from 'react';
import '../../assets/styles/modal/Modal.css';
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className = "modal-overlay">
            <div className='modal-content'>
                <button 
                    className="modal-close-button" 
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <span className="modal-close-icon">X</span>
                </button>
                {children}
            </div>
        </div>
    )
}

export default Modal;