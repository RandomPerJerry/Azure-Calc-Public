import React, { useState } from 'react';
import Modal from './Modal';
import { useUserForm } from '../../context/UserFormContext';
import '../../assets/styles/modal/continueShipModal.css';
import { useNavigate } from 'react-router-dom';

const ContinueShipModal = ({ isOpen, onClose }) => {
    const { userShips, setCurrentShipFromId, deleteShip } = useUserForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleShipSelect = (shipId) => {
        setCurrentShipFromId(shipId);
        onClose();
        navigate('/setting');
    };

    const handleDelete = async (shipId) => {
        if (window.confirm('Are you sure you want to delete this ship?')) {
            setLoading(true);
            try {
                await deleteShip(shipId);
            } catch (error) {
                console.error("Error deleting ship:", error);
            } finally {
                setLoading(false);
            }
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="ship-continue-content">
                <h2 className="ship-continue-title">My Ships</h2>
                <div className="ship-continue-grid">
                    {userShips.map(ship => (
                        <div key={ship.id} className="ship-continue-card">
                            <h3 className="ship-continue-card-title">{ship.name}</h3>
                            <p className="ship-continue-card-date">
                                Created: {new Date(ship.createdAt.toDate()).toLocaleDateString()}
                            </p>
                            <div className="ship-continue-buttons">
                                <button 
                                    onClick={() => handleShipSelect(ship.id)}
                                    className="ship-continue-button"
                                >
                                    Continue
                                </button>
                                <button 
                                    onClick={() => handleDelete(ship.id)}
                                    className="ship-continue-delete"
                                    disabled={loading}
                                >
                                    {loading ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {userShips.length === 0 && (
                        <p className="ship-continue-empty">No ships created yet</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ContinueShipModal;