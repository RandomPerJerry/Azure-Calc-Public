import generatorNode from "../nodes/generatorNode";
import dcAcConverterNode from "../nodes/dcAcConverterNode";
import fuseNode from "../nodes/fuseNode";

function generatorSystemFactory ({generatorSystem, pos}) {
  const systemId = generatorSystem.id;
  const systemData = generatorSystem.data;

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

  const generatorNodeObject = generatorNode({
    id: `${systemId}-generator`,
    pos: { x: pos.x, y: pos.y - 350 },
    nodePos: [0.5, 1],
  })

  const generatorNodeText = {
    id: `${systemId}-generator-text-description`,
    origin: [0.5, 1],
    position: {x: pos.x, y: pos.y - 705},
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
      generatorNodeObject,
      fuseNodeObject,
      dcAcConverterNodeText,
      generatorNodeText,
      fuseNodeText
    ],
    connectionNodeId: generatorNodeObject.id,
  };
}

export default generatorSystemFactory;