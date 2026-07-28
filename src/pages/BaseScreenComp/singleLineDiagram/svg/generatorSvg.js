import generatorImage from "../../../../assets/images/SLD/generator.svg";

const originalDimensions = { width: 1026, height: 2096 };

function generatorSvg({ imageScale = 0.18 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={generatorImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );
}

export default generatorSvg;