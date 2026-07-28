import React, { useState, useMemo } from "react";
import useShipComponent from "../../hooks/useShipComponent";
import DataInput from "../../components/DataInput";
import useUserForm from "../../hooks/useUserForm";
import getSafeValue from "../../utils/getSafeValues";
import { calculateMultipleShipsCostAnalysis } from "../../utils/routeDataCalculations";
const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  CAD: "$",
  HKD: "HK$",
  RUB: "₽",
  SGD: "$",
  KRW: "₩",
};

function CostAnalysis() {
  const { appData } = useUserForm();
  const { shipData, updateComponentState } = useShipComponent();

  const costAnalysisData = getSafeValue(shipData.costAnalysis, {});
  const maxBarNumber = getSafeValue(shipData.busBar?.dcLinkNumber, 1)
  const dieselFuelCost = getSafeValue(costAnalysisData.dieselFuelCost);
  const shorePowerCost = getSafeValue(costAnalysisData.shorePowerCost);
  const serviceCost = getSafeValue(costAnalysisData.serviceCost);
  const selectedRouteId = getSafeValue(costAnalysisData.selectedRoutes, []);

  
  const [isComparing, setIsComparing] = useState(false);

  const selectedCurrency = appData.settings?.currency || "USD";
  const currencySymbol = currencySymbols[selectedCurrency] || "$";

  const routeData = useMemo(() => {
    const costSettings = {
      dieselFuelCost,
      shorePowerCost,
      serviceCost,
    };
    return calculateMultipleShipsCostAnalysis(
      appData.ships || [],
      maxBarNumber,
      costSettings
    );
  }, [appData.ships, dieselFuelCost, shorePowerCost, serviceCost]);

  // Memoize the selected ships data - find once, use everywhere
  const selectedRoute = useMemo(() => {
    return selectedRouteId.map((shipId) => {
      const ship = routeData.find(s => s.id === shipId);
      return ship;
    }).filter(Boolean); // Remove any undefined entries
  }, [selectedRouteId, routeData]);

  const handleCostUpdate = (value, field) => {
    const numericalValue = value == null || value === "" ? "" : Number(value);
    updateComponentState("costAnalysis", { [field]: numericalValue });
  };

  const handleRouteSelection = (routeId, exists) => {
    if (exists) {
      updateComponentState("costAnalysis", { 
        selectedRoutes: selectedRouteId.filter(r => r !== routeId)
      });
      return;
    }
    updateComponentState("costAnalysis", { 
      selectedRoutes: [...selectedRouteId, routeId]
    });
  };

  console.log(selectedRoute)

  const renderShipOptions = () => {
    return routeData.map((data) => {
      const exists = selectedRouteId.includes(data.id);

      return (
        <button
          type="button"
          key={data.id}
          className={`component-list-item ${exists ? "selected" : ""}`}
          onClick={() => handleRouteSelection(data.id, exists)}
        >
          <span className="route-name">{data.route}</span>
          <span className="ship-name">({data.shipName})</span>
        </button>
      );
    });
  };

  return (
    <div className="cost-analysis">
      {!isComparing && (
        <div className="cost-input">
          <div className="left-panel">
            <h2>Cost Analysis</h2>
            <button
              onClick={() => {
                setIsComparing(true);
              }}
            >
              Comparison Object
            </button>

            <div className="input-field">
              <h3>Cost</h3>
              <div className="cost-input">
                <DataInput
                  type="number"
                  data={dieselFuelCost}
                  setData={(val) => handleCostUpdate(val, "dieselFuelCost")}
                  options={{
                    label: "Diesel Fuel Cost",
                    prefix: currencySymbol,
                    unit:'/ton',
                  }}
                />
                <DataInput
                  type="number"
                  data={shorePowerCost}
                  setData={(val) => handleCostUpdate(val, "shorePowerCost")}
                  options={{
                    label: "Shore Power Cost",
                    prefix: currencySymbol,
                    unit:'/kWh',
                  }}
                />
                <DataInput
                  type="number"
                  data={serviceCost}
                  setData={(val) => handleCostUpdate(val, "serviceCost")}
                  options={{
                    label: "Service Cost",
                    prefix: currencySymbol,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isComparing && (
        <div className="route-select">
          <div className="left-panel">
            <h2>Select Ships to Compare</h2>
            <div className="ship-list">{renderShipOptions()}</div>
            <div className="back-action">
              <button
                type="button"
                className="back-btn"
                onClick={() => setIsComparing(false)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="right-panel">
        <div className="table-container">
          <table>
            <tbody>
              <tr>
                <th>Ship Name</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>{ship.shipName || "N/A"}</td>
                ))}
              </tr>
              <tr>
                <th>Route</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>{ship.route || "N/A"}</td>
                ))}
              </tr>
              <tr>
                <th>Ship Type</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>{ship.shipType || "N/A"}</td>
                ))}
              </tr>
              <tr> 
                <th>System</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>{ship.system || "N/A"}</td>
                ))}
              </tr>
              <tr>
                <th>Average Speed</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.averageSpeed !== null
                      ? ship.averageSpeed.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Range</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.range !== null ? ship.range.toFixed(2) : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Time</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.time !== null ? ship.time.toFixed(2) : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Fuel Tank Capacity</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.fuelTankCapacity !== null
                      ? ship.fuelTankCapacity.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Fuel Consumption</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.fuelConsumption !== null
                      ? ship.fuelConsumption.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Average Fuel Consumption</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.averageFullConsumption !== null
                      ? ship.averageFullConsumption.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Carbon Emission</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.carbonEmission !== null
                      ? ship.carbonEmission.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>SO2 Emission</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.so2Emission !== null
                      ? ship.so2Emission.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Power Consumption</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.powerConsumption !== null
                      ? ship.powerConsumption.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Average Power Consumption</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.averagePowerConsumption !== null
                      ? ship.averagePowerConsumption.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Fuel Cost</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.fuelCost !== null ? ship.fuelCost.toFixed(2) : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Power Cost</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.powerCost !== null ? ship.powerCost.toFixed(2) : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Total Energy Price</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.totalEnergyPrice !== null
                      ? ship.totalEnergyPrice.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Price Per NM</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.pricePerNm !== null ? ship.pricePerNm.toFixed(2) : "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Price Per 100 NM</th>
                {selectedRoute.map((ship) => (
                  <td key={ship.id}>
                    {ship.pricePer100Nm !== null
                      ? ship.pricePer100Nm.toFixed(2)
                      : "N/A"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CostAnalysis;
