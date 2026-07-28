import { BaseEdge } from "@xyflow/react";

function YStrightEdge({
  id,
  sourceX,
  sourceY,
  targetY,
  data,
  style = {},
  markerEnd,
}) {
  const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${targetY}`

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        stroke: data?.color || "#000000",
        strokeWidth: data?.strokeWidth || 3,
      }}
      markerEnd={markerEnd}
    />
  );
}

export default YStrightEdge;