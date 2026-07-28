import { useState, useEffect, useCallback, useRef } from 'react';
import { defaultAppData } from '../utils/defaultSavedFormat';
import { lenientDeepEqual} from '../utils/objectComp';

export const useLocalStorage = () => {
  const [storageMethod, setStorageMethod] = useState('detecting');
  const [currentFileHandle, setCurrentFileHandle] = useState(null);
  const [lastSavedData, setLastSavedData] = useState(defaultAppData); 
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [data, setData] = useState(defaultAppData);
  const dataRef = useRef(data);

  useEffect(() => {
    console.log('appData', data); 
    dataRef.current = data;
  }, [JSON.stringify(data)])

  useEffect(() => {
    // Detect browser capability and set storage method
    if ('showSaveFilePicker' in window) {
      setStorageMethod('file-system-api');
    } else {
      setStorageMethod('download-upload');
    }
    
    // Load data on startup
    loadData();
    
    // Setup Ctrl+S listener (only for File System API)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's' && storageMethod === 'file-system-api') {
        e.preventDefault();
        saveData();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [storageMethod]);

  useEffect(() => {
    const hasChanges = !lenientDeepEqual(data, lastSavedData);
    setHasUnsavedChanges(hasChanges);
  }, [data, lastSavedData]);

  const createNewFile = () => {
    setData(defaultAppData);
    setLastSavedData(defaultAppData);
    setHasUnsavedChanges(false);
    setCurrentFileHandle(null);
  }

  // Chrome/Edge: File System Access API
  const saveWithFileSystemAPI = async (dataToSave) => {
    try {
      if (!currentFileHandle) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `ship-data-${new Date().toISOString().split('T')[0]}.txt`,
          types: [{
            description: 'Ship Data Files',
            accept: { 'text/plain': ['.txt'] }
          }]
        });
        setCurrentFileHandle(handle);

        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(dataToSave));
        await writable.close();
        
        console.log('✅ Saved to file (Chrome/Edge)12', dataToSave);
        return { success: true, method: 'file-system-api' };
      }

      const writable = await currentFileHandle.createWritable();
      await writable.write(JSON.stringify(dataToSave)); 
      await writable.close();
      
      console.log('✅ Saved to file (Chrome/Edge)',dataToSave);
      return { success: true, method: 'file-system-api' };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      throw error;
    }
  };

  const loadWithFileSystemAPI = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'Ship Data Files',
          accept: { 'text/plain': ['.txt'], 'application/json': ['.json'] }
        }]
      });
      
      const file = await fileHandle.getFile();
      const text = await file.text();
      const loadedData = JSON.parse(text);
      
      setCurrentFileHandle(fileHandle);
      setData(loadedData);
      
      return { success: true, data: loadedData, method: 'file-system-api' };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      throw error;
    }
  };

  // Firefox/Safari: Download/Upload only
  const saveWithDownload = (dataToSave) => {
    const blob = new Blob([JSON.stringify(dataToSave)], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ship-data-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { success: true, method: 'download' };
  };

  const loadWithUpload = () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.json';
      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          if (!file) {
            resolve({ success: false, cancelled: true });
            return;
          }
          
          const text = await file.text();
          const loadedData = JSON.parse(text);
          
          setData(loadedData);
          
          resolve({ success: true, data: loadedData, method: 'upload' });
        } catch (error) {
          console.error('Error loading file:', error);
          resolve({ success: false, error: error.message });
        }
      };
      input.click();
    });
  };

  // Main interface methods - ALL using dataRef
  const saveData = useCallback(async () => {
    const currentData = dataRef.current;
    console.log('saving current data:', currentData);

    try {
      let result;
      if (storageMethod === 'file-system-api') {
        result = await saveWithFileSystemAPI(currentData);
      } else {
        result = saveWithDownload(currentData);
      }

      if (result.success) {
        setLastSavedData(currentData);
        setHasUnsavedChanges(false);
      }

      return result;
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  }, [storageMethod, currentFileHandle]); // Removed data dependency

  const saveAsData = useCallback(async () => {
    const currentData = dataRef.current; // Use ref instead of data
    
    try {
      let result;
      if (storageMethod === 'file-system-api') {
        result = await saveAsWithFileSystemAPI(currentData);
      } else {
        result = saveWithDownload(currentData);
      }

      if (result.success) {
        setLastSavedData(currentData);
        setHasUnsavedChanges(false);
      }

      return result;
    } catch (error) {
      console.error('Save As error:', error);
      throw error;
    }
  }, [storageMethod]); // Removed data dependency

  const saveAsWithFileSystemAPI = async (dataToSave) => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `ship-data-${new Date().toISOString().split('T')[0]}.txt`,
        types: [{
          description: 'Ship Data Files',
          accept: { 'text/plain': ['.txt'] }
        }]
      });
      
      setCurrentFileHandle(handle);

      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(dataToSave));
      await writable.close();
      
      return { success: true, method: 'file-system-api' };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      throw error;
    }
  };

  const loadData = useCallback(async () => {
    try {
      if (storageMethod === 'detecting') {
        setData(defaultAppData);
        return { success: true, data: defaultAppData, method: 'default' };
      }

      setData(defaultAppData);
      return { success: true, data: defaultAppData, method: 'default' };
    } catch (error) {
      console.error('Load error:', error);
      throw error;
    }
  }, [storageMethod]);

  const openFile = useCallback(async () => {
    try {
      let result;
      if (storageMethod === 'file-system-api') {
        result = await loadWithFileSystemAPI();
      } else {
        result = await loadWithUpload();
      }
      
      if (result.success) {
        setLastSavedData(result.data);
        setHasUnsavedChanges(false);
      }
      
      return result;
    } catch (error) {
      console.error('Open file error:', error);
      throw error;
    }
  }, [storageMethod]);

  // Simple data update - triggers immediate re-render
  const updateData = useCallback((updater) => {
    if (typeof updater === 'function') {
      setData(updater);
    } else {
      setData(currentData => ({ ...currentData, ...updater }));
    }
  }, []);

  return {
    // Data access
    data,
    updateData,
    
    // Save/Load operations
    saveData,
    saveAsData,
    openFile,
    createNewFile,
    
    // Status
    storageMethod,
    currentFileHandle: currentFileHandle ? 'Connected' : 'Not connected',
    hasUnsavedChanges,
    
    // Browser capabilities
    isFileSystemSupported: storageMethod === 'file-system-api',
    isDownloadOnly: storageMethod === 'download-upload'
  };
};
