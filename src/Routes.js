import React from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
// import SettingPage from "./pages/SettingPage";
import BasePage from "./pages/BasePage";
import NotFoundPage from "./pages/NotFoundPage";

import BatteryCell from "./pages/PageComponents/BatteryCell";
import BatteryPack from "./pages/PageComponents/BatteryPack";
import BatteryString from "./pages/PageComponents/BatteryString";
import Motor from "./pages/PageComponents/Motor";
import DieselEngine from "./pages/PageComponents/DieselEngine";
import ShorePowerStation from "./pages/PageComponents/ShorePowerStation";
import AuxiliaryPowerUnit from "./pages/PageComponents/AuxiliaryPowerUnit";
import HotelSupplyUnit from "./pages/PageComponents/HotelSupplyUnit";
import OtherLoadUnit from "./pages/PageComponents/OtherLoadUnit";
import Transformer from "./pages/PageComponents/Transformer";
import LTS from "./pages/PageComponents/LTS";
import DCDCConverter from "./pages/PageComponents/DCDCConverter";
import DCACConverter from "./pages/PageComponents/DCACConverter";
import StringController from "./pages/PageComponents/StringController";

import TestComp from "./test/test";
import TopFileBar from "./components/TopFileBar"; // Import your TopFileBar component

// Layout component that includes TopFileBar
const AppLayout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div>
      {!isLandingPage && (
        <div style={{ paddingTop: "36px" }}>
          <TopFileBar />
        </div>
      )}
      <Outlet />
    </div>
  );
};

// Layout component for components section
const ComponentsLayout = () => {
  return (
    <div className="components-layout">
      <Outlet />
    </div>
  );
};

// Layout component for base section
const BaseLayout = () => {
  return (
    <div className="base-layout">
      <Outlet />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          
          {/* All other routes - With TopFileBar */}
          <Route path="home" element={<HomePage />} />

          {/* Base Routes - Grouped */}
          <Route path="base/:shipId" element={<BaseLayout />}>
            <Route index element={<BasePage />} />
          </Route>

          {/* Component Routes - Grouped */}
          <Route path="components" element={<ComponentsLayout />}>
            <Route path="battery-cell" element={<BatteryCell />} />
            <Route path="battery-cell/:id" element={<BatteryCell />} />

            <Route path="battery-pack" element={<BatteryPack />} />
            <Route path="battery-pack/:id" element={<BatteryPack />} />

            <Route path="battery-string" element={<BatteryString />} />
            <Route path="battery-string/:id" element={<BatteryString />} />
            
            <Route path="motor" element={<Motor />} />
            <Route path="motor/:id" element={<Motor />} />

            <Route path="diesel-engine" element={<DieselEngine />} />
            <Route path="diesel-engine/:id" element={<DieselEngine />} />

            <Route path="shore-power-station" element={<ShorePowerStation />} />
            <Route path="shore-power-station/:id" element={<ShorePowerStation />} />

            <Route path="auxiliary-power-unit" element={<AuxiliaryPowerUnit />} />
            <Route path="auxiliary-power-unit/:id" element={<AuxiliaryPowerUnit />} />

            <Route path="hotel-supply-unit" element={<HotelSupplyUnit />} />
            <Route path="hotel-supply-unit/:id" element={<HotelSupplyUnit />} />

            <Route path="other-load-unit" element={<OtherLoadUnit />} />
            <Route path="other-load-unit/:id" element={<OtherLoadUnit />} />

            <Route path="transformer" element={<Transformer />} />
            <Route path="transformer/:id" element={<Transformer />} />

            <Route path="lts" element={<LTS />} />
            <Route path="lts/:id" element={<LTS />} />

            <Route path="dc-dc-converter" element={<DCDCConverter />} />
            <Route path="dc-dc-converter/:id" element={<DCDCConverter />} />

            <Route path="dc-ac-converter" element={<DCACConverter />} />
            <Route path="dc-ac-converter/:id" element={<DCACConverter />} />

            <Route path="string-controller" element={<StringController />} />
            <Route path="string-controller/:id" element={<StringController />} />
          </Route>

          {/* Test Route */}
          <Route path="test" element={<TestComp />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
