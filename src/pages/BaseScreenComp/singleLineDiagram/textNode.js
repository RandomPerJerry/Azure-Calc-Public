import React from "react";

function TextNode({ data }) {
  return (
    <div
      style={{
        background: "transparent",
        border: 'none',

        padding: data.padding || "0",
        margin: 0,
        fontSize: data.fontSize || "26px",
        color: data.color || "black",
        fontWeight: data.fontWeight || "normal",
        fontFamily: data.fontFamily || "Arial, sans-serif",
        textAlign: data.textAlign || "center",
        whiteSpace: data.whiteSpace || "pre-wrap",
        wordBreak: data.wordBreak || "break-word",
        pointerEvents: "none",
        width: data.width || "4rem",
        height: data.height || "60px",
        overflow: data.overflow || "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: data.justifyContent || "flex-start" ,
      }}
    >
      {data.label}
    </div>
  );
}

export default TextNode;
