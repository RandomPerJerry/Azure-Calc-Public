const averageCount = (listLength, index) => {
  if (listLength === 0) {
    return null;
  }

  if (listLength === 3 && index === 1) {
    return 34;
  } else if (listLength === 3) {
    return 33;
  } else {
    return Math.round(100 / listLength);
  }
}

/**
 * Creates default system state based on system type
 * @param {string} systemType - The type of system
 * @param {Object} system - The system object
 * @param {number} totalSystemCount - Total number of systems of this type
 * @param {number} systemIndex - Index of current system (0-based)
 * @returns {Object} Default system state object
 */
export const createDefaultSystemState = (systemType, system, totalSystemCount, systemIndex = 0) => {
  const propulsionState = (propulsionSystem, totalCount, index) => {
    const propulsionMode = propulsionSystem?.data?.propulsionMode || null;
    
    const defaultPowerDistribution = averageCount(totalCount, index);


    let systemState;
    switch (propulsionMode) {
      case "hybrid":
        systemState = {
          powerMode: "Full Electric",
          propulsionPowerDistribution: defaultPowerDistribution,
          dieselPowerSupply: 0,
          burstDivide: 0,
        };
        break;

      case "electric":
      case "diesel":
      default:
        systemState = { propulsionPowerDistribution: defaultPowerDistribution };
        break;
    }

    return systemState;
  };

  const defaults = {
    batterySystem: { activate: true }, // useless (for consistency)
    propulsionSystem: propulsionState(system, totalSystemCount, systemIndex),
    auxiliaryPowerUnitSystem: { activate: false },
    generatorGroupSystem: { generatorPower: 0 },
    hotelLoadSystem: { activate: false },
    otherLoadSystem: { activate: false },
    shorePowerSystem: { activate: false, fuelSupplied: 0 },
  };

  return defaults[systemType] || { activate: false };
};

/**`
 * Syncs a single data point's system data with available systems
 * @param {Object} dataPoint - The working condition data point
 * @param {Object} availableSystem - Available systems object
 * @returns {Object} Updated data point
 */
export const syncDataPointSystems = (dataPoint, availableSystem, maxBarNumber) => {
  const currentData = dataPoint.data || {};
  const newPointData = {};

  Object.keys(availableSystem).forEach((systemType) => {
    const usedSystemList = availableSystem[systemType].filter(s => s.barNumber && s.barNumber <= maxBarNumber);
    
    const conditionSystemList = currentData[systemType] || [];
    const newListData = [];
    usedSystemList.forEach((usedSystem, systemIndex) => {
      // Check if the system already existed
      const goodConditionSystem = conditionSystemList.find(conditionSystem => usedSystem.id === conditionSystem.id && conditionSystem.systemState !== undefined)
  
      if (goodConditionSystem) {

        if (systemType === "propulsionSystem" && usedSystemList.length !== conditionSystemList.length) {
          goodConditionSystem.systemState.propulsionPowerDistribution = averageCount(usedSystemList.length, systemIndex);
        }
        newListData.push(goodConditionSystem);
        return;
      }

      const newConditionSystemObject = {
        id: usedSystem.id,
        systemState: createDefaultSystemState(systemType, usedSystem, usedSystemList.length, systemIndex),
      }

      newListData.push(newConditionSystemObject);
    })

    newPointData[systemType] = newListData;
  })

  return {
    ...dataPoint,
    data: newPointData,
  }
};

/**
 * Syncs all working condition routes with available systems
 * @param {Array} routes - Array of working condition routes
 * @param {Object} availableSystem - Available systems object
 * @returns {Array} Updated routes array
 */
export const syncWorkingConditionRoutes = (routes, availableSystem, maxBarNumber) => {
  if (!routes || routes.length === 0) return routes;

  return routes.map((route) => {
    const updatedDataPoints = route.workingConditionDataPoints.map(
      (dataPoint) => syncDataPointSystems(dataPoint, availableSystem, maxBarNumber)
    );

    return {
      ...route,
      workingConditionDataPoints: updatedDataPoints,
    };
  });
};

/**
 * Main function to sync working condition state with available systems
 * @param {Object} workingConditionState - Current working condition state
 * @param {Object} availableSystem - Available systems object
 * @param {Number} maxBarNumber - User Selected Bar
 * @returns {Object} Updated working condition state
 */
export const syncWorkingConditionState = (
  workingConditionState,
  availableSystem,
  maxBarNumber
) => {
  const updatedRoutes = syncWorkingConditionRoutes(
    workingConditionState.routes,
    availableSystem,
    maxBarNumber
  );

  return {
    ...workingConditionState,
    routes: updatedRoutes,
  };
};

