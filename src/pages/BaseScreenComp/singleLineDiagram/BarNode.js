import React from "react";
import { Handle } from "@xyflow/react";

function BarNode({ data }) {
  const { width = 200, height = 40, nodeHandles = [] } = data;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: "black",
        border: "1px solid #333",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "12px",
        position: "relative",
      }}
    >
      {nodeHandles &&
        nodeHandles.map((handle, index) => (
          <Handle
            key={index}
            position={handle.position}
            id={handle.id}
            style={handle.style}
          />
        ))}
    </div>
  );
}

export default BarNode;
