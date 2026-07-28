import importAll from "../../../../utils/importImages";

const propulsionImages = importAll(
  require.context(
    "../../../../assets/images/SLD/propulsionImages",
    false,
    /\.svg$/
  )
);

const propulsionImageDimensions = {
  azimuthCrp: { width: 1349, height: 1771 },
  azimuthDuctP: { width: 1455, height: 1887 },
  azimuthOpenP: { width: 1414, height: 1889 },
  shaftPropellerElectric: { width: 4781, height: 881 },
  shaftPropellerHybrid: { width: 4781, height: 1029 },
  shaftPropellerDiesel: { width: 4652, height: 1034 },
  thrustElectric: { width: 3330, height: 747 },
  thrustDiesel: { width: 2867, height: 1027 },
  thrustHybrid: { width: 3395, height: 1028 },
};

function propulsionSvg({ propulsionSystem, index, imageScale = 0.15 }) {
  const propulsionData = propulsionSystem.data;
  const propulsionMode = propulsionData.propulsionMode;
  const propulsionDevice = propulsionData.propulsionDevice;
  const propulsorType = propulsionData.propulsorType;

  const shouldRotate =
    propulsionMode !== "electric" ||
    propulsionDevice === "thrustBearing" ||
    propulsorType === "Shaft Propeller"
      ? index % 2 === 0
        ? -1
        : 1
      : index % 2 === 0
      ? 1
      : -1;

  const getImageKey = () => {
    switch (propulsionMode) {
      case "electric":
        if (propulsionDevice === "thrustBearing") return "thrustElectric";
        switch (propulsorType) {
          case "Shaft Propeller":
            return "shaftPropellerElectric";
          case "Azimuth CRP":
            return "azimuthCrp";
          case "Azimuth Duct P":
            return "azimuthDuctP";
          case "Azimuth Open P":
            return "azimuthOpenP";
          default:
            return "shaftPropellerElectric";
        }
      case "hybrid":
        if (propulsionDevice === "thrustBearing") return "thrustHybrid";
        return "shaftPropellerHybrid";
      case "diesel":
        if (propulsionDevice === "thrustBearing") return "thrustDiesel";
        return "shaftPropellerDiesel";
      default:
        return "shaftPropellerElectric";
    }
  };

  const imageKey = getImageKey();
  const selectedImage = propulsionImages[imageKey];
  const dimensions = propulsionImageDimensions[imageKey];

  const scaledWidth = dimensions.width * imageScale;
  const scaledHeight = dimensions.height * imageScale;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      transform={`scale(${shouldRotate}, 1)`}
    >
      <image
        href={selectedImage}
        x="0"
        y="0"
        width={dimensions.width}
        height={dimensions.height}
      />
    </svg>
  );
}

export default propulsionSvg;
