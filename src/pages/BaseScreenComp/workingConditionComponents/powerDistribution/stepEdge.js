import { BaseEdge } from "@xyflow/react";
import { memo } from "react";

const propulsionOffsetMap = {
  'small-d': 5,
  'small' : 10,
  'medium-d': 15,
  'medium': 20,
  'large-d': 30,
  'large': 35
}

function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style = {},
  markerEnd,
}) {
  const determinePath = () => {
    var edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    let verticalOffset;

    switch (data.type) {
      case "propulsion": {
        const offsetLength = propulsionOffsetMap[data.offsetSize] || 0

        verticalOffset =
          data.direction === "down" ? offsetLength : data.direction === "up" ? - offsetLength : 0;
        const horizontalOffset = 10;

        edgePath = data.flowReversed
          ? `
              M ${sourceX} ${sourceY} 
              L ${sourceX} ${sourceY + verticalOffset} 
              L ${targetX - horizontalOffset} ${sourceY + verticalOffset}
              L ${targetX - horizontalOffset} ${targetY}
              L ${targetX} ${targetY}
              `
          : `
              M ${sourceX} ${sourceY}
              L ${sourceX - horizontalOffset} ${sourceY}
              L ${sourceX - horizontalOffset} ${targetY + verticalOffset}
              L ${targetX} ${targetY + verticalOffset}
              L ${targetX} ${targetY}
          `;
        return edgePath;
      }

      case "generator": {
        const isInner = data.isInner;
        const verticalOffset =
          data.direction === "down" ? -10 : data.direction === "up" ? 10 : 0;
        edgePath = isInner
          ? `
                M ${sourceX} ${sourceY}
                L ${sourceX} ${targetY}
                L ${targetX} ${targetY}
            `
          : `
              M ${sourceX} ${sourceY}
              L ${sourceX} ${sourceY + verticalOffset}
              L ${targetX - 2} ${sourceY + verticalOffset}
              L ${targetX - 2} ${targetY}
        `;
        return edgePath;
      }
      case "default": {
        return edgePath;
      }
      default: {
        return edgePath;
      }
    }
  };

  return (
    <BaseEdge
      id={id}
      path={determinePath()}
      style={{
        ...style,
        stroke: data?.color || "#b1b1b7",
        strokeWidth: data?.strokeWidth || 2,
      }}
      markerEnd={markerEnd}
    />
  );
}

export default memo(StepEdge);
