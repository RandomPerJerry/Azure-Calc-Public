import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShipComponentProvider } from "../context/ShipComponentContext";
import { useUrlNavigation } from "../hooks/useUrlNavigation";
import useUserForm from "../hooks/useUserForm";
import handleBackNavigationState from "../utils/basePageBackButton";
import settingIcon from "../assets/images/Icons/setting.svg";
import backIcon from "../assets/images/Icons/back.svg";
import LoadProfile from "./BaseScreenComp/LoadProfile";
import BusBar from "./BaseScreenComp/BusBar";
import SystemComponent from "./BaseScreenComp/System";
import WorkingCondition from "./BaseScreenComp/WorkingCondition";
import CostAnalysis from "./BaseScreenComp/CostAnalysis";
import BiddingList from "./BaseScreenComp/BiddingList";
import { toast } from "react-toastify";
import "../assets/styles/basePage/base-page.css";
import SingleLineDiagram from "./BaseScreenComp/singleLineDiagram/SingleLineDiagram";
import ReportCenter from "./BaseScreenComp/ReportCenter";

const categoryIcons = {
  setting: settingIcon,
  back: backIcon,
};

function BasePage() {
  const { shipId } = useParams();
  const navigate = useNavigate();
  const { urlState, updateUrl } = useUrlNavigation();
  const { getShip, saveShip } = useUserForm();

  const [activeSection, setActiveSection] = useState("parameters");
  const [error, setError] = useState("");
  // Get active component from URL instead of local state
  const activeComponent = urlState.currentScreen || "loadProfile";
  const shipData = getShip(shipId);

  const SECTIONS = {
    parameters: {
      name: "PARAMETERS",
      components: {
        loadProfile: {
          name: "Load Profile",
          Component: LoadProfile,
        },
        busBar: {
          name: "Bus Bar",
          Component: BusBar,
        },
        system: {
          name: "System",
          Component: SystemComponent,
        },
      },
    },
    dataPlot: {
      name: "DATA PLOT",
      components: {
        workingCondition: {
          name: "Working Condition",
          Component: WorkingCondition,
        },
        costAnalysis: {
          name: "Cost Analysis",
          Component: CostAnalysis,
        },
      },
    },
    biddingList: {
      name: "BIDDING LIST",
      components: {
        biddingList: {
          name: "Bidding List",
          Component: BiddingList,
        },
      },
    },
    reportCenter: {
      name: "REPORT CENTER",
      components: {
        reportCenter: {
          name: "Report Center",
          Component: ReportCenter,
        },
      },
    },
  };

  const backButtonClick = () => {
    const resUrl = handleBackNavigationState(urlState);
    if (!resUrl) {
      navigate("/home");
      return;
    }
    updateUrl(resUrl);
  };

  useEffect(() => {
    if (!shipId) {
      toast.error("Ship ID is missing");
      navigate("/home");
      return;
    }

    if (!shipData) {
      toast.error("Ship Data is missing");
      navigate("/home");
      return;
    }

    setError("");
  }, [shipId, shipData, navigate]);

  // Initialize section based on URL component
  useEffect(() => {
    if (urlState.currentScreen) {
      // Find which section contains the current component
      for (const [sectionId, section] of Object.entries(SECTIONS)) {
        if (section.components[urlState.currentScreen]) {
          setActiveSection(sectionId);
          break;
        }
      }
    }
  }, [urlState.currentScreen]);

  // Initialize URL if empty (use replace to not create history entry)
  useEffect(() => {
    // Only set default if there's no currentScreen in the URL at all
    if (
      !urlState.currentScreen &&
      !new URLSearchParams(window.location.search).get("currentScreen")
    ) {
      updateUrl(
        {
          currentScreen: "loadProfile",
          systemType: "",
          isEditingSystem: false,
          editingSystemId: "",
          workingConditionRoute: "",
          workingConditionPoint: "",
          isEditingCondition: false,
        },
        true
      ); // Add replaceHistory = true here
    }
  }, [updateUrl]); // Remove urlState.currentScreen dependency

  const handleNameChange = (e) => {
    saveShip(shipId, {
      ...shipData,
      name: e.target.value,
    });
  };

  // Handle section change - now updates URL
  const handleSectionChange = (section) => {
    setActiveSection(section);

    const components = SECTIONS[section]?.components;
    if (components && Object.keys(components).length > 0) {
      const firstComponent = Object.keys(components)[0];

      // Update URL with new component and reset deeper navigation
      updateUrl(
        {
          currentScreen: firstComponent,
          systemType: "",
          isEditingSystem: false,
          editingSystemId: "",
          workingConditionRoute: "",
          workingConditionPoint: "",
          isEditingCondition: false,
        },
        true
      ); // Add replaceHistory = true here to avoid creating history entries for section changes
    }
  };

  // Handle component navigation - creates history entries ONLY for component changes
  const handleComponentChange = (componentId) => {
    updateUrl({
      currentScreen: componentId,
      systemType: "",
      isEditingSystem: false,
      editingSystemId: "",
      workingConditionRoute: "",
      workingConditionPoint: "",
      isEditingCondition: false,
    }); // Keep as false to create history entries for component navigation
  };
  // Render component with URL props
  const renderComponent = () => {
    if (!shipId) return <div>No ship selected</div>;

    const componentData =
      SECTIONS[activeSection]?.components?.[activeComponent];

    if (!componentData) {
      return <div>This section is under development</div>;
    }

    const { Component } = componentData;

    // Pass URL navigation props to child components
    return <Component />;
  };

  if (!shipData) {
    return <div>Error</div>;
  }

  return (
    <ShipComponentProvider shipId={shipId} shipData={shipData}>
      <div className="page">
        <div className="top-base-bar">
          <div className="back-area">
            <button onClick={backButtonClick}>
              <img
                src={categoryIcons["back"]}
                alt="back icon"
                draggable={false}
              />
            </button>
          </div>

          <div className="name-area">
            <input
              type="text"
              value={shipData.name}
              onChange={handleNameChange}
            ></input>
          </div>

          <div className="section-area">
            {Object.entries(SECTIONS).map(([sectionId, section]) => (
              <button
                key={sectionId}
                onClick={() => handleSectionChange(sectionId)}
                className={activeSection === sectionId ? "active" : ""}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        <div className="side-base-bar">
          {Object.entries(SECTIONS[activeSection]?.components || {}).map(
            ([compId, comp]) => (
              <button
                key={compId}
                onClick={() => handleComponentChange(compId)}
                className={activeComponent === compId ? "active" : ""}
              >
                {comp.name}
              </button>
            )
          )}
        </div>

        <div className="main-content">
          {renderComponent()}
          {(activeComponent === "busBar" || activeComponent === "system") &&
            urlState.isEditingSystem === false && (
              <div className="right-panel extra-padding">
                <div className="flow-container">
                  <SingleLineDiagram />
                </div>
              </div>
            )}
        </div>
      </div>
    </ShipComponentProvider>
  );
}

export default BasePage;
