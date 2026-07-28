import otherLoadSvg from "../svg/otherLoadSvg";
import { Position } from "@xyflow/react";

function otherLoadNode({ id, pos, nodePos }) {
  const otherLoadImage = otherLoadSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: otherLoadImage,
      nodeHandles: [{ id: "output", position: Position.Bottom, style: { bottom: "50%" } }],
    },
    type: "image",
  };

  return nodeObject;
}

export default otherLoadNode;
