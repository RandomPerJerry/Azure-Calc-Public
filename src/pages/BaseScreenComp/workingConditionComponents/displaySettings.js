import React, { useState } from "react";
import PowerDistribution from "./powerDistribution/distributionDiagram";

const displatTypeMap = {
  powerDistribution: {
    name: "Ship Power Distribution Setting",
    Component: PowerDistribution
  },
  streamNavigation: { 
    name: "Stream Navigation Setting", 
    Component: null 
  },
  advancedWorking: {
    name: "Advanced Working Condition Setting",
    Component: null,
  },
};

function DisplaySettings({ conditionState, onConditionUpdate }) {
  const [displayType, setDisplayType] = useState("powerDistribution");

  const renderOutputSection = () => {
    const OutputComponent = displatTypeMap[displayType].Component;

    if (!OutputComponent) return <div>Component Under Development</div>;

    // No need to pass props - component will get data from context
    return <OutputComponent 
      conditionData={conditionState}
      onUpdate={onConditionUpdate}
    />
  }
  
  const displayOutputOptions = () => {
    return Object.keys(displatTypeMap).map((typeKey) => {
      const type = displatTypeMap[typeKey];
      return (
        <button
          key={typeKey}
          onClick={() => setDisplayType(typeKey)}
          className={displayType === typeKey ? "active" : ""}
        >
          {type.name}
        </button>
      );
    });
  };

  return (
    <div>
      <div className="option-display">
        {displayOutputOptions()}
      </div>
      {/* Add the output section rendering here */}
      <div className="output-container">
        {renderOutputSection()}
      </div>
    </div>
  )
}

export default DisplaySettings;
