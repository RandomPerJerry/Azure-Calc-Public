import React from "react";

function PDFloading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          marginBottom: "20px",
          color: "#333",
          fontWeight: "600",
        }}
      >
        PDF Report Ready to Generate
      </div>

      <div
        style={{
          fontSize: "16px",
          color: "#666",
          lineHeight: "1.5",
          maxWidth: "400px",
        }}
      >
        Click the <strong>"Generate Report"</strong> button in the left panel to capture all components and create your PDF report.
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "15px 25px",
          backgroundColor: "#e3f2fd",
          border: "1px solid #2196f3",
          borderRadius: "8px",
          color: "#1976d2",
          fontSize: "14px",
        }}
      >
        Make sure all your ship data is complete before generating the report
      </div>
    </div>
  );
}

export default PDFloading;