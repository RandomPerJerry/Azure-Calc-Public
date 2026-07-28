import dcAcConverterSvg from "../svg/dcAcConverterSvg";

function dcAcConverterNode({ id, pos, nodePos }) {
  const dcAcControllerImage = dcAcConverterSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: dcAcControllerImage,
    },
    type: "image",
  };

  return nodeObject;
}

export default dcAcConverterNode;