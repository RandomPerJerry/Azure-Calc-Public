import shorePowerStationNode from "../nodes/shorePowerStationNode";
import dcAcConverterNode from "../nodes/dcAcConverterNode";
import fuseNode from "../nodes/fuseNode";

function shorePowerStationSystemFactory ({shorePowerStationSystem, pos}) {
  const systemId = shorePowerStationSystem.id;
  const systemData = shorePowerStationSystem.data;

  const fuseNodeObject = fuseNode({
    id: `${systemId}-fuse`,
    pos: { x: pos.x, y: pos.y - 60 },
    nodePos: [0.5, 1],
  });

  const dcAcConverterNodeObject = dcAcConverterNode({
    id: `${systemId}-dcAcConverter`,
    pos: { x: pos.x, y: pos.y - 150 },
    nodePos: [0.5, 1],
  });

  const shoreConnectionNodeObject = shorePowerStationNode({
    id: `${systemId}-shoreConnection`,
    pos: { x: pos.x, y: pos.y - 340 },
    nodePos: [0.5, 1],
  })

  const shoreConnectionNodeText = {
    id: `${systemId}-shoreConnection-text-description`,
    origin: [0.5, 1],
    position: {x: pos.x, y: pos.y - 485},
    type: 'text',
    data: {
      label: `${systemData.description}\n${systemData.power.toFixed(2)}kW`,
      color: '#333',
      width: '100px',
      height: '150px',
      whiteSpace: 'pre-wrap',
      justifyContent: 'center',
    }
  }

  const dcAcConverterNodeText = {
    id: `${systemId}-dcAcConverter-text`,
    origin: [0, 0.5],
    position: {x: pos.x + 30, y: pos.y - 210},
    type: 'text',
    data: {
      label: `${systemData.dcAcConverter.data.description}`
    }
  }

  const fuseNodeText = {
    id: `${systemId}-fuse-text`,
    origin: [0, 0.5],
    position: {x: pos.x + 30, y: pos.y - 90},
    type: 'text',
    data: {
      label: `Fuse`
    }
  }

  return {
    nodes: [
      dcAcConverterNodeObject,
      shoreConnectionNodeObject,
      fuseNodeObject,
      shoreConnectionNodeText,
      dcAcConverterNodeText,
      fuseNodeText
    ],
    connectionNodeId: shoreConnectionNodeObject.id,
  };
}

export default shorePowerStationSystemFactory;