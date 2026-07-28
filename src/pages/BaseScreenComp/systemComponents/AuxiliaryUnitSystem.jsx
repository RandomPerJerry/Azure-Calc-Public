import React, { useState, useMemo, useEffect } from "react";
import { auxiliaryUnitPowerCal } from '../../../calculations/auxiliaryUnitCal';
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultAuxiliaryUnitSystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function AuxiliaryUnitSystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId = new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultAuxiliaryUnitSystemData);
  const [originalFormData, setOriginalFormData] = useState(defaultAuxiliaryUnitSystemData);

  const [formOutputData, setFormOutputData] = useState({
    power: null
  });

  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");
  const isEditMode = !!currentSystemId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      auxiliaryUnit: currentAuxiliaryUnit,
      dcAcConverter: currentDcAcConverter,
      ...currentPrimitiveData
    } = formData;
    const {
      auxiliaryUnit: originalAuxiliaryUnit,
      dcAcConverter: originalDcAcConverter,
      ...originalPrimitiveData
    } = originalFormData;

    const auxiliaryUnitChanged =
      currentAuxiliaryUnit?.id !== originalAuxiliaryUnit?.id ||
      currentAuxiliaryUnit?.version !== originalAuxiliaryUnit?.version;

    const dcAcConverterChanged =
      currentDcAcConverter?.id !== originalDcAcConverter?.id ||
      currentDcAcConverter?.version !== originalDcAcConverter?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return auxiliaryUnitChanged || dcAcConverterChanged || restChanged;
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;
    
    const existingSystem = shipData.system?.auxiliaryPowerUnitSystem?.find(
      (s) => s.id === currentSystemId
    );

    if (!existingSystem?.data) {
      toast.error("System Does Not Exist");
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
    const power = auxiliaryUnitPowerCal(formData.auxiliaryUnit);
    setFormOutputData({
      power
    });
  }, [formData.auxiliaryUnit?.id, formData.auxiliaryUnit?.version]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.auxiliaryUnit?.id ||
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
      const currentSystems = shipData.system?.auxiliaryPowerUnitSystem || [];
      
      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map(system => 
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState('system', {
          ...shipData.system,
          auxiliaryPowerUnitSystem: updatedSystems
        });
        toast.success("Auxiliary System Updated");
      } else {
        // Add new system
        updateComponentState('system', {
          ...shipData.system,
          auxiliaryPowerUnitSystem: [...currentSystems, systemData]
        });
        toast.success("Auxiliary System Created");
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error("Auxiliary System Edit Failed");
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Auxiliary Unit System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter auxiliary unit system description",
                  }}
                />

                {/* Auxiliary Unit Selection */}
                <div className="component-selection">
                  <label>Auxiliary Power Unit</label>
                  {formData.auxiliaryUnit?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.auxiliaryUnit.data?.description ||
                          "Selected Auxiliary Power Unit"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("auxiliaryUnit")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("auxiliaryUnit")}
                      className="select-btn"
                    >
                      Select Auxiliary Power Unit
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
                  {isEditMode ? "Update" : "Create"} Auxiliary Unit System
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
            {showComponentSelection === "auxiliaryUnit" && (
              <ChildComponentSelection
                type="auxiliaryPowerUnit"
                selectedComponent={formData.auxiliaryUnit}
                setSelectedComponent={(val) => updateField("auxiliaryUnit", val)}
                currentComponent={
                  isEditMode ? originalFormData.auxiliaryUnit : null
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
                      <dt>Auxiliary Power (kW):</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} kW`
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </>
              );

            case "auxiliaryUnit":
              return (
                <>
                  <h3>Auxiliary Power Unit Selection</h3>
                  {formData.auxiliaryUnit?.data ? (
                    <ComponentDataDisplay
                      type="auxiliaryPowerUnit"
                      data={formData.auxiliaryUnit.data}
                      outputData={formData.auxiliaryUnit?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select an auxiliary power unit from the options on the left to
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

export default AuxiliaryUnitSystem;