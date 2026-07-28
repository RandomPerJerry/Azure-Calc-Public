/**
 * Power consumption calculation utilities
 */
import findDataBounds from "./findTargetBound";

// Helper function for adding power property of each system type together (default case)

const powerToDiesel = (power, fuelConsumptionPlot) => {
  const exactMatch = fuelConsumptionPlot.find((p) => p.power === power);
  if (exactMatch) {
    return exactMatch.fuelConsumption;
  }

  const sortedArray = fuelConsumptionPlot.sort((a, b) => a.power - b.power); // unsure if each array is the same so it in the loop
  const powerArray = sortedArray.map((p) => p.power);
  const bounds = findDataBounds(powerArray, power);
  const lower =
    bounds.lowerIndex !== null
      ? sortedArray[bounds.lowerIndex]
      : { power: 0, fuelConsumption: 0 };
  const upper = sortedArray[bounds.upperIndex];
  if (!upper) return null;
  const slope =
    (upper.fuelConsumption - lower.fuelConsumption) /
    (upper.power - lower.power);
  const fuelUsed = lower.fuelConsumption + slope * (power - lower.power);

  return fuelUsed;
};

const sumSystemPower = (
  systemComponents,
  getSystem,
  powerProperty = "power"
) => {
  const activateComponents = systemComponents?.filter(
    (s) => s.systemState.activate
  );

  return activateComponents?.reduce(
    (total, component) => total + getSystem(component.id).data[powerProperty],
    0
  );
};

const calculateShorePower = (systemComponents, getSystem) => {
  const activateComponents = systemComponents?.filter(
    (s) => s.systemState.activate
  );

  const fuelLoaded = systemComponents?.reduce(
    (total, component) => total + component.systemState?.fuelSupplied || 0,
    0
  )

  const powerGenerated = activateComponents?.reduce(
    (total, component) => total + getSystem(component.id).data.power,
    0
  );


  return {fuelLoaded, powerGenerated}
};

const calculateGeneratorPower = (generatorSystem, getSystem) => {
  let batteryGeneration = 0;
  let fuelConsumption = 0;
  const errors = [];
  generatorSystem?.forEach((generatorItem) => {
    const generatorItemData = getSystem(
      generatorItem.id,
      "generatorGroupSystem"
    ).data;

    const inputPercentage = generatorItem.systemState.generatorPower / 100;
    if (inputPercentage > 1 || inputPercentage < 0) {
      errors.push({
        severity: "ERROR",
        code: "INVALID_INPUT",
        message: `Generator System input percentage ${generatorItem.systemState.generatorPower}, should be between 0 and 100 (include both sides)`,
      });
      return;
    }

    const fuelConsumptionPlot =
      generatorItemData.dieselEngine.data.fuelDataPoints;
    const generatorPowerUsed = generatorItemData.power * inputPercentage;

    const fuelUsed = powerToDiesel(generatorPowerUsed, fuelConsumptionPlot);
    batteryGeneration += generatorPowerUsed;
    fuelConsumption += fuelUsed;
  });

  return { batteryGeneration, fuelConsumption, errors };
};
// exclusive for propulsion;
const calculatePropulsionPower = (
  propulsionSystem,
  powerRequired,
  getSystem
) => {
  let batteryPower = 0;
  let dieselPower = 0;
  const errors = [];
  for (const propulsionItem of propulsionSystem || []) {
    const propulsionItemData = getSystem(
      propulsionItem.id,
      "propulsionSystem"
    ).data;

    const responsibility =
      powerRequired *
      (propulsionItem.systemState.propulsionPowerDistribution / 100);

    const fuelDataPlot =
      propulsionItemData.dieselEngine?.data?.fuelDataPoints || [];

    let motorOverLoad = -1;
    let dieselOverLoad = -1;
    switch (propulsionItemData.propulsionMode) {
      case "electric":
        motorOverLoad = propulsionItemData.power;
        batteryPower += responsibility;
        break;

      case "diesel":
        dieselOverLoad = propulsionItemData.power;
        dieselPower += powerToDiesel(responsibility, fuelDataPlot);
        break;

      case "hybrid":
        const powerMode = propulsionItem.systemState.powerMode;
        switch (powerMode) {
          case "Full Electric":
            batteryPower += responsibility;
            motorOverLoad = propulsionItemData.hybridPower.motor;
            break;

          case "Full Diesel":
            const dieselConumption = powerToDiesel(
              responsibility,
              fuelDataPlot
            );
            dieselPower += dieselConumption;
            dieselOverLoad = propulsionItemData.hybridPower.diesel;
            break;

          case "Power Supply":
            const maxDieselSupply = propulsionItemData.hybridPower.diesel;
            const usedDieselPower =
              maxDieselSupply *
              (propulsionItem.systemState.dieselPowerSupply / 100);
            const batteryGain = usedDieselPower - responsibility;
            dieselOverLoad = usedDieselPower;
            batteryPower -= batteryGain;
            dieselPower += powerToDiesel(usedDieselPower, fuelDataPlot);
            break;

          case "Boost Mode":
            const boostPercent = propulsionItem.systemState.burstDivide / 100;
            const motorPortion = responsibility * boostPercent;
            const dieselPortion = responsibility * (1 - boostPercent);

            if (boostPercent > 1 || boostPercent < 0) {
              errors.push({
                severity: "ERROR",
                code: "INVALID_INPUT",
                message: `Propulsion System ${propulsionItemData.description} has invalid boost divide value ${propulsionItem.systemState.burstDivide}`
              })
            }

            if (motorPortion > propulsionItemData.hybridPower.motor) {
              errors.push({
                severity: "WARNING",
                code: "MOTOR_OVERLOAD",
                message: `System ${
                  propulsionItemData.description
                }, motor portion ${motorPortion.toFixed(
                  2
                )}kW exceeds limit (max: ${
                  propulsionItemData.hybridPower.motor
                }kW)`,
              });
            }

            if (dieselPortion > propulsionItemData.hybridPower.diesel) {
              errors.push({
                severity: "WARNING",
                code: "DIESEL_OVERLOAD",
                message: `System ${
                  propulsionItemData.description
                }, diesel portion ${dieselPortion.toFixed(
                  2
                )}kW exceeds limit (max: ${
                  propulsionItemData.hybridPower.diesel
                }kW)`,
              });
            }

            batteryPower += motorPortion;
            dieselPower += powerToDiesel(dieselPortion, fuelDataPlot);

            // Set to -1 to skip the general overload checks
            motorOverLoad = -1;
            dieselOverLoad = -1;
            break;

          default:
            errors.push({
              severity: "ERROR",
              code: "INVALID_HYBRID_MODE",
              message: `Unknown hybrid power mode: ${powerMode} for system ${propulsionItem.id}`,
            });
            break;
        }
        break;

      default:
        errors.push({
          severity: "ERROR",
          code: "INVALID_PROPULSION_MODE",
          message: `Unknown propulsion mode: ${propulsionItemData.propulsionMode} for system ${propulsionItem.id}`,
        });
        break;
    }

    if (motorOverLoad !== -1 && responsibility > motorOverLoad) {
      errors.push({
        severity: "WARNING",
        code: "POWER_OVERLOAD",
        message: `Propulsion System ${propulsionItemData.description}, motor cannot handle ${responsibility}kW (max: ${motorOverLoad}kW)`,
      });
    }

    if (dieselOverLoad !== -1 && responsibility > dieselOverLoad) {
      errors.push({
        severity: "WARNING",
        code: "POWER_OVERLOAD",
        message: `Propulsion System ${propulsionItemData.description}, diesel engine cannot handle ${responsibility}kW (max: ${dieselOverLoad}kW)`,
      });
    }
  }

  return { batteryPower, dieselPower, errors };
};

