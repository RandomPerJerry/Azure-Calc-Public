import hotelLoadNode from "../nodes/hotelLoadNode";
import fuseNode from "../nodes/fuseNode";

function hotelLoadSystemFactory ({hotelLoadSystem, pos}) {
  const systemId = hotelLoadSystem.id;
  const systemData = hotelLoadSystem.data;

  const fuseNodeObject = fuseNode({
    id: `${systemId}-fuse`,
    pos: { x: pos.x, y: pos.y + 60 },
    nodePos: [0.5, 0],
  });

  const hotelLoadNodeObject = hotelLoadNode({
    id: `${systemId}-hotelLoad`,
    pos: { x: pos.x, y: pos.y + 350 },
    nodePos: [0.5, 0],
  })

  const hotelLoadNodeText = {
    id: `${systemId}-hotelLoad-text-description`,
    origin: [0.5, 0],
    position: {x: pos.x, y: pos.y + 450},
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
      hotelLoadNodeObject,
      fuseNodeObject,
      hotelLoadNodeText,
      fuseNodeText,
    ],
    connectionNodeId: hotelLoadNodeObject.id,
  };
}

export default hotelLoadSystemFactory;