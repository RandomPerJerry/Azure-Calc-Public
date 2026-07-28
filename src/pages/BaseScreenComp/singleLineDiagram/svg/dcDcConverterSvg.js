import dcDcConverterImage from '../../../../assets/images/SLD/DCDCconveter.svg';

const originalDimensions = { width: 323, height: 585 }

function dcDcConverterSvg ({ imageScale = 0.15 }) {
  const scaledWidth = originalDimensions.width * imageScale;
  const scaledHeight = originalDimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
    >
      <image
        href={dcDcConverterImage}
        x={0}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
      />
    </svg>
  );  
}

export default dcDcConverterSvg;