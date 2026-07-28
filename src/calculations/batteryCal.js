// -- cell -------
export const cellPowerCal = (capacity) => {
  if (isNaN(capacity)) return null;
  return (capacity * 3.2) / 1000;
}

export const cellName = (description) => {
  if (isNaN(description)) return null;
  return description;
}

// -- pack -------
export const packPowerCal = (packNum, moduleNum, batteryCell) => {
  if (isNaN(packNum) || isNaN(moduleNum) || !batteryCell || !batteryCell.data) return null;
  const cellPower = cellPowerCal(batteryCell.data.capacity);

  return cellPower * packNum * moduleNum;
}

export const cellNumCal = (packNum, moduleNum) => {
  if (isNaN(packNum) || isNaN(moduleNum)) return null;

  return packNum * moduleNum;
}

export const soc100Cal = (moduleNum) => {
  console.log(moduleNum);
  if (isNaN(moduleNum)) return null;

  return moduleNum * 3.2;
}

export const soc20Cal = (moduleNum) => {
  if (isNaN(moduleNum)) return null;

  return moduleNum * 3.2 * 0.2;
}

export const volumetricPackCal = (packPower, height, width, depth) => {
  if (isNaN(packPower) || isNaN(height) || isNaN(width) || isNaN(depth)) return null;
  if (height === 0 || width === 0 || depth === 0) return null;

  return packPower / (height * width * depth) * 10000000;
}

// -- string ------
export const stringPowerCal = (packNum, batteryPack) => {
  if (isNaN(packNum) || !batteryPack || !batteryPack.data) return null;
  const batteryPackData = batteryPack.data;
  const packPower = packPowerCal(
    batteryPackData.moduleNum, 
    batteryPackData.packNum, 
    batteryPackData.batteryCell
  );

  return packNum * packPower;
}

export const stringChargingCurrentCal = (batteryPack) => {
  if (!batteryPack || !batteryPack.data || !batteryPack.data.batteryCell || !batteryPack.data.batteryCell.data) return null;
  
  const moduleNum = batteryPack.data.packNum;

  const batteryCellData = batteryPack.data.batteryCell.data;
  const capacity = batteryCellData.capacity;
  const chargingRate = batteryCellData.chargingRate;

  return capacity * chargingRate * moduleNum;
}

export const stringDischargingCurrentCal = (batteryPack) => {
  if (!batteryPack || !batteryPack.data || !batteryPack.data.batteryCell || !batteryPack.data.batteryCell.data) return null;
  
  const moduleNum = batteryPack.data.packNum;

  const batteryCellData = batteryPack.data.batteryCell.data;
  const capacity = batteryCellData.capacity;
  const dischargingRate = batteryCellData.dischargingRate;

  return capacity * dischargingRate * moduleNum;
}

export const soc20VolCal = (packNum, batteryPack) => {
  if (isNaN(packNum) || !batteryPack || !batteryPack.data || !batteryPack.data.batteryCell || !batteryPack.data.batteryCell.data) return null;
  const batteryPackData = batteryPack.data;
  const soc20 = soc20Cal(batteryPackData.moduleNum);

  return soc20 * packNum;
}

export const soc100VolCal = (packNum, batteryPack) => {
  if (isNaN(packNum) || !batteryPack || !batteryPack.data || !batteryPack.data.batteryCell || !batteryPack.data.batteryCell.data) return null;
  const batteryPackData = batteryPack.data;

  const soc100 = soc100Cal(batteryPackData.moduleNum);

  return soc100 * packNum;
} 

// -- system ---------

// String power × Number of string
export const groupPowerCal = (batteryString, stringNum) => {
  if (!batteryString || !batteryString.data) return null;

  const layoutArrays = JSON.parse(batteryString.data.gridLayout);

  var packNum = 0;

  layoutArrays.forEach(elementList => {
    elementList.forEach(num => {
      if (num === 1) packNum ++;
    })
  });

  const stringPower = stringPowerCal(packNum, batteryString.data.batteryPack);

  return stringPower * stringNum;
}

// Battery string Power(kWh) × SOC range (Second number, usually 80%）
export const groupAvailablePowerCal = (batteryString, stringNum) => {
  if (!batteryString || !batteryString.data) return null;

  const groupPower = groupPowerCal(batteryString, stringNum); // group power

  return groupPower * 0.8;
}

export const group20SOCVolCal = (batteryString) => {
  if (!batteryString || !batteryString.data) return null;

  const layoutArrays = JSON.parse(batteryString.data.gridLayout);

  var packNum = 0;

  layoutArrays.forEach(elementList => {
    elementList.forEach(num => {
      if (num === 1) packNum ++;
    })
  });

  const soc20Vol = soc20VolCal(packNum, batteryString.data.batteryPack);

  return soc20Vol * 0.2;
}

export const group100SOCVolCal = (batteryString) => {
  if (!batteryString || !batteryString.data) return null;

  const layoutArrays = JSON.parse(batteryString.data.gridLayout);

  var packNum = 0;

  layoutArrays.forEach(elementList => {
    elementList.forEach(num => {
      if (num === 1) packNum ++;
    })
  });

  const soc100Vol = soc100VolCal(packNum, batteryString.data.batteryPack);

  return soc100Vol;
}

// String charging current × Number of string
export const groupMaxChargeCurrentCal = (batteryString, stringNum) => {
  if (!batteryString || !batteryString.data || isNaN(stringNum)) return null;

  const stringChargingCurrent = stringChargingCurrentCal(batteryString.data.batteryPack);

  return stringChargingCurrent * stringNum;
}

export const groupMaxDischargeCurrentCal = (batteryString, stringNum) => {
  if (!batteryString || !batteryString.data || isNaN(stringNum)) return null;

  const stringDischargingCurrent = stringDischargingCurrentCal(batteryString.data.batteryPack);

  return stringDischargingCurrent * stringNum;
}
