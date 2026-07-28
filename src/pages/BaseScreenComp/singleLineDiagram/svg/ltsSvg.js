import ltsImage from "../../../../assets/images/SLD/LTS.svg";

const originalDimensions = { width: 323, height: 307 };

function ltsSvg({ imageScale = 0.15 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={ltsImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );
}

export default ltsSvg;