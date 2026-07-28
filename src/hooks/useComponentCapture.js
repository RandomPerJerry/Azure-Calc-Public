// src/hooks/useComponentCapture.js
import { useState, useCallback } from "react";
import { toPng } from "html-to-image";

const useComponentCapture = () => {
  const [images, setImages] = useState({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const captureAll = useCallback(async () => {
    setIsCapturing(true);

    const captured = {};

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture bidding list
      const biddingList = document.querySelector("#capture-bidding-list .bidding-list");
      if (biddingList && biddingList.offsetHeight > 0) {
        captured.biddingList = await toPng(biddingList, {
          backgroundColor: "#fff",
        });
        console.log('✅ Captured bidding list');
      }

      // Capture cost analysis
      const costAnalysis = document.querySelector("#capture-cost-analysis .table-container");
      if (costAnalysis && costAnalysis.offsetHeight > 0) {
        captured.costAnalysis = await toPng(costAnalysis, {
          backgroundColor: "#fff",
        });
        console.log('✅ Captured cost analysis');
      }

      // Capture single line diagram
      const sldViewport = document.querySelector("#capture-sld .react-flow__viewport");
      if (sldViewport && sldViewport.offsetHeight > 0) {
        captured.singleLineDiagram = await toPng(sldViewport, {
          backgroundColor: "#fff",
          pixelRatio: 4,
        });
        console.log('✅ Captured single line diagram');
      }

      // Capture energy consumption graph
      const energyConsumptionGraph = document.querySelector("#capture-energy-consumption-graph .energy-graphs-container");
      if (energyConsumptionGraph && energyConsumptionGraph.offsetHeight > 0) {
        captured.energyConsumptionGraph = await toPng(energyConsumptionGraph, {
          backgroundColor: "#fff",
        });
        console.log('✅ Captured energy consumption graph');
      }

      // ✅ Capture working condition tables individually
      const workingConditionContainer = document.querySelector("#capture-working-condition .working-condition-tables");
      if (workingConditionContainer) {
        const tables = workingConditionContainer.querySelectorAll('[class*="working-condition-table-"]');
        const workingConditionTables = [];
        
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
          if (table && table.offsetHeight > 0) {
            const tableImage = await toPng(table, {
              backgroundColor: "#fff",
            });
            workingConditionTables.push(tableImage);
            console.log(`✅ Captured working condition table ${i + 1}`);
          }
        }
        
        if (workingConditionTables.length > 0) {
          captured.workingConditionTables = workingConditionTables;
        }
      }

      if (Object.keys(captured).length > 0) {
        setImages(captured);
        console.log(`🎉 Captured ${Object.keys(captured).length} components`);
      }
    } catch (error) {
      console.error("Capture failed:", error);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clear = () => setImages({});

  return {
    images,
    isCapturing,
    shouldRender,
    captureAll,
    clear,
    count: Object.keys(images).length,
    hasImages: Object.keys(images).length > 0,
  };
};

export default useComponentCapture;
