
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ReactFlow,
  Controls,
  MiniMap,
  useReactFlow,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";

import DiagramNode from "./DiagramNode";
import StudentArchitectureViewer from "./pages/StudentArchitectureViewer";
import StudentArchitectures from "./pages/StudentArchitectures";
import { createArchitecture } from "./api";

function App() {
  // Student and shared architecture views
  const [studentView, setStudentView] = useState(false);
  const [sharedArchitectureId, setSharedArchitectureId] =
    useState(null);
  
const handleEditArchitecture = async (architectureId) => {
  try {
    console.log("Opening architecture for editing:", architectureId);

    const response = await fetch(
      `http://127.0.0.1:8000/api/architectures/${architectureId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || "Failed to load architecture for editing"
      );
    }

    const data = await response.json();

    const content =
      typeof data.content === "string"
        ? JSON.parse(data.content)
        : data.content;

    if (
      !content?.architectures ||
      !content.architectures.root
    ) {
      throw new Error(
        "Saved architecture content is missing or invalid."
      );
    }

    setEditingArchitectureId(data.id);
    setArchitectureName(data.name || "Main Architecture");
    setArchitectures(content.architectures);
    setLevelNames(
      content.levelNames || {
        root: data.name || "Main Architecture",
      }
    );

    const savedLevel = content.currentLevel || "root";

    setCurrentLevel(
      content.architectures[savedLevel] ? savedLevel : "root"
    );

    setLevelHistory(content.levelHistory || []);
    setSelectedNodeId(null);
    setActiveTool("select");
    setPublishStatus(data.status || "draft");

    localStorage.setItem("architecture-id", String(data.id));
    setStudentView(false);

    console.log("Architecture loaded successfully:", data.id);
  } catch (error) {
    console.error("Load architecture for editing error:", error);
    window.alert(`Unable to open architecture: ${error.message}`);
  }
};

  useEffect(() => {
    const match = window.location.pathname.match(
      /^\/student\/architecture\/(\d+)$/
    );

    if (match) {
      setSharedArchitectureId(Number(match[1]));
    }
  }, []);

  // Architecture data
  const [architectures, setArchitectures] = useState({
    root: {
      name: "Main Architecture",
      nodes: [],
      edges: [],
    },
  });

  const [currentLevel, setCurrentLevel] = useState("root");
  const [levelHistory, setLevelHistory] = useState([]);

  const [architectureName, setArchitectureName] =
    useState("Main Architecture");

  const [levelNames, setLevelNames] = useState({
    root: "Main Architecture",
  });

  const [activeTool, setActiveTool] = useState("select");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [publishStatus, setPublishStatus] = useState("draft");
  const [editingArchitectureId, setEditingArchitectureId] =
  useState(null);

  const { screenToFlowPosition } = useReactFlow();

  const currentArchitecture = architectures[currentLevel];
  const nodes = currentArchitecture?.nodes || [];

  const edges = (currentArchitecture?.edges || []).map((edge) => ({
    ...edge,
    type: "smoothstep",
    style: {
      stroke: "#333333",
      strokeWidth: 2,
      ...edge.style,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#333333",
      width: 20,
      height: 20,
    },
  }));

  const nodeTypes = {
    diagram: DiagramNode,
    diagramNode: DiagramNode,
  };

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) || null;

  // Update node positions and selection
  const onNodesChange = useCallback(
    (changes) => {
      setArchitectures((current) => {
        const architecture = current[currentLevel];
        if (!architecture) return current;

        return {
          ...current,
          [currentLevel]: {
            ...architecture,
            nodes: applyNodeChanges(changes, architecture.nodes),
          },
        };
      });
    },
    [currentLevel]
  );

  // Update edges
  const onEdgesChange = useCallback(
    (changes) => {
      setArchitectures((current) => {
        const architecture = current[currentLevel];
        if (!architecture) return current;

        return {
          ...current,
          [currentLevel]: {
            ...architecture,
            edges: applyEdgeChanges(changes, architecture.edges),
          },
        };
      });
    },
    [currentLevel]
  );

  // Create shapes and text on the canvas
  const handlePaneClick = useCallback(
    (event) => {
      if (activeTool === "select" || activeTool === "arrow") {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode = null;

      if (activeTool === "rectangle") {
        newNode = {
          id: `rectangle-${Date.now()}`,
          type: "diagram",
          position,
          data: { label: "", description: "", children: [] },
          style: {
            width: 180,
            height: 100,
            border: "2px solid #333",
            borderRadius: "8px",
            background: "#ffffff",
          },
        };
      }

      if (activeTool === "circle") {
        newNode = {
          id: `circle-${Date.now()}`,
          type: "diagram",
          position,
          data: { label: "", description: "", children: [] },
          style: {
            width: 100,
            height: 100,
            border: "2px solid #333",
            borderRadius: "50%",
            background: "#ffffff",
          },
        };
      }

      if (activeTool === "container") {
        newNode = {
          id: `container-${Date.now()}`,
          type: "diagram",
          position,
          data: { label: "", description: "", children: [] },
          style: {
            width: 350,
            height: 220,
            border: "2px solid #333",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.5)",
          },
        };
      }

      if (activeTool === "text") {
        const text = window.prompt("Enter text");

        if (!text) {
          setActiveTool("select");
          return;
        }

        newNode = {
          id: `text-${Date.now()}`,
          type: "diagram",
          position,
          data: { label: text, description: "", children: [] },
          style: {
            background: "transparent",
            border: "none",
            width: 180,
            height: 50,
            fontSize: "16px",
            fontWeight: "700",
            color: "#000000",
            textAlign: "center",
          },
        };
      }

      if (newNode) {
        setArchitectures((current) => {
          const architecture = current[currentLevel];
          if (!architecture) return current;

          return {
            ...current,
            [currentLevel]: {
              ...architecture,
              nodes: [...architecture.nodes, newNode],
            },
          };
        });
      }

      setActiveTool("select");
    },
    [activeTool, currentLevel, screenToFlowPosition]
  );

  // Connect nodes with arrows
  const handleConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,
        id: `edge-${Date.now()}`,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#333333",
        },
        style: {
          stroke: "#333333",
          strokeWidth: 2,
        },
      };

      setArchitectures((current) => {
        const architecture = current[currentLevel];
        if (!architecture) return current;

        return {
          ...current,
          [currentLevel]: {
            ...architecture,
            edges: [...architecture.edges, newEdge],
          },
        };
      });

      setActiveTool("select");
    },
    [currentLevel]
  );

  // Select a node
  const handleNodeClick = useCallback(
    (_event, node) => {
      if (activeTool === "select") {
        setSelectedNodeId(node.id);
      }
    },
    [activeTool]
  );

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeId(selectedNodes[0]?.id || null);
  }, []);

  // Delete selected nodes and edges
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const tag = event.target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        event.target?.isContentEditable
      ) {
        return;
      }

      setArchitectures((current) => {
        const architecture = current[currentLevel];
        if (!architecture) return current;

        const deletedNodeIds = new Set(
          architecture.nodes
            .filter((node) => node.selected)
            .map((node) => node.id)
        );

        return {
          ...current,
          [currentLevel]: {
            ...architecture,
            nodes: architecture.nodes.filter(
              (node) => !node.selected
            ),
            edges: architecture.edges.filter(
              (edge) =>
                !edge.selected &&
                !deletedNodeIds.has(edge.source) &&
                !deletedNodeIds.has(edge.target)
            ),
          },
        };
      });

      setSelectedNodeId(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLevel]);

  // Edit the selected component
  const updateSelectedNode = (property, value) => {
    if (!selectedNode) return;

    setArchitectures((current) => {
      const architecture = current[currentLevel];
      if (!architecture) return current;

      const updatedNodes = architecture.nodes.map((node) => {
        if (node.id !== selectedNode.id) return node;

        if (property === "label" || property === "description") {
          return {
            ...node,
            data: {
              ...node.data,
              [property]: value,
            },
          };
        }

        return {
          ...node,
          style: {
            ...node.style,
            [property]: value,
          },
        };
      });

      return {
        ...current,
        [currentLevel]: {
          ...architecture,
          nodes: updatedNodes,
        },
      };
    });
  };

  // Open or create a child architecture
  const openDrillDown = () => {
    if (!selectedNode) return;

    const childLevel = `${currentLevel}-${selectedNode.id}`;
    const childName = selectedNode.data?.label || "Child Architecture";

    setArchitectures((current) => {
      if (current[childLevel]) return current;

      return {
        ...current,
        [childLevel]: {
          name: childName,
          nodes: [],
          edges: [],
        },
      };
    });

    setLevelNames((current) => ({
      ...current,
      [childLevel]: childName,
    }));

    setLevelHistory((history) => [...history, currentLevel]);
    setCurrentLevel(childLevel);
    setSelectedNodeId(null);
    setActiveTool("select");
  };

  // Return to the previous architecture level
  const goBack = () => {
    if (levelHistory.length === 0) return;

    setCurrentLevel(levelHistory[levelHistory.length - 1]);
    setLevelHistory((history) => history.slice(0, -1));
    setSelectedNodeId(null);
    setActiveTool("select");
  };

  // Save architecture to the backend
  
const saveDraft = async () => {
  try {
    const architectureData = {
      name: architectureName.trim() || "Main Architecture",
      description: "Architecture created using Architecture Builder",
      content: {
        currentLevel,
        levelNames: {
          ...levelNames,
          root: architectureName.trim() || "Main Architecture",
        },
        levelHistory,
        architectures: {
          ...architectures,
          root: {
            ...architectures.root,
            name: architectureName.trim() || "Main Architecture",
          },
        },
      },
    };

    let savedArchitecture;

    if (editingArchitectureId !== null) {
      // Update the architecture that is already saved.
      const response = await fetch(
        `http://127.0.0.1:8000/api/architectures/${editingArchitectureId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(architectureData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Failed to update architecture"
        );
      }

      savedArchitecture = await response.json();
    } else {
      // Create a new architecture only when it has not been saved before.
      savedArchitecture = await createArchitecture(architectureData);
      setEditingArchitectureId(savedArchitecture.id);
    }

    localStorage.setItem(
      "architecture-id",
      String(savedArchitecture.id)
    );

    setPublishStatus(savedArchitecture.status || "draft");

    window.alert(
      `Architecture saved successfully. ID: ${savedArchitecture.id}`
    );
  } catch (error) {
    console.error("Save architecture error:", error);
    window.alert(`Failed to save architecture: ${error.message}`);
  }
};

  // Publish the saved architecture
  const publishArchitecture = async () => {
    try {
      const architectureId = localStorage.getItem("architecture-id");

      if (!architectureId) {
        window.alert("Please save the architecture first, then publish it.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/architectures/${architectureId}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Failed to publish architecture"
        );
      }

      await response.json();
      setPublishStatus("published");
      window.alert("Architecture published successfully.");
    } catch (error) {
      console.error("Publish architecture error:", error);
      window.alert(`Failed to publish architecture: ${error.message}`);
    }
  };

  const levelPath = [
    "root",
    ...levelHistory,
    currentLevel,
  ].filter((level, index, array) => array.indexOf(level) === index);

  // Shared student architecture route
  if (sharedArchitectureId !== null) {
    return (
      <StudentArchitectureViewer
        architectureId={sharedArchitectureId}
        onBack={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  // Student architecture list
  if (studentView) {
    return (
      <div className="student-list-page">
        <header className="student-list-header">
          <div>
            <span className="student-list-eyebrow">DIGIDENSE</span>
            <h1>Student Architectures</h1>
          </div>

          <button
            className="standard-button primary-button"
            onClick={() => setStudentView(false)}
          >
            Back to Instructor
          </button>
        </header>

        <main className="student-list-content">
          <StudentArchitectures 
           onEditArchitecture={handleEditArchitecture}
           />
        </main>
      </div>
    );
  }

  // Instructor architecture editor
  return (
    <div className="editor instructor-editor">
      <header className="instructor-header">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">A</div>
          <div>
            <span className="instructor-eyebrow">DIGIDENSE WORKSPACE</span>
            <h1>Architecture Builder</h1>
          </div>
        </div>

        <div className="instructor-title-field">
          <label htmlFor="architecture-title">Architecture name</label>
          <input
            id="architecture-title"
            type="text"
            value={architectureName}
            onChange={(event) => setArchitectureName(event.target.value)}
            placeholder="Enter architecture name"
          />
        </div>
        
<div className="instructor-header-actions">

  {/* Back button */}
  <button
    className="standard-button"
    onClick={goBack}
    disabled={levelHistory.length === 0}
    title={
      levelHistory.length === 0
        ? "You are at the main architecture"
        : "Go back to the previous architecture"
    }
  >
    ← Back
  </button>

  {/* Save button */}
  
  <button className="standard-button" onClick={saveDraft}>
    <span className="button-icon">💾</span>
    Save
  </button>

  {/* Publish button */}
  <button
    className="standard-button primary-button"
    onClick={publishArchitecture}
    
  >
    <span className="button-icon">🚀</span>
    Publish
  </button>

  {/* Student View button */}
  <button
    className="standard-button"
    onClick={() => setStudentView(true)}
  >
  
    Student View
  </button>

</div>


      </header>

      <div className="instructor-toolstrip">
        <div className="instructor-toolstrip-label">TOOLS</div>

        {[
          ["select", "↖", "Select"],
          ["rectangle", "▱", "Rectangle"],
          ["circle", "○", "Circle"],
          ["container", "▣", "Container"],
          ["text", "T", "Text"],
          ["arrow", "↗", "Arrow"],
        
        ].map(([tool, symbol, label]) => (
          <button
            key={tool}
            className={`instructor-tool ${
              activeTool === tool ? "active" : ""
            }`}
            onClick={() => setActiveTool(tool)}
            title={label}
          >
            <span className="instructor-tool-symbol">{symbol}</span>
            <span>{label}</span>
          </button>
        ))}

        <button
          className="instructor-tool instructor-drilldown-toolbar-button"
          onClick={openDrillDown}
          disabled={!selectedNode}
          title={
            selectedNode
              ? "Open nested architecture"
              : "Select a component first"
          }
        >
          <span className="instructor-tool-symbol">↳</span>
          <span>Open Drill Down</span>
        </button>

        <div className="instructor-toolstrip-help">
          {activeTool === "select"
            ? "Select and move components"
            : activeTool === "arrow"
            ? "Drag from one connection handle to another"
            : `Click the canvas to add ${activeTool}`}
        </div>
      </div>

      <main className="instructor-workspace">
        <section className="instructor-canvas-card">
          <div className="instructor-canvas-header">
            <div>
              <span className="instructor-section-label">WORKSPACE</span>
              <h2>{architectureName.trim() || "Main Architecture"}</h2>
            </div>

            <div className="instructor-canvas-meta">
              <span>{nodes.length} components</span>
              <span className="meta-separator">·</span>
              <span>{edges.length} connections</span>
            </div>
          </div>

          <div className="canvas instructor-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onPaneClick={handlePaneClick}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              onSelectionChange={handleSelectionChange}
              nodesDraggable={activeTool === "select"}
              nodesConnectable={activeTool === "arrow"}
              elementsSelectable={true}
              fitView
            >
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>

          <footer className="instructor-canvas-footer">
            <span>
              <span className="instructor-footer-dot" />
              Editor ready
            </span>
            <span>Choose a tool above to edit your architecture</span>
          </footer>
        </section>

        <aside className="properties-panel instructor-properties">
          <div className="properties-header instructor-properties-header">
            <div>
              <span className="instructor-section-label">COMPONENT SETTINGS</span>
              <h3>Properties</h3>
            </div>

            {selectedNode && (
              <button
                className="instructor-clear-selection"
                aria-label="Clear selection"
                onClick={() => setSelectedNodeId(null)}
              >
                ×
              </button>
            )}
          </div>

          {!selectedNode && (
            <div className="instructor-empty-properties">
              <div className="instructor-empty-icon">◇</div>
              <h4>No component selected</h4>
              <p>
                Select a component on the canvas to edit its name, explanation,
                size, and drill-down architecture.
              </p>
            </div>
          )}

          {selectedNode && (
            <div className="instructor-property-content">
              <div className="instructor-selected-symbol">◇</div>

              <span className="instructor-section-label">
                SELECTED COMPONENT
              </span>

              <div className="property-group">
                <label htmlFor="component-name">Component name</label>
                <input
                  id="component-name"
                  type="text"
                  value={selectedNode.data?.label || ""}
                  onChange={(event) =>
                    updateSelectedNode("label", event.target.value)
                  }
                  placeholder="Enter component name"
                />
              </div>

              <div className="property-group">
                <label htmlFor="component-description">Explanation</label>
                <textarea
                  id="component-description"
                  rows={6}
                  value={selectedNode.data?.description || ""}
                  onChange={(event) =>
                    updateSelectedNode("description", event.target.value)
                  }
                  placeholder="Explain what this component does..."
                />
              </div>

              <div className="property-row">
                <div className="property-group">
                  <label htmlFor="component-width">Width</label>
                  <input
                    id="component-width"
                    type="number"
                    min="30"
                    value={parseInt(selectedNode.style?.width, 10) || 100}
                    onChange={(event) =>
                      updateSelectedNode("width", Number(event.target.value))
                    }
                  />
                </div>

                <div className="property-group">
                  <label htmlFor="component-height">Height</label>
                  <input
                    id="component-height"
                    type="number"
                    min="30"
                    value={parseInt(selectedNode.style?.height, 10) || 100}
                    onChange={(event) =>
                      updateSelectedNode("height", Number(event.target.value))
                    }
                  />
                </div>
              </div>

              <div className="instructor-drilldown-card">
                <div className="instructor-drilldown-icon">↳</div>
                <div>
                  <h4>Nested architecture</h4>
                  <p>Create or open a detailed flow for this component.</p>
                </div>
              </div>

              <button
                className="instructor-drilldown-button"
                onClick={openDrillDown}
              >
                Open Drill Down <span>→</span>
              </button>
            </div>
          )}

          <div className="instructor-properties-footer">
            <span className="properties-footer-dot" />
            Changes are kept in the current editor until saved.
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;