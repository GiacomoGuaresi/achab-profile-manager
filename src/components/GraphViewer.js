import React, { useEffect, useRef, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
} from 'reactflow';
import { Box, TextField, IconButton, Stack } from '@mui/material';
import getLayoutedElements from '../utils/layout';
import 'reactflow/dist/style.css';
import SearchIcon from '@mui/icons-material/Search';

const GraphViewer = ({ profileGraph, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const reactFlowInstance = useRef(null);

  useEffect(() => {
    if (profileGraph && !profileGraph.error) {
      getLayoutedElements(profileGraph.nodes, profileGraph.edges).then(
        ({ nodes, edges }) => {
          setNodes(nodes);
          setEdges(edges);
        }
      );
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [profileGraph]);

  const handleSearch = () => {
    if (!searchTerm) return;
    const foundNode = nodes.find((n) =>
      n.data?.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (foundNode && reactFlowInstance.current) {
      const { x, y } = foundNode.position;
      reactFlowInstance.current.setCenter(x, y, {
        zoom: 1.5,
        duration: 800,
      });
    }
  };

  // Cerca anche premendo Invio
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <ReactFlowProvider>
      <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
        {/* Pannello di ricerca a sinistra */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 1000,
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 1,
            p: 2,
            boxShadow: 3,
            minWidth: 280,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="Search node"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={onKeyDown}
              fullWidth
            />
            <IconButton onClick={handleSearch} aria-label="search" sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}>
              <SearchIcon />
            </IconButton>
          </Stack>
        </Box>

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
          onInit={(instance) => (reactFlowInstance.current = instance)}
        >
          <MiniMap />
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Box>
    </ReactFlowProvider>
  );
};

export default GraphViewer;
