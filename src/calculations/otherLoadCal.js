export const otherLoadPowerCal = (otherLoadUnit) => {
  if (!otherLoadUnit || !otherLoadUnit.data ) return 0;

  const power = otherLoadUnit.data.loadPower;
  return power;
}