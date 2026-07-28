// src/pages/common/ComponentSelectorPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from '../../assets/styles/Component.module.css';

function ComponentSelectorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    itemType,
    returnPath,
    currentPageId,
    selectedItemId,
    displayFields = [],
    selectionTitle,
    filterOptions
  } = location.state || {};
  
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  
  // Fetch components based on itemType
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        // Replace with your actual data fetching logic
        const response = await fetch(`/api/components?type=${itemType}`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error(`Error fetching ${itemType}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (itemType) {
      fetchComponents();
    } else {
      setIsLoading(false);
      setItems([]);
    }
  }, [itemType]);
  
  // Filter items based on search term and filter
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      (item.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.data?.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = !filter || (
      filterOptions && filterOptions[filter] && filterOptions[filter].predicate(item)
    );
    
    return matchesSearch && matchesFilter;
  });
  
  // Select an item and return
  const selectItem = (item) => {
    navigate(returnPath || '/', { 
      state: { 
        selectedItem: item,
        fromSelection: true,
        itemType,
        currentPageId
      }
    });
  };
  
  // Go back without selecting
  const cancelSelection = () => {
    navigate(returnPath || '/');
  };
  
  return (
    <div className={styles.selectionPage}>
      <div className={styles.selectionHeader}>
        <button onClick={cancelSelection} className={styles.backButton}>
          ← Back
        </button>
        <h2>{selectionTitle || `Select Component`}</h2>
      </div>
      
      <div className={styles.selectionTools}>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        
        {filterOptions && (
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Items</option>
            {Object.keys(filterOptions).map(key => (
              <option key={key} value={key}>
                {filterOptions[key].label}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {isLoading ? (
        <div className={styles.loadingState}>Loading {itemType}s...</div>
      ) : (
        <div className={styles.itemGrid}>
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className={`${styles.itemCard} ${selectedItemId === item.id ? styles.selected : ''}`}
              onClick={() => selectItem(item)}
            >
              <h3 className={styles.itemTitle}>{item.name || `Unnamed ${itemType}`}</h3>
              
              <div className={styles.itemSpecs}>
                {displayFields.map(field => (
                  <div key={field.key} className={styles.specItem}>
                    <span className={styles.specLabel}>{field.label}:</span>
                    <span className={styles.specValue}>
                      {field.format ? 
                        field.format(item[field.key] || item.data?.[field.key]) : 
                        item[field.key] || item.data?.[field.key] || '--'
                      }
                    </span>
                  </div>
                ))}
              </div>
              
              <button className={styles.selectItemButton}>
                {selectedItemId === item.id ? 'Currently Selected' : 'Select This Item'}
              </button>
            </div>
          ))}
        </div>
      )}
      
      {filteredItems.length === 0 && !isLoading && (
        <div className={styles.emptyItems}>
          <p>No {itemType}s found matching your criteria.</p>
          <button 
            onClick={() => navigate(`/${itemType}`)}
            className={styles.createItemButton}
          >
            Create New {itemType.replace(/-/g, ' ')}
          </button>
        </div>
      )}
    </div>
  );
}

export default ComponentSelectorPage;