// src/pages/BaseScreenComp/BusBar.jsx
import React, { useState } from "react";
import useShipComponent from "../../hooks/useShipComponent";
import getSafeValue from "../../utils/getSafeValues";
import SingleLineDiagram from "./singleLineDiagram/SingleLineDiagram";

function BusBar() {
    // Get everything from context - no more prop drilling!
    const {
      shipData,
      updateComponentState,
    } = useShipComponent();

    const [error, setError] = useState('');

    // More explicit handling of undefined/null values using helper function
    const busBarData = shipData.busBar || {};
    const dcLinkVoltage = getSafeValue(busBarData.dcLinkVoltage, null);
    const dcLinkNumber = getSafeValue(busBarData.dcLinkNumber, null);

    // Update state using context
    const setState = (newState) => {
        updateComponentState('busBar', newState);
    };
    
    const handleVoltageChange = (voltage) => {
        const newVoltage = dcLinkVoltage === voltage ? null : voltage;
        setState({ dcLinkVoltage: newVoltage });
    };

    const handleNumberChange = (number) => {
        const newNumber = dcLinkNumber === number ? null : number;
        setState({ dcLinkNumber: newNumber });
    };

    return (
         <div className="busbar">
            <div className='left-panel'>
                <h2>DC Link Setting</h2>
                
                <div className="form-group">
                    <label>Voltage of DC Link Bus Bar</label>
                    
                    <div className="checkbox-row">
                        <div className="checkbox-item">
                            <label>750V</label>
                            <div 
                                className={`checkbox-box ${dcLinkVoltage === 750 ? 'selected' : ''}`}
                                onClick={() => handleVoltageChange(750)}
                            >
                                {dcLinkVoltage === 750 && <span>✓</span>}
                            </div>
                        </div>
                        
                        <div className="checkbox-item">
                            <label>1000V</label>
                            <div 
                                className={`checkbox-box ${dcLinkVoltage === 1000 ? 'selected' : ''}`}
                                onClick={() => handleVoltageChange(1000)}
                            >
                                {dcLinkVoltage === 1000 && <span>✓</span>}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Number of DC Link Bus Bar</label>
                    
                    <div className="checkbox-row">
                        <div className="checkbox-item">
                            <label>1 Bus Bar</label>
                            <div 
                                className={`checkbox-box ${dcLinkNumber === 1 ? 'selected' : ''}`}
                                onClick={() => handleNumberChange(1)}
                            >
                                {dcLinkNumber === 1 && <span>✓</span>}
                            </div>
                        </div>
                        
                        <div className="checkbox-item">
                            <label>2 Bus Bar</label>
                            <div 
                                className={`checkbox-box ${dcLinkNumber === 2 ? 'selected' : ''}`}
                                onClick={() => handleNumberChange(2)}
                            >
                                {dcLinkNumber === 2 && <span>✓</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="checkbox-row">
                        <div className="checkbox-item">
                            <label>3 Bus Bar</label>
                            <div 
                                className={`checkbox-box ${dcLinkNumber === 3 ? 'selected' : ''}`}
                                onClick={() => handleNumberChange(3)}
                            >
                                {dcLinkNumber === 3 && <span>✓</span>}
                            </div>
                        </div>
                        
                        <div className="checkbox-item">
                            <label>4 Bus Bar</label>
                            <div 
                                className={`checkbox-box ${dcLinkNumber === 4 ? 'selected' : ''}`}
                                onClick={() => handleNumberChange(4)}
                            >
                                {dcLinkNumber === 4 && <span>✓</span>}
                            </div>
                        </div>
                    </div>
                </div>
                
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}

export default BusBar;