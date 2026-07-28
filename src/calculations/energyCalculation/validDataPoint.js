// Does not check if a propulsion can or cannot handle the load
function isValidDataPoint(point, systems, maxBarNumber) {

  const error = []
  if (typeof point.velocity !== 'number' || typeof point.time !== 'number') {
    error.push({
      severity: "ERROR",
      code: "INVALID_INPUT",
      message: "Velocity and time are required"
    })
    return error
  };
  if (point.velocity < 0 || point.time <= 0) {
    error.push({
      severity: "ERROR",
      code: "INVALID_INPUT",
      message: "Velocity and time must be positive"
    })
    return error
  };

  const pointData = point.data;
  // Check if all the system is valid
  Object.keys(systems).forEach((systemType) => {
    const allSystems = systems[systemType]
    const systemId = allSystems.filter(s => s.barNumber && s.barNumber <= maxBarNumber).map(s => s.id) || [];
    const pointId = pointData[systemType]?.map(s => s.id) || [];

    if (
      systemId.length !== pointId.length ||
      systemId.sort().join() !== pointId.sort().join()
    ) {
      error.push({
        severity: "CRITICAL",
        code: "SYSTEM_MISMATCH",
        message: `System configuration mismatch for ${systemType}. Expected: [${systemId.sort().join(', ')}], Got: [${pointId.sort().join(', ')}]`
      });
    }
  })

  if (pointData.propulsionSystem) {
    let totalDistributionPercentage = 0;

    (pointData.propulsionSystem).forEach((propulsionItem) => {
      const currentDistribution = propulsionItem.systemState.propulsionPowerDistribution
      totalDistributionPercentage += currentDistribution;
    })

    if ( totalDistributionPercentage !== 100 ) {
      error.push({
        severity: "WARNING",
        code: "INPUT_ERROR",
        message: `Propulsion Power Distribution Sum dosent equal 100`
      });
    };
  }

  return error;

}

export default isValidDataPoint;



 