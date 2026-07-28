
import hotelLoadSvg from "../svg/hotelLoadSystemSvg";
import { Position } from "@xyflow/react";

function hotelLoadNode({ id, pos, nodePos }) {
  const hotelLoadImage = hotelLoadSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: hotelLoadImage,
      nodeHandles: [{ id: "output", position: Position.Bottom, style: { bottom: "50%" } }],
    },
    type: "image",
  };

  return nodeObject;
}

export default hotelLoadNode;
