import React, { useState, useMemo, useEffect } from "react";
import { propulsionPowerCal } from "../../../calculations/propulsionCal";
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultPropulsionSystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function PropulsionSystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId =
    new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultPropulsionSystemData);
  const [originalFormData, setOriginalFormData] = useState(
    defaultPropulsionSystemData
  );

  const [formOutputData, setFormOutputData] = useState({
    power: null,
    hybridPower: null,
  });

  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");
  const isEditMode = !!currentSystemId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      motor: currentMotor,
      dieselEngine: currentDieselEngine,
      dcAcConverter: currentDcAcConverter,
      ...currentPrimitiveData
    } = formData;
    const {
      motor: originalMotor,
      dieselEngine: originalDieselEngine,
      dcAcConverter: originalDcAcConverter,
      ...originalPrimitiveData
    } = originalFormData;

    const motorChanged =
      currentMotor?.id !== originalMotor?.id ||
      currentMotor?.version !== originalMotor?.version;

    const dieselEngineChanged =
      currentDieselEngine?.id !== originalDieselEngine?.id ||
      currentDieselEngine?.version !== originalDieselEngine?.version;

    const dcAcConverterChanged =
      currentDcAcConverter?.id !== originalDcAcConverter?.id ||
      currentDcAcConverter?.version !== originalDcAcConverter?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return (
      motorChanged || dieselEngineChanged || dcAcConverterChanged || restChanged
    );
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;

    const existingSystem = shipData.system?.propulsionSystem?.find(
      (s) => s.id === currentSystemId
    );

    if (!existingSystem?.data) {
      toast.error('System Not Found');
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
    const power = propulsionPowerCal(
      formData.propulsionMode,
      formData.motor,
      formData.dieselEngine
    );

    setFormOutputData({
      power: power[0],
      hybridPower:
        power.length > 2 ? { motor: power[1], diesel: power[2] } : null,
    });
  }, [
    formData.propulsionMode,
    formData.motor?.id,
    formData.motor?.version,
    formData.dieselEngine?.id,
    formData.dieselEngine?.version,
  ]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.propulsionDevice
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      formData.propulsionMode === "electric" &&
      formData.propulsionDevice === "gearBox" &&
      !formData.propulsorType
    ) {
      setError("Propulsor Type Needed");
      return;
    }

    if (
      formData.propulsionMode === "electric" ||
      formData.propulsionMode === "hybrid"
    ) {
      if (!formData.motor?.id) {
        setError("Electric Motor Required for Electric or Hybrid mode");
        return;
      }

      if (!formData.dcAcConverter?.id) {
        setError("DC/AC Converter is required for Electric and Hybrid modes");
        return;
      }
    }

    if (
      formData.propulsionMode === "diesel" ||
      formData.propulsionMode === "hybrid"
    ) {
      if (!formData.dieselEngine?.id) {
        setError("Diesel Engine Required for Diesel or Hybrid mode");
        return;
      }
    }

    if (formData.gearRatio <= 0) {
      setError("Gear Ratio must be greater than 0");
      return;
    }

    try {
      const systemData = {
        id: currentSystemId || generateId(),
        data: {
          ...formData,
          power: formOutputData.power,
          hybridPower: formOutputData.hybridPower,
        },
        barNumber: null,
      };

      // Update the systems array
      const currentSystems = shipData.system?.propulsionSystem || [];

      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map((system) =>
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState("system", {
          ...shipData.system,
          propulsionSystem: updatedSystems,
        });
        toast.success('Propulsion System Updated');
      } else {
        // Add new system
        updateComponentState("system", {
          ...shipData.system,
          propulsionSystem: [...currentSystems, systemData],
        });
        toast.success('Propulsion System Created');
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error("Propulsion System Edit Failed");
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Propulsion System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter propulsion system description",
                  }}
                />

                {/* Propulsion Mode Selection */}
                <div className="component-selection">
                  <label>Propulsion Mode</label>
                  <div className="button-group">
                    <button
                      type="button"
                      className={
                        formData.propulsionMode === "electric" ? "active" : ""
                      }
                      onClick={() => updateField("propulsionMode", "electric")}
                    >
                      Full Electric
                    </button>
                    <button
                      type="button"
                      className={
                        formData.propulsionMode === "hybrid" ? "active" : ""
                      }
                      onClick={() => updateField("propulsionMode", "hybrid")}
                    >
                      Hybrid
                    </button>
                    <button
                      type="button"
                      className={
                        formData.propulsionMode === "diesel" ? "active" : ""
                      }
                      onClick={() => updateField("propulsionMode", "diesel")}
                    >
                      Diesel
                    </button>
                  </div>
                </div>

                {/* Motor Selection (for Electric/Hybrid) */}
                {(formData.propulsionMode === "electric" ||
                  formData.propulsionMode === "hybrid") && (
                  <div className="component-selection">
                    <label>Electric Motor</label>
                    {formData.motor?.id ? (
                      <div className="selected-component">
                        <span>
                          {formData.motor.data?.description || "Selected Motor"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowComponentSelection("motor")}
                          className="change-btn"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("motor")}
                        className="select-btn"
                      >
                        Select Motor
                      </button>
                    )}
                  </div>
                )}

                {/* DC/AC Converter Selection (for Electric/Hybrid) */}
                {(formData.propulsionMode === "electric" ||
                  formData.propulsionMode === "hybrid") && (
                  <div className="component-selection">
                    <label>DC/AC Converter</label>
                    {formData.dcAcConverter?.id ? (
                      <div className="selected-component">
                        <span>
                          {formData.dcAcConverter.data?.description ||
                            "Selected DC/AC Converter"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowComponentSelection("dcAcConverter")
                          }
                          className="change-btn"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setShowComponentSelection("dcAcConverter")
                        }
                        className="select-btn"
                      >
                        Select DC/AC Converter
                      </button>
                    )}
                  </div>
                )}

                {/* Diesel Engine Selection (for Diesel/Hybrid) */}
                {(formData.propulsionMode === "diesel" ||
                  formData.propulsionMode === "hybrid") && (
                  <div className="component-selection">
                    <label>Diesel Engine</label>
                    {formData.dieselEngine?.id ? (
                      <div className="selected-component">
                        <span>
                          {formData.dieselEngine.data?.description ||
                            "Selected Diesel Engine"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowComponentSelection("dieselEngine")
                          }
                          className="change-btn"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setShowComponentSelection("dieselEngine")
                        }
                        className="select-btn"
                      >
                        Select Diesel Engine
                      </button>
                    )}
                  </div>
                )}

                {/* Propulsion Device Selection */}
                <div className="component-selection">
                  <label>Propulsion Device</label>
                  <div className="button-group">
                    <button
                      type="button"
                      className={
                        formData.propulsionDevice === "gearBox" ? "active" : ""
                      }
                      onClick={() => updateField("propulsionDevice", "gearBox")}
                    >
                      Gear Box
                    </button>
                    <button
                      type="button"
                      className={
                        formData.propulsionDevice === "thrustBearing" ? "active" : ""
                      }
                      onClick={() =>
                        updateField("propulsionDevice", "thrustBearing")
                      }
                    >
                      Thrust Bearing
                    </button>
                  </div>
                </div>

                {/* Propulsor Type (conditional) */}
                {formData.propulsionDevice === "gearBox" &&
                  formData.propulsionMode === "electric" && (
                    <div className="component-selection">
                      <label>Propulsor Type</label>
                      <select
                        id="propulsorType"
                        value={formData.propulsorType}
                        onChange={(e) =>
                          updateField("propulsorType", e.target.value)
                        }
                      >
                        <option value="">Select Propulsor</option>
                        <option value="Shaft Propeller">Shaft Propeller</option>
                        <option value="Azimuth CRP">Azimuth CRP</option>
                        <option value="Azimuth Duct P">Azimuth Duct P</option>
                        <option value="Azimuth Open P">Azimuth Open P</option>
                      </select>
                    </div>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!hasChanges}
                >
                  {isEditMode ? "Update" : "Create"} Propulsion System
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
            {showComponentSelection === "motor" && (
              <ChildComponentSelection
                type="motor"
                selectedComponent={formData.motor}
                setSelectedComponent={(val) => updateField("motor", val)}
                currentComponent={isEditMode ? originalFormData.motor : null}
              />
            )}

            {showComponentSelection === "dieselEngine" && (
              <ChildComponentSelection
                type="dieselEngine"
                selectedComponent={formData.dieselEngine}
                setSelectedComponent={(val) => updateField("dieselEngine", val)}
                currentComponent={
                  isEditMode ? originalFormData.dieselEngine : null
                }
              />
            )}

            {showComponentSelection === "dcAcConverter" && (
              <ChildComponentSelection
                type="dcAcConverter"
                selectedComponent={formData.dcAcConverter}
                setSelectedComponent={(val) =>
                  updateField("dcAcConverter", val)
                }
                currentComponent={
                  isEditMode ? originalFormData.dcAcConverter : null
                }
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
                      <dt>Propulsion Power (kW):</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} kW`
                          : "N/A"}
                      </dd>
                    </dl>

                    {formData.propulsionMode === "hybrid" &&
                      formOutputData.hybridPower && (
                        <>
                          <dl className="calc-item">
                            <dt>Electric Motor Power (kW):</dt>
                            <dd>
                              {formOutputData.hybridPower.motor
                                ? `${formOutputData.hybridPower.motor.toFixed(
                                    2
                                  )} kW`
                                : "N/A"}
                            </dd>
                          </dl>
                          <dl className="calc-item">
                            <dt>Diesel Engine Power (kW):</dt>
                            <dd>
                              {formOutputData.hybridPower.diesel
                                ? `${formOutputData.hybridPower.diesel.toFixed(
                                    2
                                  )} kW`
                                : "N/A"}
                            </dd>
                          </dl>
                        </>
                      )}
                  </div>
                </>
              );

            case "motor":
              return (
                <>
                  <h3>Motor Selection</h3>
                  {formData.motor?.data ? (
                    <ComponentDataDisplay
                      type="motor"
                      data={formData.motor.data}
                      outputData={formData.motor?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a motor from the options on the left to
                        see its specifications.
                      </p>
                    </div>
                  )}
                </>
              );

            case "dieselEngine":
              return (
                <>
                  <h3>Diesel Engine Selection</h3>
                  {formData.dieselEngine?.data ? (
                    <ComponentDataDisplay
                      type="dieselEngine"
                      data={formData.dieselEngine.data}
                      outputData={formData.dieselEngine?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a diesel engine from the options on the left to
                        see its specifications.
                      </p>
                    </div>
                  )}
                </>
              );

            case "dcAcConverter":
              return (
                <>
                  <h3>DC/AC Converter Selection</h3>
                  {formData.dcAcConverter?.data ? (
                    <ComponentDataDisplay
                      type="dcAcConverter"
                      data={formData.dcAcConverter.data}
                      outputData={formData.dcAcConverter?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a DC/AC converter from the options on the left to
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

export default PropulsionSystem;