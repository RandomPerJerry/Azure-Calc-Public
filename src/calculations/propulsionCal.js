// system
export const propulsionPowerCal = (type, motor = {}, diselEngine = {}) => {

  switch (type) {
    case 'electric':
      if (!motor.data) return [null, null, null];

      var maxMotorPower = 0
      motor.data.validDataPoints.forEach(element => {
        if (element.power > maxMotorPower) maxMotorPower = element.power; 
      });

      return [maxMotorPower, null, null];
    case 'hybrid':
      if (!motor.data || !diselEngine.data) return [null, null, null];

      var maxMotorPower = 0
      motor.data.validDataPoints.forEach(element => {
        if (element.power > maxMotorPower) maxMotorPower = element.power; 
      });

      var maxDiselPower = 0
      diselEngine.data.fuelDataPoints.forEach(element => {
        if (element.power > maxDiselPower) maxDiselPower = element.power; 
      });

      const totalPower = (maxMotorPower + maxDiselPower);
      const maxMotor = maxMotorPower;
      const maxDiesel = maxDiselPower;

      return [totalPower, maxMotor, maxDiesel];

    case 'diesel':
      if (!diselEngine.data) return [null, null, null];

      var maxDiselPower = 0
      diselEngine.data.fuelDataPoints.forEach(element => {
        if (element.power > maxDiselPower) maxDiselPower = element.power; 
      });

      return [maxDiselPower, null, null];

    default:
      return [null, null, null];
  }
}