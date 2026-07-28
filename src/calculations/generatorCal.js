// Group Generator Set Group Power(max kW)

export const generatorPowerCal = (generator, motor) => {
  if (!generator || !generator.data || !motor || !motor.data) return null;

  const dieselEngineDataPlot = generator.data.fuelDataPoints;
  const motorDataPlot = motor.data.validDataPoints;

  const maxDiesel = dieselEngineDataPlot?.length
      ? Math.max(...dieselEngineDataPlot.map((point) => point.power || 0))
      : 0;
    const maxMotor = motorDataPlot?.length
      ? Math.max(...motorDataPlot.map((point) => point.power || 0))
      : 0;
  const maxPower = Math.min(maxDiesel, maxMotor);

  return maxPower;
} 