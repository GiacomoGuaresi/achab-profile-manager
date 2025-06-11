import Elk from 'elkjs/lib/elk.bundled.js';

const elk = new Elk({
  defaultLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.spacing.nodeNode': '75',
    'elk.spacing.edgeNode': '50',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.componentComponent': '200',
    'elk.componentLayout.strategy': 'MULTI_LEVEL_SIMPLEX',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  },
});

const getLayoutedElements = async (nodes, edges) => {
  const graph = {
    id: 'root',
    children: nodes.map((node) => ({
      ...node,
      width: 200,
      height: 40,
    })),
    edges,
  };

  try {
    const layout = await elk.layout(graph);

    const newNodes = layout.children.map((node) => ({
      ...node,
      position: { x: node.x, y: node.y },
      className: 'rounded-lg shadow-md bg-white p-2 border border-gray-200 hover:bg-gray-100',
    }));

    const newEdges = layout.edges.map((edge) => ({
      ...edge,
      markerEnd: {
        type: 'arrowclosed',
        color: '#009688',
      },
      style: {
        strokeWidth: 2,
        stroke: '#333',
      },
    }));

    return { nodes: newNodes, edges: newEdges };
  } catch (err) {
    console.error('ELK layout error:', err);
    return { nodes, edges };
  }
};

export default getLayoutedElements;
