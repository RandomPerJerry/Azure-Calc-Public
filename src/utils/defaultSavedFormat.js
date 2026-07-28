export const defaultAppData = {
  componentLibrary: {
    batteryCell: [],
    batteryPack: [],
    batteryString: [],
    motor: [],
    dieselEngine: [],
    auxiliaryPowerUnit: [],
    shorePowerStation: [],
    hotelSupplyUnit: [],
    otherLoadUnit: [],
    dcDcConverter: [],
    dcAcConverter: [],
    fuse: [],
    lts: [],
    stringController: [],
    transformer: [],
  },
  settings: {
    currency: "USD",
  },
  ships: [],
};

export const defaultShipData = {
  loadProfile: {
    shipType: undefined,
    propulsionSystem: undefined,
    dataPoints: [{ power: undefined, velocity: undefined }],
    fuelTankCapacity: undefined,
  },
  busBar: {
    dcLinkVoltage: undefined,
    dcLinkNumber: undefined,
  },
  system: {
    batterySystem: [], // {id, barNum}
    propulsionSystem: [],
    auxiliaryPowerUnitSystem: [],
    generatorGroupSystem: [],
    hotelLoadSystem: [],
    otherLoadSystem: [],
    shorePowerSystem: [],
  },

  workingConditions: {
    routes: [],
  },

  costAnalysis: {
    dieselFuelCost: undefined,
    shorePowerCost: undefined,
    serviceCost: undefined,
    selectedRoutes: [],
  },

  biddingList: {
    componentsNote: {},
    note: undefined,
    discount: 0,
    saleCommission: 0,
    classification: undefined,
  },

  reportCenter: {
    bmax: undefined,
    crew: undefined,
    cruiseRange: undefined,
    cruiseSpeed: undefined,
    depth: undefined,
    displacement: undefined,
    draft: undefined,
    introduction: undefined,
    loa: undefined,
    lwl: undefined,
    maxSpeed: undefined,
  },
  // No timestamps here, will be added during creation
};

export const defaultBatteryCellData = {
  capacity: "",
  chargingRate: "",
  dischargingRate: "",
  startingRangeSOC: "",
  endingRangeSOC: "",
  description: "",

  // Optional
  thickness: "",
  width: "",
  height: "",
  manfactureName: "",
  price: "",
  modelName: "",
  startingOperatingTem: "",
  endingOperatingTem: "",
  weight: "",
  cyclelife: "",
  material: "",
};

export const defaultBatteryPackStateData = {
  batteryCell: {},
  width: "",
  depth: "",
  height: "",
  packNum: "",
  moduleNum: "",
  description: "",

  // Optional
  weight: "",
  manfactureName: "",
  price: "",
  modelName: "",
  cooling: "",
  ip: "",
};

export const defaultBatteryStringData = {
  // Required
  batteryPack: {},
  stringController: {},
  gridLayout: "",
  description: "",

  // Optional
  manfactureName: "",
  modelName: "",
  price: "",
};

export const defaultHotelSupplyUnitData = {
  // Required
  hotelLoadPower: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultAuxiliaryPowerUnitData = {
  // Required
  powerOutput: "",
  powerMode: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
  dimensions: { length: "", width: "", height: "" },
};

export const defaultShorePowerStationData = {
  // Required
  powerCapacity: "",
  voltage: "",
  chargingMode: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultOtherLoadData = {
  // Required
  loadPower: "",
  loadVoltage: "",
  powerMode: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultStringControllerData = {
  // Required
  dimensions: { length: "", width: "", height: "" },
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultLTSData = {
  // Required
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultTransformerData = {
  // Required
  primaryVoltage: "",
  secondaryVoltage: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultDCAConverterData = {
  // Required
  nominalCurrent: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultDCDCConverterData = {
  // Required
  nominalCurrent: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

export const defaultFuseData = {
  // Required
  maximumCurrent: "",
  description: "",

  // Optional
  manufacturer: "",
  model: "",
  price: "",
};

// system
export const defaultBatterySystemData = {
  description: "",
  batteryString: {},
  dcDcConverter: {},
  lts: {},
  numberOfUnits: "",
};

export const defaultShorePowerSystemData = {
  description: "",
  shorePowerStation: {},
  dcAcConverter: {},
};

export const defaultPropulsionSystemData = {
  description: "",
  propulsionMode: "electric", // 'electric', 'hybrid', 'diesel'
  motor: {},
  dieselEngine: {},
  dcAcConverter: {},
  propulsionDevice: "gearBox",
  propulsorType: "",
};

export const defaultOtherLoadSystemData = {
  description: "",
  dcAcConverter: {},
  otherLoadUnit: {},
};

export const defaultHotelLoadSystemData = {
  description: "",
  hotelSupplyUnit: {},
  transformer: {},
};

export const defaultGeneratorSystemData = {
  description: "",
  motor: {},
  dieselEngine: {},
  dcAcConverter: {},
};

export const defaultAuxiliaryUnitSystemData = {
  description: "",
  auxiliaryUnit: {},
  dcAcConverter: {},
};
/**
 *         {
          routeName: undefined,
          workConditionDataPoint: {
            condition: undefined,
            velocity: undefined,
            time: undefined,
            data: []
          }
        }
 */
