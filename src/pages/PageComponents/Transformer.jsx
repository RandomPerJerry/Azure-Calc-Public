import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import cleanFormData from "../../utils/clearFormData";
import { defaultTransformerData } from "../../utils/defaultSavedFormat";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function Transformer() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState(defaultTransformerData);
  const [originalFormData, setOriginalFormData] = useState(
    defaultTransformerData
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
    const existingComponent = getComponent("transformer", currentComponentId);

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
    if (!formData.primaryVoltage || Number(formData.primaryVoltage) <= 0) {
      setError("Primary voltage must be greater than 0");
      return;
    }

    if (!formData.secondaryVoltage || Number(formData.secondaryVoltage) <= 0) {
      setError("Secondary voltage must be greater than 0");
      return;
    }

    if (!formData.description.trim()) {
      setError("Enter a description for the transformer");
      return;
    }

    // Convert empty strings to undefined and prepare data
    const cleanedData = cleanFormData(formData);

    try {
      if (isEditMode) {
        saveComponent("transformer", currentComponentId, cleanedData, {});
        toast.success("Transformer Updated");
      } else {
        createComponent("transformer", cleanedData, {});
        toast.success("Transformer Created");
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error saving transformer. Please try again.");
      toast.success("Transformer Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>Transformer</h2>

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
                data={formData.primaryVoltage}
                setData={(value) => updateField("primaryVoltage", value)}
                options={{
                  label: "Primary Voltage (V)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.secondaryVoltage}
                setData={(value) => updateField("secondaryVoltage", value)}
                options={{
                  label: "Secondary Voltage (V)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

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
              {isEditMode ? "Update" : "Create"} Transformer
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

      {/* Right Side - Transformer's own information display */}
      <div className="right">
        <h3>Transformer Information</h3>

        <div className="calculations">
          <dl className="calc-item">
            <dt>Transformer Name:</dt>
            <dd>{formData.description || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Primary Voltage:</dt>
            <dd>
              {formData.primaryVoltage ? `${formData.primaryVoltage} V` : "--"}
            </dd>
          </dl>

          <dl className="calc-item">
            <dt>Secondary Voltage:</dt>
            <dd>
              {formData.secondaryVoltage
                ? `${formData.secondaryVoltage} V`
                : "--"}
            </dd>
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

export default Transformer;
