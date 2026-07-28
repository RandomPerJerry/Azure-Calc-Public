import React, { useState, useRef, useEffect } from "react";
import useUserForm from "../hooks/useUserForm";
import "../assets/styles/TopFileBar.css";
import UnsavedChangesModal from "./model/UnsavedChangesModal";
import NewFileModel from "./model/newFileModel";
import DisclaimerModal from "./model/disclaimerModal";
import { toast } from "react-toastify";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
];

const TopFileBar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showCurrencySubmenu, setShowCurrencySubmenu] = useState(false);
  const [showUnsavedChangeModal, setShowUnsaveChangeModal] = useState(false);
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const dropdownRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  const currencySubmenuRef = useRef(null);

  // Detect operating system
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifierKey = isMac ? "⌘" : "Ctrl";

  const {
    saveAppData,
    appData,
    saveSetting,
    openFile,
    createNewFile,
    currentFileHandle,
    saveAsData,
    hasUnsavedChanges,
  } = useUserForm();

  const selectedCurrency = appData.settings?.currency || "USD";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;

      if (isModifierPressed && !event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case "u":
            event.preventDefault();
            handleNew(true);
            break;
          case "o":
            event.preventDefault();
            handleOpen();
            break;
          case "s":
            event.preventDefault();
            handleSave();
            break;
        }
      }

      // Save As: Ctrl/Cmd + Shift + S
      if (
        isModifierPressed &&
        event.shiftKey &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        handleSaveAs();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMac, hasUnsavedChanges]);

  // Update the click outside handler to include currency submenu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }

      if (
        showSettingsDropdown &&
        settingsDropdownRef.current &&
        !settingsDropdownRef.current.contains(event.target) &&
        // Only check currency submenu if it exists
        (!currencySubmenuRef.current ||
          !currencySubmenuRef.current.contains(event.target))
      ) {
        setShowSettingsDropdown(false);
        setShowCurrencySubmenu(false);
      }
    };

    if (showDropdown || showSettingsDropdown || showCurrencySubmenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    dropdownRef,
    settingsDropdownRef,
    showDropdown,
    showSettingsDropdown,
    showCurrencySubmenu,
  ]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await saveAppData();
      if (result.success) {
        toast.success("File Saved");
      }
    } catch (error) {
      toast.error("File Save Failed");
      console.error("Save failed:", error);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const handleSaveAs = async () => {
    setIsLoading(true);
    try {
      const result = await saveAsData();
      if (result.success) {
        toast.success("File Saved");
      }
    } catch (error) {
      toast.error("File Save Failed");
      console.error("save as error", error);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const handleNew = (fromFunc) => {
    console.log(fromFunc, hasUnsavedChanges);
    if (fromFunc && hasUnsavedChanges) {
      console.log("asdasd");
      setIsModalShowing(true);
      return;
    }

    try {
      createNewFile();
      setShowDropdown(false);
      toast.success("New File Created");
    } catch (error) {}
  };

  const handleOpen = async () => {
    setIsLoading(true);
    try {
      const result = await openFile();
      if (result.success) {
        toast.success("File Loaded");
      }
    } catch (error) {
      toast.error("File Failed to Load");
      console.error("Open failed:", error);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  };

  const handleCurrencySelect = (currency) => {
    saveSetting("currency", currency.code);
  };

  const handleCurrencyHover = () => {
    setShowCurrencySubmenu(true);
  };

  const handleCurrencyLeave = () => {
    setShowCurrencySubmenu(false);
  };

  const handleDisclaimerClick = () => {
    setShowDisclaimerModal(true);
    setShowSettingsDropdown(false); // Close settings dropdown
  };

  return (
    <>
      <div className="top-file-bar">
        <div className="menu-container">
          <div className="file-menu" ref={dropdownRef}>
            <button
              className="file-menu-button"
              onClick={() => setShowDropdown((prev) => !prev)}
              disabled={isLoading}
            >
              File
            </button>

            {showDropdown && (
              <div className="file-dropdown">
                <div className="file-dropdown-group">
                  <button
                    onClick={() => handleNew(true)}
                    className="file-dropdown-item"
                  >
                    <span className="menu-text">New File</span>
                    <span className="menu-shortcut">{modifierKey}+U</span>
                  </button>
                </div>
                <div className="file-dropdown-group">
                  <button onClick={handleOpen} className="file-dropdown-item">
                    <span className="menu-text">Open</span>
                    <span className="menu-shortcut">{modifierKey}+O</span>
                  </button>
                </div>
                <div className="file-dropdown-group">
                  <button onClick={handleSave} className="file-dropdown-item">
                    <span className="menu-text">Save</span>
                    <span className="menu-shortcut">{modifierKey}+S</span>
                  </button>

                  <button onClick={handleSaveAs} className="file-dropdown-item">
                    <span className="menu-text">Save As</span>
                    <span className="menu-shortcut">Shift+{modifierKey}+S</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="settings-menu" ref={settingsDropdownRef}>
            <button
              className="file-menu-button"
              onClick={() => setShowSettingsDropdown((prev) => !prev)}
              disabled={isLoading}
            >
              Settings
            </button>

            {showSettingsDropdown && (
              <div className="file-dropdown">
                <div className="file-dropdown-group">
                  <div
                    className="file-dropdown-item currency-selector"
                    onMouseEnter={handleCurrencyHover}
                    onMouseLeave={handleCurrencyLeave}
                    onClick={(e) => e.stopPropagation()}
                    title="Currency"
                  >
                    <span className="menu-text">Currency</span>

                    {showCurrencySubmenu && (
                      <div
                        ref={currencySubmenuRef} // Add the ref here
                        className="currency-submenu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCurrencySelect(currency);
                            }}
                            className={`currency-item ${
                              selectedCurrency === currency.code
                                ? "selected"
                                : ""
                            }`}
                          >
                            <span className="currency-symbol">
                              {currency.symbol}
                            </span>
                            <span className="currency-code">
                              {currency.code}
                            </span>
                            <span className="currency-name">
                              {currency.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="file-dropdown-group">
                  <button
                    onClick={handleDisclaimerClick}
                    className="file-dropdown-item"
                  >
                    <span className="menu-text">Disclaimer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="file-status">
          <span
            className={`status-indicator ${
              currentFileHandle === "Connected" ? "connected" : "new"
            }`}
          >
            {currentFileHandle === "Connected" ? "Connected" : "New File"}
          </span>
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedChangeModal}
        onCancel={() => setShowUnsaveChangeModal(false)}
      />

      <NewFileModel
        isOpen={isModalShowing}
        onClose={() => setIsModalShowing(false)}
        onSubmit={() => handleNew(false)}
      />

      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
      />
    </>
  );
};

export default TopFileBar;
