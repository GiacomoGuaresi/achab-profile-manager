import React, { useEffect, useCallback } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, MiniMap, Controls, Background } from 'reactflow';
import getLayoutedElements from '../utils/layout';
import 'reactflow/dist/style.css';

const GraphViewer = ({ profileGraph, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (profileGraph && !profileGraph.error) {
      getLayoutedElements(profileGraph.nodes, profileGraph.edges)
        .then(({ nodes, edges }) => {
          setNodes(nodes);
          setEdges(edges);
        });
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [profileGraph]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(event, node) => {
          console.log('GraphViewer onNodeClick:', node);
          onNodeClick(node);
        }}
        nodesConnectable={false}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default GraphViewer;
