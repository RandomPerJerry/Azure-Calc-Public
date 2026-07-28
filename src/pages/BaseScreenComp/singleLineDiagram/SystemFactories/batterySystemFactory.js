import batteryStringNode from "../nodes/batteryStringNode";
import ltsNode from "../nodes/ltsNode";
import dcDcConverterNode from "../nodes/dcDcConverterNode";
import fuseNode from "../nodes/fuseNode";

function batterySystemFactory({ batterySystem, pos }) {
  const systemId = batterySystem.id;
  const systemData = batterySystem.data;

  const fuseNodeObject = fuseNode({
    id: `${systemId}-fuse`,
    pos: { x: pos.x, y: pos.y - 60 },
    nodePos: [0.5, 1],
  });

  const dcDcConverterNodeObject = dcDcConverterNode({
    id: `${systemId}-dcDcConverter`,
    pos: { x: pos.x, y: pos.y - 150 },
    nodePos: [0.5, 1],
  });

  const ltsNodeObject = ltsNode({
    id: `${systemId}-lts`,
    pos: { x: pos.x, y: pos.y - 260 },
    nodePos: [0.5, 1],
  });

  const batteryStringNodeObject = batteryStringNode({
    id: `${systemId}-batteryString`,
    pos: { x: pos.x, y: pos.y - 370 },
    nodePos: [0.5, 1],
    batteryString: systemData.batteryString,
  });

  // text nodes
  const batteryStringNodeText = {
    id: `${systemId}-batteryString-text-description`,
    origin: [0.5, 1],
    position: {x: pos.x, y: pos.y - 580},
    type: 'text',
    data: {
      label: `${systemData.description}\n${systemData.power.toFixed(2)}kW\nString x${systemData.numberOfUnits}`,
      color: '#333',
      width: '100px',
      height: '150px',
      whiteSpace: 'pre-wrap',
      justifyContent: 'center',
    }
  }

  const ltsNodeText = {
    id: `${systemId}-lts-text`,
    origin: [0, 0.5],
    position: {x: pos.x + 30, y: pos.y - 290},
    type: 'text',
    data: {
      label: `${systemData.lts.data.description}`
    }
  }

  const dcDcConverterNodeText = {
    id: `${systemId}-dcDcConverter-text`,
    origin: [0, 0.5],
    position: {x: pos.x + 30, y: pos.y - 210},
    type: 'text',
    data: {
      label: `${systemData.dcDcConverter.data.description}`
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
      batteryStringNodeObject,
      ltsNodeObject,
      dcDcConverterNodeObject,
      fuseNodeObject,
      batteryStringNodeText,
      ltsNodeText,
      dcDcConverterNodeText,
      fuseNodeText,
    ],
    connectionNodeId: batteryStringNodeObject.id,
  };
}

export default batterySystemFactory;
