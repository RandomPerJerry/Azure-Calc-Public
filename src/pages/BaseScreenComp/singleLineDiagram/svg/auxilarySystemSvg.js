import auxiliaryImage from "../../../../assets/images/SLD/auxiliaryUnit.svg";

const originalDimensions = { width: 903, height: 1140 };

function auxiliarySvg({ imageScale = 0.18 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={auxiliaryImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );
}

export default auxiliarySvg;