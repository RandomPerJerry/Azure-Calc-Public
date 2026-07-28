import batteryStringSvg from "../svg/batteryStringSvg";
import { Position } from "@xyflow/react";

function batteryStringNode({ id, pos, nodePos, batteryString }) {
  const batteryPackGrid = JSON.parse(batteryString.data.gridLayout);
  const batteryPackCount = batteryPackGrid
    .flat()
    .filter((cell) => cell === 1).length;

  const batteryStringImage = batteryStringSvg({ batteryPackCount });

  const nodeObject = {
    id,
    origin: nodePos,
    position: { x: pos.x, y: pos.y },
    data: {
      svgComponent: batteryStringImage,
      nodeHandles: [
        { id: "output", position: Position.Bottom, style: { bottom: "50%" } },
      ],
    },
    type: "image",
  };

  return nodeObject;
}

export default batteryStringNode;
