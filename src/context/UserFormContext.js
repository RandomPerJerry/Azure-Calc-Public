import React, {
  createContext,
  useEffect,
  useCallback,
} from "react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { defaultShipData } from "../utils/defaultSavedFormat";
import generateId from "../utils/generateId";

export const UserFormContext = createContext();

export const UserFormProvider = ({ children }) => {
  const {
    data: appData,
    updateData: updateAppData,
    saveData: saveAppData,
    saveAsData,
    openFile,
    createNewFile,
    isFileSystemSupported, 
    currentFileHandle,
    hasUnsavedChanges,
  } = useLocalStorage();
  // --------- Ship Components ---------
  const getComponent = useCallback(
    (type, id) => {
      const category = appData.componentLibrary[type];
      if (!category) return null;

      const component = category.find((comp) => comp.id === id);
      if (!component) return null;

      return {
        id: component.id,
        name: component.name,
        data: component.data,
        version: component.version || 1,
      };
    },
    [appData.componentLibrary]
  );

  const createComponent = useCallback(
    (componentType, newData, output) => {
      const componentWithIdAndVersion = {
        id: generateId(),
        version: 1,
        data: newData,
        output,
      };

      updateAppData((currentData) => ({
        ...currentData,
        componentLibrary: {
          ...currentData.componentLibrary,
          [componentType]: [
            ...currentData.componentLibrary[componentType],
            componentWithIdAndVersion,
          ],
        },
      }));
    },
    [updateAppData]
  );

  const saveComponent = useCallback(
    (componentType, componentId, newData, output) => {
      updateAppData((currentData) => ({
        ...currentData,
        componentLibrary: {
          ...currentData.componentLibrary,
          [componentType]: currentData.componentLibrary[componentType].map(
            (comp) => {
              if (comp.id === componentId) {
                return {
                  ...comp,
                  data: newData,
                  id: componentId,
                  output,
                  version: (comp.version || 1) + 1,
                };
              }
              return comp;
            }
          ),
        },
      }));
    },
    [updateAppData]
  );

  const deleteComponent = useCallback(
    (componentType, componentId) => {
      updateAppData((currentData) => ({
        ...currentData,
        componentLibrary: {
          ...currentData.componentLibrary,
          [componentType]: currentData.componentLibrary[componentType].filter(
            (comp) => comp.id !== componentId
          ),
        },
      }));
    },
    [updateAppData]
  );

  // ship
  const getShip = useCallback(
    (shipId) => {
      if (!shipId) return null;
      return appData.ships.find((s) => s.id === shipId) || null;
    },
    [appData.ships]
  );

  const createShip = useCallback(
    (shipName) => {
      const newShip = {
        id: generateId(),
        ...defaultShipData,
        name: shipName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateAppData((currentData) => ({
        ...currentData,
        ships: [...currentData.ships, newShip],
      }));
      return newShip
    },
    [updateAppData]
  );

  const saveShip = useCallback(
    (shipId, newData) => {
      updateAppData((currentData) => ({ 
        ...currentData,
        ships: currentData.ships.map((s) => {
          if (s.id !== shipId) return s;

          return {
            ...s,
            ...newData,
            id: shipId,
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    [updateAppData]
  );

  const deleteShip = useCallback(
    (shipId) => {
      updateAppData((currentData) => ({
        ...currentData,
        ships: currentData.ships.filter((s) => s.id !== shipId),
      }));
    },
    [updateAppData]
  );

  const copyShip = useCallback((shipId) => {
    updateAppData((currentData) => {
      const targetShip = currentData.ships.find(s => s.id === shipId);
      if (!targetShip) return currentData;

      const newShipData = {
        ...targetShip,
        name: `${targetShip.name}-copy`,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        ...currentData,
        ships: [...currentData.ships, newShipData]
      }
    })
  }, [updateAppData])

  const saveSetting = useCallback((field, value) => {
    updateAppData((currentData) => ({
      ...currentData,
      settings: {
        ...currentData.settings,
        [field]: value,
      }
    }))
  }, [updateAppData])

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const value = {
    appData,
    saveAppData,
    saveAsData,

    getComponent,
    createComponent,
    saveComponent,
    deleteComponent,
    
    getShip,
    createShip,
    saveShip,
    deleteShip,
    copyShip,

    saveSetting,

    openFile,
    createNewFile,
    isFileSystemSupported, 
    currentFileHandle,
    hasUnsavedChanges,
    
  };

  return (
    <UserFormContext.Provider value={value}>
      {children}
    </UserFormContext.Provider>
  );
};
// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return "Unknown";

//   // Handle JavaScript Date objects
//   if (timestamp instanceof Date) {
//     return timestamp.toLocaleString();
//   }

//   // Handle Firestore Timestamps
//   if (timestamp.toDate) {
//     return timestamp.toDate().toLocaleString();
//   }

//   // Fallback
//   return "Invalid date format";
// };
