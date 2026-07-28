import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import cleanFormData from "../../utils/clearFormData";
import { defaultOtherLoadData } from "../../utils/defaultSavedFormat";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function OtherLoad() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState(defaultOtherLoadData);
  const [originalFormData, setOriginalFormData] =
    useState(defaultOtherLoadData);

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
    const existingComponent = getComponent("otherLoad", currentComponentId);

    if (!existingComponent?.data) {
      toast.error('Component Not Found')
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
    if (!formData.loadPower || Number(formData.loadPower) <= 0) {
      setError("Load power must be greater than 0");
      return;
    }

    if (!formData.loadVoltage || Number(formData.loadVoltage) <= 0) {
      setError("Load voltage must be greater than 0");
      return;
    }

    if (!formData.powerMode) {
      setError("Power mode selection is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Enter a description for the other load");
      return;
    }

    // Convert empty strings to undefined and prepare data
    const cleanedData = cleanFormData(formData);

    try {
      if (isEditMode) {
        saveComponent("otherLoadUnit", currentComponentId, cleanedData, {});
        toast.success("Other Load Unit Updated")
      } else {
        createComponent("otherLoadUnit", cleanedData, {});
        toast.success("Other Load Unit Created")
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error saving other load. Please try again.");
      toast.error("Other Load Unit Edit Failed")
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>Other Load</h2>

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
                data={formData.loadPower}
                setData={(value) => updateField("loadPower", value)}
                options={{
                  label: "Load Power (kW)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.loadVoltage}
                setData={(value) => updateField("loadVoltage", value)}
                options={{
                  label: "Load Voltage (V)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />
              <label>Power Mode *</label>
              <div className="field-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.powerMode === "AC"}
                    onChange={() =>
                      updateField(
                        "powerMode",
                        formData.powerMode === "AC" ? "" : "AC"
                      )
                    }
                  />
                  AC
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.powerMode === "DC"}
                    onChange={() =>
                      updateField(
                        "powerMode",
                        formData.powerMode === "DC" ? "" : "DC"
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
              {isEditMode ? "Update" : "Create"} Other Load
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

      {/* Right Side - Other Load's own information display */}
      <div className="right">
        <h3>Other Load Information</h3>

        <div className="calculations">
          <dl className="calc-item">
            <dt>Load Name:</dt>
            <dd>{formData.description || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Load Power:</dt>
            <dd>{formData.loadPower || "--"} kW</dd>
          </dl>

          <dl className="calc-item">
            <dt>Load Voltage:</dt>
            <dd>{formData.loadVoltage || "--"} V</dd>
          </dl>

          <dl className="calc-item">
            <dt>Power Mode:</dt>
            <dd>{formData.powerMode || "--"}</dd>
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

export default OtherLoad;
