// src/renderer/pages/GraphOverview.tsx
import React, { useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box, Button, Typography,
  Dialog, DialogTitle, DialogContent,
  TextField, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const initialGraphs = [
  {
    id: 'graph1',
    nodes: [
      { id: '1', position: { x: 0, y: 0 }, data: { label: 'Padre 1' } },
      { id: '2', position: { x: -100, y: 100 }, data: { label: 'Figlio 1A' } },
      { id: '3', position: { x: 100, y: 100 }, data: { label: 'Figlio 1B' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
    ],
  },
  {
    id: 'graph2',
    nodes: [
      { id: '4', position: { x: 500+0, y: 0 }, data: { label: 'Padre 2' } },
      { id: '5', position: { x: 500+-100, y: 100 }, data: { label: 'Figlio 2A' } },
      { id: '6', position: { x: 500+100, y: 100 }, data: { label: 'Figlio 2B' } },
    ],
    edges: [
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e4-6', source: '4', target: '6' },
    ],
  },
  {
    id: 'graph3',
    nodes: [
      { id: '7', position: { x: 1000+0, y: 0 }, data: { label: 'Padre 3' } },
      { id: '8', position: { x: 1000+-100, y: 100 }, data: { label: 'Figlio 3A' } },
      { id: '9', position: { x: 1000+100, y: 100 }, data: { label: 'Figlio 3B' } },
    ],
    edges: [
      { id: 'e7-8', source: '7', target: '8' },
      { id: 'e7-9', source: '7', target: '9' },
    ],
  },
];

export default function GraphOverview() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [graphs, setGraphs] = useState(initialGraphs);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const navigate = useNavigate();

  const handleNodeClick = (_event: any, node: Node) => {
    setSelectedNode(node);
  };

  const handleClone = () => {
    if (!selectedNode) return;
    const graphIndex = graphs.findIndex(g => g.nodes.find(n => n.id === selectedNode.id));
    const graph = graphs[graphIndex];
    const newId = Date.now().toString();
    const newNode = {
      id: newId,
      data: { label: selectedNode.data.label + ' (clone)' },
      position: { x: selectedNode.position.x + 50, y: selectedNode.position.y + 50 },
    };
    const updatedGraphs = [...graphs];
    updatedGraphs[graphIndex].nodes.push(newNode);
    setGraphs(updatedGraphs);
  };

  const handleCreateChild = () => {
    setNameDialogOpen(true);
  };

  const confirmCreateChild = () => {
    if (!selectedNode || !newNodeName) return;
    const graphIndex = graphs.findIndex(g => g.nodes.find(n => n.id === selectedNode.id));
    const graph = graphs[graphIndex];
    const newId = Date.now().toString();
    const newNode = {
      id: newId,
      data: { label: newNodeName },
      position: { x: selectedNode.position.x + Math.random() * 200 - 100, y: selectedNode.position.y + 150 },
    };
    const newEdge = { id: `e${selectedNode.id}-${newId}`, source: selectedNode.id, target: newId };
    const updatedGraphs = [...graphs];
    updatedGraphs[graphIndex].nodes.push(newNode);
    updatedGraphs[graphIndex].edges.push(newEdge);
    setGraphs(updatedGraphs);
    setNameDialogOpen(false);
    setNewNodeName('');
  };

  const handleDelete = () => {
    if (!selectedNode) return;
    const graphIndex = graphs.findIndex(g => g.nodes.find(n => n.id === selectedNode.id));
    const graph = graphs[graphIndex];
    const hasChildren = graph.edges.some(e => e.source === selectedNode.id);
    if (hasChildren) return alert('Impossibile eliminare: il nodo ha dei figli.');
    const updatedGraphs = [...graphs];
    updatedGraphs[graphIndex].nodes = graph.nodes.filter(n => n.id !== selectedNode.id);
    updatedGraphs[graphIndex].edges = graph.edges.filter(e => e.target !== selectedNode.id);
    setGraphs(updatedGraphs);
    setSelectedNode(null);
  };

  const handleOpenView = () => {
    navigate('/view');
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box height="600px" p={2} sx={{ border: '1px solid #ccc' }}>
        <ReactFlow
          nodes={graphs.flatMap(g => g.nodes)}
          edges={graphs.flatMap(g => g.edges)}
          onNodeClick={handleNodeClick}
          fitView>
          <MiniMap />
          <Controls />
          <Background gap={12} />
        </ReactFlow>
      </Box>


      {selectedNode && (
        <Box sx={{ bgcolor: '#f5f5f5', p: 2, mt: 2, borderTop: '1px solid #ccc' }}>
          <Typography variant="h6">Informazioni Nodo</Typography>
          <Typography>Name: {selectedNode.data.label}</Typography>
          <Typography>Path: /mock/path/{selectedNode.id}</Typography>
          <Typography>Version: 1.0.0</Typography>
          <Typography>Type: Nodo fittizio</Typography>
          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" onClick={handleClone}>Clona</Button>
            <Button variant="contained" onClick={handleCreateChild}>Crea Figlio</Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>Elimina</Button>
            <Button variant="outlined" onClick={handleOpenView}>Apri</Button>
          </Box>
        </Box>
      )}

      <Dialog open={nameDialogOpen} onClose={() => setNameDialogOpen(false)}>
        <DialogTitle>Inserisci nome del figlio</DialogTitle>
        <Divider />
        <DialogContent>
          <TextField
            fullWidth
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            label="Nome"
            sx={{ mt: 2 }}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={() => setNameDialogOpen(false)}>Annulla</Button>
            <Button variant="contained" onClick={confirmCreateChild}>Conferma</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}