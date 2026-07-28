import React, { useMemo, useState, useEffect, memo } from "react";
import { ReactFlow, Position, ConnectionMode } from "@xyflow/react";
import useShipComponent from "../../../../hooks/useShipComponent";
import EditPanel from "./editPanel";
import ButtonNode from "./buttonNode";
import "@xyflow/react/dist/style.css";
import {
  propulsionSVG,
  batterySVG,
  generatorSVG,
  shoreConnectionSVG,
  otherLoadSVG,
  hotelLoadSVG,
} from "./componentNodeSvg";
import StepEdge from "./stepEdge";
function DistributionDiagram({ conditionData, onUpdate }) {
  const { getSystem } = useShipComponent();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isEditingPanel, setIsEditingPanel] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const nodeType = useMemo(() => ({ button: ButtonNode }), []);
  const edgeTypes = useMemo(() => ({ step: StepEdge }), []);

  const onEditSystem = (editType, editId = "") => {
    if (!editType) return;

    setEditingType(editType);
    setEditingId(editId);
    setIsEditingPanel(true);
  };

  const closeEditSystem = () => {
    setIsEditingPanel(false);
    setEditingType(null);
    setEditingId(null);
  };

  const getPropulsionSizeClass = (propulsionType, index, totalCount) => {
    const dieselSuffix = propulsionType === "diesel" ? "-d" : "";

    let sizeClass;
    if (totalCount === 1) {
      sizeClass = "medium";
    } else if (totalCount >= 2 && (index === 0 || index === totalCount - 1)) {
      sizeClass = "large";
    } else if (totalCount >= 4 && (index === 1 || index === 2)) {
      sizeClass = "small";
    } else {
      sizeClass = "medium";
    }

    return `${sizeClass}${dieselSuffix}`;
  };

  // Create nodes based on data
  useEffect(() => {
    const newNodes = [];

    // Create nodes for each system component
    Object.keys(conditionData).forEach((systemType) => {
      switch (systemType) {
        case "propulsionSystem": {
          const propulsionList = conditionData.propulsionSystem;
          const propulsionNum = propulsionList.length;

          propulsionList.forEach((propulsionItem, index) => {
            const propulsionItemData = getSystem(
              propulsionItem.id,
              "propulsionSystem"
            ).data;

            const x = -400; // ← Changed from 200 to -400 (200 - 600)
            const y = (400 / (propulsionNum + 1)) * (index + 1) - 200; // ← Subtract 300 offset

            const handlePosition =
              index >= propulsionNum / 2 ? Position.Bottom : Position.Top;
            const propulsionType = propulsionItemData.propulsionMode;
            const propulsionNodeId = `propulsion-${propulsionItem.id}`;
            const sizeClass = getPropulsionSizeClass(
              propulsionType,
              index,
              propulsionNum
            );
            let motorState;
            let dieselState;
            switch (propulsionType) {
              case "electric":
                motorState =
                  propulsionItem.systemState.propulsionPowerDistribution;
                dieselState = false;
                break;

              case "hybrid":
                switch (propulsionItem.systemState.powerMode) {
                  case "Full Electric":
                    motorState =
                      propulsionItem.systemState.propulsionPowerDistribution;
                    dieselState = false;
                    break;

                  case "Full Diesel":
                    motorState = false;
                    dieselState =
                      propulsionItem.systemState.propulsionPowerDistribution;
                    break;

                  case "Power Supply":
                  case "Boost Mode":
                    motorState = true;
                    dieselState = true;
                    break;

                  default:
                    motorState = false;
                    dieselState = false;
                    break;
                }
                break;

              case "diesel":
                motorState = false;
                dieselState =
                  propulsionItem.systemState.propulsionPowerDistribution;
                break;

              default:
                motorState = false;
                dieselState = false;
                break;
            }

            const style =
              propulsionType === "electric"
                ? index >= propulsionNum / 2
                  ? { left: 114.22, bottom: 2 } // electric bottom
                  : { left: 114.22 } // electric top
                : propulsionType === "hybrid"
                ? index >= propulsionNum / 2
                  ? { left: 108, bottom: 12 } // hybrid bottom
                  : { left: 108, top: 10 } // hybrid top
                : index >= propulsionNum / 2
                ? { left: 152, bottom: 2 } // diesel bottom
                : { left: 152 }; // diesel top

            const svgComponent = propulsionSVG({
              type: propulsionType,
              state: { motorActive: motorState, dieselActive: dieselState },
              onClick: () =>
                onEditSystem("propulsionSystem", propulsionItem.id),
            });

            const propulsionNode = {
              id: propulsionNodeId,
              origin: [0, 0.5],
              position: { x, y },
              data: {
                svgComponent,
                systemType: "propulsionSystem",
                nodeHandles: [{ position: handlePosition, style }],
                offsetSize: sizeClass,
                propulsionType,
              },
              type: "button",
            };

            newNodes.push(propulsionNode);
          });
          break;
        }

        case "batterySystem": {
          if (conditionData.batterySystem.length) {
            const batteryComponent = batterySVG();

            const batteryNode = {
              id: "battery",
              origin: [0.5, 0.5],
              position: { x: 0, y: 0 }, // ← Changed from { x: 600, y: 300 } to center
              data: {
                svgComponent: batteryComponent,
                systemType: "batterySystem",
                nodeHandles: [
                  { id: "battery-left", position: Position.Left },
                  { id: "battery-right", position: Position.Right },
                  { id: "battery-top", position: Position.Top },
                  { id: "battery-bottom", position: Position.Bottom },
                  {
                    id: "battery-right-top",
                    position: Position.Right,
                    style: { top: "25%" },
                  },
                  {
                    id: "battery-right-bottom",
                    position: Position.Right,
                    style: { top: "75%" },
                  },
                ],
              },
              type: "button",
            };
            newNodes.push(batteryNode);
          }
          break;
        }

        case "generatorGroupSystem": {
          const generatorList = conditionData.generatorGroupSystem;

          generatorList.forEach((generatorItem, index) => {
            const x = 200; // ← Changed from 800 to 200 (800 - 600)
            const yOffset = Math.floor(index / 2) * 100 + 70;
            const y = (index % 2 === 0 ? 200 - yOffset : 200 + yOffset) - 200; // ← Subtract 300 offset
            const generatorNodeId = `generator-${generatorItem.id}`;
            const handlePosition =
              index % 2 === 0 ? Position.Bottom : Position.Top;

            const generatorState = generatorItem.systemState.generatorPower;

            const generatorComponent = generatorSVG({
              onClick: () =>
                onEditSystem("generatorGroupSystem", generatorItem.id),
              active: generatorState,
            });

            const generatorNode = {
              id: generatorNodeId,
              origin: [0.5, 0.5],
              position: { x, y },
              data: {
                svgComponent: generatorComponent,
                systemType: "generatorGroupSystem",
                isInner: index < 2,
                nodeHandles: [{ position: handlePosition }],
              },
              type: "button",
            };

            newNodes.push(generatorNode);
          });
          break;
        }

        case "shorePowerSystem": {
          if (conditionData?.shorePowerSystem?.length) {
            const shorePowerList = conditionData.shorePowerSystem;
            const isActivated = shorePowerList.some(
              (s) => s.systemState.activate
            );

            const shoreConnectionComponent = shoreConnectionSVG({
              active: isActivated,
              onClick: () => onEditSystem("shorePowerSystem"),
            });

            const shoreConnectionNode = {
              id: "shoreConnection",
              origin: [0.5, 0.5],
              position: { x: 0, y: -150 }, // ← Changed from { x: 600, y: 150 }
              data: {
                svgComponent: shoreConnectionComponent,
                systemType: "shorePowerSystem",
                nodeHandles: [
                  {
                    id: "shoreConnetionHandle",
                    position: Position.Bottom,
                  },
                ],
              },
              type: "button",
            };
            newNodes.push(shoreConnectionNode);
          }
          break;
        }

        case "otherLoadSystem": {
          if (conditionData?.otherLoadSystem?.length) {
            const otherLoadList = conditionData.otherLoadSystem;
            const auxiliaryPowerList = conditionData.auxiliaryPowerUnitSystem;
            const isActivated =
              otherLoadList.some((s) => s.systemState.activate) ||
              auxiliaryPowerList.some((s) => s.systemState.activate);

            const otherLoadComponent = otherLoadSVG({
              active: isActivated,
              onClick: () => onEditSystem("otherLoadSystem"),
            });

            const otherLoadNode = {
              id: "otherLoad",
              origin: [0.5, 0.5],
              position: { x: 0, y: 150 }, // ← Changed from { x: 600, y: 450 }
              data: {
                svgComponent: otherLoadComponent,
                systemType: "otherLoadSystem",
                nodeHandles: [
                  {
                    id: "otherLoadHandle",
                    position: Position.Top,
                  },
                ],
              },
              type: "button",
            };
            newNodes.push(otherLoadNode);
          }
          break;
        }

        case "hotelLoadSystem": {
          if (conditionData?.hotelLoadSystem?.length) {
            const hotelLoadList = conditionData.hotelLoadSystem;
            const isActivated = hotelLoadList.some(
              (s) => s.systemState.activate
            );

            const hotelLoadComponent = hotelLoadSVG({
              active: isActivated,
              onClick: () => onEditSystem("hotelLoadSystem"),
            });

            const hotelLoad = {
              id: "hotelLoad",
              origin: [0.5, 0.5],
              position: { x: 350, y: 0 }, // ← Changed from { x: 950, y: 300 }
              data: {
                svgComponent: hotelLoadComponent,
                systemType: "hotelLoadSystem",
                nodeHandles: [
                  {
                    id: "hotelLoadHandle",
                    position: Position.Left,
                  },
                ],
              },
              type: "button",
            };
            newNodes.push(hotelLoad);
          }
          break;
        }
      }
    });
    console.log("a", newNodes);
    setNodes(newNodes);
  }, [conditionData]);

  useEffect(() => {
    console.log("🔍 Condition data structure:", {
      keys: Object.keys(conditionData),
      propulsionCount: conditionData.propulsionSystem?.length || 0,
      batteryCount: conditionData.batterySystem?.length || 0,
      generatorCount: conditionData.generatorGroupSystem?.length || 0,
    });
  }, [conditionData]);

  // Create edges based on nodes
  useEffect(() => {
    const batteryNode = nodes.find(
      (node) => node.data.systemType === "batterySystem"
    );
    if (!batteryNode) return;

    const newEdges = [];

    nodes.forEach((node) => {
      if (node.id === batteryNode.id) return;

      const edgeId = `${node.id}-${batteryNode.id}`;

      switch (node.data.systemType) {
        case "propulsionSystem": {
          const isHigher = node.position.y <= batteryNode.position.y;
          const systemState = conditionData.propulsionSystem.find(
            (s) => `propulsion-${s.id}` === node.id
          ).systemState;

          let isFlowing;
          let isReverse;
          switch (node.data.propulsionType) {
            case "hybrid":
              switch (systemState.powerMode) {
                case "Full Electric":
                  isFlowing = systemState.propulsionPowerDistribution;
                  isReverse = false;
                  break;

                case "Full Diesel":
                  isFlowing = false;
                  isReverse = false;
                  break;

                case "Power Supply":
                  isFlowing = true;
                  isReverse = true;
                  break;

                case "Boost Mode":
                  isFlowing = true;
                  isReverse = false;
                  break;

                default:
                  isFlowing = false;
                  isReverse = false;
                  break;
              }
              break;

            case "electric":
              isFlowing = systemState.propulsionPowerDistribution;
              isReverse = false;
              break;

            case "diesel":
            default:
              isFlowing = false;
              isReverse = false;
          }

          const nodeEdge = isReverse
            ? {
                id: edgeId,
                source: node.id,
                target: batteryNode.id,
                targetHandle: "battery-left",
                type: "step",
                data: {
                  type: "propulsion",
                  direction: isHigher ? "up" : "down",
                  flowReversed: true,
                  offsetSize: node.data.offsetSize,
                },
                animated: isFlowing,
              }
            : {
                id: edgeId,
                source: batteryNode.id,
                sourceHandle: "battery-left",
                target: node.id,
                type: "step",
                data: {
                  type: "propulsion",
                  direction: isHigher ? "up" : "down",
                  flowReversed: false,
                  offsetSize: node.data.offsetSize,
                },
                animated: isFlowing,
              };
          newEdges.push(nodeEdge);
          break;
        }

        case "generatorGroupSystem": {
          const isHigher = node.position.y <= batteryNode.position.y;
          const generatorTargetHandle = isHigher
            ? "battery-right-top"
            : "battery-right-bottom";
          const isActivated = conditionData.generatorGroupSystem.find(
            (s) => `generator-${s.id}` === node.id
          ).systemState.generatorPower;
          const nodeEdge = {
            id: edgeId,
            source: node.id,
            target: batteryNode.id,
            targetHandle: generatorTargetHandle,
            type: "step",
            data: {
              type: "generator",
              isInner: node.data.isInner,
              direction: isHigher ? "up" : "down",
            },
            animated: isActivated,
          };
          newEdges.push(nodeEdge);
          break;
        }

        case "shorePowerSystem": {
          const isActivated = conditionData.shorePowerSystem.some(
            (s) => s.systemState.activate
          );

          const nodeEdge = {
            id: edgeId,
            source: node.id,
            target: batteryNode.id,
            targetHandle: "battery-top",
            type: "step",
            data: { type: "default" },
            animated: isActivated,
          };
          newEdges.push(nodeEdge);
          break;
        }

        case "otherLoadSystem": {
          const isActivated =
            conditionData.otherLoadSystem.some((s) => s.systemState.activate) ||
            conditionData.auxiliaryPowerUnitSystem.some(
              (s) => s.systemState.activate
            );

          const nodeEdge = {
            id: edgeId,
            source: node.id,
            target: batteryNode.id,
            targetHandle: "battery-bottom",
            type: "step",
            data: { type: "default" },
            animated: isActivated,
          };
          newEdges.push(nodeEdge);
          break;
        }

        case "hotelLoadSystem": {
          const isActivated = conditionData.hotelLoadSystem.some(
            (s) => s.systemState.activate
          );

          const nodeEdge = {
            id: edgeId,
            source: batteryNode.id,
            target: node.id,
            type: "step",
            data: { type: "default" },
            animated: isActivated,
          };
          newEdges.push(nodeEdge);
          break;
        }
      }
    });

    setEdges(newEdges);
  }, [nodes]);

  console.log(nodes, edges);

  return (
    <div className="distribution-diagram">
      <div className="right-panel extra-padding">
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeType}
            edgeTypes={edgeTypes}
            proOptions={{ hideAttribution: true }}
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            preventScrolling={true}
            minZoom={1}
            maxZoom={1}
            nodesConnectable={false}
            connectOnClick={false}
            connectionMode={ConnectionMode.Loose}
            fitView
          />
        </div>
      </div>
      <div className="left-panel">
        {isEditingPanel ? (
          <EditPanel
            distributionData={conditionData}
            setDistributionData={onUpdate}
            type={editingType}
            systemId={editingId}
            onClose={closeEditSystem}
          />
        ) : (
          <div>
            <h1>Power Distribution</h1>
            <p>Select Components from the right to edit their settings</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(DistributionDiagram);
