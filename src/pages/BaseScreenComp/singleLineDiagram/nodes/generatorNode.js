import generatorSvg from "../svg/generatorSvg";
import { Position } from "@xyflow/react";

function generatorNode({ id, pos, nodePos }) {
  const generatorImage = generatorSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: generatorImage,
      nodeHandles: [{ id: "output", position: Position.Bottom, style: { bottom: "50%" } }],
    },
    type: "image",
  };

  return nodeObject;
}

export default generatorNode;
