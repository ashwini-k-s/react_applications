import { useCallback, useState, useEffect } from "react";

import DiagramNode from "./DiagramNode";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";

function App() {
  // ==========================================
  // ARCHITECTURES
  // ==========================================

  const [architectures, setArchitectures] = useState({
    root: {
      name: "Main Architecture",
      nodes: [],
      edges: [],
    },
  });

  // ==========================================
  // CURRENT LEVEL
  // ==========================================

  const [currentLevel, setCurrentLevel] = useState("root");

  // ==========================================
  // DRILL DOWN HISTORY
  // ==========================================

  const [levelHistory, setLevelHistory] = useState([]);

  // Store the actual names given to components
  const [levelNames, setLevelNames] = useState({
    root: "Main Architecture",
  });

  // ==========================================
  // ACTIVE TOOL
  // ==========================================

  const [activeTool, setActiveTool] = useState("select");

  // ==========================================
  // SELECTED NODE
  // ==========================================

  const [selectedNodeId, setSelectedNodeId] =
    useState(null);

// ==========================================
// PUBLISH STATUS
// ==========================================

  const [publishStatus, setPublishStatus] =
    useState("draft");  

  // ==========================================
  // REACT FLOW
  // ==========================================

  const { screenToFlowPosition } = useReactFlow();

  // ==========================================
  // CURRENT ARCHITECTURE
  // ==========================================

  const currentArchitecture =
    architectures[currentLevel];

  const nodes =
    currentArchitecture?.nodes || [];

  const edges =
    currentArchitecture?.edges || [];

  // ==========================================
  // NODE TYPES
  // ==========================================

  const nodeTypes = {
    diagram: DiagramNode,
  };

  // ==========================================
  // SELECTED NODE
  // ==========================================

  const selectedNode =
    nodes.find(
      (node) =>
        node.id === selectedNodeId
    ) || null;

  // ==========================================
  // NODE CHANGES
  // ==========================================

  const onNodesChange = useCallback(
    (changes) => {
      setArchitectures(
        (currentArchitectures) => {
          const architecture =
            currentArchitectures[
              currentLevel
            ];

          if (!architecture) {
            return currentArchitectures;
          }

          const updatedNodes =
            applyNodeChanges(
              changes,
              architecture.nodes
            );

          return {
            ...currentArchitectures,

            [currentLevel]: {
              ...architecture,
              nodes: updatedNodes,
            },
          };
        }
      );
    },
    [currentLevel]
  );

  // ==========================================
  // EDGE CHANGES
  // ==========================================

  const onEdgesChange = useCallback(
    (changes) => {
      setArchitectures(
        (currentArchitectures) => {
          const architecture =
            currentArchitectures[
              currentLevel
            ];

          if (!architecture) {
            return currentArchitectures;
          }

          const updatedEdges =
            applyEdgeChanges(
              changes,
              architecture.edges
            );

          return {
            ...currentArchitectures,

            [currentLevel]: {
              ...architecture,
              edges: updatedEdges,
            },
          };
        }
      );
    },
    [currentLevel]
  );

  // ==========================================
  // CREATE COMPONENT
  // ==========================================

  const handlePaneClick = useCallback(
    (event) => {
      // SELECT MODE
      if (activeTool === "select") {
        return;
      }

      // ARROW MODE
      if (activeTool === "arrow") {
        return;
      }

      // Get canvas position
      const position =
        screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

      let newNode = null;

      // ======================================
      // RECTANGLE
      // ======================================

      if (activeTool === "rectangle") {
        newNode = {
          id: `rectangle-${Date.now()}`,
          type: "diagram",
          position,

          data: {
            label: "",
            description: "",
            children: [],
          },

          style: {
            width: 180,
            height: 100,
            border: "2px solid #333",
            borderRadius: "8px",
            background: "#ffffff",
          },
        };
      }

      // ======================================
      // CIRCLE
      // ======================================

      if (activeTool === "circle") {
        newNode = {
          id: `circle-${Date.now()}`,
          type: "diagram",
          position,

          data: {
            label: "",
            description: "",
            children: [],
          },

          style: {
            width: 100,
            height: 100,
            border: "2px solid #333",
            borderRadius: "50%",
            background: "#ffffff",
          },
        };
      }

      // ======================================
      // CONTAINER
      // ======================================

      if (activeTool === "container") {
        newNode = {
          id: `container-${Date.now()}`,
          type: "diagram",
          position,

          data: {
            label: "",
            description: "",
            children: [],
          },

          style: {
            width: 350,
            height: 220,
            border: "2px solid #333",
            borderRadius: "10px",
            background:
              "rgba(255,255,255,0.5)",
          },
        };
      }

      // ======================================
      // TEXT
      // ======================================

      if (activeTool === "text") {
        const text = window.prompt(
          "Enter text"
        );

        if (!text) {
          setActiveTool("select");
          return;
        }

        newNode = {
          id: `text-${Date.now()}`,
          type: "diagram",
          position,

          data: {
            label: text,
            description: "",
            children: [],
          },

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

      // ======================================
      // ADD NODE
      // ======================================

      if (newNode) {
        setArchitectures(
          (currentArchitectures) => {
            const architecture =
              currentArchitectures[
                currentLevel
              ];

            if (!architecture) {
              return currentArchitectures;
            }

            return {
              ...currentArchitectures,

              [currentLevel]: {
                ...architecture,

                nodes: [
                  ...architecture.nodes,
                  newNode,
                ],
              },
            };
          }
        );
      }

      // Return to Select mode
      setActiveTool("select");
    },
    [
      activeTool,
      currentLevel,
      screenToFlowPosition,
    ]
  );

  // ==========================================
  // CONNECT ARROW
  // ==========================================

  const handleConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,

        id: `edge-${Date.now()}`,

        type: "smoothstep",

        markerEnd: {
          type: MarkerType.ArrowClosed,
        },

        style: {
          strokeWidth: 2,
        },
      };

      setArchitectures(
        (currentArchitectures) => {
          const architecture =
            currentArchitectures[
              currentLevel
            ];

          if (!architecture) {
            return currentArchitectures;
          }

          return {
            ...currentArchitectures,

            [currentLevel]: {
              ...architecture,

              edges: [
                ...architecture.edges,
                newEdge,
              ],
            },
          };
        }
      );

      setActiveTool("select");
    },
    [currentLevel]
  );

  // ==========================================
  // NODE CLICK
  // ==========================================

  const handleNodeClick = useCallback(
    (event, node) => {
      if (activeTool === "select") {
        setSelectedNodeId(node.id);
      }
    },
    [activeTool]
  );

  // ==========================================
  // SELECTION CHANGE
  // ==========================================

  const handleSelectionChange =
    useCallback(
      ({ nodes: selectedNodes }) => {
        if (
          selectedNodes.length > 0
        ) {
          setSelectedNodeId(
            selectedNodes[0].id
          );
        } else {
          setSelectedNodeId(null);
        }
      },
      []
    );

  // ==========================================
  // DELETE
  // ==========================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key !== "Delete" &&
        event.key !== "Backspace"
      ) {
        return;
      }

      // Do not delete while typing
      const tag =
        event.target.tagName;

      if (
        tag === "INPUT" ||
        tag === "TEXTAREA"
      ) {
        return;
      }

      setArchitectures(
        (currentArchitectures) => {
          const architecture =
            currentArchitectures[
              currentLevel
            ];

          if (!architecture) {
            return currentArchitectures;
          }

          const deletedNodeIds =
            new Set(
              architecture.nodes
                .filter(
                  (node) =>
                    node.selected
                )
                .map(
                  (node) =>
                    node.id
                )
            );

          return {
            ...currentArchitectures,

            [currentLevel]: {
              ...architecture,

              nodes:
                architecture.nodes.filter(
                  (node) =>
                    !node.selected
                ),

              edges:
                architecture.edges.filter(
                  (edge) =>
                    !edge.selected &&
                    !deletedNodeIds.has(
                      edge.source
                    ) &&
                    !deletedNodeIds.has(
                      edge.target
                    )
                ),
            },
          };
        }
      );

      setSelectedNodeId(null);
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [currentLevel]);

  // ==========================================
  // UPDATE SELECTED NODE
  // ==========================================

  const updateSelectedNode = (
    property,
    value
  ) => {
    if (!selectedNode) {
      return;
    }

    setArchitectures(
      (currentArchitectures) => {
        const architecture =
          currentArchitectures[
            currentLevel
          ];

        if (!architecture) {
          return currentArchitectures;
        }

        const updatedNodes =
          architecture.nodes.map(
            (node) => {
              if (
                node.id !==
                selectedNode.id
              ) {
                return node;
              }

              // DATA PROPERTIES
              if (
                property === "label" ||
                property ===
                  "description"
              ) {
                return {
                  ...node,

                  data: {
                    ...node.data,

                    [property]: value,
                  },
                };
              }

              // STYLE PROPERTIES
              return {
                ...node,

                style: {
                  ...node.style,

                  [property]: value,
                },
              };
            }
          );

        return {
          ...currentArchitectures,

          [currentLevel]: {
            ...architecture,
            nodes: updatedNodes,
          },
        };
      }
    );
  };

  // ==========================================
  // OPEN DRILL DOWN
  // ==========================================

  const openDrillDown = () => {
    if (!selectedNode) {
      return;
    }

    const childLevel =
      `${currentLevel}-${selectedNode.id}`;

    const childName =
      selectedNode.data?.label ||
      "Child Architecture";

    // Create child architecture
    setArchitectures(
      (currentArchitectures) => {
        if (
          currentArchitectures[
            childLevel
          ]
        ) {
          return currentArchitectures;
        }

        return {
          ...currentArchitectures,

          [childLevel]: {
            name: childName,
            nodes: [],
            edges: [],
          },
        };
      }
    );

    // Save the actual component name
    setLevelNames(
      (currentNames) => ({
        ...currentNames,

        [childLevel]: childName,
      })
    );

    // Save current level
    setLevelHistory(
      (history) => [
        ...history,
        currentLevel,
      ]
    );

    // Enter child architecture
    setCurrentLevel(childLevel);

    setSelectedNodeId(null);

    setActiveTool("select");
  };

  // ==========================================
  // BACK
  // ==========================================

  const goBack = () => {
    if (
      levelHistory.length === 0
    ) {
      return;
    }

    const previousLevel =
      levelHistory[
        levelHistory.length - 1
      ];

    setCurrentLevel(
      previousLevel
    );

    setLevelHistory(
      (history) =>
        history.slice(0, -1)
    );

    setSelectedNodeId(null);

    setActiveTool("select");
  };

  // ==========================================
