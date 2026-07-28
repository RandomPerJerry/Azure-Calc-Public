import React, { useState, useMemo, useEffect } from "react";
import { otherLoadPowerCal } from '../../../calculations/otherLoadCal';
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultOtherLoadSystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function OtherLoadSystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId = new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultOtherLoadSystemData);
  const [originalFormData, setOriginalFormData] = useState(defaultOtherLoadSystemData);

  const [formOutputData, setFormOutputData] = useState({
    power: null
  });

  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");
  const isEditMode = !!currentSystemId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      dcAcConverter: currentDcAcConverter,
      otherLoadUnit: currentOtherLoadUnit,
      ...currentPrimitiveData
    } = formData;
    const {
      dcAcConverter: originalDcAcConverter,
      otherLoadUnit: originalOtherLoadUnit,
      ...originalPrimitiveData
    } = originalFormData;

    const dcAcConverterChanged =
      currentDcAcConverter?.id !== originalDcAcConverter?.id ||
      currentDcAcConverter?.version !== originalDcAcConverter?.version;

    const otherLoadUnitChanged =
      currentOtherLoadUnit?.id !== originalOtherLoadUnit?.id ||
      currentOtherLoadUnit?.version !== originalOtherLoadUnit?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return dcAcConverterChanged || otherLoadUnitChanged || restChanged;
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;
    
    const existingSystem = shipData.system?.otherLoadSystem?.find(
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
    const power = otherLoadPowerCal(formData.otherLoadUnit);

    setFormOutputData({
      power
    });
  }, [formData.otherLoadUnit?.id, formData.otherLoadUnit?.version]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.dcAcConverter?.id ||
      !formData.otherLoadUnit?.id
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
      const currentSystems = shipData.system?.otherLoadSystem || [];
      
      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map(system => 
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState('system', {
          ...shipData.system,
          otherLoadSystem: updatedSystems
        });
        toast.success('Other Load System Updated');
      } else {
        // Add new system
        updateComponentState('system', {
          ...shipData.system,
          otherLoadSystem: [...currentSystems, systemData]
        });
        toast.success('Other Load System Created');
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error("Other Load System Edit Failed");
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Other Load System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter other load system description",
                  }}
                />

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

                {/* Other Load Unit Selection */}
                <div className="component-selection">
                  <label>Other Load Unit</label>
                  {formData.otherLoadUnit?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.otherLoadUnit.data?.description ||
                          "Selected Other Load Unit"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("otherLoadUnit")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("otherLoadUnit")}
                      className="select-btn"
                    >
                      Select Other Load Unit
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
                  {isEditMode ? "Update" : "Create"} Other Load System
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
            
            {showComponentSelection === "otherLoadUnit" && (
              <ChildComponentSelection
                type="otherLoadUnit"
                selectedComponent={formData.otherLoadUnit}
                setSelectedComponent={(val) => updateField("otherLoadUnit", val)}
                currentComponent={
                  isEditMode ? originalFormData.otherLoadUnit : null
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
                      <dt>Other Load Power (kW):</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} kW`
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
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

            case "otherLoadUnit":
              return (
                <>
                  <h3>Other Load Unit Selection</h3>
                  {formData.otherLoadUnit?.data ? (
                    <ComponentDataDisplay
                      type="otherLoadUnit"
                      data={formData.otherLoadUnit.data}
                      outputData={formData.otherLoadUnit?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select an other load unit from the options on the left to
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

export default OtherLoadSystem;
