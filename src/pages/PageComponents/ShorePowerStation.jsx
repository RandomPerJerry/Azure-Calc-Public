import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import cleanFormData from "../../utils/clearFormData";
import { defaultShorePowerStationData } from "../../utils/defaultSavedFormat";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function ShorePowerStation() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState(defaultShorePowerStationData);
  const [originalFormData, setOriginalFormData] = useState(
    defaultShorePowerStationData
  );

  // UI State
  const [activeTab, setActiveTab] = useState("required");
  const [error, setError] = useState("");

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
    const existingComponent = getComponent(
      "shorePowerStation",
      currentComponentId
    );

    if (!existingComponent?.data) {
      toast.error("Component Not Found");
      navigate("/home");
      return;
    }

    setFormData((prev) => updateWithTruthyValues(prev, existingComponent.data));
    setOriginalFormData((prev) =>
      updateWithTruthyValues(prev, existingComponent.data)
    );
  }, [isEditMode, currentComponentId, getComponent, navigate]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.powerCapacity || Number(formData.powerCapacity) <= 0) {
      setError("Power capacity must be greater than 0");
      return;
    }

    if (!formData.voltage || Number(formData.voltage) <= 0) {
      setError("Voltage must be greater than 0");
      return;
    }

    if (!formData.chargingMode) {
      setError("Charging mode selection is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Enter a description for the shore power station");
      return;
    }

    // Convert empty strings to undefined and prepare data
    const cleanedData = cleanFormData(formData);

    try {
      if (isEditMode) {
        saveComponent("shorePowerStation", currentComponentId, cleanedData, {});
        toast.success("Shore Power Station Updated");
      } else {
        createComponent("shorePowerStation", cleanedData, {});
        toast.success("Shore Power Station Created");
      }
      navigate("/home");
    } catch (err) {
      setError(
        err.message || "Error saving shore power station. Please try again."
      );
      toast.error("Shore Power Station Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>Shore Power Station</h2>

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
              <DataInput
                type="number"
                data={formData.powerCapacity}
                setData={(value) => updateField("powerCapacity", value)}
                options={{
                  label: "Power Capacity (kW)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.voltage}
                setData={(value) => updateField("voltage", value)}
                options={{
                  label: "Voltage (V)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <label>Charging Mode *</label>
              <div className="field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.chargingMode === "AC"}
                    onChange={() =>
                      updateField(
                        "chargingMode",
                        formData.chargingMode === "AC" ? "" : "AC"
                      )
                    }
                  />
                  AC
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.chargingMode === "DC"}
                    onChange={() =>
                      updateField(
                        "chargingMode",
                        formData.chargingMode === "DC" ? "" : "DC"
                      )
                    }
                  />
                  DC
                </label>
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
              {isEditMode ? "Update" : "Create"} Shore Power Station
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

      {/* Right Side - Shore Power Station's own information display */}
      <div className="right">
        <h3>Shore Power Station Information</h3>

        <div className="calculations">
          <dl className="calc-item">
            <dt>Station Name:</dt>
            <dd>{formData.description || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Power Capacity:</dt>
            <dd>{formData.powerCapacity || "--"} kW</dd>
          </dl>

          <dl className="calc-item">
            <dt>Voltage:</dt>
            <dd>{formData.voltage || "--"} V</dd>
          </dl>

          <dl className="calc-item">
            <dt>Charging Mode:</dt>
            <dd>{formData.chargingMode || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Manufacturer:</dt>
            <dd>{formData.manufacturer || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Model:</dt>
            <dd>{formData.model || "--"}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default ShorePowerStation;
