import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserForm from "../hooks/useUserForm";
import ShipCreationModal from "../components/model/createShipModal";
import logo from "../assets/images/Icons/logo.png";
import camelCaseToDisplayName from "../utils/camelCaseToDisplayName";
import clearUrlParams from "../utils/clearUrlParams";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker

// Component icons
import batteryIcon from "../assets/images/Icons/battery.svg";
import propulsionIcon from "../assets/images/Icons/propulsion.svg";
import shoreConnectionIcon from "../assets/images/Icons/shoreconnection.svg";
import auxiliaryPowerIcon from "../assets/images/Icons/auxiliarypower.svg";
import hotelSupplyIcon from "../assets/images/Icons/hotelsupply.svg";
import otherLoadIcon from "../assets/images/Icons/otherload.svg";
import electricConverterIcon from "../assets/images/Icons/electricconverter.svg";
import editIcon from "../assets/images/Icons/edit.svg";
import removeIcon from "../assets/images/Icons/remove.svg";
import copyIcon from "../assets/images/Icons/copy.svg";
import styles from "../assets/styles/Home.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// Session storage keys
const SESSION_KEYS = {
  ACTIVE_SECTION: "homepage_activeSection",
  COMPONENT_MENU_OPEN: "homepage_componentMenuOpen",
  OPEN_CATEGORIES: "homepage_openCategories",
  SELECTED_COMPONENT_TYPE: "homepage_selectedComponentType",
};

