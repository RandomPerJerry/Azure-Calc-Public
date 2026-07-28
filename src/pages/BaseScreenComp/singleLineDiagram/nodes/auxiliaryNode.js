import auxiliarySvg from "../svg/auxilarySystemSvg";
import { Position } from "@xyflow/react";

function auxiliaryNode({ id, pos, nodePos }) {
  const auxiliaryImage = auxiliarySvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: auxiliaryImage,
      nodeHandles: [{ id: "output", position: Position.Bottom, style: { bottom: "50%" } }],
    },
    type: "image",
  };

  return nodeObject;
}

export default auxiliaryNode;
