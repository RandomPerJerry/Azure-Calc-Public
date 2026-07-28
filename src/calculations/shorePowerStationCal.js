export const chargingCurrentStationCal = (chargingPower, outputVoltage) => {
  if (isNaN(chargingPower) || isNaN(outputVoltage)) return null;

  return chargingPower / 1000 * outputVoltage;
};

export const chargingCurrentConnectorCal = (chargingPower, outputVoltage, connectorNumber) => {
  if (isNaN(chargingPower) || isNaN(outputVoltage) || isNaN(connectorNumber)) return null;

  return chargingCurrentStationCal(chargingPower, outputVoltage) / connectorNumber;
}

// Group
// Shore Power Station Charging Power(kW) × Number of Shore Power Station
export const chargingPowerCal = (shoreCharginStation) => {
  if (!shoreCharginStation || !shoreCharginStation.data) return null;
  const chargingPower = shoreCharginStation.data.powerCapacity;

  return chargingPower;
}

export const connectorNumberCal = (shoreCharginStation) => {
  if (!shoreCharginStation || !shoreCharginStation.data) return null;

  const plugNum = shoreCharginStation.data.numberOfPlug;

  return plugNum;
}