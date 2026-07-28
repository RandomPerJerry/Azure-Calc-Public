import BatteryPackSvg from "../../../../assets/images/SLD/batteryPack.svg";
import BatteryControllerSvg from "../../../../assets/images/SLD/batteryControler.svg";

const batteryOriginalDimensions = { width: 600, height: 179 };

function batteryStringSvg({ batteryPackCount = 1, batteryScale = 0.15 }) {

  const scaledWidth = batteryOriginalDimensions.width * batteryScale;
  const scaledHeight = batteryOriginalDimensions.height * batteryScale;

  // ✅ Single column layout
  const totalWidth = scaledWidth;
  const totalHeight = scaledHeight * (1 + batteryPackCount);

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      style={{ 
        borderTop: '8px solid white',   
        borderBottom: '8px solid white', 
        outline: '2px solid black',
        boxShadow: 'inset 0 1px 0 0 black, inset 0 -1px 0 0 black',
        paddingTop: '1px',
        paddingBottom: '1px'
      }}
    >
      {/* Battery Controller */}
      <image
        href={BatteryControllerSvg}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />

      {/* Battery Packs - Single Column */}
      {Array.from({ length: batteryPackCount }, (_, index) => {
        // ✅ Single column: x always 0, y stacked vertically
        const x = 0;
        const y = (index + 1) * scaledHeight; // Stack below controller
        
        return (
          <g key={index}>
            <image
              href={BatteryPackSvg}
              x={x}
              y={y}
              width={scaledWidth}
              height={scaledHeight}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default batteryStringSvg;
