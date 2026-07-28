import React, { useEffect, useState, useMemo } from "react";
import useShipComponent from "../../hooks/useShipComponent";
import DataInput from "../../components/DataInput";
import useUserForm from "../../hooks/useUserForm";

const systemComponentMap = {
  batterySystem: ["batteryString", "dcDcConverter", "lts"],
  generatorGroupSystem: ["dcAcConverter", "dieselEngine", "motor"],
  propulsionSystem: ["dcAcConverter", "dieselEngine", "motor"],
  auxiliaryPowerUnitSystem: ["auxiliaryUnit", "dcAcConverter"],
  hotelLoadSystem: ["transformer"],
  otherLoadSystem: ["dcAcConverter", "otherLoadUnit"],
  shorePowerSystem: ["dcAcConverter", "shorePowerStation"],
};

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

function BiddingList() {
  const { shipData, updateComponentState } = useShipComponent();
  const { appData } = useUserForm(); // Fix the missing parentheses
  const systemData = shipData.system;
  const biddingListData = shipData.biddingList || {};
  const maxBarNumber = shipData?.busBar?.dcLinkNumber || 1;
  const [componentDisplay, setComponentDisplay] = useState([]);

  // Get currency symbol from app settings
  const selectedCurrency = appData.settings?.currency || "USD";
  const currencySymbol = currencySymbols[selectedCurrency] || "$";

  // Initialize componentsNote if it doesn't exist
  const componentsNote = biddingListData.componentsNote || {};
  const listNote = biddingListData.note || "";
  const discount = biddingListData.discount || 0;
  const saleCommission = biddingListData.saleCommission || 0;
  const classification = biddingListData.classification || "";

  // Calculate total price
  const totalPrice = useMemo(() => {
    return componentDisplay.reduce((total, component) => {
      const subtotal = (component.price || 0) * component.quantity;
      return total + subtotal;
    }, 0);
  }, [componentDisplay]);

  const setState = (field, value, isNum = false) => {
    if (isNum) {
      const numericalValue = value == null || value === "" ? "" : Number(value);
      updateComponentState("biddingList", { [field]: numericalValue });
      return;
    }
    updateComponentState("biddingList", { [field]: value });
  };

  // Handle note updates for individual components
  const setNoteForComponent = (biddingListId, value) => {
    const updatedNotes = {
      ...componentsNote,
      [biddingListId]: value,
    };
    setState("componentsNote", updatedNotes);
  };

  useEffect(() => {
    const usedComponents = [];

    Object.keys(systemData).forEach((systemType) => {
      const validComponents = systemData[systemType].filter(
        (s) => s.barNumber && s.barNumber <= maxBarNumber
      );
      validComponents.forEach((system) => {
        const currentSystem = system.data;
        systemComponentMap[systemType].forEach((component) => {
          if (
            currentSystem.propulsionMode === "electric" &&
            component === "dieselEngine"
          )
            return;
          if (
            currentSystem.propulsionMode === "diesel" &&
            component === "motor"
          )
            return;

          const currentComponent = currentSystem[component].data;
          const price = currentComponent.price;
          const modelName = currentComponent.modelName;
          const manfactureName = currentComponent.manfactureName;
          const description = currentComponent.description;
          const componentId = currentSystem[component].id;
          const unitNumber =
            systemType === "batterySystem" && component === "batteryString"
              ? currentSystem.numberOfUnits || 1
              : 1;
          const biddingListId = `${price}-${modelName}-${manfactureName}-${description}-${componentId}`;
          usedComponents.push({
            price,
            modelName,
            manfactureName,
            description,
            componentId,
            biddingListId,
            unitNumber,
          });
        });
      });
    });

    const componentMap = new Map();

    usedComponents.forEach((component) => {
      const key = component.biddingListId;
      const unitNumber = component.unitNumber;
      if (componentMap.has(key)) {
        componentMap.get(key).quantity += unitNumber;
      } else {
        componentMap.set(key, {
          ...component,
          quantity: unitNumber,
        });
      }
    });

    const componentsWithQuantity = Array.from(componentMap.values());
    setComponentDisplay(componentsWithQuantity);
  }, [systemData]);

  return (
    <div className="bidding-list">
      <h1>
        {shipData.name}-{shipData.loadProfile.propulsionSystem}-Equipment Sheet
      </h1>
      <div className="bidding-list-main">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Description</th>
                <th>Manufacture</th>
                <th>Model</th>
                <th>Qty</th>
                <th>Price/pc</th>
                <th>Subtotal Price</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {componentDisplay.map((component, index) => (
                <tr key={component.biddingListId}>
                  <td>{index + 1}</td>
                  <td>{component.description || "N/A"}</td>
                  <td>{component.manfactureName || "N/A"}</td>
                  <td>{component.modelName || "N/A"}</td>
                  <td>{component.quantity}</td>
                  <td>
                    {currencySymbol}
                    {component.price || 0}
                  </td>
                  <td>
                    {currencySymbol}
                    {((component.price || 0) * component.quantity).toFixed(2)}
                  </td>
                  <td>
                    <DataInput
                      type="string"
                      data={componentsNote[component.biddingListId] || ""}
                      setData={(val) =>
                        setNoteForComponent(component.biddingListId, val)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <div className="footer-text-area">
            <h2>Note:</h2>
            <textarea
              value={listNote || ""}
              onChange={(e) => setState("note", e.target.value)}
            />
          </div>

          <div className="footer-display-area">
            <div className="display-set">
              <label>Grand Total:</label>
              <span>
                {currencySymbol}
                {totalPrice.toFixed(2)}
              </span>
            </div>

            <DataInput
              type="number"
              data={discount || 0}
              setData={(val) => setState("discount", val, true)}
              options={{ label: "Discount (%)" }}
            />
            <DataInput
              type="number"
              data={saleCommission || 0}
              setData={(val) => setState("saleCommission", val, true)}
              options={{ label: "Sales Commission (%)" }}
            />

            <div className="display-set">
              <label>Classification</label>
              <select
                id="classification"
                value={classification}
                onChange={(e) => {
                  setState("classification", e.target.value);
                }}
              >
                <option value="">Select a Classification</option>
                <option value="ABS">ABS</option>
                <option value="DNV">DNV</option>
                <option value="LR">LR</option>
                <option value="BV">BV</option>
                <option value="RINA">RINA</option>
                <option value="NK">NK</option>
                <option value="CCS">CCS</option>
                <option value="KR">KR</option>
                <option value="RS">RS</option>
                <option value="Local">Local</option>
              </select>
            </div>

            <div className="display-set">
              <label>Net system price ex works:</label>
              <span>
                {currencySymbol}
                {(
                  totalPrice * (discount / 100) +
                  totalPrice * (saleCommission / 100)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiddingList;
