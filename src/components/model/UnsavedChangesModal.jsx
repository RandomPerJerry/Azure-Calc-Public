import React from 'react';
import Modal from './Modal';
import '../../assets/styles/modal/UnsavedChangesModal.css';

const UnsavedChangesModal = ({ 
  isOpen, 
  onSave, 
  onDiscard, 
  onCancel,
  action = "continue" 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="unsaved-changes-content">
        <div className="modal-header">
          <h3>⚠️ Unsaved Changes</h3>
        </div>
        
        <div className="modal-body">
          <p>You have unsaved changes. What would you like to do?</p>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn-primary" 
            onClick={onSave}
          >
            💾 Save and {action}
          </button>
          
          <button 
            className="btn-danger" 
            onClick={onDiscard}
          >
            🗑️ Discard changes
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={onCancel}
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UnsavedChangesModal;