// Main calculation function with clear naming and structure
/**
 *
 * @param {object} distributionState - Current datapoint distribution settings
 * @param {number} powerRequired - Total power required for propulsion system(s) to handle
 * @returns Percentage of power used and error
 */
const calculatePowerConsumption = (
  distributionState,
  powerRequired,
  time,
  fuelTankCapacity,
  getSystem
) => {
  const errors = [];
  // Calculate propulsion power requirements
  console.log('dstate',distributionState)
  const {
    batteryPower: propulsionBatteryPower,
    dieselPower: propulsionDieselPower,
    errors: propulsionErrors,
  } = calculatePropulsionPower(
    distributionState.propulsionSystem,
    powerRequired,
    getSystem
  );

  const {
    batteryGeneration: generatorBatteryPower,
    fuelConsumption: generatorDieselPower,
    errors: generatorErrors,
  } = calculateGeneratorPower(
    distributionState.generatorGroupSystem,
    getSystem
  );

  const {fuelLoaded: shoreFuelLoaded, powerGenerated: shorePowerGenerated} = calculateShorePower(
    distributionState.shorePowerSystem,
    getSystem
  );

  const otherLoadPower = sumSystemPower(
    distributionState.otherLoadSystem,
    getSystem
  );
  const hotelLoadPower = sumSystemPower(
    distributionState.hotelLoadSystem,
    getSystem
  );
  const auxiliaryPower = sumSystemPower(
    distributionState.auxiliaryPowerUnitSystem,
    getSystem
  )

  // Calculate total battery capacity
  const totalBatteryCapacity = sumSystemPower(
    distributionState.batterySystem,
    getSystem
  );

  if (typeof totalBatteryCapacity !== "number" || totalBatteryCapacity === 0) {
    errors.push({
      severity: "CRITICAL",
      code: "BATTERY_ERROR",
      message: "Invalid Total Battery",
    });
    return { result: 0, errors };
  }

  errors.push(...propulsionErrors, ...generatorErrors);

  // Calculate net battery usage
  const netBatteryUsage =
    (propulsionBatteryPower -
      shorePowerGenerated -
      otherLoadPower -
      auxiliaryPower -
      generatorBatteryPower +
      hotelLoadPower) *
    time;

  const netDieselUsage = (propulsionDieselPower + generatorDieselPower - shoreFuelLoaded) * time;

  if (
    netDieselUsage &&
    (typeof fuelTankCapacity !== "number" || fuelTankCapacity === 0)
  ) {
    errors.push({
      severity: "CRITICAL",
      code: "DIESEL_ERROR",
      message: "Invalid Total Fuel",
    });
  }

  // Return battery usage ratio (0 to 1, where 1 = full capacity usage)
  const batteryUsedPercentage = (netBatteryUsage / totalBatteryCapacity) * 100;
  const dieselUsedPercentage = (netDieselUsage / fuelTankCapacity) * 100;

  return {
    batteryUsage: batteryUsedPercentage,
    dieselUsage: dieselUsedPercentage,
    shoreConnectionKwUsage: shorePowerGenerated * time,
    shoreConnectionFuelUsage: shoreFuelLoaded,
    errors,
  };
};

export default calculatePowerConsumption;
