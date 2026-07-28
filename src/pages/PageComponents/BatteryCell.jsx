import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import { cellPowerCal } from "../../calculations/batteryCal";
import cleanFormData from "../../utils/clearFormData";
import { defaultBatteryCellData } from "../../utils/defaultSavedFormat";
import deepEqual from "../../utils/objectComp";
import { toast } from "react-toastify";

function BatteryCellPage() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState(defaultBatteryCellData);

  const [originalFormData, setOriginalFormData] = useState(
    defaultBatteryCellData
  );

  // Output fields - Combined into single object
  const [formOutputData, setFormOutputData] = useState({
    cellPower: null,
  });

  // Others
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("required");
  const isEditMode = !!currentComponentId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const restChanged = !deepEqual(formData, originalFormData);
    return restChanged;
  }, [formData, originalFormData]);

  // Edit Component
  useEffect(() => {
    if (!isEditMode || !currentComponentId) return;
    const existingComponent = getComponent("batteryCell", currentComponentId);

    if (!existingComponent?.data) {
      toast.error('Component Not Found');
      navigate("/home");
      return;
    }

    setFormData((prev) => updateWithTruthyValues(prev, existingComponent.data));
    setOriginalFormData((prev) =>
      updateWithTruthyValues(prev, existingComponent.data)
    );
  }, [isEditMode, currentComponentId, getComponent, navigate]);

  // Cell Power calculation
  useEffect(() => {
    const power = cellPowerCal(formData.capacity);
    setFormOutputData({ cellPower: power });
  }, [formData.capacity]);

  // Update helper
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.capacity ||
      !formData.chargingRate ||
      !formData.dischargingRate ||
      !formData.startingRangeSOC ||
      !formData.endingRangeSOC
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (isEditMode) {
        saveComponent(
          "batteryCell",
          currentComponentId,
          cleanFormData(formData),
          formOutputData
        );
        toast.success("Battery Cell Updated");
      } else {
        createComponent("batteryCell", cleanFormData(formData), formOutputData);
        toast.success("Battery Cell Created");
      }
      
      navigate("/home");
    } catch (error) {
      setError("Failed to save component. Please try again.");
      toast.error("Battery Cell Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        <h2>Battery Cell</h2>


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
                type="string"
                data={formData.description}
                setData={(val) => updateField("description", val)}
                options={{
                  label: "Description",
                  required: true,
                  placeholder: "Enter battery cell description",
                }}
              />

              <DataInput
                type="number"
                data={formData.capacity}
                setData={(val) => updateField("capacity", val)}
                options={{
                  label: "Capacity (Ah)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.chargingRate}
                setData={(val) => updateField("chargingRate", val)}
                options={{
                  label: "Charging Rate (C)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.dischargingRate}
                setData={(val) => updateField("dischargingRate", val)}
                options={{
                  label: "Discharging Rate (C)",
                  required: true,
                  min: 0,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.startingRangeSOC}
                setData={(val) => updateField("startingRangeSOC", val)}
                options={{
                  label: "Starting SOC (%)",
                  required: true,
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.endingRangeSOC}
                setData={(val) => updateField("endingRangeSOC", val)}
                options={{
                  label: "Ending SOC (%)",
                  required: true,
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
              />
            </div>
          )}

          {/* Optional Fields */}
          {activeTab === "optional" && (
            <div className="input-field">
              <DataInput
                type="string"
                data={formData.manfactureName}
                setData={(val) => updateField("manfactureName", val)}
                options={{
                  label: "Manufacturer Name",
                  placeholder: "Enter manufacturer",
                }}
              />

              <DataInput
                type="string"
                data={formData.modelName}
                setData={(val) => updateField("modelName", val)}
                options={{
                  label: "Model Name",
                  placeholder: "Enter model name",
                }}
              />

              <DataInput
                type="number"
                data={formData.thickness}
                setData={(val) => updateField("thickness", val)}
                options={{ label: "Thickness (mm)", min: 0, step: 0.1 }}
              />

              <DataInput
                type="number"
                data={formData.width}
                setData={(val) => updateField("width", val)}
                options={{ label: "Width (mm)", min: 0, step: 0.1 }}
              />

              <DataInput
                type="number"
                data={formData.height}
                setData={(val) => updateField("height", val)}
                options={{ label: "Height (mm)", min: 0, step: 0.1 }}
              />

              <DataInput
                type="number"
                data={formData.price}
                setData={(val) => updateField("price", val)}
                options={{ label: "Price", min: 0, step: 0.01 }}
              />

              <DataInput
                type="number"
                data={formData.weight}
                setData={(val) => updateField("weight", val)}
                options={{ label: "Weight (kg)", min: 0, step: 0.01 }}
              />

              <DataInput
                type="number"
                data={formData.cyclelife}
                setData={(val) => updateField("cyclelife", val)}
                options={{ label: "Cycle Life", min: 0 }}
              />

              <DataInput
                type="number"
                data={formData.startingOperatingTem}
                setData={(val) => updateField("startingOperatingTem", val)}
                options={{
                  label: "Starting Operating Temperature (°C)",
                  step: 0.1,
                }}
              />

              <DataInput
                type="number"
                data={formData.endingOperatingTem}
                setData={(val) => updateField("endingOperatingTem", val)}
                options={{
                  label: "Ending Operating Temperature (°C)",
                  step: 0.1,
                }}
              />

              <label>Cell Material</label>
              <select
                id="material"
                value={formData.material}
                onChange={(e) => updateField("material", e.target.value)}
              >
                <option value="">Select Material</option>

                <option value="Lithium-titanate battery">
                  Lithium-titanate battery
                </option>
                <option value="lithium-ion ternary battery">
                  lithium-ion ternary battery
                </option>
                <option value="lead-acid">Lead Acid</option>
                <option value="lithium-iron-phosphate">
                  Lithium Iron Phosphate (LiFePO4)
                </option>
              </select>
            </div>
          )}

          {/* Form Actions */}
          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            
            <button type="submit" className="submit-btn" disabled={!hasChanges}>
              {isEditMode ? "Update" : "Create"} Battery Cell
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

      {/* Right Side - Calculations */}
      <div className="right">
        <h3>Calculated Values</h3>
        <div className="calculations">
          <dl className="calc-item">
            <dt>Cell Power:</dt>
            <dd>
              {formOutputData.cellPower
                ? `${formOutputData.cellPower.toFixed(2)} kWh`
                : "N/A"}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default BatteryCellPage;
