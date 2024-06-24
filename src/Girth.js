import { Panel } from "reactflow";

export default function Girth({ edges }) {
  return (
    <Panel position="top-center">
      <div
        style={{
          backgroundColor: "white",
          padding: 8,
          borderRadius: 4,
          boxShadow: "6px 6px 11px 0 rgba(0,0,0,0.45)",
          display: "inline-block",
        }}
      >
        <span>Total Girth:</span>
        <span style={{ fontWeight: "bold" }}>
          {edges.reduce((acc, curr) => {
            const value = parseInt(curr.label);
            if (!isNaN(value)) {
              return acc + value;
            } else {
              return acc;
            }
          }, 0)}
          mm
        </span>
        <div />
        <span>Bends:</span>
        <span style={{ fontWeight: "bold" }}>
          {Math.max(edges.length - 1, 0)}
        </span>
      </div>
    </Panel>
  );
}
