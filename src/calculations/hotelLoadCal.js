export const hotelLoadPowerCal = (hotelLoadUnit) => {
  if (!hotelLoadUnit || !hotelLoadUnit.data) return null;

  const power = hotelLoadUnit.data.hotelLoadPower;
  return power;
}