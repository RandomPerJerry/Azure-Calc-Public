// src/pages/BaseScreenComp/LoadProfile.jsx
import React, { useEffect, useState } from "react";
import useShipComponent from "../../hooks/useShipComponent";
import Graph from "../../components/chartComp";
import getSafeValue from "../../utils/getSafeValues";

function LoadProfile() {
  // Get everything from context - no more prop drilling!
  const { shipData, updateComponentState } = useShipComponent();

  const [error, setError] = useState("");

  // More explicit handling of undefined/null values using helper function
  const loadProfileData = shipData.loadProfile || {};
  const shipType = getSafeValue(loadProfileData.shipType);
  const propulsionSystem = getSafeValue(loadProfileData.propulsionSystem);
  const dataPoints = getSafeValue(loadProfileData.dataPoints, [
    { power: "", velocity: "" },
  ]);
  const fuelTankCapacity = getSafeValue(loadProfileData.fuelTankCapacity);

  const [graphData, setGraphData] = useState([]);

  const shipTypeOptions = [
    "Pilot",
    "Barge",
    "Ferry",
    "CTV",
    "Tug Boat",
    "Yacht",
    "Fishing Boat",
  ];
  const propulsionSystemOptions = [
    "Full Electric",
    "Serial Hybrid",
    "Parallel Hybrid",
    "Fossil Fuel",
  ];

  // Update state using context
  const setState = (newState) => {
    updateComponentState("loadProfile", newState);
  };

  const handleShipTypeChange = (e) => {
    const value = e.target.value;
    setState({ shipType: value });
  };

  const handlePropulsionSystemChange = (e) => {
    const value = e.target.value;
    setState({ propulsionSystem: value });
  };

  const handleAddDataPoint = () => {
    setState({
      dataPoints: [...dataPoints, { power: undefined, velocity: undefined }],
    });
  };

  const handleDeleteDataPoint = (index) => {
    const newDataPoints = dataPoints.filter((_, i) => i !== index);
    setState({ dataPoints: newDataPoints });
  };

  const handleChangeDataPoint = (index, field, value) => {
    const newDataPoints = [...dataPoints];
    // Ensure we handle undefined/null values properly
    newDataPoints[index][field] =
      value == null || value === "" ? "" : Number(value);
    setState({ dataPoints: newDataPoints });
  };

  const handleFuelCapacityChange = (e) => {
    const value = e.target.value;
    // More explicit handling of undefined/null values
    const numericValue = value == null || value === "" ? "" : Number(value);
    setState({ fuelTankCapacity: numericValue });
  };

  const renderShipTypeOptions = () => {
    if (!shipTypeOptions || !shipTypeOptions.length) return null;

    return shipTypeOptions.map((ship) => (
      <option key={ship} value={ship}>
        {ship}
      </option>
    ));
  };

  const renderPropulsionSystemOptions = () => {
    if (!propulsionSystemOptions || !propulsionSystemOptions.length)
      return null;

    return propulsionSystemOptions.map((system) => (
      <option key={system} value={system}>
        {system}
      </option>
    ));
  };

  useEffect(() => {
    const filteredDatapoints = dataPoints.filter(
      (point) =>
        point.velocity != null &&
        point.velocity !== "" &&
        point.power != null &&
        point.power !== ""
    );
    const transformedData = filteredDatapoints.map((point) => ({
      x: Number(point.velocity),
      y: Number(point.power),
    }));

    transformedData.push({ x: 0, y: 0 });

    setGraphData(transformedData);
  }, [dataPoints, setGraphData]);

  return (
    <div className="load-profile">
      <div className="left-panel">
        <h2>Load Profile</h2>

        <div className="input-field">
          <div className="form-group">
            <label htmlFor="Ship-Type">Ship Type</label>
            <select
              id="Ship-Type"
              value={shipType}
              onChange={handleShipTypeChange}
            >
              <option key="empty" value="">
                Select Ship Type
              </option>
              {renderShipTypeOptions()}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="Propulsion-System">Propulsion System</label>
            <select
              id="Propulsion-System"
              value={propulsionSystem}
              onChange={handlePropulsionSystemChange}
            >
              <option key="empty" value="">
                Select Propulsion System
              </option>
              {renderPropulsionSystemOptions()}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fuel-tank-capacity">Fuel Tank Capacity</label>
            <div className="input-with-unit">
              <input
                type="number"
                id="fuel-tank-capacity"
                value={getSafeValue(fuelTankCapacity)}
                onChange={handleFuelCapacityChange}
                placeholder="Enter capacity"
              />
              <span className="unit">L</span>
            </div>
          </div>

          <div className="form-group data-points-group">
            <label>Power-Velocity Data Points</label>
            <div className="data-points-container">
              {dataPoints.map((point, index) => (
                <div key={index} className="data-point-item">
                  <div>
                    <label htmlFor={`velocity-${index}`}>Velocity</label>
                    <div>
                      <input
                        type="number"
                        id={`velocity-${index}`}
                        value={getSafeValue(point.velocity)}
                        onChange={(e) =>
                          handleChangeDataPoint(
                            index,
                            "velocity",
                            e.target.value
                          )
                        }
                      />
                      <label>kts</label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`power-${index}`}>Power</label>
                    <div>
                      <input
                        type="number"
                        id={`power-${index}`}
                        value={getSafeValue(point.power)}
                        onChange={(e) =>
                          handleChangeDataPoint(index, "power", e.target.value)
                        }
                      />
                      <label>kW</label>
                    </div>
                  </div>

                  {dataPoints.length > 1 && (
                    <button
                      onClick={() => handleDeleteDataPoint(index)}
                      type="button"
                      className="delete-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddDataPoint}
              className="add-btn"
            >
              + Add Data Point
            </button>
          </div>
        </div>

        {error && <div>{error}</div>}
      </div>

      <div className="right-panel">
        <div className="title">
        <h1>Ship Information</h1>
        </div>
        

        <div className="content-container">
          <Graph
            data={graphData}
            label={{
              title: "Power(kW) vs Velocity(kts)",
              data: "kW",
              x: "Velocity(kts)",
              y: "Power(kW)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LoadProfile;
