import { useState, useEffect } from "react";
import { useUrlNavigation } from "../../hooks/useUrlNavigation";
import SystemDisplay from "./systemComponents/SystemDisplay";
import batteryIcon from "../../assets/images/Icons/battery.svg";
import propulsionIcon from "../../assets/images/Icons/propulsion.svg";
import shoreConnectionIcon from "../../assets/images/Icons/shoreconnection.svg";
import auxiliaryPowerIcon from "../../assets/images/Icons/auxiliarypower.svg";
import hotelSupplyIcon from "../../assets/images/Icons/hotelsupply.svg";
import otherLoadIcon from "../../assets/images/Icons/otherload.svg";
import electricConverterIcon from "../../assets/images/Icons/electricconverter.svg";
import generatorIcon from "../../assets/images/Icons/Sygenerator.svg";

function SystemComponent() {
  const { urlState, updateUrl } = useUrlNavigation();

  // Get state from URL instead of local state
  const activeSystemSection = urlState.systemType;
  const isEditingSystem = urlState.isEditingSystem;

  const categoryIcons = {
    Battery: batteryIcon,
    Propulsion: propulsionIcon,
    "Shore Connection": shoreConnectionIcon,
    "Auxiliary Power": auxiliaryPowerIcon,
    "Hotel Supply": hotelSupplyIcon,
    "Other Load": otherLoadIcon,
    "Electric Converter": electricConverterIcon,
    Generator: generatorIcon,
  };

  const systemSections = [
    {
      id: "batterySystem",
      name: "BATTERY",
      type: "Producing",
    },
    {
      id: "shorePowerSystem",
      name: "SHORE CONNECTION",
      type: "Producing",
    },
    {
      id: "propulsionSystem",
      name: "PROPULSION",
      type: "Consumption",
    },
    {
      id: "auxiliaryPowerUnitSystem",
      name: "AUXILIARY POWER UNIT",
      type: "Producing",
    },
    {
      id: "generatorGroupSystem",
      name: "GENERATOR",
      type: "Producing",
    },
    {
      id: "hotelLoadSystem",
      name: "HOTEL LOAD",
      type: "Consumption",
    },
    {
      id: "otherLoadSystem",
      name: "OTHER LOAD",
      type: "Consumption",
    },
  ];

  // Handle system section click
  const handleSystemSectionClick = (sectionId) => {
    updateUrl({
      ...urlState,
      systemType: sectionId,
      isEditingSystem: false,
      editingSystemId: "",
    });
  };

  // Handle back to main
  const handleBackToMain = () => {
    updateUrl({
      ...urlState,
      systemType: "",
      isEditingSystem: false,
      editingSystemId: "",
    });
  };

  const renderSystemComponents = () => {
    if (!activeSystemSection) return null;

    return <SystemDisplay type={activeSystemSection} />;
  };

  const renderProducingButtons = () => {
    return systemSections
      .filter((section) => section.type === "Producing")
      .map((section) => {
        // Map section names to categoryIcons keys
        let iconKey = "";
        switch (section.name) {
          case "BATTERY":
            iconKey = "Battery";
            break;
          case "SHORE CONNECTION":
            iconKey = "Shore Connection";
            break;
          case "AUXILIARY POWER UNIT":
            iconKey = "Auxiliary Power";
            break;
          case "GENERATOR":
            iconKey = "Generator";
            break;
          default:
            iconKey = "";
        }

        return (
          <div key={section.id} className="system-button-container">
            <button
              className="system-icon-button producing"
              onClick={() => handleSystemSectionClick(section.id)}
            >
              {categoryIcons[iconKey] && (
                <img src={categoryIcons[iconKey]} alt={section.name} />
              )}
            </button>
            <div className="system-button-label">{section.name}</div>
          </div>
        );
      });
  };

  const renderConsumptionButtons = () => {
    return systemSections
      .filter((section) => section.type === "Consumption")
      .map((section) => {
        // Map section names to categoryIcons keys
        let iconKey = "";
        switch (section.name) {
          case "PROPULSION":
            iconKey = "Propulsion";
            break;
          case "HOTEL LOAD":
            iconKey = "Hotel Supply";
            break;
          case "OTHER LOAD":
            iconKey = "Other Load";
            break;
          default:
            iconKey = "";
        }

        return (
          <div key={section.id} className="system-button-container">
            <button
              className="system-icon-button consumption"
              onClick={() => handleSystemSectionClick(section.id)}
            >
              {categoryIcons[iconKey] && (
                <img src={categoryIcons[iconKey]} alt={section.name} />
              )}
            </button>
            <div className="system-button-label">{section.name}</div>
          </div>
        );
      });
  };

  return (
    <div className="system">
      <div className="general-system-display">
        <div className="left-panel">
          {!activeSystemSection && (
            <>
              <h2>System Setting</h2>

              <div className="input-field">
                <div className="system-block">
                  <h3>Producing Power Systems</h3>
                  <div className="system-button-grid">
                    {renderProducingButtons()}
                  </div>
                </div>

                <div className="system-block">
                  <h3>Consumption Power Systems</h3>
                  <div className="system-button-grid">
                    {renderConsumptionButtons()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeSystemSection && renderSystemComponents()}
    </div>
  );
}

export default SystemComponent;
