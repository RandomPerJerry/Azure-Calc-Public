import React, { useState, useMemo, useEffect } from "react";
import {
  groupPowerCal,
  groupAvailablePowerCal,
  groupMaxChargeCurrentCal,
  groupMaxDischargeCurrentCal,
  group100SOCVolCal,
  group20SOCVolCal,
} from "../../../calculations/batteryCal";
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultBatterySystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function BatterySystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId =
    new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultBatterySystemData);
  const [originalFormData, setOriginalFormData] = useState(
    defaultBatterySystemData
  );

  const [formOutputData, setFormOutputData] = useState({
    power: null,
    availablePower: null,
    maxChargeCurrent: null,
    maxDischargeCurrent: null,
    soc100Vol: null,
    soc20Vol: null,
  });

  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");
  const isEditMode = !!currentSystemId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      batteryString: currentBatteryString,
      dcDcConverter: currentDcDcConverter,
      lts: currentLts,
      ...currentPrimitiveData
    } = formData;
    const {
      batteryString: originalBatteryString,
      dcDcConverter: originalDcDcConverter,
      lts: originalLts,
      ...originalPrimitiveData
    } = originalFormData;

    const batteryStringChanged =
      currentBatteryString?.id !== originalBatteryString?.id ||
      currentBatteryString?.version !== originalBatteryString?.version;

    const dcDcConverterChanged =
      currentDcDcConverter?.id !== originalDcDcConverter?.id ||
      currentDcDcConverter?.version !== originalDcDcConverter?.version;

    const ltsChanged =
      currentLts?.id !== originalLts?.id ||
      currentLts?.version !== originalLts?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return (
      batteryStringChanged || dcDcConverterChanged || ltsChanged || restChanged
    );
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;

    const existingSystem = shipData.system?.batterySystem?.find(
      (s) => s.id === currentSystemId
    );

    if (!existingSystem?.data) {
      toast.error("System Not Found");
      onCancel();
      return;
    }

    setFormData((prev) => updateWithTruthyValues(prev, existingSystem.data));
    setOriginalFormData((prev) =>
      updateWithTruthyValues(prev, existingSystem.data)
    );
  }, [isEditMode, currentSystemId, shipData.system]);

  // Calculate output values
  useEffect(() => {
    const power = groupPowerCal(formData.batteryString, formData.numberOfUnits);
    const availablePower = groupAvailablePowerCal(
      formData.batteryString,
      formData.numberOfUnits
    );
    const maxChargeCurrent = groupMaxChargeCurrentCal(
      formData.batteryString,
      formData.numberOfUnits
    );
    const maxDischargeCurrent = groupMaxDischargeCurrentCal(
      formData.batteryString,
      formData.numberOfUnits
    );
    const soc100Vol = group100SOCVolCal(formData.batteryString);
    const soc20Vol = group20SOCVolCal(formData.batteryString);

    setFormOutputData({
      power,
      availablePower,
      maxChargeCurrent,
      maxDischargeCurrent,
      soc100Vol,
      soc20Vol,
    });
  }, [
    formData.batteryString?.id,
    formData.batteryString?.version,
    formData.numberOfUnits,
  ]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.numberOfUnits ||
      !formData.batteryString?.id ||
      !formData.dcDcConverter?.id ||
      !formData.lts?.id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const systemData = {
        id: currentSystemId || generateId(),
        data: {
          ...formData,
          power: formOutputData.power,
        },
        barNumber: null,
      };

      // Update the systems array
      const currentSystems = shipData.system?.batterySystem || [];

      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map((system) =>
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState("system", {
          ...shipData.system,
          batterySystem: updatedSystems,
        });
        toast.success("Battery System Updated");
      } else {
        // Add new system
        updateComponentState("system", {
          ...shipData.system,
          batterySystem: [...currentSystems, systemData],
        });
        toast.success("Battery System Created");
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error("Battery System Edit Failed");
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Battery System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter battery system description",
                  }}
                />

                <DataInput
                  type="number"
                  data={formData.numberOfUnits}
                  setData={(val) => updateField("numberOfUnits", val)}
                  options={{ label: "Unit Number", required: true, min: 1 }}
                />

                {/* Battery String Selection */}
                <div className="component-selection">
                  <label>Battery String</label>
                  {formData.batteryString?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.batteryString.data?.description ||
                          "Selected Battery String"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setShowComponentSelection("batteryString")
                        }
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("batteryString")}
                      className="select-btn"
                    >
                      Select Battery String
                    </button>
                  )}
                </div>

                {/* DC/DC Converter Selection */}
                <div className="component-selection">
                  <label>DC/DC Converter</label>
                  {formData.dcDcConverter?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.dcDcConverter.data?.description ||
                          "Selected DC/DC Converter"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setShowComponentSelection("dcDcConverter")
                        }
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("dcDcConverter")}
                      className="select-btn"
                    >
                      Select DC/DC Converter
                    </button>
                  )}
                </div>

                {/* LTS Selection */}
                <div className="component-selection">
                  <label>LTS (Low Temperature Sensor)</label>
                  {formData.lts?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.lts.data?.description || "Selected LTS"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("lts")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("lts")}
                      className="select-btn"
                    >
                      Select LTS
                    </button>
                  )}
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!hasChanges}
                >
                  {isEditMode ? "Update" : "Create"} Battery System
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          // Component Selection Views
          <>
            {showComponentSelection === "batteryString" && (
              <ChildComponentSelection
                type="batteryString"
                selectedComponent={formData.batteryString}
                setSelectedComponent={(val) =>
                  updateField("batteryString", val)
                }
                currentComponent={
                  isEditMode ? originalFormData.batteryString : null
                }
              />
            )}

            {showComponentSelection === "dcDcConverter" && (
              <ChildComponentSelection
                type="dcDcConverter"
                selectedComponent={formData.dcDcConverter}
                setSelectedComponent={(val) =>
                  updateField("dcDcConverter", val)
                }
                currentComponent={
                  isEditMode ? originalFormData.dcDcConverter : null
                }
              />
            )}

            {showComponentSelection === "lts" && (
              <ChildComponentSelection
                type="lts"
                selectedComponent={formData.lts}
                setSelectedComponent={(val) => updateField("lts", val)}
                currentComponent={isEditMode ? originalFormData.lts : null}
              />
            )}

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
        )}
      </div>

      {/* Right Side - Conditional Content */}
      <div className="right-panel">
        {(() => {
          switch (showComponentSelection) {
            case "none":
              return (
                <>
                  <h3>Calculated Values</h3>
                  <div className="calculations">
                    <dl className="calc-item">
                      <dt>System Power:</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} W`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Available Power:</dt>
                      <dd>
                        {formOutputData.availablePower
                          ? `${formOutputData.availablePower.toFixed(2)} W`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Max Charge Current:</dt>
                      <dd>
                        {formOutputData.maxChargeCurrent
                          ? `${formOutputData.maxChargeCurrent.toFixed(2)} A`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Max Discharge Current:</dt>
                      <dd>
                        {formOutputData.maxDischargeCurrent
                          ? `${formOutputData.maxDischargeCurrent.toFixed(2)} A`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>SOC 100% Voltage:</dt>
                      <dd>
                        {formOutputData.soc100Vol
                          ? `${formOutputData.soc100Vol.toFixed(2)} V`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>SOC 20% Voltage:</dt>
                      <dd>
                        {formOutputData.soc20Vol
                          ? `${formOutputData.soc20Vol.toFixed(2)} V`
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </>
              );

            case "batteryString":
              return (
                <>
                  <h3>Battery String Selection</h3>
                  {formData.batteryString?.data ? (
                    <ComponentDataDisplay
                      type="batteryString"
                      data={formData.batteryString.data}
                      outputData={formData.batteryString?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a battery string from the options on the left to
                        see its specifications.
                      </p>
                    </div>
                  )}
                </>
              );

            case "dcDcConverter":
              return (
                <>
                  <h3>DC/DC Converter Selection</h3>
                  {formData.dcDcConverter?.data ? (
                    <ComponentDataDisplay
                      type="dcDcConverter"
                      data={formData.dcDcConverter.data}
                      outputData={formData.dcDcConverter?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a DC/DC converter from the options on the left to
                        see its specifications.
                      </p>
                    </div>
                  )}
                </>
              );

            case "lts":
              return (
                <>
                  <h3>LTS Selection</h3>
                  {formData.lts?.data ? (
                    <ComponentDataDisplay
                      type="lts"
                      data={formData.lts.data}
                      outputData={formData.lts?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select an LTS from the options on the left to
                        see its specifications.
                      </p>
                    </div>
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

export default BatterySystem;
