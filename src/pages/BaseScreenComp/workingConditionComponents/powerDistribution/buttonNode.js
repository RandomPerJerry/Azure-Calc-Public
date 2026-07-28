import { Handle } from "@xyflow/react";
import React, { memo } from "react";

function ButtonNode({ data }) {

    const renderContent = () => {
        
        if (data.svgComponent) {
            return data.svgComponent;
        }
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

export default memo(ButtonNode);