// Helper function to validate and convert numeric values
const safeNumeric = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
};

export const calculateRouteCostAnalysis = (
  ship,
  route,
  maxBarNumber,
  routeIndex = 0,
  costSettings = {}
) => {
  const {
    dieselFuelCost = ship.costAnalysis?.dieselFuelCost,
    shorePowerCost = ship.costAnalysis?.shorePowerCost,
    serviceCost = ship.costAnalysis?.serviceCost,
  } = costSettings;

  // Validate all numeric inputs
  const fuelTankCapacity = safeNumeric(ship.loadProfile?.fuelTankCapacity);
  const validDieselFuelCost = safeNumeric(dieselFuelCost);
  const validShorePowerCost = safeNumeric(shorePowerCost);
  const validServiceCost = safeNumeric(serviceCost);
  const validMaxBarNumber = safeNumeric(maxBarNumber);

  const shipType = ship.loadProfile?.shipType;
  const system = ship.loadProfile?.propulsionSystem;
  const totalBatteryKw =
    ship.system?.batterySystem
      ?.filter((s) => safeNumeric(s.barNumber) && safeNumeric(s.barNumber) <= validMaxBarNumber)
      ?.reduce((sum, system) => sum + (safeNumeric(system.data?.power) ?? 0), 0) ?? 0;

  const data = {
    id: `${ship.id}-${route.routeName}-${routeIndex}`,
    shipName: ship.name,
    shipType,
    system,
    route: route.routeName,
    averageSpeed: null,
    range: null,
    time: null,
    fuelTankCapacity,
    fuelConsumption: null,
    averageFullConsumption: null,
    carbonEmission: null,
    so2Emission: null,
    powerConsumption: null,
    averagePowerConsumption: null,
    fuelCost: null,
    powerCost: null,
    totalEnergyPrice: null,
    pricePerNm: null,
    pricePer100Nm: null,
  };

  const routePoints =
    route.workingConditionDataPoints?.filter((p) => p.output?.doRender) || [];

  if (routePoints.length === 0) return data;

  const lastPointOutput = routePoints[routePoints.length - 1].output;
  data.range = safeNumeric(lastPointOutput.distanceTraveled);
  data.time = routePoints.reduce((sum, point) => sum + (safeNumeric(point.time) ?? 0), 0);

  if (!data.range || !data.time) return data;

  data.averageSpeed = data.range / data.time;

  const validDieselSOC = safeNumeric(lastPointOutput.dieselSOC);
  const validShoreConnectionFuelUsage = safeNumeric(lastPointOutput.shoreConnectionFuelUsage);
  
  if (fuelTankCapacity && validDieselSOC !== null && validShoreConnectionFuelUsage !== null) {
    data.fuelConsumption =
      validShoreConnectionFuelUsage +
      ((100 - validDieselSOC) / 100) * fuelTankCapacity;
    data.averageFullConsumption = data.fuelConsumption / data.range;

    data.carbonEmission = data.fuelConsumption * 0.834;
    data.so2Emission = data.fuelConsumption * 4.651;

    if (validDieselFuelCost !== null) {
      data.fuelCost = data.fuelConsumption * validDieselFuelCost;
    }
  }

  const validShoreConnectionKwUsage = safeNumeric(lastPointOutput.shoreConnectionKwUsage);
  const validBatterySOC = safeNumeric(lastPointOutput.batterySOC);
  
  if (
    totalBatteryKw &&
    validShoreConnectionKwUsage !== null &&
    validBatterySOC !== null
  ) {
    data.powerConsumption =
      validShoreConnectionKwUsage +
      ((100 - validBatterySOC) / 100) * totalBatteryKw;
    data.averagePowerConsumption = data.powerConsumption / data.range;

    if (validShorePowerCost !== null) {
      data.powerCost = data.powerConsumption * validShorePowerCost;
    }
  }

  if (data.powerCost !== null && data.fuelCost !== null && validServiceCost !== null) {
    data.totalEnergyPrice = data.fuelCost + data.powerCost + validServiceCost;
    data.pricePerNm = data.totalEnergyPrice / data.range;
    data.pricePer100Nm = data.pricePerNm * 100;
  }
  return data;
};

export const calculateShipCostAnalysis = (
  ship,
  maxBarNumber,
  costSettings = {}
) => {
  if (!ship?.workingConditions?.routes) return [];

  return ship.workingConditions.routes.map((route, index) =>
    calculateRouteCostAnalysis(ship, route, maxBarNumber, index, costSettings)
  );
};

// Calculate cost analysis for multiple ships
export const calculateMultipleShipsCostAnalysis = (
  ships,
  maxBarNumber,
  costSettings = {}
) => {
  return ships.flatMap((ship) =>
    calculateShipCostAnalysis(ship, maxBarNumber, costSettings)
  );
};
