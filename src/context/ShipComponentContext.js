import React, { createContext, useState, useEffect, useMemo } from "react";
import useUserForm from "../hooks/useUserForm";
import { syncWorkingConditionState } from "../hooks/useSyncWorkingConitions";
import { calculateEnergyConsumption } from "../calculations/energyCalculation/energyCalculations"; // Import the function
import { useUrlNavigation } from "../hooks/useUrlNavigation";

const ShipComponentContext = createContext();

export const ShipComponentProvider = ({ shipId, shipData, children }) => {
  const { saveShip } = useUserForm();
  const { urlState } = useUrlNavigation();

  const updateComponentState = (componentType, newData) => {
    saveShip(shipId, {
      ...shipData,
      [componentType]: {
        ...shipData[componentType],
        ...newData,
      },
    });
  };

  const getSystem = (id, type = null) => {
    if (type && Object.keys(shipData.system).includes(type)) {
      const system = shipData.system[type].find((s) => s.id === id);
      if (!system) return null;
      return system;
    }

    for (const systemType of Object.keys(shipData.system)) {
      const system = shipData.system[systemType].find((s) => s.id === id);
      if (system) return system;
    }

    return null;
  };

  const velocityTimeDependency = useMemo(() => {
    if (!shipData.workingConditions?.routes) return '';
    
    return JSON.stringify(
      shipData.workingConditions.routes.map(route => 
        route.workingConditionDataPoints?.map(point => ({
          velocity: point.velocity,
          time: point.time,
          condition: point.condition
        })) || []
      )
    );
  }, [shipData.workingConditions?.routes]);

  // Add power-velocity dependency
  const powerVelocityDependency = useMemo(() => {
    // Replace this with the actual path to your power-velocity data
    const powerVelocityData = shipData.loadProfile?.dataPoints;
    
    return JSON.stringify(
      powerVelocityData.map(point => ({
        power: point.power,
        velocity: point.velocity
      }))
    );
  }, [shipData.loadProfile?.dataPoints]); // Update this path as needed

  // Combined useEffect for both sync and energy calculation
  useEffect(() => {
    if (urlState.isEditingCondition || !shipData) return;
    console.log('recalculating due to dependency change');
    
    // Step 1: Sync working conditions with system changes
    const syncedWorkingConditions = syncWorkingConditionState(
      shipData.workingConditions,
      shipData.system,
      shipData?.busBar?.dcLinkNumber || 1,
    );

    // Step 2: Calculate energy consumption on the synced data
    const calculatedWorkingConditions = calculateEnergyConsumption(
      syncedWorkingConditions,
      shipData,
      getSystem
    );

    updateComponentState("workingConditions", calculatedWorkingConditions);
  }, [
    JSON.stringify(shipData.system), 
    velocityTimeDependency, 
    powerVelocityDependency, // Add the new dependency here
    urlState.isEditingCondition, 
    shipData.busBar?.dcLinkNumber,
    shipData.loadProfile?.fuelTankCapacity
  ]);

  const value = {
    shipData,
    shipId,
    getSystem,
    updateComponentState,
  };

  return (
    <ShipComponentContext.Provider value={value}>
      {children}
    </ShipComponentContext.Provider>
  );
};

export { ShipComponentContext };