function HomePage() {
  const navigate = useNavigate();
  const [isCreateShipModalOpen, setIsCreateShipModalOpen] = useState(false);
  const { appData, deleteShip, deleteComponent, copyShip } = useUserForm();

  // Helper functions for session storage
  const getSessionState = (key, defaultValue) => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Failed to parse session storage for ${key}:`, error);
      return defaultValue;
    }
  };

  const setSessionState = (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save to session storage for ${key}:`, error);
    }
  };

  // UI state with session storage integration
  const [activeSection, setActiveSection] = useState(() =>
    getSessionState(SESSION_KEYS.ACTIVE_SECTION, "recent")
  );
  const [isComponentMenuOpen, setIsComponentMenuOpen] = useState(() =>
    getSessionState(SESSION_KEYS.COMPONENT_MENU_OPEN, false)
  );
  const [openCategories, setOpenCategories] = useState(() =>
    getSessionState(SESSION_KEYS.OPEN_CATEGORIES, [])
  );
  const [selectedComponentType, setSelectedComponentType] = useState(() =>
    getSessionState(SESSION_KEYS.SELECTED_COMPONENT_TYPE, null)
  );
  const [deletingComponentId, setDeletingComponentId] = useState(null);
  const [deletingShipId, setDeletingShipId] = useState(null);
  const [copyingShipId, setCopyingShipId] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Update session storage when state changes
  useEffect(() => {
    setSessionState(SESSION_KEYS.ACTIVE_SECTION, activeSection);
  }, [activeSection]);

  useEffect(() => {
    setSessionState(SESSION_KEYS.COMPONENT_MENU_OPEN, isComponentMenuOpen);
  }, [isComponentMenuOpen]);

  useEffect(() => {
    setSessionState(SESSION_KEYS.OPEN_CATEGORIES, openCategories);
  }, [openCategories]);

  useEffect(() => {
    setSessionState(
      SESSION_KEYS.SELECTED_COMPONENT_TYPE,
      selectedComponentType
    );
  }, [selectedComponentType]);

  const categoryIcons = {
    Battery: batteryIcon,
    Propulsion: propulsionIcon,
    "Shore Connection": shoreConnectionIcon,
    "Auxiliary Power": auxiliaryPowerIcon,
    "Hotel Supply": hotelSupplyIcon,
    "Other Load": otherLoadIcon,
    "Electric Converter": electricConverterIcon,
    Edit: editIcon,
    Remove: removeIcon,
    Copy: copyIcon,
  };

  const componentCategories = {
    Battery: {
      types: ["batteryCell", "batteryPack", "batteryString"],
    },
    Propulsion: {
      types: ["motor", "dieselEngine"],
    },
    "Shore Connection": {
      types: ["shorePowerStation"],
    },
    "Auxiliary Power": {
      types: ["auxiliaryPowerUnit"],
    },
    "Hotel Supply": {
      types: ["hotelSupplyUnit"],
    },
    "Other Load": {
      types: ["otherLoadUnit"],
    },
    "Electric Converter": {
      types: [
        "transformer",
        "lts",
        "dcDcConverter",
        "dcAcConverter",
        "stringController",
      ],
    },
  };

  const componentTypeToRouteMap = {
    batteryCell: "/components/battery-cell",
    batteryPack: "/components/battery-pack",
    batteryString: "/components/battery-string",
    motor: "/components/motor",
    dieselEngine: "/components/diesel-engine",
    shorePowerStation: "/components/shore-power-station",
    auxiliaryPowerUnit: "/components/auxiliary-power-unit",
    hotelSupplyUnit: "/components/hotel-supply-unit",
    otherLoadUnit: "/components/other-load-unit",
    transformer: "/components/transformer",
    lts: "/components/lts",
    dcDcConverter: "/components/dc-dc-converter",
    dcAcConverter: "/components/dc-ac-converter",
    stringController: "/components/string-controller",
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Updated to handle multiple open categories
  const handleCategorySelect = (category) => {
    setOpenCategories((prev) => {
      if (prev.includes(category)) {
        // If category is already open, close it
        return prev.filter((cat) => cat !== category);
      } else {
        // If category is closed, open it
        return [...prev, category];
      }
    });
  };

  const handleComponentTypeSelect = (componentType) => {
    setSelectedComponentType(componentType);
    setActiveSection("componentLibrary");
  };

  const handleDeleteComponent = (componentType, id) => {
    setDeletingComponentId(id);
    deleteComponent(componentType, id);
    setDeletingComponentId(null);
  };

  const navigateToComponentCreation = (componentType) => {
    const route = componentTypeToRouteMap[componentType];
    if (route) {
      navigate(route);
    }
  };

  const navigateToComponentEdit = (componentType, id) => {
    const baseRoute = componentTypeToRouteMap[componentType];
    if (baseRoute) {
      navigate(`${baseRoute}/${id}`);
    }
  };

  const handleDeleteShip = (shipId) => {
    setDeletingShipId(shipId);
    deleteShip(shipId);
    setDeletingShipId(null);
  };

  const handleCopyShip = (shipId) => {
    setCopyingShipId(shipId);
    copyShip(shipId);
    setCopyingShipId(null);
  };

  const getComponentsByType = (type) => {
    return appData?.componentLibrary?.[type] || [];
  };

  const navigateToShip = (shipId) => {
    navigate(`/base/${shipId}`);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    clearUrlParams();
  }, []);

  const renderOutput = () => {
    switch (activeSection) {
      case "recent":
        return (
          <div className={styles.outputContainer}>
            <div className={styles.redBar}></div>
            <div className={styles.componentHeader}>
              <h1>Recent Ships</h1>
              <button
                onClick={() => setIsCreateShipModalOpen(true)}
                className={styles.createButton}
              >
                <span>→</span> New
              </button>
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.componentTable}>
                {/* Table Header */}
                <div className={styles.tableHeader}>
                  <div className={styles.tableHeaderCell}>No</div>
                  <div className={styles.tableHeaderCell}>Ship Name</div>
                  <div className={styles.tableHeaderCell}>Created</div>
                  <div className={styles.tableHeaderCell}>Edit</div>
                  <div className={styles.tableHeaderCell}>Copy</div>
                  <div className={styles.tableHeaderCell}>Remove</div>
                </div>

                {/* Table Body */}
                <div className={styles.tableBody}>
                  {(appData?.ships || []).map((ship, index) => (
                    <div key={ship.id} className={styles.tableRow}>
                      <div className={styles.tableCell}>{index + 1}</div>
                      <div className={styles.tableCell}>
                        <span title={ship.name}>{ship.name}</span>
                      </div>
                      <div className={styles.tableCell}>
                        <span>{formatTimestamp(ship.createdAt)}</span>
                      </div>
                      <div className={styles.tableCell}>
                        <button
                          onClick={() => navigateToShip(ship.id)}
                          className={styles.iconButton}
                        >
                          <img
                            src={categoryIcons["Edit"]}
                            alt="Edit icon"
                            className={styles.categoryIcon}
                          />
                        </button>
                      </div>
                      <div className={styles.tableCell}>
                        <button
                          onClick={() => handleCopyShip(ship.id)}
                          disabled={copyingShipId === ship.id}
                          className={styles.iconButton}
                        >
                          {copyingShipId === ship.id ? (
                            "..."
                          ) : (
                            <img
                              src={categoryIcons["Copy"]}
                              alt="Copy icon"
                              className={styles.categoryIcon}
                            />
                          )}
                        </button>
                      </div>
                      <div className={styles.tableCell}>
                        <button
                          onClick={() => handleDeleteShip(ship.id)}
                          disabled={deletingShipId === ship.id}
                          className={styles.iconButton}
                        >
                          {deletingShipId === ship.id ? (
                            "..."
                          ) : (
                            <img
                              src={categoryIcons["Remove"]}
                              alt="Remove icon"
                              className={styles.categoryIcon}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "componentLibrary":
        return (
          <div className={styles.outputContainer}>
            {selectedComponentType ? (
              <>
                <div className={styles.redBar}></div>
                <div className={styles.componentHeader}>
                  <h1>{camelCaseToDisplayName(selectedComponentType)}</h1>
                  <button
                    onClick={() =>
                      navigateToComponentCreation(selectedComponentType)
                    }
                    className={styles.createButton}
                  >
                    <span>→</span> New
                  </button>
                </div>
                <div className={styles.contentWrapper}>
                  <div className={styles.componentTable}>
                    {/* Table Header */}
                    <div className={styles.tableHeader}>
                      <div className={styles.tableHeaderCell}>No</div>
                      <div className={styles.tableHeaderCell}>Description</div>
                      <div className={styles.tableHeaderCell}>Edit</div>
                      <div className={styles.tableHeaderCell}>Remove</div>
                    </div>

                    {/* Table Body */}
                    <div className={styles.tableBody}>
                      {getComponentsByType(selectedComponentType).map(
                        (component, index) => (
                          <div key={component.id} className={styles.tableRow}>
                            <div className={styles.tableCell}>{index + 1}</div>
                            <div className={styles.tableCell}>
                              <span title={component.data.description}>
                                {component.data.description}
                              </span>
                            </div>
                            <div className={styles.tableCell}>
                              <button
                                onClick={() =>
                                  navigateToComponentEdit(
                                    selectedComponentType,
                                    component.id
                                  )
                                }
                                className={styles.iconButton}
                              >
                                <img
                                  src={categoryIcons["Edit"]}
                                  alt="Edit icon"
                                  className={styles.categoryIcon}
                                />
                              </button>
                            </div>
                            <div className={styles.tableCell}>
                              <button
                                onClick={() =>
                                  handleDeleteComponent(
                                    selectedComponentType,
                                    component.id
                                  )
                                }
                                className={styles.iconButton}
                                disabled={deletingComponentId === component.id}
                              >
                                {deletingComponentId === component.id ? (
                                  "..."
                                ) : (
                                  <img
                                    src={categoryIcons["Remove"]}
                                    alt="Remove icon"
                                    className={styles.categoryIcon}
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1>Component Library</h1>
                <div className={styles.contentWrapper}>
                  <div className={styles.componentSelectionPrompt}>
                    <p>Please select a component type from the sidebar menu.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "learning":
        return (
          <div className={styles.outputContainer}>
            <div className={styles.redBar}></div>
            <div className={styles.componentHeader}>
              <h1>User Guide</h1>
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.pdfContainer}>
                <div className={styles.pdfControls}>
                  <button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className={styles.pdfButton}
                  >
                    Previous
                  </button>
                  <span className={styles.pageInfo}>
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    className={styles.pdfButton}
                  >
                    Next
                  </button>
                </div>
                
                <div className={styles.pdfViewer}>
                  <Document
                    file="/user-guide.pdf"// Place PDF in public folder
                    onLoadSuccess={onDocumentLoadSuccess}
                    className={styles.pdfDocument}
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      width={Math.min(800, window.innerWidth * 0.8)}
                      className={styles.pdfPage}
                    />
                  </Document>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.mainContentContainer}>
        {/* Left sidebar navigation */}
        <div className={styles.sidebarNav}>
          <div className={styles.logoContainer}>
            <img 
              src={logo} 
              alt="AzurE e-ship Logo" 
              className={styles.logo}
              style={{
                width: '10rem',
                height: '10rem',
                objectFit: 'contain'
              }}
            />
            <h2 className={styles.headerTitle}>AzurE e-Ship</h2>
          </div>
          <button
            className={styles.createShipButton}
            onClick={() => setIsCreateShipModalOpen(true)}
          >
            New
          </button>

          <button
            className={`${styles.sidebarButton} ${
              activeSection === "recent" ? styles.active : ""
            }`}
            onClick={() => handleSectionChange("recent")}
          >
            Recent
          </button>

          <div
            className={`${styles.sidebarDropdown} ${
              isComponentMenuOpen ? styles.open : ""
            }`}
          >
            <button
              className={`${styles.sidebarButton} ${
                activeSection === "componentLibrary" ? styles.active : ""
              }`}
              onClick={() => setIsComponentMenuOpen(!isComponentMenuOpen)}
            >
              Component Library
            </button>
            <div className={styles.sidebarDropdownContent}>
              {Object.keys(componentCategories).map((category) => (
                <div
                  key={category}
                  className={`${styles.categoryItem} ${
                    openCategories.includes(category) ? styles.open : ""
                  }`}
                >
                  <button
                    className={styles.categoryButton}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {categoryIcons[category] && (
                      <img
                        src={categoryIcons[category]}
                        alt={`${category} icon`}
                        className={styles.categoryIcon}
                      />
                    )}
                    {category}
                  </button>
                  <div className={styles.componentTypes}>
                    {componentCategories[category].types.map((type) => (
                      <button
                        key={type}
                        className={styles.typeButton}
                        onClick={() => handleComponentTypeSelect(type)}
                      >
                        {camelCaseToDisplayName(type)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>



          <button
            className={`${styles.sidebarButton} ${
              activeSection === "learning" ? styles.active : ""
            }`}
            onClick={() => handleSectionChange("learning")}
          >
            Learning
          </button>
        </div>

        {/* Right content area */}
        <div className={styles.contentArea}>{renderOutput()}</div>
      </div>

      {isCreateShipModalOpen && (
        <ShipCreationModal
          isOpen={isCreateShipModalOpen}
          onClose={() => setIsCreateShipModalOpen(false)}
        />
      )}
    </div>
  );
}

export default HomePage;
