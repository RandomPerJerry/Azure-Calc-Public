import React, { useState } from 'react';
import styles from '../assets/styles/Component.module.css';

export const ComponentFormLayout = ({ 
  title, 
  backgroundImage,
  requiredFields, 
  optionalFields, 
  infoPanel,
  onSave, 
  isSaving, 
  error,
  isEditMode 
}) => {
  const [inputMode, setInputMode] = useState('required');

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.redBar}></div>
        <h2 className={styles.headerTitle}>{title}</h2>
        
        <div className={styles.inputMode}>
          <div className={styles.modeButtons}>
            <button
              type="button"
              className={`${styles.modeButton} ${inputMode === 'required' ? styles.active : ''}`}
              onClick={() => setInputMode('required')}
            >
              Required
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${inputMode === 'optional' ? styles.active : ''}`}
              onClick={() => setInputMode('optional')}
            >
              Optional
            </button>
          </div>
        </div>

        <div className={styles.inputField}>
          {inputMode === 'required' && requiredFields}
          {inputMode === 'optional' && optionalFields}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving}
          className={isSaving ? styles.buttonDisabled : styles.buttonPrimary}
        >
          {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Create"}
        </button>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
      
      <div className={styles.right}>
        {backgroundImage && (
          <div style={{ 
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: '75% 25%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '60% 60%',
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
        )}
        
        <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
          {infoPanel}
        </div>
      </div>
    </div>
  );
};