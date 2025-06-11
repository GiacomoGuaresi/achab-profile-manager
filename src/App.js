import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Drawer, // Imported for the information panel
  IconButton, // Imported for the close button in the panel
} from '@mui/material';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'reactflow';
import Elk from 'elkjs/lib/elk.bundled.js';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import CloseIcon from '@mui/icons-material/Close'; // Icon for the close button
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import 'reactflow/dist/style.css';

// Initialize ELK for graph layouting
const elk = new Elk({
  defaultLayoutOptions: {
    'elk.algorithm': 'layered', // Use a layered algorithm for hierarchical graphs
    'elk.direction': 'DOWN', // Layout direction from top to bottom
    'elk.spacing.nodeNode': '75', // Spacing between nodes
    'elk.spacing.edgeNode': '50', // Spacing between edges and nodes
    'elk.layered.spacing.nodeNodeBetweenLayers': '100', // Spacing between nodes in different layers
    'elk.spacing.componentComponent': '200', // Spacing between disconnected components
    'elk.componentLayout.strategy': 'MULTI_LEVEL_SIMPLEX', // Strategy for component layout
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX', // Strategy for node placement within layers
  },
});

// Define a custom Material-UI theme
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#009688', // Primary color for AppBar and accents
    },
    background: {
      default: '#f5f5f5', // Light gray background to make the graph stand out
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Use Inter font
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Optional: disable ripple effect for a cleaner look
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners to all Paper-based components
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners to select input
        },
      },
    },
  },
});

