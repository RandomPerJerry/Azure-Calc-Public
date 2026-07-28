import ltsSvg from "../svg/ltsSvg";

function ltsNode({ id, pos, nodePos }) {
  const ltsImage = ltsSvg({});
  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: ltsImage,
    },
    type: "image",
  };

  return nodeObject;
}

export default ltsNode;
