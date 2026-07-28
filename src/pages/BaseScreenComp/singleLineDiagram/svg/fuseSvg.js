import fuseImage from "../../../../assets/images/SLD/fuse.svg";

const originalDimensions = { width: 116, height: 262 };

function fuseSvg({ imageScale = 0.18 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={fuseImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );
}

export default fuseSvg;