import React, { useState, useEffect } from "react";
import useUserForm from "../hooks/useUserForm";
import camelCaseToDisplayName from "../utils/camelCaseToDisplayName";

function ChildComponentSelection({
  type,
  selectedComponent,
  setSelectedComponent,
  currentComponent = null,
}) {
  const { appData } = useUserForm();
  const [availableComponents, setAvailableComponents] = useState([]);

  useEffect(() => {
    const componentsOfType = appData.componentLibrary[type];
    if (!componentsOfType || !Array.isArray(componentsOfType)) return;

    if (!currentComponent) {
      setAvailableComponents(componentsOfType);
      return;
    }

    const filteredComponent = componentsOfType.flatMap((component) => {
      if (
        component.id !== currentComponent.id ||
        component.version === currentComponent.version
      ) {
        return { ...component, selectionId: component.id };
      }

      const currentVersionComponent = {
        ...currentComponent,
        selectionId: `${component.id}/current`,
      };
      const newVersionComponent = {
        ...component,
        selectionId: `${component.id}/new`,
      };
      return [currentVersionComponent, newVersionComponent];
    });

    setAvailableComponents(filteredComponent);
  }, [
    type,
    setAvailableComponents,
    currentComponent,
    appData.componentLibrary,
  ]);

  return (
    <>
      <h2>{camelCaseToDisplayName(type)} Component Selection</h2>
      <div className="component-list">
        {availableComponents.map((component) => {
          const compSelectionId = component.selectionId;
          const isCurrent = currentComponent
            ? compSelectionId.includes("/current")
            : false;
          const isNew = currentComponent
            ? compSelectionId.includes("/new")
            : false;
          const { selectionId, ...cleanComponent } = component;
          const isSelected =
            selectedComponent?.id === component.id &&
            selectedComponent?.version === component.version;

          return (
            <button
              type="button"
              key={compSelectionId || component.id}
              className={`component-list-item ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedComponent(cleanComponent)}
            >
              <div className="radio-indicator">
                {isSelected && <div className="radio-dot"></div>}
              </div>
              <div className="component-label">
                {component.data.description}
                {isCurrent && <span className="version-tag">current</span>}
                {isNew && <span className="version-tag">latest</span>}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default ChildComponentSelection;
