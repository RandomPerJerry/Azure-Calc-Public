import React from 'react';
import '../assets/styles/ComponentDataDisplay.css';
// Import calculation functions
import { 
  chargingCurrentStationCal, 
  chargingPowerCal, 
} from '../calculations/shorePowerStationCal';
import { otherLoadPowerCal } from '../calculations/otherLoadCal';
import { auxiliaryUnitPowerCal } from '../calculations/auxiliaryUnitCal';
import { hotelLoadPowerCal } from '../calculations/hotelLoadCal';
import { 
  cellPowerCal, 
  packPowerCal, 
  cellNumCal, 
  soc100Cal, 
  soc20Cal, 
  volumetricPackCal,
  stringPowerCal,
  stringChargingCurrentCal,
  stringDischargingCurrentCal,
  soc20VolCal,
  soc100VolCal,
} from '../calculations/batteryCal';

const ComponentDataDisplay = ({ type, data}) => {
  
  // Helper function to format field labels
  const formatLabel = (key) => {
    const labelMap = {
      description: 'Description',
      capacity: 'Capacity',
      chargingRate: 'Charging Rate',
      dischargingRate: 'Discharging Rate',
      startingRangeSOC: 'Starting SOC',
      endingRangeSOC: 'Ending SOC',
      thickness: 'Thickness',
      width: 'Width',
      height: 'Height',
      manfactureName: 'Manufacturer',
      modelName: 'Model Name',
      price: 'Price',
      weight: 'Weight',
      cyclelife: 'Cycle Life',
      material: 'Material',
      startingOperatingTem: 'Min Operating Temperature',
      endingOperatingTem: 'Max Operating Temperature',
      packNum: 'Pack Number',
      moduleNum: 'Module Number',
      cooling: 'Cooling System',
      ip: 'IP Rating',
      gridLayout: 'Grid Layout',
      batteryPack: 'Battery Pack',
      stringController: 'String Controller',
      voltage: 'Voltage',
      motorType: 'Motor Type',
      ipRating: 'IP Rating',
      manufacturer: 'Manufacturer',
      model: 'Model',
      validDataPoints: 'Data Points',
      fuelDataPoints: 'Fuel Data Points',
      speedDataPoints: 'Speed Data Points',
      hotelLoadPower: 'Hotel Load Power',
      powerOutput: 'Power Output',
      powerMode: 'Power Mode',
      dimensions: 'Dimensions',
      powerCapacity: 'Power Capacity',
      chargingMode: 'Charging Mode',
      loadPower: 'Load Power',
      loadVoltage: 'Load Voltage'
    };
    
    return labelMap[key] || key;
  };

  // Helper function to format values with units
  const formatValue = (key, value) => {
    if (!value) return 'N/A';
    
    const unitMap = {
      capacity: 'Ah',
      chargingRate: 'C',
      dischargingRate: 'C',
      startingRangeSOC: '%',
      endingRangeSOC: '%',
      thickness: 'mm',
      width: 'mm',
      height: 'mm',
      weight: 'kg',
      price: '$',
      startingOperatingTem: '°C',
      endingOperatingTem: '°C',
      packNum: '',
      moduleNum: '',
      cyclelife: 'cycles',
      voltage: 'V',
      hotelLoadPower: 'kW',
      powerOutput: 'kW',
      powerCapacity: 'kW',
      loadPower: 'kW',
      loadVoltage: 'V'
    };
    
    const unit = unitMap[key] || '';
    return unit ? `${value} ${unit}` : value;
  };

  // Define which fields to show for each component type
  const getFieldsForType = (type) => {
    switch (type) {
      case 'batteryCell':
        return [
          'description',
          'capacity',
          'chargingRate',
          'dischargingRate',
          'startingRangeSOC',
          'endingRangeSOC',
          'thickness',
          'width',
          'height',
          'weight',
          'manfactureName',
          'modelName',
          'price',
          'cyclelife',
          'material',
          'startingOperatingTem',
          'endingOperatingTem'
        ];
      case 'batteryPack':
        return [
          'description',
          'width',
          'height',
          'packNum',
          'moduleNum',
          'weight',
          'manfactureName',
          'modelName',
          'price',
          'cooling',
          'ip'
        ];
      case 'batteryString':
        return [
          'description',
          'manfactureName',
          'modelName',
          'price'
        ];
      case 'stringController':
        return [
          'description',
          'dimensions',
          'manufacturer',
          'model',
          'price'
        ];
      case 'motor':
        return [
          'description',
          'voltage',
          'weight',
          'motorType',
          'ipRating',
          'price',
          'manufacturer',
          'model'
        ];
      case 'dieselEngine':
        return [
          'description',
          'manufacturer',
          'model',
          'price'
        ];
      case 'hotelSupplyUnit':
        return [
          'description',
          'hotelLoadPower',
          'manufacturer',
          'model',
          'price'
        ];
      case 'auxiliaryPowerUnit':
        return [
          'description',
          'powerOutput',
          'powerMode',
          'manufacturer',
          'model',
          'price',
          'dimensions'
        ];
      case 'shorePowerStation':
        return [
          'description',
          'powerCapacity',
          'voltage',
          'chargingMode',
          'manufacturer',
          'model',
          'price'
        ];
      case 'otherLoad':
        return [
          'description',
          'loadPower',
          'loadVoltage',
          'powerMode',
          'manufacturer',
          'model',
          'price'
        ];
      case 'lts':
        return [
          'description',
          'manufacturer',
          'model',
          'price'
        ];
      case 'transformer':
        return [
          'description',
          'primaryVoltage',
          'secondaryVoltage',
          'manufacturer',
          'model',
          'price'
        ];
      case 'dcAcConverter':
        return [
          'description',
          'nominalCurrent',
          'manufacturer',
          'model',
          'price'
        ];
      case 'dcDcConverter':
        return [
          'description',
          'nominalCurrent',
          'manufacturer',
          'model',
          'price'
        ];
      default:
        return Object.keys(data || {});
    }
  };

  // Get calculated values for different component types
  const getCalculatedValues = (type, data) => {
    switch (type) {
      case 'batteryCell':
        const cellPower = cellPowerCal(data.capacity);
        return {
          'Cell Power': cellPower ? `${cellPower.toFixed(2)} kWh` : 'N/A'
        };
      case 'batteryPack':
        console.log(data)
        const packPower = packPowerCal(data.packNum, data.moduleNum, data.batteryCell);
        const cellNum = cellNumCal(data.packNum, data.moduleNum);
        const soc100 = soc100Cal(data.moduleNum);
        const soc20 = soc20Cal(data.moduleNum);
        const volumetricPack = volumetricPackCal(packPower, data.height, data.width, data.depth);
        return {
          'Pack Power': packPower ? `${packPower.toFixed(2)} W` : 'N/A',
          'Cell Number': cellNum || 'N/A',
          'SOC 100%': soc100 ? `${soc100.toFixed(2)} Ah` : 'N/A',
          'SOC 20%': soc20 ? `${soc20.toFixed(2)} Ah` : 'N/A',
          'Volumetric Pack': volumetricPack ? `${volumetricPack.toFixed(2)} Wh/L` : 'N/A'
        };
      case 'batteryString':
        // Parse grid layout to get pack number
        let packNum = 0;
        try {
          const layoutArrays = JSON.parse(data.gridLayout);
          layoutArrays.forEach(elementList => {
            elementList.forEach(num => {
              if (num === 1) packNum++;
            });
          });
        } catch (e) {
          console.error('Error parsing grid layout:', e);
        }
        
        const stringPower = stringPowerCal(packNum, data.batteryPack);
        const soc100Vol = soc100VolCal(packNum, data.batteryPack);
        const soc20Vol = soc20VolCal(packNum, data.batteryPack);
        const stringChargingCurrent = stringChargingCurrentCal(data.batteryPack);
        const stringDischargingCurrent = stringDischargingCurrentCal(data.batteryPack);
        
        return {
          'String Power': stringPower ? `${stringPower.toFixed(2)} kWh` : 'N/A',
          'SOC 100% Voltage': soc100Vol ? `${soc100Vol.toFixed(2)} V` : 'N/A',
          'SOC 20% Voltage': soc20Vol ? `${soc20Vol.toFixed(2)} V` : 'N/A',
          'Charging Current': stringChargingCurrent ? `${stringChargingCurrent.toFixed(2)} A` : 'N/A',
          'Discharging Current': stringDischargingCurrent ? `${stringDischargingCurrent.toFixed(2)} A` : 'N/A'
        };
      case 'shorePowerStation':
        const chargingPower = chargingPowerCal({ data });
        const chargingCurrentStation = chargingCurrentStationCal(data.powerCapacity, data.voltage);
        
        return {
          'Charging Power': chargingPower ? `${chargingPower} kW` : 'N/A',
          'Station Charging Current': chargingCurrentStation ? `${chargingCurrentStation.toFixed(2)} A` : 'N/A',
        };
      case 'otherLoad':
        const otherLoadPower = otherLoadPowerCal({ data });
        return {
          'Load Power': otherLoadPower ? `${otherLoadPower} kW` : 'N/A',
          'Load Voltage': data.loadVoltage ? `${data.loadVoltage} V` : 'N/A',
          'Power Type': data.powerMode || 'N/A'
        };
      case 'hotelSupplyUnit':
        const hotelLoadPower = hotelLoadPowerCal({ data });
        return {
          'Hotel Load Power': hotelLoadPower ? `${hotelLoadPower} kW` : 'N/A'
        };
      case 'auxiliaryPowerUnit':
        const auxiliaryPower = auxiliaryUnitPowerCal({ data });
        const dimensionsStr = data.dimensions && (data.dimensions.length || data.dimensions.width || data.dimensions.height)
          ? `${data.dimensions.length || '--'} × ${data.dimensions.width || '--'} × ${data.dimensions.height || '--'} mm`
          : 'N/A';
        return {
          'Output Power': auxiliaryPower ? `${auxiliaryPower} kW` : 'N/A',
          'Power Type': data.powerMode || 'N/A',
          'Dimensions': dimensionsStr
        };
      case 'transformer':
        return {
          // Transformer is a simple component without complex calculated values
        };
      case 'dcAcConverter':
        return {
          'Nominal Current': data.nominalCurrent ? `${data.nominalCurrent} A` : 'N/A'
        };
      case 'dcDcConverter':
        return {
          'Nominal Current': data.nominalCurrent ? `${data.nominalCurrent} A` : 'N/A'
        };
      default:
        return {};
    }
  };

  // Special handling for complex fields
  const renderComplexField = (key, value) => {
    if (key === 'batteryPack' && value?.data) {
      return value.data.description || value.name || 'Battery Pack Selected';
    }
    if (key === 'stringController' && value?.data) {
      return value.data.description || value.name || 'String Controller Selected';
    }
    if (key === 'gridLayout') {
      try {
        const layout = JSON.parse(value);
        const batteryCount = layout.flat().filter(cell => cell === 1).length;
        const controllerCount = layout.flat().filter(cell => cell === 2).length;
        return `${batteryCount} Battery Packs, ${controllerCount} Controller`;
      } catch {
        return 'Grid Configuration Set';
      }
    }
    if (key === 'motorType') {
      const motorTypeMap = {
        'dc': 'DC Motor',
        'acInduction': 'AC Induction Motor',
        'pmsm': 'Permanent Magnet Synchronous Motor',
        'bldc': 'Brushless DC Motor',
        'srm': 'Switched Reluctance Motor'
      };
      return motorTypeMap[value] || value;
    }
    if (key === 'validDataPoints' && Array.isArray(value)) {
      return `${value.length} data points`;
    }
    if (key === 'fuelDataPoints' && Array.isArray(value)) {
      return `${value.length} fuel data points`;
    }
    if (key === 'speedDataPoints' && Array.isArray(value)) {
      return `${value.length} speed data points`;
    }
    if (key === 'dimensions' && typeof value === 'object' && value !== null) {
      return `${value.length || '--'} × ${value.width || '--'} × ${value.height || '--'} mm`;
    }
    return formatValue(key, value);
  };

  const getAllDataItems = (type, data) => {
    const items = [];
    const fieldsToShow = getFieldsForType(type);
    const calculatedValues = getCalculatedValues(type, data);

    fieldsToShow.forEach(field => {
      const value = data[field];
      if (value || value === 0) {
        items.push({
          label: formatLabel(field),
          value: renderComplexField(field, value),
          type: 'specification'
        });
      }
    });

    // Add calculated values
    Object.entries(calculatedValues).forEach(([label, value]) => {
      items.push({
        label,
        value,
        type: 'calculated'
      });
    });

    // Add special component relationships for batteryString
    if (type === 'batteryString') {
      if (data.batteryPack?.data) {
        items.push({
          label: 'Battery Pack',
          value: data.batteryPack.data.description || 'Selected Battery Pack',
          type: 'relationship'
        });
      }
      if (data.stringController?.data) {
        items.push({
          label: 'String Controller',
          value: data.stringController.data.description || 'Selected String Controller',
          type: 'relationship'
        });
      }
      if (data.gridLayout) {
        items.push({
          label: 'Layout',
          value: renderComplexField('gridLayout', data.gridLayout),
          type: 'relationship'
        });
      }
    }

    // Add data points for motor
    if (type === 'motor' && data.validDataPoints && data.validDataPoints.length > 0) {
      data.validDataPoints.forEach((point, index) => {
        items.push({
          label: `Power-Speed Point ${index + 1}`,
          value: `${point.power || '--'} kW @ ${point.speed || '--'} RPM`,
          type: 'datapoint'
        });
      });
    }

    // Add data points for diesel engine
    if (type === 'dieselEngine') {
      if (data.fuelDataPoints && data.fuelDataPoints.length > 0) {
        data.fuelDataPoints.forEach((point, index) => {
          items.push({
            label: `Fuel Consumption Point ${index + 1}`,
            value: `${point.power || '--'} kW @ ${point.fuelConsumption || '--'} g/kWh`,
            type: 'datapoint'
          });
        });
      }
      
      if (data.speedDataPoints && data.speedDataPoints.length > 0) {
        data.speedDataPoints.forEach((point, index) => {
          items.push({
            label: `Power-Speed Point ${index + 1}`,
            value: `${point.power || '--'} kW @ ${point.speed || '--'} RPM`,
            type: 'datapoint'
          });
        });
      }
    }

    return items;
  };

  if (!data) {
    return <div className="no-data">No component data available</div>;
  }

  const allDataItems = getAllDataItems(type, data);

  return (
    <div className="component-data-display">
      <div className="calculations">
        {allDataItems.map((item, index) => (
          <dl key={`${item.label}-${index}`} className={`calc-item ${item.type}`}>
            <dt>{item.label}:</dt>
            <dd>{item.value}</dd>
          </dl>
        ))}
      </div>
    </div>
  );
};

export default ComponentDataDisplay;