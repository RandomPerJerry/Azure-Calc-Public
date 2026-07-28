import React from "react";
import useShipComponent from "../../../hooks/useShipComponent";
import getSafeValue from "../../../utils/getSafeValues";

function WorkingConditionDisplay() {
  const { shipData } = useShipComponent();
  const workingConditionRoutes = getSafeValue(shipData.workingConditions?.routes, []);

  return (
    <div className="working-condition-tables">
      {workingConditionRoutes.map((route, rIndex) => (
        <div key={rIndex} className={`working-condition-table-${rIndex}`}>
          <h2>Route {rIndex + 1} - {route.routeName || "Working Conditions"}</h2>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Condition</th>
                <th>Velocity (kt)</th>
                <th>Time (h)</th>
                <th>Battery SOC (%)</th>
                <th>Diesel SOC (%)</th>
                <th>Distance (nm)</th>
              </tr>
            </thead>
            <tbody>
              {route.workingConditionDataPoints?.map((point, pIndex) => (
                <tr key={pIndex}>
                  <td>{pIndex + 1}</td>
                  <td>{point.condition || "N/A"}</td>
                  <td>{point.velocity || "N/A"}</td>
                  <td>{point.time || "N/A"}</td>
                  <td>{point.output?.batterySOC || "N/A"}</td>
                  <td>{point.output?.dieselSOC || "N/A"}</td>
                  <td>{point.output?.distanceTraveled || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default WorkingConditionDisplay;