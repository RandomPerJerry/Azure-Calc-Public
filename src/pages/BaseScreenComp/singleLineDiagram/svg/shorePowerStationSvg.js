import shorePowerStationImage from "../../../../assets/images/SLD/ShorePower.svg";

const originalDimensions = { width: 751, height: 1436 };

function shoreConnectionSvg({ imageScale = 0.1 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={shorePowerStationImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );
}

export default shoreConnectionSvg;