// SAVE DRAFT
// ==========================================

const saveDraft = () => {
  const architectureData = {
    name:
      levelNames.root ||
      "Main Architecture",

    status: "draft",

    currentLevel,

    levelNames,

    levelHistory,

    architectures,

    savedAt:
      new Date().toISOString(),
  };

  localStorage.setItem(
    "architecture-draft",
    JSON.stringify(
      architectureData
    )
  );

  setPublishStatus("draft");

  alert(
    "Architecture saved as draft."
  );
};

// ==========================================
// PUBLISH ARCHITECTURE
// ==========================================

const publishArchitecture = () => {
  const architectureData = {
    name:
      levelNames.root ||
      "Main Architecture",

    status: "published",

    currentLevel,

    levelNames,

    levelHistory,

    architectures,

    publishedAt:
      new Date().toISOString(),
  };

  localStorage.setItem(
    "architecture-published",
    JSON.stringify(
      architectureData
    )
  );

  // Also keep the latest version as draft
  localStorage.setItem(
    "architecture-draft",
    JSON.stringify(
      architectureData
    )
  );

  setPublishStatus(
    "published"
  );

  alert(
    "Architecture published successfully."
  );
};

  // ==========================================
  // BUILD LEVEL PATH
  // ==========================================

  const levelPath = [
    "root",
    ...levelHistory,
    currentLevel,
  ].filter(
    (level, index, array) =>
      array.indexOf(level) === index
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="editor">

      {/* =====================================
          TOOLBAR
          ===================================== */}

      <div className="toolbar">

        {/* BACK */}

        {currentLevel !==
          "root" && (
          <button
            className="tool-button"
            onClick={goBack}
          >
            Back
          </button>
        )}

        {/* SELECT */}

        <button
          className={
            activeTool === "select"
              ? "tool-button active"
              : "tool-button"
          }
          onClick={() =>
            setActiveTool(
              "select"
            )
          }
        >
          Select
        </button>

        {/* RECTANGLE */}

        <button
          className={
            activeTool === "rectangle"
              ? "tool-button active"
              : "tool-button"
          }
          onClick={() =>
            setActiveTool(
              "rectangle"
            )
          }
        >
          Rectangle
        </button>

        {/* CIRCLE */}

        <button
          className={
            activeTool === "circle"
              ? "tool-button active"
              : "tool-button"
          }
          onClick={() =>
            setActiveTool(
              "circle"
            )
          }
        >
          Circle
        </button>

        {/* CONTAINER */}

        <button
          className={
            activeTool === "container"
              ? "tool-button active"
              : "tool-button"
          }
          onClick={() =>
            setActiveTool(
              "container"
            )
          }
        >
          Container
        </button>

        {/* TEXT */}

        <button
          className={
            activeTool === "text"
              ? "tool-button active"
              : "tool-button"
          }
          onClick={() =>
            setActiveTool(
              "text"
            )
          }
        >
          Text
        </button>

        {/* ARROW */}

        <button
          className={
            activeTool === "arrow"
              ? "tool-button active"
              : "tool-button"
          }
          onClick={() =>
            setActiveTool(
              "arrow"
            )
          }
        >
          Arrow
  
        </button>

        {/* =================================
    SAVE / PUBLISH
    ================================= */}

<div
  style={{
    marginLeft: "auto",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  }}
>

  <button
    className="tool-button"
    onClick={saveDraft}
  >
    Save Draft
  </button>

  <button
    className="tool-button"
    onClick={publishArchitecture}
  >
    Publish
  </button>

  <span
    style={{
      fontSize: "13px",
      fontWeight: "600",
      paddingLeft: "5px",
    }}
  >
    {publishStatus === "published"
      ? "Published ✓"
      : "Draft"}
  </span>

</div>

        {/* =================================
            LEVEL PATH - SECOND LINE
            ================================= */}

        <div className="level-path">
          {levelPath
            .map(
              (level) =>
                levelNames[level] ||
                "Architecture"
            )
            .join(" → ")}
        </div>

      </div>

      {/* =====================================
          WORKSPACE
          ===================================== */}

      <div className="workspace">

        {/* ===================================
            CANVAS
            =================================== */}

        <div className="canvas">

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={
              onNodesChange
            }
            onEdgesChange={
              onEdgesChange
            }
            onPaneClick={
              handlePaneClick
            }
            onConnect={
              handleConnect
            }
            onNodeClick={
              handleNodeClick
            }
            onSelectionChange={
              handleSelectionChange
            }
            nodesDraggable={
              activeTool === "select"
            }
            nodesConnectable={
              activeTool === "arrow"
            }
            elementsSelectable={
              true
            }
            fitView
          >
            <Background />

            <Controls />

            <MiniMap />
          </ReactFlow>

        </div>

        {/* ===================================
            PROPERTIES PANEL
            =================================== */}

        <div className="properties-panel">

          <div className="properties-header">

            <h3>
              Properties
            </h3>

            {selectedNode && (
              <button
                onClick={() =>
                  setSelectedNodeId(
                    null
                  )
                }
              >
                ×
              </button>
            )}

          </div>

          {/* NO NODE SELECTED */}

          {!selectedNode && (
            <div className="empty-properties">
              Select a component to
              edit its properties.
            </div>
          )}

          {/* NODE SELECTED */}

          {selectedNode && (
            <>

              {/* COMPONENT NAME */}

              <div className="property-group">

                <label>
                  Component Name
                </label>

                <input
                  type="text"
                  value={
                    selectedNode
                      .data?.label ||
                    ""
                  }
                  onChange={(event) =>
                    updateSelectedNode(
                      "label",
                      event.target.value
                    )
                  }
                />

              </div>

              {/* EXPLANATION */}

              <div className="property-group">

                <label>
                  Explanation
                </label>

                <textarea
                  rows="6"
                  value={
                    selectedNode
                      .data
                      ?.description ||
                    ""
                  }
                  onChange={(event) =>
                    updateSelectedNode(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Explain this component..."
                />

              </div>

              {/* WIDTH / HEIGHT */}

              <div className="property-row">

                <div className="property-group">

                  <label>
                    Width
                  </label>

                  <input
                    type="number"
                    value={
                      parseInt(
                        selectedNode
                          .style?.width
                      ) || 100
                    }
                    onChange={(event) =>
                      updateSelectedNode(
                        "width",
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />

                </div>

                <div className="property-group">

                  <label>
                    Height
                  </label>

                  <input
                    type="number"
                    value={
                      parseInt(
                        selectedNode
                          .style?.height
                      ) || 100
                    }
                    onChange={(event) =>
                      updateSelectedNode(
                        "height",
                        Number(
                          event.target.value
                        )
                      )
                    }
                  />

                </div>

              </div>

              {/* DRILL DOWN */}

              <button
                className="drill-down-button"
                onClick={
                  openDrillDown
                }
              >
                Open Drill Down
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default App;