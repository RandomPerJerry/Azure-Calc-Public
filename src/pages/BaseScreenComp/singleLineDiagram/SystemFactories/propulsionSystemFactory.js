import propulsionNode from "../nodes/propulsionNode";
import dcAcConverterNode from "../nodes/dcAcConverterNode";
import fuseNode from "../nodes/fuseNode";

function propulsionSystemFactory({ propulsionSystem, pos, index }) {
  const systemId = propulsionSystem.id;
  const systemData = propulsionSystem.data;
  const isDiesel = propulsionSystem.data.propulsionMode === "diesel";

  const newNodes = [];

  const propulsionNodeObject = propulsionNode({
    id: `${systemId}-propulsion`,
    pos: { x: pos.x, y: pos.y + 550 },
    nodePos: [0.5, 1],
    propulsionSystem,
    index,
  });

  newNodes.push(propulsionNodeObject);

  const fuseNodeObject = fuseNode({
    id: `${systemId}-fuse`,
    pos: { x: pos.x, y: pos.y + 60 },
    nodePos: [0.5, 0],
  });

  newNodes.push(fuseNodeObject);

  if (!isDiesel) {
    const dcAcNodeObject = dcAcConverterNode({
      id: `${systemId}-dcAcConverter`,
      pos: { x: pos.x, y: pos.y + 150 },
      nodePos: [0.5, 0],
    });

    const dcAcConverterNodeText = {
      id: `${systemId}-dcAcConverter-text`,
      origin: [0, 0.5],
      position: { x: pos.x + 30, y: pos.y + 180 },
      type: "text",
      data: {
        label: `${systemData.dcAcConverter.data.description}`,
      },
    };

    newNodes.push(dcAcNodeObject, dcAcConverterNodeText);
  }

  const propulsionNodeText = {
    id: `${systemId}-propulsion-text-description`,
    origin: [0.5, 0],
    position: { x: pos.x, y: pos.y + 600 },
    type: "text",
    data: {
      label: `${systemData.description}\n${systemData.power.toFixed(
        2
      )}kW`,
      color: "#333",
      width: "120px",
      height: "150px",
      whiteSpace: "pre-wrap",
      justifyContent: 'center',
    },
  };

  newNodes.push(propulsionNodeText);

  const fuseNodeText = {
    id: `${systemId}-fuse-text`,
    origin: [0, 0.5],
    position: { x: pos.x + 30, y: pos.y + 80 },
    type: "text",
    data: {
      label: `Fuse`,
    },
  };

  newNodes.push(fuseNodeText);

  return {
    nodes: newNodes,
    connectionNodeId: propulsionNodeObject.id,
  };
}

export default propulsionSystemFactory;
