import fuseSvg from "../svg/fuseSvg";

function fuseNode({ id, pos, nodePos }) {
  const fuseImage = fuseSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    zIndex: -1,
    data: {
      svgComponent: fuseImage,
    },
    type: "image",
  };

  return nodeObject;
}

export default fuseNode;
