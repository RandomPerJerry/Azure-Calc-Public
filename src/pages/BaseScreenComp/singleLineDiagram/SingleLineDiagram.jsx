import React, { useState, useMemo, useEffect } from "react";
import { ReactFlow, ConnectionMode, Position } from "@xyflow/react";
import useShipComponent from "../../../hooks/useShipComponent";
import batterySystemFactory from "./SystemFactories/batterySystemFactory";
import propulsionSystemFactory from "./SystemFactories/propulsionSystemFactory";
import generatorSystemFactory from "./SystemFactories/generatorSystemFactory";
import shorePowerStationSystemFactory from "./SystemFactories/shoreConnectionFactory";
import auxiliarySystemFactory from "./SystemFactories/auxiliaryUnitSystemFactory";
import hotelLoadSystemFactory from "./SystemFactories/hotelLoadSystemFactory";
import otherLoadSystemFactory from "./SystemFactories/otherLoadFactory";
import ImageNode from "./ImageNode";
import BarNode from "./BarNode";
import TextNode from "./textNode";
import YStrightEdge from "./yStraightEdge";

function SingleLineDiagram() {
  const { shipData } = useShipComponent();
  const barData = shipData.busBar;
  const shipSystems = shipData.system;

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const nodeTypes = useMemo(() => ({ barNode: BarNode, image: ImageNode, text: TextNode }), []);
  const edgeTypes = useMemo(() => ({ yStrightEdge: YStrightEdge }), []);

  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    const barNumber = barData.dcLinkNumber;
    
    newNodes.push({
      id: "Bar_Voltage_Display",
      origin: [0.5, 0.5],
      position: {x: 0, y: 0},
      data: {
        label: `Producing\n${barData.dcLinkVoltage} V\nConsuming`,
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        width: '100px',
        height: '70px',
        whiteSpace: 'pre',
        justifyContent: 'center',
      },
      type: 'text',
      draggable: false,
      selectable: false
    })

    const barWidth = 1500;
    const barGap = 160;

    for (let i = 1; i < barNumber + 1; i++) {
      const barPosX =
        (i > 2 ? barWidth + barGap : barGap / 2) * (-1) ** (i + 1);

      const barCenter = barPosX + (barWidth / 2) * (-1) ** (i + 1);
      const busBarNode = {
        id: `busBar${i}`,
        origin: i % 2 === 1 ? [0, 0.5] : [1, 0.5],
        position: { x: barPosX, y: 0 },
        data: {
          width: barWidth,
          height: 5,
          nodeHandles: [
            {
              id: `busBar${i}-handle`,
              position: Position.Bottom,
              style: {
                bottom: "65%",
              },
            },
          ],
        },
        type: "barNode",
      };

      const textPosX = barPosX + (barWidth * ((-1) ** (i + 1)))

      const busBarNumNode = {
        id: `busBar${i}-num`,
        origin: i % 2 === 1 ? [0, 0.5] : [1, 0.5],
        position: { x: textPosX, y: 0 },
        type: 'text',
        data: {
          label: `Bar ${i}`,
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
          width: '50px',
          height: '40px',
          whiteSpace: 'pre',
          justifyContent: 'center',
        }
      }

      newNodes.push(busBarNode, busBarNumNode);

      const batterySystems = shipSystems.batterySystem.filter(
        (s) => s.barNumber === i
      );
      const batterySystemLength = batterySystems.length;
      batterySystems.forEach((batterySystem, index) => {
        let xPos = 0;

        const positionIndex = index + 1;
        const maxWidth = 620;
        const gap = maxWidth / (batterySystemLength + 1);
        const startOffset = -maxWidth / 2;

        xPos = barCenter + startOffset + positionIndex * gap;

        const {
          nodes: batteryNodes,
          connectionNodeId: batteryConnectionNodeId,
        } = batterySystemFactory({ batterySystem, pos: { x: xPos, y: 0 } });

        const connectionEdge = {
          id: `${batterySystem.id}-busBar${i}`,
          source: batteryConnectionNodeId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        };

        newNodes.push(...batteryNodes);
        newEdges.push(connectionEdge);
      });

      const propulsionSystem = shipSystems.propulsionSystem.find(
        (s) => s.barNumber === i
      );
      if (propulsionSystem) {
        const centerOffset = 400 * (i % 2 === 0 ? -1 : 1);
        const {
          nodes: propulsionNodes,
          connectionNodeId: propulsionConnectionNodeId,
        } = propulsionSystemFactory({
          propulsionSystem,
          pos: { x: barCenter + centerOffset, y: 0 },
          index: i,
        });

        newNodes.push(...propulsionNodes);
        newEdges.push({
          id: `${propulsionSystem.id}-busBar${i}`,
          source: propulsionConnectionNodeId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        });
      }

      // ----------------------- Generator --------------------------
      const generatorSystems = shipSystems.generatorGroupSystem.filter(s => s.barNumber === i)
      generatorSystems.forEach((generatorSystem, index) => {
        if (index > 1) return;
        const centerOffset = 350 * (index === 0 ? 1 : -1) * (i % 2 === 0 ? 1 : -1);

        const {
          nodes: generatorNodes,
          connectionNodeId: generatorConnectionNodeId,
        } = generatorSystemFactory({
          generatorSystem,
          pos: { x: barCenter + centerOffset, y: 0},
        })

        newNodes.push(...generatorNodes);
        newEdges.push({
          id: `${generatorSystem.id}-busBar${i}`,
          source: generatorConnectionNodeId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        })
      })

      // ----------------------- Shore Power Station --------------------------
      const shorePowerStationSystems = shipSystems.shorePowerSystem.filter(s => s.barNumber === i)
      shorePowerStationSystems.forEach((shorePowerStationSystem, index) => {
        if (index > 1) return;
        const centerOffset = 500 * (index === 0 ? 1 : -1) * (i % 2 === 0 ? 1 : -1);

        const {
          nodes: shorePowerStationNodes,
          connectionNodeId: shorePowerStationConnectionId,
        } = shorePowerStationSystemFactory({
          shorePowerStationSystem,
          pos: { x: barCenter + centerOffset, y: 0},
        })
        newNodes.push(...shorePowerStationNodes);
        newEdges.push({
          id: `${shorePowerStationSystem.id}-busBar${i}`,
          source: shorePowerStationConnectionId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        })
      })

      // ----------------------- Auxiliary Unit System --------------------------
      const auxiliaryUnitSystems = shipSystems.auxiliaryPowerUnitSystem.filter(s => s.barNumber === i)
      auxiliaryUnitSystems.forEach((auxiliaryUnitSystem, index) => {
        if (index > 2) return;
        const centerOffset = 700 * (index === 0 ? 1 : -1) * (i % 2 === 0 ? 1 : -1); 

        const {
          nodes: auxiliaryUnitNodes,
          connectionNodeId: auxiliaryUnitConnectionId,
        } = auxiliarySystemFactory({
          auxiliaryUnitSystem,
          pos: { x: barCenter + centerOffset, y: 0},
        })

        newNodes.push(...auxiliaryUnitNodes);
        newEdges.push({
          id: `${auxiliaryUnitSystem.id}-busBar${i}`,
          source: auxiliaryUnitConnectionId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        })
      })

      // ----------------------- Hotel Load System --------------------------
      const hotelLoadSystems = shipSystems.hotelLoadSystem.filter(s => s.barNumber === i)
      hotelLoadSystems.forEach((hotelLoadSystem, index) => {
        if (index > 2) return;
        const centerOffset = (index === 0 ? 430 : 300) * (i % 2 === 0 ? 1 : -1); 

        const {
          nodes: hotelLoadNodes,
          connectionNodeId: hotelLoadConnectionId,
        } = hotelLoadSystemFactory({
          hotelLoadSystem,
          pos: { x: barCenter + centerOffset, y: 0},
        })

        newNodes.push(...hotelLoadNodes);
        newEdges.push({
          id: `${hotelLoadSystem.id}-busBar${i}`,
          source: hotelLoadConnectionId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        })
      })

      // ----------------------- Other Load System --------------------------
      const otherLoadSystems = shipSystems.otherLoadSystem.filter(s => s.barNumber === i)
      otherLoadSystems.forEach((otherLoadSystem, index) => {
        if (index > 2) return;
        const centerOffset = (index === 0 ? 730 : 580) * (i % 2 === 0 ? 1 : -1); 

        const {
          nodes: otherLoadNodes,
          connectionNodeId: otherLoadConnectionId,
        } = otherLoadSystemFactory({
          otherLoadSystem,
          pos: { x: barCenter + centerOffset, y: 0},
        })

        newNodes.push(...otherLoadNodes);
        newEdges.push({
          id: `${otherLoadSystem.id}-busBar${i}`,
          source: otherLoadConnectionId,
          target: `busBar${i}`,
          type: "yStrightEdge",
        })
      })
    }

    // BatterySystem
    setNodes(newNodes);
    setEdges(newEdges);
  }, [barData.dcLinkNumber, barData.dcLinkVoltage, JSON.stringify(shipData.system)]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <style>
        {`
          .react-flow__handle {
            opacity: 0 !important;
          }
        `}
      </style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        nodesDraggable={false}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        fitView
      >
      </ReactFlow>
    </div>
  );
}

export default SingleLineDiagram;
