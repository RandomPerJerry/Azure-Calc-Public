import { Handle } from "@xyflow/react";
import React, { memo } from "react";

function ButtonNode({ data }) {

    const renderContent = () => {
        // If SVG component is provided, render it directly
        if (data.svgComponent) {
            return data.svgComponent;
        }
        // Fallback if neither is provided
        return <div>Missing node image</div>;
    };


    return (
        <>
            {renderContent()}
            
            {data.nodeHandles && data.nodeHandles.map((handle, index) => (
                <Handle
                    key={index}
                    position={handle.position}
                    id={handle.id}
                    style={handle.style}
                />
            ))}
        </>
    );
}

export default ButtonNode;