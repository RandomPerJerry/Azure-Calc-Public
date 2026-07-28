import otherLoadImage from "../../../../assets/images/SLD/otherLoad.svg";

const originalDimensions = { width: 969, height: 977 };

function otherLoadSvg({ imageScale = 0.15 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={otherLoadImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );
}

export default otherLoadSvg;