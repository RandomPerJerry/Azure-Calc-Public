import shorePowerStationSvg from "../svg/shorePowerStationSvg";
import { Position } from "@xyflow/react";

function shoreConnectionNode({ id, pos, nodePos }) {
  const shoreConnectionImage = shorePowerStationSvg({});

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: shoreConnectionImage,
      nodeHandles: [{ id: "output", position: Position.Bottom, style: { bottom: "50%" } }],
    },
    type: "image",
  };

  return nodeObject;
}

export default shoreConnectionNode;
