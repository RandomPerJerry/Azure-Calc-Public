import { useContext } from 'react';
import { ShipComponentContext } from '../context/ShipComponentContext';

const useShipComponent = () => {
  const context = useContext(ShipComponentContext);
  
  if (!context) {
    throw new Error(
      'useShipComponent must be used within a ShipComponentProvider. ' +
      'Make sure to wrap your component with <ShipComponentProvider>.'
    );
  }
  
  return context;
};

export default useShipComponent;