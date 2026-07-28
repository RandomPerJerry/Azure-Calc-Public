import React, { useState } from 'react';
import Modal from './Modal.jsx';
import useUserForm from '../../hooks/useUserForm.js';
import '../../assets/styles/modal/createShipModal.css';
import { useNavigate } from 'react-router-dom';

const ShipCreationModal = ({ isOpen, onClose }) => {
    const [shipName, setShipName] = useState('');
    const navigate = useNavigate();
    const { createShip } = useUserForm();
    const [error, setError] = useState('');

    const handleShipCreation = (e) => {
        e.preventDefault();
        if (!shipName.trim()) {
            setError('Please enter a ship name');
            return;
        }
        
        try {
            const newShip = createShip(shipName.trim());
            setShipName('');
            setError('');
            onClose();
            navigate(`/base/${newShip.id}`);
        } catch (error) {
            console.error("Error creating ship:", error);
            setError('Failed to create ship. Please try again.');  
        }
    }

    const handleClose = () => {
        setShipName('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <h2 className="ship-creation-title">Create New Ship</h2>
            <form className="ship-creation-form" onSubmit={handleShipCreation}>
                <input 
                    className="ship-creation-input"
                    type="text" 
                    value={shipName} 
                    onChange={(e) => setShipName(e.target.value)} 
                    placeholder="Ship Name"
                    maxLength={100}
                />
                <button 
                    className="ship-creation-button"
                    type="submit"
                >
                    Create Ship
                </button>
                {error && <p className="ship-creation-error">{error}</p>}
            </form>
        </Modal>
    );
}

export default ShipCreationModal;