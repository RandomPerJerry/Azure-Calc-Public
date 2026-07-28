import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useUserForm from "../../hooks/useUserForm";
import updateWithTruthyValues from "../../utils/updateWithTruthValues";
import DataInput from "../../components/DataInput";
import ChildComponentSelection from "../../components/ChildComponentSelection";
import ComponentDataDisplay from "../../components/ComponentDataDisplay";
import deepEqual from "../../utils/objectComp";
import {
  stringChargingCurrentCal,
  stringDischargingCurrentCal,
  soc100VolCal,
  soc20VolCal,
  stringPowerCal,
} from "../../calculations/batteryCal";
import cleanFormData from "../../utils/clearFormData";
import { toast } from "react-toastify";

function BatteryStringPage() {
  // Hooks
  const { getComponent, createComponent, saveComponent } = useUserForm();
  const { id: currentComponentId } = useParams();
  const navigate = useNavigate();

  // Input fields
  const [formData, setFormData] = useState({
    // Required
    batteryPack: {},
    stringController: {},
    gridLayout: JSON.stringify(
      Array(6)
        .fill()
        .map(() => Array(8).fill(0))
    ),
    description: "",
    // Optional
    manfactureName: "",
    modelName: "",
    price: "",
  });

  const [originalFormData, setOriginalFormData] = useState({
    // Required
    batteryPack: {},
    stringController: {},
    gridLayout: JSON.stringify(
      Array(6)
        .fill()
        .map(() => Array(8).fill(0))
    ),
    description: "",
    // Optional
    manfactureName: "",
    modelName: "",
    price: "",
  });

  // Calculated outputs
  const [formOutputData, setFormOutputData] = useState({
    stringPower: null,
    soc100Vol: null,
    soc20Vol: null,
    stringChargingCurrent: null,
    stringDischargingCurrent: null,
  });

  // UI State
  const [inputMode, setInputMode] = useState("required");
  const [error, setError] = useState("");
  const [showComponentSelection, setShowComponentSelection] = useState("none");

  // Grid layout derived state
  const [selectedItem, setSelectedItem] = useState(1);

  // Parse grid layout from formData
  const gridLayout = useMemo(() => {
    try {
      return JSON.parse(formData.gridLayout);
    } catch {
      return Array(6)
        .fill()
        .map(() => Array(8).fill(0));
    }
  }, [formData.gridLayout]);

  // Calculate counts from grid layout
  const { batteryPackCount, controllerPlaced } = useMemo(() => {
    let packs = 0;
    let controller = false;

    gridLayout.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) packs++;
        if (cell === 2) controller = true;
      });
    });

    return { batteryPackCount: packs, controllerPlaced: controller };
  }, [gridLayout]);

  // Component IDs
  const isEditMode = !!currentComponentId;

  // Field update function
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Change detection
  const hasChanges = useMemo(() => {
    if (!isEditMode) return true;

    const {
      batteryPack: currentBatteryPack,
      stringController: currentStringController,
      ...currentPrimitiveData
    } = formData;
    const {
      batteryPack: originalBatteryPack,
      stringController: originalStringController,
      ...originalPrimitiveData
    } = originalFormData;
    const batteryPackChanged =
      currentBatteryPack?.id !== originalBatteryPack?.id ||
      currentBatteryPack?.version !== originalBatteryPack?.version;

    const stringControllerChanged =
      currentStringController?.id !== originalStringController?.id ||
      currentStringController?.version !== originalStringController?.version;

    const restChanged = !deepEqual(currentPrimitiveData, originalPrimitiveData);

    return restChanged || batteryPackChanged || stringControllerChanged;
  }, [formData, originalFormData]);

  // Edit Component
  useEffect(() => {
    if (!isEditMode || !currentComponentId) return;
    const existingComponent = getComponent("batteryString", currentComponentId);

    if (!existingComponent?.data) {
      toast.error('Component Not Found');
      navigate("/home");
      return;
    }

    const updatedData = updateWithTruthyValues(
      formData,
      existingComponent.data
    );
    setFormData(updatedData);
    setOriginalFormData(updatedData);
  }, [isEditMode, currentComponentId]);

  // All calculations in one useEffect
  useEffect(() => {
    const power = stringPowerCal(batteryPackCount, formData.batteryPack);
    const soc100Vol = soc100VolCal(batteryPackCount, formData.batteryPack);
    const soc20Vol = soc20VolCal(batteryPackCount, formData.batteryPack);
    const chargingCurrent = stringChargingCurrentCal(formData.batteryPack);
    const dischargingCurrent = stringDischargingCurrentCal(
      formData.batteryPack
    );

    setFormOutputData({
      stringPower: power,
      soc100Vol: soc100Vol,
      soc20Vol: soc20Vol,
      stringChargingCurrent: chargingCurrent,
      stringDischargingCurrent: dischargingCurrent,
    });
  }, [formData.batteryPack, batteryPackCount]);

  // Grid functions
  const handleCellClick = (rowIndex, colIndex) => {
    const newGrid = JSON.parse(JSON.stringify(gridLayout));
    const currentValue = newGrid[rowIndex][colIndex];

    if (currentValue === selectedItem) {
      newGrid[rowIndex][colIndex] = 0;
    } else {
      if (selectedItem === 1 && batteryPackCount < 14) {
        newGrid[rowIndex][colIndex] = 1;
      } else if (selectedItem === 2 && !controllerPlaced) {
        newGrid[rowIndex][colIndex] = 2;
      }
    }

    updateField("gridLayout", JSON.stringify(newGrid));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.description ||
      !formData.batteryPack?.id ||
      !formData.stringController?.id
    ) {
      setError("Please fill in all required fields and select components");
      return;
    }

    if (batteryPackCount === 0) {
      setError("Please place at least one battery pack in the grid");
      return;
    }

    if (!controllerPlaced) {
      setError("Please place the string controller in the grid");
      return;
    }

    // Convert empty strings to undefined
    const cleanedData = cleanFormData(formData);

    try {
      if (isEditMode) {
        saveComponent(
          "batteryString",
          currentComponentId,
          cleanedData,
          formOutputData
        );
        toast.success('Battery String Updated');  
      } else {
        createComponent("batteryString", cleanedData, formOutputData);
        toast.success('Battery String Created');
      }
      navigate("/home");
    } catch (err) {
      setError(err.message || "Error saving component. Please try again.");
      toast.error('Battery String Edit Failed');
    }
  };

  return (
    <div className="page">
      <div className="left">
        {showComponentSelection === "none" ? (
          <>
            <h2>Battery String</h2>
            <form onSubmit={handleSubmit} noValidate>
              {/* Tab Navigation */}
              <div className="mode-select">
                <button
                  type="button"
                  className={`tab-button ${
                    inputMode === "required" ? "active" : ""
                  }`}
                  onClick={() => setInputMode("required")}
                >
                  Required
                </button>
                <button
                  type="button"
                  className={`tab-button ${
                    inputMode === "optional" ? "active" : ""
                  }`}
                  onClick={() => setInputMode("optional")}
                >
                  Optional
                </button>
              </div>

              {/* Required Fields */}
              {inputMode === "required" && (
                <div className="input-field">
                  {/* Battery Pack Selection */}
                  <div className="component-selection">
                    <label>Battery Pack</label>
                    {formData.batteryPack?.id ? (
                      <div className="selected-component">
                        <span>
                          {formData.batteryPack.data?.description ||
                            "Selected Battery Pack"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowComponentSelection("batteryPack")
                          }
                          className="change-btn"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowComponentSelection("batteryPack")}
                        className="select-btn"
                      >
                        Select Battery Pack
                      </button>
                    )}
                  </div>

                  {/* String Controller Selection */}
                  <div className="component-selection">
                    <label>String Controller</label>
                    {formData.stringController?.id ? (
                      <div className="selected-component">
                        <span>
                          {formData.stringController.data?.description ||
                            "Selected String Controller"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setShowComponentSelection("stringController")
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
                          setShowComponentSelection("stringController")
                        }
                        className="select-btn"
                      >
                        Select String Controller
                      </button>
                    )}
                  </div>

                  {/* Grid Layout */}
                  <div className="layout-configuration">
                    <label>String Layout Configuration</label>
                    <div className="placement-controls">
                      <div>
                        <input
                          type="radio"
                          id="place-battery"
                          name="place-item"
                          checked={selectedItem === 1}
                          onChange={() => setSelectedItem(1)}
                        />
                        <label htmlFor="place-battery">
                          Place Battery Pack ({batteryPackCount}/14)
                        </label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          id="place-controller"
                          name="place-item"
                          checked={selectedItem === 2}
                          onChange={() => setSelectedItem(2)}
                        />
                        <label htmlFor="place-controller">
                          Place String Controller{" "}
                          {controllerPlaced ? "(Placed)" : ""}
                        </label>
                      </div>
                    </div>

                    <div className="grid-container">
                      {gridLayout.map((row, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="grid-row"
                          style={{ display: "flex" }}
                        >
                          {row.map((cell, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              onClick={() =>
                                handleCellClick(rowIndex, colIndex)
                              }
                              style={{
                                width: "30px",
                                height: "30px",
                                border: "1px solid #ccc",
                                backgroundColor:
                                  cell === 0
                                    ? "white"
                                    : cell === 1
                                    ? "lightblue"
                                    : "lightgreen",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {cell === 1 ? "B" : cell === 2 ? "C" : ""}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div
                      className="grid-legend"
                      style={{ marginBottom: "15px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "15px",
                            backgroundColor: "lightblue",
                            marginRight: "5px",
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>Battery Pack</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "15px",
                            backgroundColor: "lightgreen",
                            marginRight: "5px",
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>
                          String Controller
                        </span>
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
              {inputMode === "optional" && (
                <div className="input-field">
                  <DataInput
                    type="number"
                    data={formData.price}
                    setData={(value) => updateField("price", value)}
                    options={{ label: "Price", min: 0 }}
                  />

                  <DataInput
                    type="string"
                    data={formData.manfactureName}
                    setData={(value) => updateField("manfactureName", value)}
                    options={{ label: "Manufacturer" }}
                  />

                  <DataInput
                    type="string"
                    data={formData.modelName}
                    setData={(value) => updateField("modelName", value)}
                    options={{ label: "Model Name" }}
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
                  {isEditMode ? "Update" : "Create"} Battery String
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
        ) : (
          // Component Selection Views
          <>
            {showComponentSelection === "batteryPack" && (
              <ChildComponentSelection
                type="batteryPack"
                selectedComponent={formData.batteryPack}
                setSelectedComponent={(val) => updateField("batteryPack", val)}
                currentComponent={
                  isEditMode ? originalFormData.batteryPack : null
                }
              />
            )}

            {showComponentSelection === "stringController" && (
              <ChildComponentSelection
                type="stringController"
                selectedComponent={formData.stringController}
                setSelectedComponent={(val) =>
                  updateField("stringController", val)
                }
                currentComponent={
                  isEditMode ? originalFormData.stringController : null
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
      <div className="right">
        {(() => {
          switch (showComponentSelection) {
            case "none":
              return (
                <>
                  <h3>Calculated Values</h3>
                  <div className="calculations">
                    <dl className="calc-item">
                      <dt>String Power:</dt>
                      <dd>
                        {formOutputData.stringPower !== null
                          ? `${formOutputData.stringPower.toFixed(2)} kWh`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>SOC 100%:</dt>
                      <dd>
                        {formOutputData.soc100Vol !== null
                          ? `${formOutputData.soc100Vol.toFixed(2)} V`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>SOC 20%:</dt>
                      <dd>
                        {formOutputData.soc20Vol !== null
                          ? `${formOutputData.soc20Vol.toFixed(2)} V`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Charging Current:</dt>
                      <dd>
                        {formOutputData.stringChargingCurrent !== null
                          ? `${formOutputData.stringChargingCurrent.toFixed(
                              2
                            )} A`
                          : "N/A"}
                      </dd>
                    </dl>

                    <dl className="calc-item">
                      <dt>Discharging Current:</dt>
                      <dd>
                        {formOutputData.stringDischargingCurrent !== null
                          ? `${formOutputData.stringDischargingCurrent.toFixed(
                              2
                            )} A`
                          : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </>
              );

            case "batteryPack":
              return (
                <>
                  <h3>Battery Pack Selection</h3>
                  {formData.batteryPack?.data ? (
                    <ComponentDataDisplay
                      type="batteryPack"
                      data={formData.batteryPack?.data}
                      outputData={formData.batteryPack?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a battery pack from the options on the left to
                        see its specifications.
                      </p>
                    </div>
                  )}
                </>
              );

            case "stringController":
              return (
                <>
                  <h3>String Controller Selection</h3>
                  {formData.stringController?.data ? (
                    <ComponentDataDisplay
                      type="stringController"
                      data={formData.stringController?.data}
                      outputData={formData.stringController?.output}
                    />
                  ) : (
                    <div className="selection-info">
                      <p>
                        Select a string controller from the options on the left
                        to see its specifications.
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

export default BatteryStringPage;
