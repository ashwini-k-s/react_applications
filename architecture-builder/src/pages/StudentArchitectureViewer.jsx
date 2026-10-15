import { useEffect, useState } from "react";
import {
  ReactFlow,
  Controls,
  MarkerType,
} from "@xyflow/react";

import DiagramNode from "../DiagramNode";
import "@xyflow/react/dist/style.css";

const API_URL = "http://127.0.0.1:8000";

const nodeTypes = {
  diagram: DiagramNode,
  diagramNode: DiagramNode,
};

function StudentArchitectureViewer({ architectureId, onBack }) {
  const [architecture, setArchitecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentLevel, setCurrentLevel] = useState("root");
  const [levelHistory, setLevelHistory] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Load the saved architecture from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadArchitecture() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/architectures/${architectureId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load architecture");
        }

        const data = await response.json();

        if (cancelled) return;

        setArchitecture(data);
        setCurrentLevel("root");
        setLevelHistory([]);
        setSelectedNode(null);
      } catch (err) {
        if (!cancelled) {
          console.error("Load architecture error:", err);
          setError("Unable to load this architecture. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArchitecture();

    return () => {
      cancelled = true;
    };
  }, [architectureId]);

  // Handle loading and error states.
  if (loading) {
    return (
      <div className="student-state-screen">
        <div className="student-loading-spinner" />
        <h3>Loading architecture</h3>
        <p>Preparing your architecture workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-state-screen">
        <div className="student-state-icon">!</div>
        <h3>Architecture unavailable</h3>
        <p>{error}</p>
        <button className="student-primary-button" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to architectures
        </button>
      </div>
    );
  }

  if (!architecture) return null;

  // Read the saved architecture content.
  let content = {};

  try {
    content =
      typeof architecture.content === "string"
        ? JSON.parse(architecture.content)
        : architecture.content || {};
  } catch (err) {
    console.error("Invalid architecture content:", err);
  }

  const savedArchitectures = content.architectures || {};
  const levelNames = content.levelNames || {};

  const currentArchitecture = savedArchitectures[currentLevel];
  const nodes = currentArchitecture?.nodes || [];
  const rawEdges = currentArchitecture?.edges || [];

  // Highlight the selected component without changing its saved data.
  const displayNodes = nodes.map((node) => ({
  ...node,
  selected: selectedNode?.id === node.id,
  }));

  // Use consistent architecture-style connections.
  const edges = rawEdges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    style: {
      stroke: "#8493a8",
      strokeWidth: 2,
      ...edge.style,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#8493a8",
      width: 18,
      height: 18,
    },
  }));

  // Single-click: show the component explanation.
  const handleNodeClick = (_event, node) => {
    setSelectedNode(node);
  };

  // Double-click: open the component's child architecture.
  const handleNodeDoubleClick = (_event, node) => {
    const childLevel = `${currentLevel}-${node.id}`;

    if (!savedArchitectures[childLevel]) return;

    setLevelHistory((history) => [...history, currentLevel]);
    setCurrentLevel(childLevel);
    setSelectedNode(null);
  };

  // Navigate to the previous architecture level.
  const goBack = () => {
    if (levelHistory.length === 0) return;

    const previousLevel = levelHistory[levelHistory.length - 1];

    setLevelHistory((history) => history.slice(0, -1));
    setCurrentLevel(previousLevel);
    setSelectedNode(null);
  };

  // Build the breadcrumb path.
  const breadcrumbLevels = [...levelHistory, currentLevel];

  const currentLevelName =
    levelNames[currentLevel] ||
    currentArchitecture?.name ||
    "Architecture";

  const hasChildArchitecture = selectedNode
    ? Boolean(
        savedArchitectures[`${currentLevel}-${selectedNode.id}`]
      )
    : false;

  return (
    <div className="student-architecture">
      {/* Professional top header */}
      <header className="student-topbar">
        <div className="student-brand">
          <div className="student-brand-icon" aria-hidden="true">
            <svg
              viewBox="0 0 32 32"
              width="28"
              height="28"
              fill="none"
            >
              <rect
                x="10"
                y="3"
                width="12"
                height="9"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="2"
                y="21"
                width="12"
                height="9"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="18"
                y="21"
                width="12"
                height="9"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 12V16M8 21V17H24V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="student-brand-text">
            <span className="student-brand-name">
              DIGIDENSE WORKSPACE
            </span>
            <span className="student-brand-subtitle">
              Architecture Builder
            </span>
          </div>
        </div>

        <div className="student-topbar-divider" />

        <div className="student-document-title">
          <span className="student-document-label">
            ARCHITECTURE
          </span>
          <h1>{architecture.name || "Untitled Architecture"}</h1>
        </div>

        <div className="student-topbar-actions">
          <span className="student-readonly-badge">
            <span className="student-status-dot" />
            Read only
          </span>

          <button
            className="student-back-button"
            onClick={onBack}
            type="button"
          >
            <span aria-hidden="true">←</span>
            <span>All architectures</span>
          </button>
        </div>
      </header>

      {/* Breadcrumb navigation */}
      <nav className="student-breadcrumb" aria-label="Architecture path">
        <div className="student-breadcrumb-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M10 6.5H14V14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="student-breadcrumb-items">
          {breadcrumbLevels.map((level, index) => {
            const isCurrent = index === breadcrumbLevels.length - 1;

            return (
              <span
                className="student-breadcrumb-item"
                key={`${level}-${index}`}
              >
                {index > 0 && (
                  <span className="student-breadcrumb-separator">
                    /
                  </span>
                )}

                <button
                  type="button"
                  className={
                    isCurrent
                      ? "student-breadcrumb-link current"
                      : "student-breadcrumb-link"
                  }
                  disabled={isCurrent}
                  onClick={() => {
                    setCurrentLevel(level);
                    setLevelHistory(breadcrumbLevels.slice(0, index));
                    setSelectedNode(null);
                  }}
                >
                  {levelNames[level] || level}
                </button>
              </span>
            );
          })}
        </div>

        <div className="student-breadcrumb-right">
          {levelHistory.length > 0 && (
            <button
              type="button"
              className="student-previous-button"
              onClick={goBack}
            >
              <span aria-hidden="true">←</span>
              Previous level
            </button>
          )}
        </div>
      </nav>

      {/* Main workspace */}
      <main className="student-workspace">
        <section className="student-canvas-section">
          <div className="student-canvas-toolbar">
            <div className="student-canvas-heading">
              <span className="student-canvas-heading-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="19"
                  height="19"
                  fill="none"
                >
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M10 6.5H14V14"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </span>

              <div>
                <h2>{levelNames.root || architecture.name || "Main Architecture"}</h2>
                <p>
                  {nodes.length} {nodes.length === 1 ? "component" : "components"}
                  {" · "}
                  {rawEdges.length} {rawEdges.length === 1 ? "connection" : "connections"}
                </p>
              </div>
            </div>

            <div className="student-canvas-hint">
              <span className="student-hint-mouse" aria-hidden="true">
                ↖
              </span>
              Click to inspect
              <span className="student-hint-divider">·</span>
              Double-click to explore
            </div>
          </div>

          <div className="student-architecture-canvas">
            {nodes.length === 0 ? (
              <div className="student-empty-canvas">
                <div className="student-empty-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 48 48"
                    width="44"
                    height="44"
                    fill="none"
                  >
                    <rect
                      x="16"
                      y="4"
                      width="16"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="4"
                      y="32"
                      width="16"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="28"
                      y="32"
                      width="16"
                      height="12"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M24 16V24M12 32V24H36V32"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3>No components at this level</h3>
                <p>
                  This architecture level does not contain any components yet.
                </p>
              </div>
            ) : (
              <ReactFlow
                key={currentLevel}
                className="student-flow"
                nodes={displayNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                edgesReconnectable={false}
                panOnDrag
                zoomOnScroll
                zoomOnPinch
                zoomOnDoubleClick={false}
                fitView
                fitViewOptions={{ padding: 0.18 }}
                minZoom={0.2}
                maxZoom={2}
                defaultEdgeOptions={{
                  type: "smoothstep",
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: "#8493a8",
                  },
                }}
              >
                <Controls position="bottom-left" showInteractive={false} />
              </ReactFlow>
            )}
          </div>

          <div className="student-canvas-footer">
            <span>
              <span className="student-footer-dot" />
              Interactive architecture
            </span>
            <span>Use your mouse wheel to zoom</span>
          </div>
        </section>

        {/* Component inspection panel */}
        <aside className="student-inspector">
          <div className="student-inspector-header">
            <div>
              <span className="student-inspector-eyebrow">
                INSPECTOR
              </span>
              <h2>Component details</h2>
            </div>

            {selectedNode && (
              <button
                className="student-clear-selection"
                type="button"
                onClick={() => setSelectedNode(null)}
                aria-label="Clear component selection"
                title="Clear selection"
              >
                ×
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="student-inspector-content">
              <div className="student-component-symbol" aria-hidden="true">
                <svg
                  viewBox="0 0 32 32"
                  width="30"
                  height="30"
                  fill="none"
                >
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M10 12H22M10 16H22M10 20H18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <span className="student-component-type">
                ARCHITECTURE COMPONENT
              </span>

              <h3 className="student-component-title">
                {selectedNode.data?.label || "Unnamed component"}
              </h3>

              <div className="student-detail-divider" />

              <div className="student-description-heading">
                <h4>Overview</h4>
              </div>

              <p className="student-component-description">
                {selectedNode.data?.description?.trim()
                  ? selectedNode.data.description
                  : "No explanation has been added for this component yet."}
              </p>

              {hasChildArchitecture && (
                <div className="student-drilldown-note">
                  <span className="student-drilldown-icon" aria-hidden="true">
                    ↳
                  </span>
                  <div>
                    <strong>More details available</strong>
                    <p>
                      Double-click this component on the canvas to explore
                      its architecture.
                    </p>
                  </div>
                </div>
              )}

              <div className="student-selection-footer">
                <span className="student-selection-indicator" />
                Component selected
              </div>
            </div>
          ) : (
            <div className="student-inspector-empty">
              <div className="student-inspector-empty-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 48 48"
                  width="44"
                  height="44"
                  fill="none"
                >
                  <rect
                    x="7"
                    y="7"
                    width="34"
                    height="34"
                    rx="8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 18H32M16 24H32M16 30H26"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3>Explore components</h3>
              <p>
                Select any component in the architecture to learn what it does
                and how it fits into the system.
              </p>

              <div className="student-inspector-tip">
                <span aria-hidden="true">ⓘ</span>
                <span>
                  Double-click a component to explore its detailed architecture.
                </span>
              </div>
            </div>
          )}

          <div className="student-inspector-bottom">
            <span className="student-readonly-lock" aria-hidden="true">
              ◈
            </span>
            <div>
              <strong>Student view</strong>
              <span>Viewing only · Editing disabled</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default StudentArchitectureViewer;