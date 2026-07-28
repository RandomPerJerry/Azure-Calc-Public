import React, { useState, useMemo, useEffect } from "react";
import { generatorPowerCal } from '../../../calculations/generatorCal';
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultGeneratorSystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function GeneratorSystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId = new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultGeneratorSystemData);
  const [originalFormData, setOriginalFormData] = useState(defaultGeneratorSystemData);

  const [formOutputData, setFormOutputData] = useState({
    power: null
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

    return motorChanged || dieselEngineChanged || dcAcConverterChanged || restChanged;
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;
    
    const existingSystem = shipData.system?.generatorGroupSystem?.find(
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
    const power = generatorPowerCal(
      formData.dieselEngine, 
      formData.motor, 
    );

    setFormOutputData({
      power
    });
  }, [formData.dieselEngine?.id, formData.dieselEngine?.version, formData.motor?.id, formData.motor?.version]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.motor?.id ||
      !formData.dieselEngine?.id ||
      !formData.dcAcConverter?.id
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
        barNumber: null
      };

      // Update the systems array
      const currentSystems = shipData.system?.generatorGroupSystem || [];
      
      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map(system => 
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState('system', {
          ...shipData.system,
          generatorGroupSystem: updatedSystems
        });
        toast.success('Generator System Updated');
      } else {
        // Add new system
        updateComponentState('system', {
          ...shipData.system,
          generatorGroupSystem: [...currentSystems, systemData]
        });
        toast.success('Generator System Created');
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error("Generator System Edit Failed")
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Generator System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter generator system description",
                  }}
                />

                {/* Motor Selection */}
                <div className="component-selection">
                  <label>Motor</label>
                  {formData.motor?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.motor.data?.description ||
                          "Selected Motor"}
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

                {/* Diesel Engine Selection */}
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
                        onClick={() => setShowComponentSelection("dieselEngine")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("dieselEngine")}
                      className="select-btn"
                    >
                      Select Diesel Engine
                    </button>
                  )}
                </div>

                {/* DC/AC Converter Selection */}
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
                        onClick={() => setShowComponentSelection("dcAcConverter")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("dcAcConverter")}
                      className="select-btn"
                    >
                      Select DC/AC Converter
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
                  {isEditMode ? "Update" : "Create"} Generator System
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
                currentComponent={
                  isEditMode ? originalFormData.motor : null
                }
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
                setSelectedComponent={(val) => updateField("dcAcConverter", val)}
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
                      <dt>Generator Power (kW):</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} kW`
                          : "N/A"}
                      </dd>
                    </dl>
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

export default GeneratorSystem;
