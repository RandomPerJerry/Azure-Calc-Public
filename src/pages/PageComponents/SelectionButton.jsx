// src/components/common/SelectionButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/Component.module.css';

function SelectionButton({ 
  itemType,          // Type of item to select (e.g., 'battery-cell', 'inverter')
  label,             // Button label
  selectedItem,      // Currently selected item (if any)
  displayFields,     // Fields to display from selected item
  returnPath,        // Path to return to after selection
  currentPageId      // ID of current page/component (for context)
}) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/component-selector', { 
      state: { 
        itemType,
        returnPath,
        currentPageId,
        selectedItemId: selectedItem?.id,
        displayFields,
        selectionTitle: `Select ${label || itemType}`
      } 
    });
  };
  
  return (
    <div className={styles.selectionContainer}>
      <button 
        onClick={handleClick}
        className={styles.selectButton}
      >
        {selectedItem ? `Change ${label || itemType}` : `Select ${label || itemType}`}
      </button>
      
      {selectedItem && (
        <div className={styles.selectedItemInfo}>
          <p className={styles.selectedItemName}>
            {selectedItem.name || `Selected ${itemType}`}
          </p>
          
          {displayFields && displayFields.map((field) => (
            <p key={field.key} className={styles.selectedItemDetail}>
              <span className={styles.fieldLabel}>{field.label}:</span>
              <span className={styles.fieldValue}>
                {field.format ? 
                  field.format(selectedItem[field.key] || selectedItem.data?.[field.key]) : 
                  selectedItem[field.key] || selectedItem.data?.[field.key] || '--'
                }
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectionButton;