import { useEffect, useRef } from 'react';

const useAutoSave = ({
  onSave, // Function to call for saving
  hasChanges, // Function that returns true if there are unsaved changes
  isEnabled = true, // Whether auto-save is enabled
  delay = 5000, // Debounce delay in ms
  maxInterval = 30000, // Max time between saves in ms
  enableWindowClose = true, // Enable save on window close
  enableTabSwitch = true, // Enable save on tab switch
  dependencies = [], // Dependencies that trigger auto-save
}) => {
  const autoSaveTimeoutRef = useRef(null);
  const lastSaveTimeRef = useRef(Date.now());
  const isSavingRef = useRef(false);

  // Main auto-save effect
  useEffect(() => {
    if (!isEnabled || isSavingRef.current) return;
    if (!hasChanges()) return;

    const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
    
    // Force save if it's been too long
    if (timeSinceLastSave >= maxInterval) {
      console.log('🚨 Force save - max time exceeded');
      performSave();
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set up debounced save
    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);
    
    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [...dependencies, isEnabled]);

  // Perform save function
  const performSave = async () => {
    console.log('save')
    if (isSavingRef.current || !hasChanges()) return;
    
    try {
      isSavingRef.current = true;
      console.log('🚀 Auto-saving...');
      
      await onSave();
      lastSaveTimeRef.current = Date.now();
      
      console.log('✅ Auto-save completed');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  };

  // Window close protection
  useEffect(() => {
    if (!enableWindowClose) return;

    const handleBeforeUnload = async (e) => {
      if (hasChanges()) {
        // Cancel pending auto-save
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        try {
          await performSave();
        } catch (error) {
          console.error('Failed to save on window close:', error);
          e.preventDefault();
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
          return e.returnValue;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enableWindowClose, hasChanges, onSave]);

  // Tab switch protection
  useEffect(() => {
    if (!enableTabSwitch) return;

    const handleVisibilityChange = async () => {
      if (document.hidden && hasChanges()) {
        // Cancel pending auto-save
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        await performSave();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableTabSwitch, hasChanges, onSave]);

  // Force save interval (true periodic save)
  useEffect(() => {
    if (!isEnabled) return;
    
    const forceCheckInterval = setInterval(() => {
      const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
      
      if (timeSinceLastSave >= maxInterval && hasChanges()) {
        console.log('🚨 Force save triggered by interval');
        performSave();
      }
    }, Math.min(maxInterval / 6, 10000)); // Check every 10s or maxInterval/6, whichever is smaller
    
    return () => clearInterval(forceCheckInterval);
  }, [isEnabled, maxInterval, hasChanges]);

  // Manual save function (cancels auto-save and saves immediately)
  const saveNow = async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    await performSave();
  };

  // Reset save timestamp (call when data is loaded from server)
  const resetSaveTime = () => {
    lastSaveTimeRef.current = Date.now();
  };

  return {
    saveNow,
    resetSaveTime,
    isSaving: isSavingRef.current,
  };
};

export default useAutoSave;
