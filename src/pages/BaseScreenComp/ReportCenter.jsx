import React, { useState } from "react";
import PDFgenerater from "./Report/PDFgenerater";
import useShipComponent from "../../hooks/useShipComponent";
import useComponentCapture from "../../hooks/useComponentCapture";
import { ReactFlowProvider } from "@xyflow/react";
import BiddingList from "./BiddingList";
import CostAnalysis from "./CostAnalysis";
import SingleLineDiagram from "./singleLineDiagram/SingleLineDiagram";
import WorkingCondition from "./WorkingCondition";
import WorkingConditionDisplay from "./Report/workingConditionDisplay";
import DataInput from "../../components/DataInput";
import getSafeValue from "../../utils/getSafeValues";

function ReportCenter() {
  const { shipData, updateComponentState } = useShipComponent();
  const { images, isCapturing, captureAll, hasImages } = useComponentCapture();
  
  const [uploadedShipImage, setUploadedShipImage] = useState(
    getSafeValue(shipData.reportCenter?.shipImage, null)
  );

  const updateData = (field, value) => {
    updateComponentState('reportCenter', {[field]: value});
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setUploadedShipImage(imageDataUrl);
        updateData('shipImage', imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setUploadedShipImage(null);
    updateData('shipImage', null);
  };

  const shipDescription = getSafeValue(shipData.reportCenter?.introduction, '')
  const loa = getSafeValue(shipData.reportCenter?.loa, '')
  const lwl = getSafeValue(shipData.reportCenter?.lwl, '')
  const draft = getSafeValue(shipData.reportCenter?.draft, '')
  const bmax = getSafeValue(shipData.reportCenter?.bmax, '')
  const depth = getSafeValue(shipData.reportCenter?.depth, '')
  const displacement = getSafeValue(shipData.reportCenter?.displacement, '')
  const cruiseSpeed = getSafeValue(shipData.reportCenter?.cruiseSpeed, '')
  const maxSpeed = getSafeValue(shipData.reportCenter?.maxSpeed, '')
  const crew = getSafeValue(shipData.reportCenter?.crew, '')
  const cruiseRange = getSafeValue(shipData.reportCenter?.cruiseRange, '')

  return (
    <div className="report-center">
      <div className="left-panel">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>Report Center</h2>
          
          <div className="input-field">
            {/* Ship Image Upload Section */}
            <div className="image-upload-section">
              <label>Ship Image</label>
              <div className="image-upload-container">
                {uploadedShipImage ? (
                  <div className="image-preview">
                    <img 
                      src={uploadedShipImage} 
                      alt="Ship" 
                    />
                    <button 
                      type="button"
                      onClick={removeImage}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-placeholder">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="ship-image-upload"
                    />
                    <label 
                      htmlFor="ship-image-upload"
                      style={{
                        display: 'block',
                        padding: '20px',
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: '#666'
                      }}
                    >
                      Click to upload ship image<br/>
                      <small>Supported formats: JPG, PNG, GIF</small>
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <DataInput 
              type="textarea" 
              data={shipDescription} 
              setData={(val) => updateData('introduction', val)}
              options={{
                label: "Ship Introduction",
                placeholder: "Enter ship description and overview...",
                rows: 6
              }}
            />
            
            <div className="field-group">
              <DataInput 
                type="number" 
                data={loa} 
                setData={(val) => updateData('loa', val)}
                options={{
                  label: "LOA",
                  placeholder: "Enter length overall in meters",
                  unit: "m"
                }}
              />
              
              <DataInput 
                type="number" 
                data={lwl} 
                setData={(val) => updateData('lwl', val)}
                options={{
                  label: "LWL",
                  placeholder: "Enter waterline length in meters",
                  unit: "m"
                }}
              />
            </div>
            
            <div className="field-group">
              <DataInput 
                type="number" 
                data={draft} 
                setData={(val) => updateData('draft', val)}
                options={{
                  label: "Draft",
                  placeholder: "Enter draft in meters",
                  unit: "m"
                }}
              />
              
              <DataInput 
                type="number" 
                data={bmax} 
                setData={(val) => updateData('bmax', val)}
                options={{
                  label: "Bmax",
                  placeholder: "Enter maximum beam in meters",
                  unit: "m"
                }}
              />
            </div>
            
            <DataInput 
              type="number" 
              data={depth} 
              setData={(val) => updateData('depth', val)}
              options={{
                label: "Depth",
                placeholder: "Enter depth in meters",
                unit: "m"
              }}
            />
            
            <DataInput 
              type="number" 
              data={displacement} 
              setData={(val) => updateData('displacement', val)}
              options={{
                label: "Displacement",
                placeholder: "Enter displacement in tonnes",
                unit: "tonnes"
              }}
            />
            
            <div className="field-group">
              <DataInput 
                type="number" 
                data={cruiseSpeed} 
                setData={(val) => updateData('cruiseSpeed', val)}
                options={{
                  label: "Cruise Speed",
                  placeholder: "Enter cruise speed in knots",
                  unit: "knots"
                }}
              />
              
              <DataInput 
                type="number" 
                data={maxSpeed} 
                setData={(val) => updateData('maxSpeed', val)}
                options={{
                  label: "Max Speed",
                  placeholder: "Enter maximum speed in knots",
                  unit: "knots"
                }}
              />
            </div>
            
            <div className="field-group">
              <DataInput 
                type="number" 
                data={crew} 
                setData={(val) => updateData('crew', val)}
                options={{
                  label: "Crew Size",
                  placeholder: "Enter number of crew members",
                  unit: "people"
                }}
              />
              
              <DataInput 
                type="number" 
                data={cruiseRange} 
                setData={(val) => updateData('cruiseRange', val)}
                options={{
                  label: "Cruise Range",
                  placeholder: "Enter cruise range in nautical miles",
                  unit: "nms"
                }}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button"
              className="submit-btn" 
              onClick={captureAll} 
              disabled={isCapturing}
            >
              {isCapturing ? "Generating Report..." : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Rest of your existing JSX */}
      {isCapturing && (
        <div style={{ position: "absolute", top: "-9999px", width: "1200px" }}>
          <div id="capture-bidding-list">
            <BiddingList />
          </div>
          <div id="capture-cost-analysis">
            <CostAnalysis />
          </div>
          <div id="capture-sld" style={{ width: "1200px", height: "800px" }}>
            <ReactFlowProvider>
              <SingleLineDiagram />
            </ReactFlowProvider>
          </div>
          <div id="capture-energy-consumption-graph">
            <WorkingCondition />
          </div>
          <div id="capture-working-condition">
            <WorkingConditionDisplay />
          </div>
        </div>
      )}

      <div className="right-panel">
        <PDFgenerater
          shipData={shipData}
          images={images}
          isCapturing={isCapturing}
          hasImages={hasImages}
          uploadedShipImage={uploadedShipImage} // Pass the uploaded image
        />
      </div>
    </div>
  );
}

export default ReportCenter;