const App = () => {
  // State for vendor folders retrieved from the API
  const [vendorFolders, setVendorFolders] = useState([]);
  // State for the currently selected vendor
  const [selectedVendor, setSelectedVendor] = useState('');
  // State for the profile graph data (nodes and edges)
  const [profileGraph, setProfileGraph] = useState(null);

  // ReactFlow states for nodes and edges, along with change handlers
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for the selected node information and panel visibility
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Define the root path for profiles (Electron-specific)
  const profilesRootPath = 'C:\\Users\\guare\\source\\gingerRepos\\OrcaSlicer\\resources\\profiles';

  // useEffect to fetch vendor folders on component mount
  useEffect(() => {
    // Check if the Electron API is available
    if (window.api) {
      window.api.getVendorFolders(profilesRootPath)
        .then(folders => {
          setVendorFolders(folders);
        })
        .catch(err => {
          console.error("Error retrieving vendor folders:", err);
          // Display an error message if API call fails
          setVendorFolders(["Error loading folders. Check console."]);
        });
    } else {
      console.warn("The 'window.api' API is not available. Are you in a browser or non-Electron environment?");
      // Provide a fallback message if API is not available
      setVendorFolders(["File reading API is not available."]);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Callback to calculate the layout of nodes and edges using ELK
  const getLayoutedElements = useCallback(async (nodes, edges) => {
    // Construct the graph object for ELK layouting
    const graph = {
      id: 'root',
      children: nodes.map((node) => ({
        ...node,
        width: 150, // Fixed width for nodes for consistent layout
        height: 40, // Fixed height for nodes
      })),
      edges: edges,
    };

    try {
      // Perform layout calculation with ELK
      const layoutedGraph = await elk.layout(graph);

      // Map ELK's layouted nodes back to ReactFlow node format
      const newNodes = layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y }, // Set position from ELK layout
        // Add styling for rounded corners using Tailwind-like classes
        className: 'rounded-lg shadow-md bg-white p-2 border border-gray-200 hover:bg-gray-100',
      }));

      // Map ELK's layouted edges back to ReactFlow edge format
      const newEdges = layoutedGraph.edges.map(edge => ({
        ...edge,
        // Add arrow marker at the end of edges
        markerEnd: {
          type: 'arrowclosed',
          color: customTheme.palette.primary.main, // Use theme primary color for arrows
        },
        style: {
          strokeWidth: 2, // Thicker stroke for better visibility
          stroke: '#333', // Dark gray stroke color
        },
      }));

      return { nodes: newNodes, edges: newEdges };
    } catch (error) {
      console.error("Error calculating layout with ELK:", error);
      return { nodes, edges }; // Return original nodes/edges on error
    }
  }, []);

  // useEffect to apply layout whenever profileGraph changes
  useEffect(() => {
    if (profileGraph && !profileGraph.error) {
      getLayoutedElements(profileGraph.nodes, profileGraph.edges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes); // Update ReactFlow nodes with layouted positions
        setEdges(layoutedEdges); // Update ReactFlow edges
      });
    } else {
      // Clear nodes and edges if there's no valid graph or an error
      setNodes([]);
      setEdges([]);
    }
  }, [profileGraph, getLayoutedElements]);

  // Callback for connecting nodes in ReactFlow (not directly used by ELK layout)
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Handler for node clicks to open the info panel
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeInfo(node); // Store the entire node object
    setIsPanelOpen(true); // Open the info panel
  }, []);

  // Handler to close the info panel
  const handleClosePanel = () => {
    setIsPanelOpen(false); // Close the info panel
    setSelectedNodeInfo(null); // Clear selected node info
  };

  // Handler for vendor selection change
  const handleVendorChange = (event) => {
    const vendorName = event.target.value;
    setSelectedVendor(vendorName);
    console.log("Selected vendor:", vendorName);

    if (window.api) {
      window.api.readVendorProfiles(vendorName)
        .then(graph => {
          setProfileGraph(graph); // Set the received graph data
          console.log("Profile graph:", graph);
        })
        .catch(err => {
          console.error("Error reading vendor profiles:", err);
          // Set an error message if profile reading fails
          setProfileGraph({ error: "Error loading vendor profiles." });
        });
    }
  };

  const handleClone = () => {
    // implementa la logica per clonare
  };

  const handleAddChild = () => {
    // implementa la logica per aggiungere un figlio
  };

  const handleDelete = () => {
    // implementa la logica per cancellare
  };

  const handleEdit = () => {
    // implementa la logica per modificare/visualizzare
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Achab Profile Manager
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main container occupying the rest of the viewport height */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)', // Full viewport height minus AppBar height
          width: '100vw', // Full viewport width
          position: 'relative', // Allows absolute positioning of children
          overflow: 'hidden', // Prevents unwanted scrolls on the main container
        }}
      >
        {/* Conditional rendering for graph or error message */}
        {profileGraph && (
          <>
            {profileGraph.error ? (
              <Container sx={{ mt: 4 }}>
                <Typography color="error">{profileGraph.error}</Typography>
              </Container>
            ) : (
              <div style={{ width: '100%', height: '100%' }}> {/* React Flow takes 100% of parent Box */}
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick} // Attach the node click handler
                  fitView // Fits the view to display all nodes and edges
                >
                  <MiniMap /> {/* Small map for navigation */}
                  <Controls /> {/* Zoom and fit view controls */}
                  <Background variant="dots" gap={12} size={1} /> {/* Dotted background */}
                </ReactFlow>
              </div>
            )}
          </>
        )}

        {/* Vendor selection dropdown, positioned absolutely */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 1000, // Ensure it's above the graph
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
            borderRadius: 1, // Rounded corners
            p: 2, // Padding
            boxShadow: 3, // Subtle shadow for depth
          }}
        >
          <FormControl sx={{ m: 1, minWidth: 200 }}>
            <InputLabel id="vendor-select-label">Select a Vendor</InputLabel>
            <Select
              labelId="vendor-select-label"
              id="vendor-select"
              value={selectedVendor}
              label="Select a Vendor"
              onChange={handleVendorChange}
              sx={{ color: 'text.primary' }} // Ensure text is readable
            >
              {vendorFolders.length > 0 ? (
                vendorFolders.map((folder, index) => (
                  <MenuItem key={index} value={folder}>
                    {folder}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No vendors available or loading...</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Node Information Panel (Drawer) */}
      <Drawer
        anchor="bottom"
        open={isPanelOpen} // Controlled by isPanelOpen state
        onClose={handleClosePanel} // Close handler for clicking outside or Esc key
        PaperProps={{
          sx: {
            width: '100%', // Responsive width for the panel
            p: 3, // Padding inside the drawer
            backgroundColor: customTheme.palette.background.default, // Match the theme background
            boxShadow: 3, // Add shadow for depth
          },
        }}
      >
        {/* Close button at the top right of the panel */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleClosePanel}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Display selected node's information */}
        {selectedNodeInfo && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {selectedNodeInfo.data?.label || selectedNodeInfo.id}
            </Typography>

            {selectedNodeInfo.data?.type && (
              <Typography variant="body1">
                <strong>Type:</strong> {selectedNodeInfo.data.type}
              </Typography>
            )}

            {selectedNodeInfo.data?.instantiation && (
              <Typography variant="body1">
                <strong>Instantiation:</strong> {selectedNodeInfo.data.instantiation}
              </Typography>
            )}

            {selectedNodeInfo.data?.version && (
              <Typography variant="body1">
                <strong>Version:</strong> {selectedNodeInfo.data.version}
              </Typography>
            )}

            {selectedNodeInfo.data?.filePath && (
              <Typography variant="body1">
                <strong>File Path:</strong> {selectedNodeInfo.data.filePath}
              </Typography>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleClone}>
                Clone configuration
              </Button>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddChild}>
                Add child configuration
              </Button>
              <Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={handleDelete}>
                Delete configuration
              </Button>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
                Edit/View configuration
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </ThemeProvider>
  );
};

export default App;
