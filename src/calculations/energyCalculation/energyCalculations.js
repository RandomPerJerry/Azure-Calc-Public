import isValidDataPoint from './validDataPoint';
import calculatePowerConsumption from './batteryConsumption';
import findDataBounds from './findTargetBound';

export const calculateEnergyConsumption = (workingConditions, shipData, getSystem) => {
  // Extract data
  const routes = workingConditions?.routes || [];
  const loadProfileData = shipData?.loadProfile?.dataPoints || [];
  const fuelTankCapacity = shipData?.loadProfile?.fuelTankCapacity || 0;
  const systems = shipData?.system || {};
  const maxBarNumber = shipData?.busBar?.dcLinkNumber || 1;

  // Early return if no data
  if (!routes.length || !loadProfileData.length || !Object.keys(systems).length) {
    return workingConditions; // Return unchanged
  }

  // Create a copy to avoid mutating original data
  const sortedPlot = [...loadProfileData].sort((a, b) => a.velocity - b.velocity);

  // Helper functions
  const hasCriticalErrors = (errors) => {
    const criticalSeverities = ["ERROR", "CRITICAL"];
    return errors.some((e) => criticalSeverities.includes(e.severity));
  };

  const validateDataPoint = (dataPoint, usedSystems, powerRequired) => {
    const errors = [];
    const validationErrors = isValidDataPoint(dataPoint, usedSystems, maxBarNumber);
    errors.push(...validationErrors);

    const maxPower = dataPoint.data.propulsionSystem?.reduce(
      (prev, propulsionItem) => prev + getSystem(propulsionItem.id).data.power,
      0
    );
    if (maxPower < powerRequired) {
      errors.push({
        severity: "ERROR",
        code: "POWER_OVERLOAD",
        message: `Propulsion cannot handle required power ${powerRequired}kW (Max Power ${maxPower}kW)`,
      });
    }
    return errors;
  };

  const powerLoadConsumption = (velocity) => {
    const errors = [];
    const exactMatch = sortedPlot.find((p) => p.velocity === velocity);
    if (exactMatch) return { interpolatedPower: exactMatch.power, errors };

    const velocityArray = sortedPlot.map((p) => p.velocity);
    const bounds = findDataBounds(velocityArray, velocity);
    if (!bounds || bounds.upperIndex === null) {
      errors.push({
        severity: "ERROR",
        code: "VELOCITY_OVERLOAD",
        message: `Input velocity ${velocity} exceeded limit ${velocityArray[velocityArray.length - 1]}`,
      });
      return { interpolatedPower: 0, errors };
    }

    const lower = bounds.lowerIndex !== null
      ? sortedPlot[bounds.lowerIndex]
      : { velocity: 0, power: 0 };
    const upper = sortedPlot[bounds.upperIndex];
    if (bounds.lowerIndex === bounds.upperIndex) {
      return { interpolatedPower: lower.power, errors };
    }

    const slope = (upper.power - lower.power) / (upper.velocity - lower.velocity);
    const interpolatedPower = lower.power + slope * (velocity - lower.velocity);
    return { interpolatedPower, errors };
  };

  // Process routes with immutable updates
  const updatedRoutes = routes.map(route => {
    let batterySoc = 100;
    let dieselSoc = 100;
    let shoreKwCharged = 0;
    let shoreFuelCharged = 0;
    let distanceTraveled = 0;
    let dataOutputTerminate = false;

    const updatedDataPoints = route.workingConditionDataPoints.map(dataPoint => {
      const output = {
        errors: [],
        doRender: false,
        powerRequired: null,
        batterySOC: null,
        dieselSOC: null,
        distanceTraveled: null,
        batteryUsage: null,
        dieselUsage: null,
        shoreConnectionKwUsage: null,
        shoreConnectionFuelUsage: null,
      };

      if (dataOutputTerminate) {
        output.errors.push({
          severity: "WARNING",
          code: "PREVIOUS_POINT_TERMINATED",
          message: `Fix previous point's errors`,
        });
      }

      const pointVelocity = parseFloat(dataPoint.velocity) || 0;
      const pointTime = parseFloat(dataPoint.time) || 0;

      const { interpolatedPower, errors: powerLoadConsumptionErrors } = powerLoadConsumption(pointVelocity);
      output.powerRequired = interpolatedPower;
      output.errors.push(...powerLoadConsumptionErrors);

      const validationErrors = validateDataPoint(dataPoint, systems, interpolatedPower);
      output.errors.push(...validationErrors);

      if (hasCriticalErrors(output.errors)) {
        dataOutputTerminate = true;
        return { ...dataPoint, output };
      }

      const {
        batteryUsage,
        dieselUsage,
        shoreConnectionKwUsage,
        shoreConnectionFuelUsage,
        errors: calculationErrors,
      } = calculatePowerConsumption(
        dataPoint.data,
        interpolatedPower,
        pointTime,
        fuelTankCapacity,
        getSystem
      );


      output.errors.push(...calculationErrors);

      if (output.errors.length > 0) {
        dataOutputTerminate = true;
        return { ...dataPoint, output };
      }

      output.batteryUsage = batteryUsage > batterySoc ? batterySoc : batteryUsage;
      output.dieselUsage = dieselUsage > dieselSoc ? dieselSoc : dieselUsage;

      // Update SOC and distance with proper handling of negative usage
      if (batterySoc < batteryUsage || dieselSoc < dieselUsage) {
        // Handle cases where usage can be negative (power generation)
        let batteryDistancePercentage = Infinity;
        let dieselDistancePercentage = Infinity;
        
        // Only calculate distance percentage if consumption is positive
        if (batteryUsage > 0 && batterySoc < batteryUsage) {
          batteryDistancePercentage = batterySoc / batteryUsage;
        }
        
        if (dieselUsage > 0 && dieselSoc < dieselUsage) {
          dieselDistancePercentage = dieselSoc / dieselUsage;
        }
        
        // If both are generating power (negative usage), no depletion occurs
        if (batteryUsage <= 0 && dieselUsage <= 0) {
          // Both systems are generating power - continue normally
          batterySoc = Math.min(100, batterySoc - batteryUsage); // Subtract negative = add
          dieselSoc = Math.min(100, dieselSoc - dieselUsage);     // Subtract negative = add
          distanceTraveled += pointVelocity * pointTime;
        }
        // If only battery is consuming and insufficient
        else if (batteryDistancePercentage < dieselDistancePercentage) {
          distanceTraveled += pointVelocity * pointTime * batteryDistancePercentage;
          batterySoc = 0;
          dieselSoc = Math.min(100, dieselSoc - (dieselUsage * batteryDistancePercentage));
          dataOutputTerminate = true;
          
          output.errors.push({
            severity: "ERROR",
            code: "BATTERY_SOC_DEPLETED",
            message: `Battery Depleted, can only travel ${(pointVelocity * pointTime * batteryDistancePercentage).toFixed(2)}nm (target ${pointVelocity * pointTime}nm) in ${(pointTime * batteryDistancePercentage).toFixed(2)} hours`,
          });
        }
        // If only diesel is consuming and insufficient
        else {
          distanceTraveled += pointVelocity * pointTime * dieselDistancePercentage;
          dieselSoc = 0;
          batterySoc = Math.min(100, batterySoc - (batteryUsage * dieselDistancePercentage));
          dataOutputTerminate = true;
          
          output.errors.push({
            severity: "ERROR",
            code: "DIESEL_SOC_DEPLETED",
            message: `Diesel Depleted, can only travel ${(pointVelocity * pointTime * dieselDistancePercentage).toFixed(2)}nm (target ${pointVelocity * pointTime}nm) in ${(pointTime * dieselDistancePercentage).toFixed(2)} hours`,
          });
        }
      } else {
        // Normal operation - both systems have sufficient capacity
        batterySoc = Math.min(100, batterySoc - batteryUsage); // Can increase if batteryUsage is negative
        dieselSoc = Math.min(100, dieselSoc - dieselUsage);     // Can increase if dieselUsage is negative
        distanceTraveled += pointVelocity * pointTime;
      }

      shoreKwCharged += shoreConnectionKwUsage;
      shoreFuelCharged += shoreConnectionFuelUsage;
      output.batterySOC = Math.max(0, Math.min(batterySoc, 100));
      output.dieselSOC = Math.max(0, Math.min(dieselSoc, 100));
      output.distanceTraveled = distanceTraveled;
      output.shoreConnectionKwUsage = shoreKwCharged;
      output.shoreConnectionFuelUsage = shoreFuelCharged;
      output.doRender = true;

      return { ...dataPoint, output };
    });

    return { ...route, workingConditionDataPoints: updatedDataPoints };
  });

  // Return updated working conditions
  return {
    ...workingConditions,
    routes: updatedRoutes
  };
};