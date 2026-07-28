import React, { useEffect, useState } from "react";
import useShipComponent from "../../../hooks/useShipComponent";
import { useUrlNavigation } from "../../../hooks/useUrlNavigation";
import BatterySystem from "./BatterySystem";
import ShorePowerSystem from "./ShorePowerSystem";
import PropulsionSystem from "./PropulsionSystem";
import AuxiliaryUnitSystem from "./AuxiliaryUnitSystem";
import GeneratorSystem from "./GeneratorSystem";
import HotelLoadSystem from "./HotelLoadSystem";
import OtherLoadSystem from "./OtherLoadSystem";
import editIcon from "../../../assets/images/Icons/edit.svg";
import removeIcon from "../../../assets/images/Icons/remove.svg";

/**
 * Child Component for system display. Parent: SystemComponent (System.jsx)
 *
 * @param {string} type - The type of system being displayed
 * @returns {JSX.Element} System Page Render
 */

function SystemDisplay({ type }) {
  const { shipData, updateComponentState } = useShipComponent();

  const { urlState, updateUrl } = useUrlNavigation();

  const systemsOfType = shipData.system?.[type] || [];
  const isEditingSystem = urlState.isEditingSystem;
  const editingSystemId = urlState.editingSystemId;

  // Get bus bar configuration from shipData
  const numberOfBusBars = shipData.busBar?.dcLinkNumber || 0;

  // Now these can safely use availableSystemForType
  const isCreatingSystem = isEditingSystem && !editingSystemId;
  const isModifyingSystem = isEditingSystem && editingSystemId;
  const modifyingSystemData = isModifyingSystem
    ? systemsOfType?.find((system) => system.id === editingSystemId)
    : null;

  // System type mapping for display labels
  const systemTypeMap = {
    batterySystem: { label: "Battery System", firestoreType: "battery-system" },
    shorePowerSystem: {
      label: "Shore Power System",
      firestoreType: "shore-power-system",
    },
    propulsionSystem: {
      label: "Propulsion System",
      firestoreType: "propulsion-system",
    },
    auxiliaryPowerUnitSystem: {
      label: "Auxiliary Power Unit System",
      firestoreType: "auxiliary-power-unit-system",
    },
    generatorGroupSystem: {
      label: "Generator Group System",
      firestoreType: "generator-group-system",
    },
    hotelLoadSystem: {
      label: "Hotel Load System",
      firestoreType: "hotel-load-system",
    },
    otherLoadSystem: {
      label: "Other Load System",
      firestoreType: "other-load-system",
    },
  };

  /**
   * Updates the system state
   * @param {Object[]} newState - Array of system objects that contains system info
   */
  const setState = (newState) => {
    updateComponentState("system", {
      ...shipData.system,
      [type]: newState,
    });
  };

  /**
   * Handle bus bar assignment change
   * @param {Object} system - The system object
   * @param {number} barNumber - The bus bar number (1-4)
   */
  const handleBoxChange = (system, barNumber) => {
    const targetBar = system.barNumber !== barNumber ? barNumber : null;

    setState(
      systemsOfType.map((s) => {
        if (s.id !== system.id) return s;

        return {
          ...s,
          barNumber: targetBar,
        };
      })
    );
  };

  /**
   * Delete a system
   * @param {string} systemId - The ID of the system to delete
   */
  const handleDeleteSystem = (systemId) => {
    setState(systemsOfType.filter((s) => s.id !== systemId));
  };

  // Function to get the appropriate system component based on type
  const getSystemComponent = (systemType) => {
    switch (systemType) {
      case "batterySystem":
        return BatterySystem;
      case "shorePowerSystem":
        return ShorePowerSystem;
      case "propulsionSystem":
        return PropulsionSystem;
      case "auxiliaryPowerUnitSystem":
        return AuxiliaryUnitSystem;
      case "generatorGroupSystem":
        return GeneratorSystem;
      case "hotelLoadSystem":
        return HotelLoadSystem;
      case "otherLoadSystem":
        return OtherLoadSystem;
      default:
        return BatterySystem;
    }
  };

  // Update button handlers to use URL
  const handleCreateNew = () => {
    updateUrl({
      ...urlState,
      isEditingSystem: true,
      editingSystemId: "",
    });
  };

  const handleEditSystem = (system) => {
    updateUrl({
      ...urlState,
      isEditingSystem: true,
      editingSystemId: system.id,
    });
  };

  const handleCancelEdit = () => {
    updateUrl({
      ...urlState,
      isEditingSystem: false,
      editingSystemId: "",
    });
  };

  const SystemComponent = getSystemComponent(type);

  /**
   * Render bus bar checkboxes based on configuration
   * @param {Object} system - The system object
   * @returns {JSX.Element[]} - Array of checkbox elements
   */
  const renderBusBarCheckboxes = (system) => {
    const checkboxes = [];

    for (let i = 1; i <= numberOfBusBars; i++) {
      checkboxes.push(
        <React.Fragment key={i}>
          <label className="bus-bar-label">{i}</label>
          <input
            type="checkbox"
            checked={system.barNumber === i}
            onChange={() => handleBoxChange(system, i)}
          />
        </React.Fragment>
      );
    }

    return checkboxes;
  };

  const renderSystemOptions = () => {
    if (!systemsOfType || systemsOfType.length === 0) {
      return (
        <div className="no-systems-message">
          <p>No systems created yet. Click "New" to create a system.</p>
        </div>
      );
    }

    return (
      <table className="systems-table">
        <thead>
          <tr>
            <th className="description-header">Description</th>
            <th className="power-header">Power (kW)</th>
            <th className="bus-bar-header">
              Bus Bar {numberOfBusBars > 0 && `(1-${numberOfBusBars})`}
            </th>
            <th className="edit-header">Edit</th>
            <th className="remove-header"></th>
          </tr>
        </thead>
        <tbody>
          {systemsOfType.map((system) => {
            if (!system.id) return null;

            return (
              <tr key={system.id} className="system-row">
                <td
                  className="description-cell"
                  title={system.data.description || "Unnamed System"}
                >
                  {system.data.description || "Unnamed System"}
                </td>

                <td
                  className="power-cell"
                  title={`${system.data?.power.toFixed(2) || "--"} kW`}
                >
                  {system.data?.power.toFixed(2) || "--"}
                </td>

                <td className="bus-bar-cell">
                  <div className="bus-bar-checkboxes">
                    {numberOfBusBars > 0 ? (
                      renderBusBarCheckboxes(system)
                    ) : (
                      <span className="configure-message">
                        Configure Bus Bar first
                      </span>
                    )}
                  </div>
                </td>

                <td className="edit-cell">
                  <button
                    onClick={() => handleEditSystem(system)}
                    className="edit-icon-btn"
                  >
                    <img src={editIcon} alt="Edit" />
                  </button>
                </td>

                <td className="remove-cell">
                  <button
                    onClick={() => handleDeleteSystem(system.id)}
                    className="remove-icon-btn"
                  >
                    <img src={removeIcon} alt="Remove" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="specific-system-display">
        {!isEditingSystem && (
          <div className="left-panel">
            <div className="section-header">
              <div className="header-with-line">
                <h2>{systemTypeMap[type]?.label || type}</h2>
              </div>
              <button onClick={handleCreateNew} className="new-button">
                <span className="arrow-icon">→</span> New
              </button>
            </div>

            {numberOfBusBars === 0 && (
              <div className="warning-message">
                <p className="warning-text">
                  Please configure Bus Bar settings before assigning systems
                  to bus bars.
                </p>
              </div>
            )}

            <div className="system-options-container">
              {renderSystemOptions()}
            </div>
          </div>
        )}
      </div>
      {isCreatingSystem && <SystemComponent onCancel={handleCancelEdit} />}

      {isModifyingSystem && (
        <SystemComponent
          editSystem={modifyingSystemData}
          onCancel={handleCancelEdit}
        />
      )}
    </>
  );
}

export default SystemDisplay;
