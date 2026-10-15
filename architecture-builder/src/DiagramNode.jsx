import {
  Handle,
  Position,
  NodeResizer,
} from "@xyflow/react";

function DiagramNode({ data, selected }) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={40}
      />

      {/* Top source */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{
          width: 4,
          height: 4,
          top: -2,
          background: "#222",
        }}
      />

      {/* Right source */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{
          width: 4,
          height: 4,
          right: -2,
          background: "#222",
        }}
      />

      {/* Bottom source */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{
          width: 4,
          height: 4,
          bottom: -2,
          background: "#222",
        }}
      />

      {/* Left source */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{
          width: 4,
          height: 4,
          left: -2,
          background: "#222",
        }}
      />

      {/* Top target */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{
          opacity: 0,
        }}
      />

      {/* Right target */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{
          opacity: 0,
        }}
      />

      {/* Bottom target */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{
          opacity: 0,
        }}
      />

      {/* Left target */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{
          opacity: 0,
        }}
      />

      {/* Node body */}
      <div
        className="diagram-node-body"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Drill-down indicator */}
        {data.hasDrillDown && (
  <div
    style={{
      position: "absolute",
      top: 5,
      right: 6,
      fontSize: 12,
      fontWeight: 700,
      color: "#222",
      pointerEvents: "none",
    }}
    title="Has drill-down"
  >
    ↗
  </div>
)}
    

        {/* Node label */}
        {data.label}
      </div>
    </>
  );
}

export default DiagramNode;