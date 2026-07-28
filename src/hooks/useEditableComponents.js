import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useUserForm } from '../context/UserFormContext';

function useEditableComponent(componentType) {
  const { id } = useParams();
  const { components, saveNewComponent, updateComponent } = useUserForm();
  const [isEditMode] = useState(!!id);
  const [componentData, setComponentData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      loadComponentData();
    }
  }, [id, components]);
  
  useEffect(() => {
    if (isEditMode && componentData && originalData) {
      const currentDataString = JSON.stringify(componentData.data);
      const originalDataString = JSON.stringify(originalData.data);
      const nameChanged = componentData.name !== originalData.name;
      
      const changes = currentDataString !== originalDataString || nameChanged;
      setHasUnsavedChanges(changes);
    }
  }, [componentData, originalData, isEditMode]);
  
  const loadComponentData = () => {
    const category = components.find((category) => category.type === componentType);
    
    if (category) {
        const data = category.components.find((component) => component.id === id);
        setComponentData(data || null);
        
        // Create a deep copy for originalData
        setOriginalData(data ? JSON.parse(JSON.stringify(data)) : null);
    } else {
        setComponentData(null);
        setOriginalData(null);
    }
    
    setIsLoading(false);
  };

  const hasChanges = () => {
    if (!isEditMode || !componentData || !originalData) return false;
    
    return JSON.stringify(componentData.data) !== JSON.stringify(originalData.data) ||
           componentData.name !== originalData.name;
  };
  
  const handleSubmit = async (formData) => {
    try {
      if (isEditMode) {
        if (!hasChanges()) {
          return { success: true, message: 'No changes to save' };
        }
        return await updateComponent({
          type: componentType,
          id: id,
          name: formData.name,
          data: formData.data
        });
      } else {
        return await saveNewComponent({
          type: componentType,
          name: formData.name,
          data: formData.data
        });
      }
    } catch (error) {
      console.error('Error submitting component:', error);
      throw error;
    }
  };
  
  // Method to update a field in componentData
  const updateField = useCallback((fieldName, value) => {
    if (!componentData) return;
    
    setComponentData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldName]: value
      }
    }));
  }, [componentData]);
  
  // Method to update a nested field
  const updateNestedField = (parentField, fieldName, value) => {
    if (!componentData) return;
    
    setComponentData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [parentField]: {
          ...(prev.data[parentField] || {}),
          [fieldName]: value
        }
      }
    }));
  };
  
  // Method to update component name
  const updateName = (name) => {
    if (!componentData) return;
    
    setComponentData(prev => ({
      ...prev,
      name
    }));
  };
  
  return {
    isEditMode,
    isLoading,
    componentData,
    hasChanges,
    handleSubmit,
    hasUnsavedChanges,
    updateField,
    updateNestedField,
    updateName,
    originalData
  };
}

export default useEditableComponent;