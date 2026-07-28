import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import Graph from "../../components/chartComp";
import cleanFormData from "../../utils/clearFormData";
import { defaultMotorData } from "../../utils/defaultSavedFormat";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function MotorPage() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState({
    // Required
    validDataPoints: [{ power: "", speed: "" }],
    description: "",

    // Optional
    voltage: "",
    weight: "",
    motorType: "",
    ipRating: "",
    price: "",
    manufacturer: "",
    model: "",
  });
  const [originalFormData, setOriginalFormData] = useState({
    // Required
    validDataPoints: [{ power: "", speed: "" }],
    description: "",

    // Optional
    voltage: "",
    weight: "",
    motorType: "",
    ipRating: "",
    price: "",
    manufacturer: "",
    model: "",
  });


  // UI State
  const [activeTab, setActiveTab] = useState("required");
  const [error, setError] = useState("");

  // Graph data derived from data points
  const graphData = useMemo(() => {
    const filteredDatapoints = formData.validDataPoints.filter(
      (point) => point.power !== "" && point.speed !== ""
    );
    const transformedData = filteredDatapoints.map((point) => ({
      x: Number(point.power),
      y: Number(point.speed),
    }));
    transformedData.push({ x: 0, y: 0 });
    return transformedData;
  }, [formData.validDataPoints]);

  // Component IDs
  const isEditMode = !!currentComponentId;

  // Change detection
  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    return !deepEqual(formData, originalFormData);
  }, [formData, originalFormData]);

  // Field update function
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Edit Component
  useEffect(() => {
    if (!isEditMode || !currentComponentId) return;
    const existingComponent = getComponent("motor", currentComponentId);

    if (!existingComponent?.data) {
      toast.error('Component Not Found');
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

  // Data points handlers
  const handleAddDataPoint = () => {
    const newDataPoints = [
      ...formData.validDataPoints,
      { power: "", speed: "" },
    ];
    updateField("validDataPoints", newDataPoints);
  };

  const handleDeleteDataPoint = (index) => {
    const newDataPoints = formData.validDataPoints.filter(
      (_, i) => i !== index
    );
    updateField("validDataPoints", newDataPoints);
  };

  const handleChangeDataPoint = (index, field, value) => {
    const newDataPoints = [...formData.validDataPoints];
    newDataPoints[index][field] = value === "" ? "" : Number(value);
    updateField("validDataPoints", newDataPoints);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const validDataPoints = formData.validDataPoints.filter(
      (point) =>
        point.power !== "" &&
        point.speed !== "" &&
        !isNaN(point.power) &&
        !isNaN(point.speed)
    );

    if (validDataPoints.length < 2) {
      setError("Need to have more than 2 valid data points");
      return;
    }

    if (!formData.description.trim()) {
      setError("Enter a description for the motor");
      return;
    }

    // Convert empty strings to undefined and prepare data
    const cleanedData = {
      ...formData,
      validDataPoints: validDataPoints,
    };

    try {
      if (isEditMode) {
        saveComponent("motor", currentComponentId, cleanedData, {});
        toast.success("Motor Updated");
      } else {
        createComponent("motor", cleanedData, {});
        toast.success("Motor Created");
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error saving motor. Please try again.");
      toast.error("Motor Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>Motor</h2>

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
              {/* Data Points */}
              <label>Power-Speed Data Points</label>
              <div className="field-group">
                <div className="data-points-container">
                  {formData.validDataPoints.map((point, index) => (
                    <div key={index} className="data-point-row">
                      <div className="data-point-inputs">
                        <div className="input-group">
                          <label>Power (kW)</label>
                          <input
                            type="number"
                            value={point.power}
                            onChange={(e) =>
                              handleChangeDataPoint(
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
                              handleChangeDataPoint(
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

                        {formData.validDataPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDataPoint(index)}
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
                    onClick={handleAddDataPoint}
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
              <DataInput
                type="number"
                data={formData.voltage}
                setData={(value) => updateField("voltage", value)}
                options={{ label: "Voltage (V)", min: 0, step: 0.1 }}
              />

              <DataInput
                type="number"
                data={formData.weight}
                setData={(value) => updateField("weight", value)}
                options={{ label: "Weight (kg)", min: 0, step: 0.1 }}
              />

              <label>Motor Type</label>
              <select
                value={formData.motorType}
                onChange={(e) => updateField("motorType", e.target.value)}
              >
                <option value="">Select Motor Type</option>
                <option value="DC Motor">DC Motor</option>
                <option value="AC Induction Motor">AC Induction Motor</option>
                <option value="Permanent Magnet Synchronous Motor">
                  Permanent Magnet Synchronous Motor
                </option>
                <option value="Brushless DC Motor">Brushless DC Motor</option>
                <option value="Switched Reluctance Motor">
                  Switched Reluctance Motor
                </option>
              </select>

              <label>IP Rating</label>
              <select
                value={formData.ipRating}
                onChange={(e) => updateField("ipRating", e.target.value)}
              >
                <option value="">Select IP Rating</option>
                <option value="IP54">IP54</option>
                <option value="IP65">IP65</option>
                <option value="IP66">IP66</option>
                <option value="IP67">IP67</option>
                <option value="IP68">IP68</option>
              </select>

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
              {isEditMode ? "Update" : "Create"} Motor
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

      {/* Right Side - Motor's own information display */}
      <div className="right">
        <h3>Motor Information</h3>

        <div className="calculations">
          <dl className="calc-item">
            <dt>Motor Name:</dt>
            <dd>{formData.description || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Motor Type:</dt>
            <dd>{formData.motorType || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Voltage:</dt>
            <dd>{formData.voltage || "--"} V</dd>
          </dl>

          <h4>Data Points</h4>
          <div className="data-points-display">
            {formData.validDataPoints.length > 0 ? (
              formData.validDataPoints.map((point, index) => (
                <dl key={index} className="calc-item">
                  <dt>Point {index + 1}:</dt>
                  <dd>
                    {point.power || "--"} kW @ {point.speed || "--"} RPM
                  </dd>
                </dl>
              ))
            ) : (
              <p>No data points</p>
            )}
          </div>

          <div className="graph-container">
            <Graph
              data={graphData}
              label={{
                title: "Power(kW) vs Speed(rpm)",
                data: "Power",
                x: "Speed(rpm)",
                y: "Power(kW)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotorPage;
