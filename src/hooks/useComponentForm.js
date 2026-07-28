import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserForm } from './useUserForm';
import generateId from '../utils/generateId';

export const useComponentForm = (componentType, validationSchema) => {
  const navigate = useNavigate();
  const { componentId } = useParams();
  const { getComponent, createComponent, saveComponent } = useUserForm();
  
  const isEditMode = !!componentId;
  const componentData = isEditMode ? getComponent(componentType, componentId) : null;
  
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data when editing
  useEffect(() => {
    if (isEditMode && componentData) {
      setFormData({
        name: componentData.name || '',
        ...componentData.data
      });
    }
  }, [isEditMode, componentData]);

  // Update field helper
  const updateField = (fieldPath, value) => {
    if (typeof fieldPath === 'string') {
      setFormData(prev => ({ ...prev, [fieldPath]: value }));
    } else {
      // Handle nested updates: ['dimensions', 'width'] 
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < fieldPath.length - 1; i++) {
          if (!current[fieldPath[i]]) current[fieldPath[i]] = {};
          current[fieldPath[i]] = { ...current[fieldPath[i]] };
          current = current[fieldPath[i]];
        }
        current[fieldPath[fieldPath.length - 1]] = value;
        return newData;
      });
    }
  };

  // Validation helper
  const validateForm = () => {
    if (!validationSchema) return null;
    
    for (const [field, rules] of Object.entries(validationSchema)) {
      const value = formData[field];
      
      if (rules.required && (!value || value === '')) {
        return `${rules.label || field} is required`;
      }
      
      if (rules.type === 'number' && value !== '' && isNaN(Number(value))) {
        return `${rules.label || field} must be a valid number`;
      }
      
      if (rules.min !== undefined && Number(value) < rules.min) {
        return `${rules.label || field} must be at least ${rules.min}`;
      }
    }
    
    return null;
  };

  // Save handler
  const handleSave = async (customData) => {
    setIsSaving(true);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSaving(false);
      return;
    }

    try {
      const saveData = customData || {
        id: isEditMode ? componentId : generateId(),
        name: formData.name,
        data: { ...formData, name: undefined } // Remove name from data
      };

      if (isEditMode) {
        saveComponent(componentType, componentId, saveData);
      } else {
        createComponent(componentType, saveData);
      }

      setError('');
      navigate(`/components/${componentType}`);
      
    } catch (err) {
      setError(err.message || 'Failed to save component');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    updateField,
    handleSave,
    error,
    isSaving,
    isEditMode,
    componentData
  };
};