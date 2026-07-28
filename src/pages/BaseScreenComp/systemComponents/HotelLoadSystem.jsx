import React, { useState, useMemo, useEffect } from "react";
import { hotelLoadPowerCal } from '../../../calculations/hotelLoadCal';
import useShipComponent from "../../../hooks/useShipComponent";
import { defaultHotelLoadSystemData } from "../../../utils/defaultSavedFormat";
import deepEqual from "../../../utils/objectComp";
import updateWithTruthyValues from "../../../utils/updateWithTruthValues";
import DataInput from "../../../components/DataInput";
import ChildComponentSelection from "../../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../../components/ComponentDataDisplay";
import generateId from "../../../utils/generateId";
import { toast } from "react-toastify";

function HotelLoadSystem({ onCancel }) {
  const { shipData, updateComponentState } = useShipComponent();
  const currentSystemId = new URLSearchParams(window.location.search).get("editingSystemId") || "";

  const [formData, setFormData] = useState(defaultHotelLoadSystemData);
  const [originalFormData, setOriginalFormData] = useState(defaultHotelLoadSystemData);

  const [formOutputData, setFormOutputData] = useState({
    power: null
  });

  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");
  const isEditMode = !!currentSystemId;

  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      hotelSupplyUnit: currentHotelSupplyUnit,
      transformer: currentTransformer,
      ...currentPrimitiveData
    } = formData;
    const {
      hotelSupplyUnit: originalHotelSupplyUnit,
      transformer: originalTransformer,
      ...originalPrimitiveData
    } = originalFormData;

    const hotelSupplyUnitChanged =
      currentHotelSupplyUnit?.id !== originalHotelSupplyUnit?.id ||
      currentHotelSupplyUnit?.version !== originalHotelSupplyUnit?.version;

    const transformerChanged =
      currentTransformer?.id !== originalTransformer?.id ||
      currentTransformer?.version !== originalTransformer?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return hotelSupplyUnitChanged || transformerChanged || restChanged;
  }, [formData, originalFormData, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load existing system data for editing
  useEffect(() => {
    if (!isEditMode || !currentSystemId) return;
    
    const existingSystem = shipData.system?.hotelLoadSystem?.find(
      (s) => s.id === currentSystemId
    );

    if (!existingSystem?.data) {
      toast.error('System Not Found')
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
    const power = hotelLoadPowerCal(formData.hotelSupplyUnit);

    setFormOutputData({
      power
    });
  }, [formData.hotelSupplyUnit?.id, formData.hotelSupplyUnit?.version]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.hotelSupplyUnit?.id ||
      !formData.transformer?.id
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
      const currentSystems = shipData.system?.hotelLoadSystem || [];
      
      if (isEditMode) {
        // Update existing system
        const updatedSystems = currentSystems.map(system => 
          system.id === currentSystemId ? systemData : system
        );
        updateComponentState('system', {
          ...shipData.system,
          hotelLoadSystem: updatedSystems
        });
        toast.success('Hotel Load System Updated')
      } else {
        // Add new system
        updateComponentState('system', {
          ...shipData.system,
          hotelLoadSystem: [...currentSystems, systemData]
        });
        toast.success('Hotel Load System Created')
      }

      onCancel(); // Close the form
    } catch (error) {
      setError("Failed to save system. Please try again.");
      toast.error('Hotel Load System Edit Failed');
      console.error("Error saving system:", error);
    }
  };

  return (
    <div className="system-edit">
      <div className="left-panel">
        {showComponentSelection === "none" ? (
          <>
            <h2>Hotel Load System</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                <DataInput
                  type="string"
                  data={formData.description}
                  setData={(val) => updateField("description", val)}
                  options={{
                    label: "Description",
                    required: true,
                    placeholder: "Enter hotel load system description",
                  }}
                />

                {/* Hotel Supply Unit Selection */}
                <div className="component-selection">
                  <label>Hotel Supply Unit</label>
                  {formData.hotelSupplyUnit?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.hotelSupplyUnit.data?.description ||
                          "Selected Hotel Supply Unit"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("hotelSupplyUnit")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("hotelSupplyUnit")}
                      className="select-btn"
                    >
                      Select Hotel Supply Unit
                    </button>
                  )}
                </div>

                {/* Transformer Selection */}
                <div className="component-selection">
                  <label>Transformer</label>
                  {formData.transformer?.id ? (
                    <div className="selected-component">
                      <span>
                        {formData.transformer.data?.description ||
                          "Selected Transformer"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("transformer")}
                        className="change-btn"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowComponentSelection("transformer")}
                      className="select-btn"
                    >
                      Select Transformer
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
                  {isEditMode ? "Update" : "Create"} Hotel Load System
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
            {showComponentSelection === "hotelSupplyUnit" && (
              <ChildComponentSelection
                type="hotelSupplyUnit"
                selectedComponent={formData.hotelSupplyUnit}
                setSelectedComponent={(val) => updateField("hotelSupplyUnit", val)}
                currentComponent={
                  isEditMode ? originalFormData.hotelSupplyUnit : null
                }
              />
            )}
            
            {showComponentSelection === "transformer" && (
              <ChildComponentSelection
                type="transformer"
                selectedComponent={formData.transformer}
                setSelectedComponent={(val) => updateField("transformer", val)}
                currentComponent={
                  isEditMode ? originalFormData.transformer : null
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
                      <dt>Hotel Load Power (kW):</dt>
                      <dd>
                        {formOutputData.power
                          ? `${formOutputData.power.toFixed(2)} kW`
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </>
              );

            case "hotelSupplyUnit":
              return (
                <>
                  <h3>Hotel Supply Unit Selection</h3>
                  {formData.hotelSupplyUnit?.data ? (
                    <ComponentDataDisplay
                      type="hotelSupplyUnit"
                      data={formData.hotelSupplyUnit.data}
                      outputData={formData.hotelSupplyUnit?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a hotel supply unit from the options on the left to
                        see its specifications.
                      </p>
                    </div>
                  )}
                </>
              );

            case "transformer":
              return (
                <>
                  <h3>Transformer Selection</h3>
                  {formData.transformer?.data ? (
                    <ComponentDataDisplay
                      type="transformer"
                      data={formData.transformer.data}
                      outputData={formData.transformer?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a transformer from the options on the left to
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

export default HotelLoadSystem;
