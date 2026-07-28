import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import ChildComponentSelection from "../../components/ChildComponentSelection";
import {
  packPowerCal,
  cellNumCal,
  soc100Cal,
  soc20Cal,
  volumetricPackCal,
} from "../../calculations/batteryCal";
import cleanFormData from "../../utils/clearFormData";
import { defaultBatteryPackStateData } from "../../utils/defaultSavedFormat";
import ComponentDataDisplay from "../../components/ComponentDataDisplay";
import deepEqual from "../../utils/objectComp";
import "../../assets/styles/component/component.css";
import { toast } from "react-toastify";

function BatteryPackPage() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input feilds
  const [formData, setFormData] = useState(defaultBatteryPackStateData);
  const [originalFormData, setOriginalFormData] = useState(
    defaultBatteryPackStateData
  );

  // Output feilds - Combined into single object
  const [formOutputData, setFormOutputData] = useState({
    packPower: null,
    cellNum: null,
    soc100: null,
    soc20: null,
    volumetricPack: null,
  });

  // Others
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("required");
  const isEditMode = !!currentComponentId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const { batteryCell: currentBatteryCell, ...currentPrimitiveData } =
      formData;
    const { batteryCell: originalBatteryCell, ...originalPrimitiveData } =
      originalFormData;

    const batteryCellChanged =
      currentBatteryCell?.id !== originalBatteryCell?.id ||
      currentBatteryCell?.version !== originalBatteryCell?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return restChanged || batteryCellChanged;
  }, [formData, originalFormData]);

  // Add selection state
  const [showComponentSelection, setShowComponentSelection] = useState("none");

  // Edit Component
  useEffect(() => {
    if (!isEditMode || !currentComponentId) return;
    const existingComponent = getComponent("batteryPack", currentComponentId);

    if (!existingComponent?.data) {
      // Handle Main Error
      navigate("/home");
      toast.error('Component Not Found');
      return;
    }

    setFormData((prev) => updateWithTruthyValues(prev, existingComponent.data));
    setOriginalFormData((prev) =>
      updateWithTruthyValues(prev, existingComponent.data)
    );
  }, [isEditMode, currentComponentId, getComponent, navigate]);

  // All calculations in one useEffect
  useEffect(() => {
    const power = packPowerCal(
      formData.packNum,
      formData.moduleNum,
      formData.batteryCell
    );
    const cells = cellNumCal(formData.packNum, formData.moduleNum);
    const soc100Value = soc100Cal(formData.moduleNum);
    const soc20Value = soc20Cal(formData.moduleNum);
    const volumetric = volumetricPackCal(
      power,
      formData.height,
      formData.width,
      formData.depth
    );

    setFormOutputData({
      packPower: power,
      cellNum: cells,
      soc100: soc100Value,
      soc20: soc20Value,
      volumetricPack: volumetric,
    });
  }, [
    formData.batteryCell,
    formData.packNum,
    formData.moduleNum,
    formData.height,
    formData.width,
    formData.depth,
  ]);

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
      !formData.width ||
      !formData.depth ||
      !formData.height ||
      !formData.packNum ||
      !formData.moduleNum ||
      !formData.batteryCell?.id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (isEditMode) {
        saveComponent(
          "batteryPack",
          currentComponentId,
          cleanFormData(formData),
          formOutputData
        );
        toast.success("Battery Pack Updated");
      } else {
        createComponent("batteryPack", cleanFormData(formData), formOutputData);
        toast.success("Battery Pack Created");
      }
      navigate("/home");
    } catch (error) {
      setError("Failed to save component. Please try again.");
      toast.error("Battery Pack Edit Failed");
    }
  };

  return (
    <div className="page">
      <div className="left">
        {/* Show Component Selection OR Form */}
        {showComponentSelection === "batteryCell" ? (
          <>
            <ChildComponentSelection
              type="batteryCell"
              selectedComponent={formData.batteryCell}
              setSelectedComponent={(data) => updateField("batteryCell", data)}
              currentComponent={
                isEditMode ? originalFormData.batteryCell : null
              }
            />

            <div className="back-action">
              <button
                type="button"
                className="back-btn"
                onClick={() => setShowComponentSelection("none")}
              >
                ← Back to Form
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>Battery Pack</h2>
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
                      placeholder: "Enter battery pack description",
                    }}
                  />

                  <div className="field-group">
                    <DataInput
                      type="number"
                      data={formData.width}
                      setData={(val) => updateField("width", val)}
                      options={{ label: "Width (mm)", required: true, min: 0 }}
                    />

                    <DataInput
                      type="number"
                      data={formData.depth}
                      setData={(val) => updateField("depth", val)}
                      options={{ label: "Depth (mm)", required: true, min: 0 }}
                    />

                    <DataInput
                      type="number"
                      data={formData.height}
                      setData={(val) => updateField("height", val)}
                      options={{ label: "Height (mm)", required: true, min: 0 }}
                    />
                  </div>

                  <DataInput
                    type="number"
                    data={formData.packNum}
                    setData={(val) => updateField("packNum", val)}
                    options={{ label: "Number of Module in Pack (Parallel)", required: true, min: 1 }}
                  />

                  <DataInput
                    type="number"
                    data={formData.moduleNum}
                    setData={(val) => updateField("moduleNum", val)}
                    options={{ label: "Number of Cell in one Module (Serial)", required: true, min: 1 }}
                  />

                  {/* Battery Cell Selection Button */}
                  <div className="component-selection">
                    <label>Battery Cell</label>
                    {formData.batteryCell?.id ? (
                      <div className="selected-component">
                        <span>
                          {formData.batteryCell.data?.description ||
                            "Selected Battery Cell"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowComponentSelection("batteryCell")
                          }
                          className="change-btn"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("batteryCell")}
                        className="select-btn"
                      >
                        Select Battery Cell
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Optional Fields */}
              {activeTab === "optional" && (
                <div className="input-field">
                  <DataInput
                    type="string"
                    data={formData.weight}
                    setData={(val) => updateField("weight", val)}
                    options={{
                      label: "Weight (kg)",
                      placeholder: "Enter weight",
                    }}
                  />

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
                    type="number"
                    data={formData.price}
                    setData={(val) => updateField("price", val)}
                    options={{ label: "Price", min: 0, step: 0.01 }}
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
                    type="string"
                    data={formData.cooling}
                    setData={(val) => updateField("cooling", val)}
                    options={{
                      label: "Cooling System",
                      placeholder: "Enter cooling type",
                    }}
                  />

                  <DataInput
                    type="string"
                    data={formData.ip}
                    setData={(val) => updateField("ip", val)}
                    options={{
                      label: "IP Rating",
                      placeholder: "Enter IP rating",
                    }}
                  />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!hasChanges}
                >
                  {isEditMode ? "Update" : "Create"} Battery Pack
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
          </>
        )}
      </div>

      {/* Right Side - Conditional Content */}
      <div className="right">
        {(() => {
          switch (showComponentSelection) {
            case "none":
              return (
                <>
                  <h3>Calculated Values</h3>
                  <div className="calculations">
                    <dl className="calc-item">
                      <dt>Pack Power:</dt>
                      <dd>
                        {formOutputData.packPower
                          ? `${formOutputData.packPower.toFixed(2)} W`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Cell Number:</dt>
                      <dd>{formOutputData.cellNum || "N/A"}</dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>SOC 100%:</dt>
                      <dd>
                        {formOutputData.soc100
                          ? `${formOutputData.soc100.toFixed(2)} Ah`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>SOC 20%:</dt>
                      <dd>
                        {formOutputData.soc20
                          ? `${formOutputData.soc20.toFixed(2)} Ah`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Volumetric Pack:</dt>
                      <dd>
                        {formOutputData.volumetricPack
                          ? `${formOutputData.volumetricPack.toFixed(2)} Wh/L`
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </>
              );

            case "batteryCell":
              return (
                <>
                  <h3>Component Selection</h3>
                  {formData.batteryCell?.id && (
                    <ComponentDataDisplay
                      type="batteryCell"
                      data={formData.batteryCell.data}
                      outputData={formData.batteryCell?.output}
                    />
                  )}
                </>
              );

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
}

export default BatteryPackPage;
