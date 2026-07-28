import React, { useState, useEffect } from "react";
import useShipComponent from "../../hooks/useShipComponent";
import MultiLineGraph from "./graph";

function EnergyConsumptionGraph() {
  const { shipData } = useShipComponent();
  const [batteryGraphData, setBatteryGraphData] = useState([]);
  const [dieselGraphData, setDieselGraphData] = useState([]);

  // Get calculated data from context
  const routes = shipData.workingConditions?.routes || [];

  // Generate graph data from the calculated outputs
  useEffect(() => {
    if (!routes.length) {
      setBatteryGraphData([]);
      setDieselGraphData([]);
      return;
    }

    const newBatteryGraphData = [];
    const newDieselGraphData = [];

    routes.forEach((route, routeIndex) => {
      const batteryPoints = [];
      const dieselPoints = [];

      route.workingConditionDataPoints.forEach((dataPoint, pointIndex) => {
        const output = dataPoint.output;
        
        // Skip points with critical errors
        if (!output || !output.doRender) {
          return;
        }

        batteryPoints.push({
          name: dataPoint.condition || `Point ${pointIndex + 1}`,
          x: output.distanceTraveled || 0,
          y: output.batterySOC || 0,
        });

        dieselPoints.push({
          name: dataPoint.condition || `Point ${pointIndex + 1}`,
          x: output.distanceTraveled || 0,
          y: output.dieselSOC || 0,
        });
      });

      newBatteryGraphData.push({
        name: route.routeName || `Route ${routeIndex + 1}`,
        data: batteryPoints,
      });

      newDieselGraphData.push({
        name: route.routeName || `Route ${routeIndex + 1}`,
        data: dieselPoints,
      });
    });

    setBatteryGraphData(newBatteryGraphData);
    setDieselGraphData(newDieselGraphData);
  }, [routes]);

  return batteryGraphData.length > 0 ? (
    <div className="energy-graphs-container">
      <div className="graph-item">
        <MultiLineGraph
          data={batteryGraphData}
          label={{
            title: "Battery SOC(%) vs Range(nm)",
            xAxis: "Range (nm)",
            yAxis: "Battery SOC (%)",
          }}
        />
      </div>
      <div className="graph-item">
        <MultiLineGraph
          data={dieselGraphData}
          label={{
            title: "Diesel(%) vs Range(nm)",
            xAxis: "Range (nm)",
            yAxis: "Diesel(%)",
          }}
        />
      </div>
    </div>
  ) : (
    <div className="loading-message">Loading graph data...</div>
  );
}

export default EnergyConsumptionGraph;