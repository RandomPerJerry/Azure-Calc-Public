import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import cleanFormData from "../../utils/clearFormData";
import { defaultStringControllerData } from "../../utils/defaultSavedFormat";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function StringController() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState(defaultStringControllerData);
  const [originalFormData, setOriginalFormData] = useState(
    defaultStringControllerData
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

  // Dimension update helper
  const updateDimension = (dimension, value) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimension]: value },
    }));
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
      "stringController",
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

    // Validate required fields - all dimensions are required
    if (
      !formData.dimensions.length ||
      !formData.dimensions.width ||
      !formData.dimensions.height
    ) {
      setError("All dimensions (length, width, height) are required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Enter a description for the string controller");
      return;
    }

    // Prepare dimensions object with all required values
    const dimensionsData = {
      length: Number(formData.dimensions.length),
      width: Number(formData.dimensions.width),
      height: Number(formData.dimensions.height),
    };

    // Convert empty strings to undefined and prepare data
    const cleanedData = cleanFormData({
      ...formData,
      dimensions: dimensionsData,
    });

    try {
      if (isEditMode) {
        saveComponent("stringController", currentComponentId, cleanedData, {});
        toast.success("String Controller Updated");
      } else {
        createComponent("stringController", cleanedData, {});
        toast.success("String Controller Created");
      }
      navigate("/home");
    } catch (err) {
      setError(
        err.message || "Error saving string controller. Please try again."
      );
      toast.success("String Controller Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>String Controller</h2>

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
              <div className="field-group">
                <label>Dimensions (mm) *</label>
                <div className="dimensions-inputs">
                  <div className="input-group">
                    <label>Length</label>
                    <input
                      type="number"
                      value={formData.dimensions.length}
                      onChange={(e) =>
                        updateDimension("length", e.target.value)
                      }
                      step={0.1}
                      min={0}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Width</label>
                    <input
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) => updateDimension("width", e.target.value)}
                      step={0.1}
                      min={0}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Height</label>
                    <input
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        updateDimension("height", e.target.value)
                      }
                      step={0.1}
                      min={0}
                      placeholder="0"
                      required
                    />
                  </div>
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
              {isEditMode ? "Update" : "Create"} String Controller
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

      {/* Right Side - String Controller's own information display */}
      <div className="right">
        <h3>String Controller Information</h3>

        <div className="calculations">
          <dl className="calc-item">
            <dt>Controller Name:</dt>
            <dd>{formData.description || "--"}</dd>
          </dl>

          <dl className="calc-item">
            <dt>Dimensions:</dt>
            <dd>
              {formData.dimensions.length || "--"} ×{" "}
              {formData.dimensions.width || "--"} ×{" "}
              {formData.dimensions.height || "--"} mm
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

export default StringController;
