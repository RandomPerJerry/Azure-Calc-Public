import dcDcConverterSvg from "../svg/dcDcConverterSvg";

function dcDcConverterNode({ id, pos, nodePos }) {
  const dcDcControllerImage = dcDcConverterSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: dcDcControllerImage,
    },
    type: "image",
  };

  return nodeObject;
}

export default dcDcConverterNode;
