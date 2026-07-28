import { useState, useEffect, useCallback } from 'react';

export const useUrlNavigation = () => {
  const [urlState, setUrlState] = useState({
    currentScreen: '',
    systemType: '',
    isEditingSystem: false,
    editingSystemId: '',
    workingConditionRoute: '',
    workingConditionPoint: '',
    isEditingCondition: false
  });

  useEffect(() => {
    const parseUrl = () => {
      const params = new URLSearchParams(window.location.search);
      
      setUrlState({
        currentScreen: params.get('currentScreen') || '',
        systemType: params.get('systemType') || '',
        isEditingSystem: params.get('isEditingSystem') === 'true',
        editingSystemId: params.get('editingSystemId') || '',
        workingConditionRoute: params.get('workingConditionRoute') || '',
        workingConditionPoint: params.get('workingConditionPoint') || '',
        isEditingCondition: params.get('isEditingCondition') === 'true'
      });
    };

    parseUrl();
    
    const handlePopState = () => {
      parseUrl();
    };
    
    const handleCustomUrlChange = () => {
      parseUrl();
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('urlNavigationChange', handleCustomUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('urlNavigationChange', handleCustomUrlChange);
    };
  }, []);

  const updateUrl = useCallback((newState, replaceHistory = false) => {
    const url = new URL(window.location);
    
    url.search = '';
    
    Object.entries(newState).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== null) {
        if (typeof value === 'boolean') {
          url.searchParams.set(key, value.toString());
        } else {
          url.searchParams.set(key, value);
        }
      }
    });
    
    if (replaceHistory) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
    
    setUrlState(newState);
    
    window.dispatchEvent(new CustomEvent('urlNavigationChange'));
  }, []);

  return { urlState, updateUrl };
};
