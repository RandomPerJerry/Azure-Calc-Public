import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import Graph from "../../components/chartComp";
import cleanFormData from "../../utils/clearFormData";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function DieselEngine() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState({
    // Required
    fuelDataPoints: [{ power: "", fuelConsumption: "" }],
    description: "",

    // Optional
    speedDataPoints: [{ power: "", speed: "" }],
    manufacturer: "",
    model: "",
    price: "",
  });

  const [originalFormData, setOriginalFormData] = useState({
    // Required
    fuelDataPoints: [{ power: "", fuelConsumption: "" }],
    description: "",

    // Optional
    speedDataPoints: [{ power: "", speed: "" }],
    manufacturer: "",
    model: "",
    price: "",
  });

  // UI State
  const [activeTab, setActiveTab] = useState("required");
  const [error, setError] = useState("");

  // Graph data derived from data points
  const fuelGraphData = useMemo(() => {
    const filteredDatapoints = formData.fuelDataPoints.filter(
      (point) => point.power !== "" && point.fuelConsumption !== ""
    );
    const transformedData = filteredDatapoints.map((point) => ({
      x: Number(point.power),
      y: Number(point.fuelConsumption),
    }));
    if (transformedData.length > 0) {
      transformedData.push({ x: 0, y: 0 });
    }
    return transformedData;
  }, [formData.fuelDataPoints]);

  const speedGraphData = useMemo(() => {
    const filteredDatapoints = formData.speedDataPoints.filter(
      (point) => point.power !== "" && point.speed !== ""
    );
    const transformedData = filteredDatapoints.map((point) => ({
      x: Number(point.power),
      y: Number(point.speed),
    }));
    if (transformedData.length > 0) {
      transformedData.push({ x: 0, y: 0 });
    }
    return transformedData;
  }, [formData.speedDataPoints]);

  // Component IDs
  const isEditMode = !!currentComponentId;

  // Field update function
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Change detection
  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    return !deepEqual(formData, originalFormData);
  }, [formData, originalFormData]);

  // Edit Component
  useEffect(() => {
    if (!isEditMode || !currentComponentId) return;
    const existingComponent = getComponent("dieselEngine", currentComponentId);

    if (!existingComponent?.data) {
      toast.error("Component Not Found");
      navigate("/home");
      return;
    }

    setFormData((prev) => updateWithTruthyValues(prev, existingComponent.data));
    setOriginalFormData((prev) =>
      updateWithTruthyValues(
        prev,
        JSON.parse(JSON.stringify(existingComponent.data))
      )
    );
  }, [isEditMode, currentComponentId, getComponent, navigate]);

  // Fuel data points handlers
  const handleAddFuelDataPoint = () => {
    const newDataPoints = [
      ...formData.fuelDataPoints,
      { power: "", fuelConsumption: "" },
    ];
    updateField("fuelDataPoints", newDataPoints);
  };

  const handleDeleteFuelDataPoint = (index) => {
    const newDataPoints = formData.fuelDataPoints.filter((_, i) => i !== index);
    updateField("fuelDataPoints", newDataPoints);
  };

  const handleChangeFuelDataPoint = (index, field, value) => {
    const newDataPoints = [...formData.fuelDataPoints];
    newDataPoints[index][field] = value === "" ? "" : Number(value);
    updateField("fuelDataPoints", newDataPoints);
  };

  // Speed data points handlers
  const handleAddSpeedDataPoint = () => {
    const newDataPoints = [
      ...formData.speedDataPoints,
      { power: "", speed: "" },
    ];
    updateField("speedDataPoints", newDataPoints);
  };

  const handleDeleteSpeedDataPoint = (index) => {
    const newDataPoints = formData.speedDataPoints.filter(
      (_, i) => i !== index
    );
    updateField("speedDataPoints", newDataPoints);
  };

  const handleChangeSpeedDataPoint = (index, field, value) => {
    const newDataPoints = [...formData.speedDataPoints];
    newDataPoints[index][field] = value === "" ? "" : Number(value);
    updateField("speedDataPoints", newDataPoints);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const validFuelDataPoints = formData.fuelDataPoints.filter(
      (point) =>
        point.power !== "" &&
        point.fuelConsumption !== "" &&
        !isNaN(point.power) &&
        !isNaN(point.fuelConsumption)
    );

    // Validate required fields
    if (validFuelDataPoints.length < 2) {
      setError("Need at least 2 valid power vs fuel consumption data points");
      return;
    }

    if (!formData.description.trim()) {
      setError("Enter a description for the diesel engine");
      return;
    }

    // Filter valid speed data points for optional field
    const validSpeedDataPoints = formData.speedDataPoints.filter(
      (point) =>
        point.power !== "" &&
        point.speed !== "" &&
        !isNaN(point.power) &&
        !isNaN(point.speed)
    );

    // Convert empty strings to undefined and prepare data
    const cleanedData = cleanFormData({
      ...formData,
      fuelDataPoints: validFuelDataPoints,
      speedDataPoints:
        validSpeedDataPoints.length > 0 ? validSpeedDataPoints : undefined,
    });

    try {
      if (isEditMode) {
        saveComponent("dieselEngine", currentComponentId, cleanedData, {});
        toast.success("Diesel Engine Updated");
      } else {
        createComponent("dieselEngine", cleanedData, {});
        toast.success("Diesel Engine Created");
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error saving diesel engine. Please try again.");
      toast.error("Diesel Engine Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>Diesel Engine</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Tab Navigation */}
          <div className="mode-select">
            <button
              type="button"
              className={`tab-button ${
                activeTab === "required" ? "active" : ""
              }`}
              onClick={() => setActiveTab("required")}
            >
              Required
            </button>
            <button
              type="button"
              className={`tab-button ${
                activeTab === "optional" ? "active" : ""
              }`}
              onClick={() => setActiveTab("optional")}
            >
              Optional
            </button>
          </div>

          {/* Required Fields */}
          {activeTab === "required" && (
            <div className="input-field">
              {/* Fuel Data Points */}
              <label>Power vs Fuel Consumption</label>
              <div className="field-group">
                <div className="data-points-container">
                  {formData.fuelDataPoints.map((point, index) => (
                    <div key={index} className="data-point-row">
                      <div className="data-point-inputs">
                        <div className="input-group">
                          <label>Power (kW)</label>
                          <input
                            type="number"
                            value={point.power}
                            onChange={(e) =>
                              handleChangeFuelDataPoint(
                                index,
                                "power",
                                e.target.value
                              )
                            }
                            step={0.1}
                            min={0}
                            placeholder="0"
                          />
                        </div>

                        <div className="input-group">
                          <label>Consumption (g/kW)</label>
                          <input
                            type="number"
                            value={point.fuelConsumption}
                            onChange={(e) =>
                              handleChangeFuelDataPoint(
                                index,
                                "fuelConsumption",
                                e.target.value
                              )
                            }
                            step={0.1}
                            min={0}
                            placeholder="0"
                          />
                        </div>

                        {formData.fuelDataPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFuelDataPoint(index)}
                            className="remove-btn"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFuelDataPoint}
                    className="add-btn"
                  >
                    + Add Data Point
                  </button>
                </div>
              </div>

              <DataInput
                type="string"
                data={formData.description}
                setData={(value) => updateField("description", value)}
                options={{ label: "Description", required: true }}
              />
            </div>
          )}

          {/* Optional Fields */}
          {activeTab === "optional" && (
            <div className="input-field">
              {/* Speed Data Points */}
              <label>Power vs Speed</label>
              <div className="field-group">
                <div className="data-points-container">
                  {formData.speedDataPoints.map((point, index) => (
                    <div key={index} className="data-point-row">
                      <div className="data-point-inputs">
                        <div className="input-group">
                          <label>Power (kW)</label>
                          <input
                            type="number"
                            value={point.power}
                            onChange={(e) =>
                              handleChangeSpeedDataPoint(
                                index,
                                "power",
                                e.target.value
                              )
                            }
                            step={0.1}
                            min={0}
                            placeholder="0"
                          />
                        </div>

                        <div className="input-group">
                          <label>Speed (RPM)</label>
                          <input
                            type="number"
                            value={point.speed}
                            onChange={(e) =>
                              handleChangeSpeedDataPoint(
                                index,
                                "speed",
                                e.target.value
                              )
                            }
                            step={1}
                            min={0}
                            placeholder="0"
                          />
                        </div>

                        {formData.speedDataPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSpeedDataPoint(index)}
                            className="remove-btn"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSpeedDataPoint}
                    className="add-btn"
                  >
                    + Add Data Point
                  </button>
                </div>
              </div>

              <DataInput
                type="number"
                data={formData.price}
                setData={(value) => updateField("price", value)}
                options={{ label: "Price", min: 0, step: 0.1 }}
              />

              <DataInput
                type="string"
                data={formData.manufacturer}
                setData={(value) => updateField("manufacturer", value)}
                options={{ label: "Manufacturer" }}
              />

              <DataInput
                type="string"
                data={formData.model}
                setData={(value) => updateField("model", value)}
                options={{ label: "Model" }}
              />
            </div>
          )}
          {error && <div className="error-message">{error}</div>}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={!hasChanges}>
              {isEditMode ? "Update" : "Create"} Diesel Engine
            </button>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Right Side - Diesel Engine's own information display */}
      <div className="right">
        <h3>Diesel Engine Information</h3>

        <div className="calculations">
          <dl className="calc-item">
            <dt>Engine Name:</dt>
            <dd>{formData.description || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Manufacturer:</dt>
            <dd>{formData.manufacturer || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Model:</dt>
            <dd>{formData.model || "--"}</dd>
          </dl>
          <h4>Fuel Data Points</h4>
          <div className="data-points-display">
            {formData.fuelDataPoints.length > 0 ? (
              formData.fuelDataPoints.map((point, index) => (
                <dl key={index} className="calc-item">
                  <dt>Point {index + 1}:</dt>
                  <dd>
                    {point.power || "--"} kW @ {point.fuelConsumption || "--"}{" "}
                    g/kW
                  </dd>
                </dl>
              ))
            ) : (
              <p>No fuel data points</p>
            )}
          </div>

          <div className="graph-container">
            <Graph
              data={fuelGraphData}
              label={{
                title: "Power(kW) vs Fuel Consumption(g/kWh)",
                data: "g/kWh",
                x: "Power(kW)",
                y: "Fuel Consumption(g/kWh)",
              }}
            />
          </div>
          {formData.speedDataPoints.length > 0 && (
            <>
              <h4>Speed Data Points</h4>
              <div className="data-points-display">
                {formData.speedDataPoints.map((point, index) => (
                  <dl key={index} className="calc-item">
                    <dt>Point {index + 1}:</dt>
                    <dd>
                      {point.power || "--"} kW @ {point.speed || "--"} RPM
                    </dd>
                  </dl>
                ))}
              </div>

              <div className="graph-container">
                <Graph
                  data={speedGraphData}
                  label={{
                    title: "Power(kW) vs Speed(rpm)",
                    data: "RPM",
                    x: "Power(kW)",
                    y: "Speed(rpm)",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DieselEngine;
