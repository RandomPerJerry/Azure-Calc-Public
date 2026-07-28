import propulsionSvg from "../svg/propulsionSvg";
import { Position } from "@xyflow/react";

function propulsionNode({ id, pos, nodePos, propulsionSystem, index }) {
  const propulsionImage = propulsionSvg({ propulsionSystem, index });

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: propulsionImage,
      nodeHandles: [
        { id: "output", position: Position.Bottom, style: { bottom: "50%" } },
      ],
    }, 
    type: "image",
  };

  return nodeObject;
}

export default propulsionNode;
