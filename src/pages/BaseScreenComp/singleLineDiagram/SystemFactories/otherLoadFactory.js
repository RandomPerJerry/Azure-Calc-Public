import otherLoadNode from "../nodes/otherLoadNode";
import dcAcConverterNode from "../nodes/dcAcConverterNode";
import fuseNode from "../nodes/fuseNode";

function otherLoadSystemFactory ({otherLoadSystem, pos}) {
  const systemId = otherLoadSystem.id;
  const systemData = otherLoadSystem.data;

  const fuseNodeObject = fuseNode({
    id: `${systemId}-fuse`,
    pos: { x: pos.x, y: pos.y + 60 },
    nodePos: [0.5, 0],
  });

  const dcAcConverterNodeObject = dcAcConverterNode({
    id: `${systemId}-dcAcConverter`,
    pos: { x: pos.x, y: pos.y + 150 },
    nodePos: [0.5, 0],
  });

  const otherLoadNodeObject = otherLoadNode({
    id: `${systemId}-otherLoad`,
    pos: { x: pos.x, y: pos.y + 350 },
    nodePos: [0.5, 0],
  })


  const otherLoadNodeText = {
    id: `${systemId}-otherLoad-text-description`,
    origin: [0.5, 1],
    position: {x: pos.x, y: pos.y + 635},
    type: 'text',
    data: {
      label: `${systemData.description}\n${systemData.power.toFixed(2)}kW`,
      color: '#333',
      width: '120px',
      height: '150px',
      whiteSpace: 'pre-wrap',
      justifyContent: 'center',
    }
  }

  const dcAcConverterNodeText = {
    id: `${systemId}-dcAcConverter-text`,
    origin: [0, 0.5],
    position: {x: pos.x + 30, y: pos.y + 180},
    type: 'text',
    data: {
      label: `${systemData.dcAcConverter.data.description}`
    }
  }


  const fuseNodeText = {
    id: `${systemId}-fuse-text`,
    origin: [0, 0.5],
    position: {x: pos.x + 30, y: pos.y + 80},
    type: 'text',
    data: {
      label: `Fuse`
    }
  }

  return {
    nodes: [
      dcAcConverterNodeObject,
      otherLoadNodeObject,
      fuseNodeObject,
      otherLoadNodeText,
      dcAcConverterNodeText,
      fuseNodeText
    ],
    connectionNodeId: otherLoadNodeObject.id,
  };
}

export default otherLoadSystemFactory;