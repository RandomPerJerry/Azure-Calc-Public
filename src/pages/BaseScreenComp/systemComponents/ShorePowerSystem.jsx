import React, { useState, useMemo, useEffect } from "react";
import { chargingPowerCal, connectorNumberCal } from '../../../calculations/shorePowerStationCal';
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultShorePowerSystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function ShorePowerSystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId = new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultShorePowerSystemData);
  const [originalFormData, setOriginalFormData] = useState(defaultShorePowerSystemData);

  const [formOutputData, setFormOutputData] = useState({
    power: null,
    connectorNumber: null
  });

  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");
  const isEditMode = !!currentSystemId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      shorePowerStation: currentShorePowerStation,
      dcAcConverter: currentDcAcConverter,
      ...currentPrimitiveData
    } = formData;
    const {
      shorePowerStation: originalShorePowerStation,
      dcAcConverter: originalDcAcConverter,
      ...originalPrimitiveData
    } = originalFormData;

    const shorePowerStationChanged =
      currentShorePowerStation?.id !== originalShorePowerStation?.id ||
      currentShorePowerStation?.version !== originalShorePowerStation?.version;

    const dcAcConverterChanged =
      currentDcAcConverter?.id !== originalDcAcConverter?.id ||
      currentDcAcConverter?.version !== originalDcAcConverter?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return shorePowerStationChanged || dcAcConverterChanged || restChanged;
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;
    
    const existingSystem = shipData.system?.shorePowerSystem?.find(
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
    const power = chargingPowerCal(formData.shorePowerStation);
    const connectorNumber = connectorNumberCal(formData.shorePowerStation);

    setFormOutputData({
      power,
      connectorNumber
    });
  }, [formData.shorePowerStation?.id, formData.shorePowerStation?.version]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.shorePowerStation?.id ||
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
      const currentSystems = shipData.system?.shorePowerSystem || [];
      
      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map(system => 
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState('system', {
          ...shipData.system,
          shorePowerSystem: updatedSystems
        });
        toast.success('Shore Power System Updated');
      } else {
        // Add new system
        updateComponentState('system', {
          ...shipData.system,
          shorePowerSystem: [...currentSystems, systemData]
        });
        toast.success('Shore Power System Created');
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error("Shore Power System Edit Failed");
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Shore Power System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter shore power system description",
                  }}
                />

                {/* Shore Power Station Selection */}
                <div className="component-selection">
                  <label>Shore Power Station</label>
                  {formData.shorePowerStation?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.shorePowerStation.data?.description ||
                          "Selected Shore Power Station"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("shorePowerStation")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("shorePowerStation")}
                      className="select-btn"
                    >
                      Select Shore Power Station
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
                  {isEditMode ? "Update" : "Create"} Shore Power System
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
            {showComponentSelection === "shorePowerStation" && (
              <ChildComponentSelection
                type="shorePowerStation"
                selectedComponent={formData.shorePowerStation}
                setSelectedComponent={(val) => updateField("shorePowerStation", val)}
                currentComponent={
                  isEditMode ? originalFormData.shorePowerStation : null
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
                      <dt>Shore Power (kW):</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} kW`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Connector Number:</dt>
                      <dd>
                        {formOutputData.connectorNumber
                          ? formOutputData.connectorNumber
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </>
              );

            case "shorePowerStation":
              return (
                <>
                  <h3>Shore Power Station Selection</h3>
                  {formData.shorePowerStation?.data ? (
                    <ComponentDataDisplay
                      type="shorePowerStation"
                      data={formData.shorePowerStation.data}
                      outputData={formData.shorePowerStation?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a shore power station from the options on the left to
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

export default ShorePowerSystem;