import useShipComponent from "../../../../hooks/useShipComponent";

function EditPanel({
  distributionData,
  setDistributionData,
  type,
  systemId,
  onClose,
}) {
  const { getSystem } = useShipComponent();
  const systemList = distributionData[type];
  const currentSystem = systemList?.find((s) => s.id === systemId);
  const currentState = currentSystem ? currentSystem.systemState : systemList;

  if (!currentState) {
    return null;
  }

  const defaultPannel = (name) => {
    return (
      <div>
        <h1>{name}</h1>

        {systemList && systemList.length > 0 && (
          <div className="input-field">
            <table>
              <thead>
                <tr>
                  <th>System Name</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {systemList.map((systemItem) => {
                  const systemData = getSystem(systemItem.id);

                  return (
                    <tr key={systemItem.id}>
                      <td>{systemData.data.description}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={systemItem.systemState?.activate || false}
                          onChange={(e) => {
                            const updatedData = {
                              ...distributionData,
                              [type]: distributionData[type].map((system) =>
                                system.id === systemItem.id
                                  ? {
                                      ...system,
                                      systemState: {
                                        ...system.systemState,
                                        activate: e.target.checked,
                                      },
                                    }
                                  : system
                              ),
                            };
                            setDistributionData(updatedData);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case "propulsionSystem": {
        const currentSystemData = getSystem(systemId);

        switch (currentSystemData.data.propulsionMode) {
          case "electric":
            return (
              <div>
                <h1>{currentSystemData.data.description}</h1>
                <div className="input-field">
                  <div>
                    <label>
                      <input
                        type="number"
                        value={
                          currentSystem.systemState
                            .propulsionPowerDistribution || 0
                        }
                        onChange={(e) => {
                          const updatedData = {
                            ...distributionData,
                            [type]: distributionData[type].map((system) =>
                              system.id === currentSystem.id
                                ? {
                                    ...system,
                                    systemState: {
                                      ...system.systemState,
                                      propulsionPowerDistribution: Number(
                                        e.target.value
                                      ),
                                    },
                                  }
                                : system
                            ),
                          };
                          setDistributionData(updatedData);
                        }}
                      />
                      Propulsion Power Distribution
                    </label>
                  </div>
                </div>
              </div>
            );

          case "hybrid":
            const hybridModes = [
              { value: "Full Electric", label: "Full Electric" },
              { value: "Full Diesel", label: "Full Diesel" },
              { value: "Power Supply", label: "Power Supply" },
              { value: "Boost Mode", label: "Boost Mode" },
            ];

            return (
              <div>
                <h1>{currentSystemData.data.description}</h1>

                <div className="input-field">
                  <div>
                    <label>Power Mode</label>
                    <div className="button-group">
                      {hybridModes.map((mode) => (
                        <button
                          key={mode.value}
                          type="button"
                          className={
                            currentSystem?.systemState?.powerMode === mode.value
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            const updatedData = {
                              ...distributionData,
                              [type]: distributionData[type].map((system) =>
                                system.id === currentSystem.id
                                  ? {
                                      ...system,
                                      systemState: {
                                        ...system.systemState,
                                        powerMode: mode.value,
                                      },
                                    }
                                  : system
                              ),
                            };
                            setDistributionData(updatedData);
                          }}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Propulsion Power Distribution - available for all modes */}
                  <div>
                    <label>
                      Propulsion Power Distribution
                      <input
                        type="number"
                        value={
                          currentSystem?.systemState
                            ?.propulsionPowerDistribution || 0
                        }
                        onChange={(e) => {
                          const updatedData = {
                            ...distributionData,
                            [type]: distributionData[type].map((system) =>
                              system.id === currentSystem.id
                                ? {
                                    ...system,
                                    systemState: {
                                      ...system.systemState,
                                      propulsionPowerDistribution: Number(
                                        e.target.value
                                      ),
                                    },
                                  }
                                : system
                            ),
                          };
                          setDistributionData(updatedData);
                        }}
                      />
                    </label>
                  </div>

                  {/* Conditional controls based on power mode */}
                  {currentSystem?.systemState?.powerMode === "Power Supply" && (
                    <div>
                      <label>Diesel Power Supply</label>
                      <input
                        type="number"
                        value={
                          currentSystem?.systemState?.dieselPowerSupply || 0
                        }
                        onChange={(e) => {
                          const updatedData = {
                            ...distributionData,
                            [type]: distributionData[type].map((system) =>
                              system.id === currentSystem.id
                                ? {
                                    ...system,
                                    systemState: {
                                      ...system.systemState,
                                      dieselPowerSupply: Number(e.target.value),
                                    },
                                  }
                                : system
                            ),
                          };
                          setDistributionData(updatedData);
                        }}
                      />
                    </div>
                  )}

                  {currentSystem?.systemState?.powerMode === "Boost Mode" && (
                    <div>
                      <label>Burst Divide ({currentSystem?.systemState?.burstDivide}% Motor / {100 - currentSystem?.systemState?.burstDivide}% Diesel)</label>
                      <input
                        type="number"
                        value={currentSystem?.systemState?.burstDivide || 0}
                        onChange={(e) => {
                          const updatedData = {
                            ...distributionData,
                            [type]: distributionData[type].map((system) =>
                              system.id === currentSystem.id
                                ? {
                                    ...system,
                                    systemState: {
                                      ...system.systemState,
                                      burstDivide: Number(e.target.value),
                                    },
                                  }
                                : system
                            ),
                          };
                          setDistributionData(updatedData);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );

          case "diesel":
            return (
              <div>
                <h1>{currentSystemData.data.description}</h1>
                <div className="input-field">
                  <div>
                    <label>
                      <input
                        type="number"
                        value={
                          currentSystem?.systemState
                            ?.propulsionPowerDistribution || 0
                        }
                        onChange={(e) => {
                          const updatedData = {
                            ...distributionData,
                            [type]: distributionData[type].map((system) =>
                              system.id === currentSystem.id
                                ? {
                                    ...system,
                                    systemState: {
                                      ...system.systemState,
                                      propulsionPowerDistribution: Number(
                                        e.target.value
                                      ),
                                    },
                                  }
                                : system
                            ),
                          };
                          setDistributionData(updatedData);
                        }}
                      />
                      Propulsion Power Distribution
                    </label>
                  </div>
                </div>
              </div>
            );

          default:
            return (
              <div>
                <h1>{currentSystem.name}</h1>
                <p>Unknown propulsion mode</p>
              </div>
            );
        }
      }

      case "generatorGroupSystem": {
        const currentSystemData = getSystem(systemId);

        return (
          <div>
            <h1>{currentSystemData.data.description}</h1>
            <div className="input-field">
              <div>
                <label>Generator Power</label>
                <input
                  type="number"
                  value={currentSystem?.systemState?.generatorPower || 0}
                  onChange={(e) => {
                    const updatedData = {
                      ...distributionData,
                      [type]: distributionData[type].map((system) =>
                        system.id === currentSystem.id
                          ? {
                              ...system,
                              systemState: {
                                ...system.systemState,
                                generatorPower: Number(e.target.value),
                              },
                            }
                          : system
                      ),
                    };
                    setDistributionData(updatedData);
                  }}
                />
              </div>
            </div>
          </div>
        );
      }

      case "shorePowerSystem": {
        return (
          <div>
            <h1>Shore Power Connection</h1>

            {systemList && systemList.length > 0 && (
              <div className="input-field">
                <table>
                  <thead>
                    <tr>
                      <th>System Name</th>
                      <th>Active</th>
                      <th>Fuel Supplied (L/h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemList.map((systemItem) => {
                      const systemData = getSystem(systemItem.id);

                      return (
                        <tr key={systemItem.id}>
                          <td>{systemData.data.description}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={systemItem.systemState?.activate || false}
                              onChange={(e) => {
                                const updatedData = {
                                  ...distributionData,
                                  [type]: distributionData[type].map((system) =>
                                    system.id === systemItem.id
                                      ? {
                                          ...system,
                                          systemState: {
                                            ...system.systemState,
                                            activate: e.target.checked,
                                          },
                                        }
                                      : system
                                  ),
                                };
                                setDistributionData(updatedData);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={systemItem.systemState?.fuelSupplied ?? 0}
                              onChange={(e) => {
                                const updatedData = {
                                  ...distributionData,
                                  [type]: distributionData[type].map((system) =>
                                    system.id === systemItem.id
                                      ? {
                                          ...system,
                                          systemState: {
                                            ...system.systemState,
                                            fuelSupplied: Number(e.target.value),
                                          },
                                        }
                                      : system
                                  ),
                                };
                                setDistributionData(updatedData);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      }

      case "hotelLoadSystem":
        return defaultPannel("Hotel Load Connection");

      case "otherLoadSystem":
        // Combine otherLoadSystem and auxiliaryPowerUnitSystem
        const combinedSystems = [
          ...(distributionData.otherLoadSystem || []),
          ...(distributionData.auxiliaryPowerUnitSystem || [])
        ];

        return (
          <div>
            <h1>Others</h1>

            {combinedSystems && combinedSystems.length > 0 && (
              <div className="input-field">
                <table>
                  <thead>
                    <tr>
                      <th>System Name</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedSystems.map((systemItem) => {
                      const systemData = getSystem(systemItem.id);
                      // Determine which system type this item belongs to
                      const systemType = distributionData.otherLoadSystem?.find(s => s.id === systemItem.id) 
                        ? "otherLoadSystem" 
                        : "auxiliaryPowerUnitSystem";

                      return (
                        <tr key={systemItem.id}>
                          <td>{systemData.data.description}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={systemItem.systemState?.activate || false}
                              onChange={(e) => {
                                const updatedData = {
                                  ...distributionData,
                                  [systemType]: distributionData[systemType].map((system) =>
                                    system.id === systemItem.id
                                      ? {
                                          ...system,
                                          systemState: {
                                            ...system.systemState,
                                            activate: e.target.checked,
                                          },
                                        }
                                      : system
                                  ),
                                };
                                setDistributionData(updatedData);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <h1>Unknown system type</h1>
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      <div className="form-action">
      <button className='cancal-btn' onClick={onClose}>cancal</button>
      </div>
      
    </>
  );
}

export default EditPanel;
