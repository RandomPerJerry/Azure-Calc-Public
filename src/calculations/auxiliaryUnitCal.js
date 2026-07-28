// system
export const auxiliaryUnitPowerCal = (auxiliaryUnit) => {
  if (!auxiliaryUnit || !auxiliaryUnit.data ) return null;
  const auxiliaryUnitPower = auxiliaryUnit.data.powerOutput;

  return auxiliaryUnitPower;
};