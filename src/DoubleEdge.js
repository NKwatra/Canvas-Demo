import { BaseEdge, EdgeLabelRenderer, getStraightPath } from "reactflow";

export default function DoubleEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
}) {
  const [e1, e2] = getEdgeEnds({
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
  });

  const [p1] = getStraightPath(e1);
  const [p2] = getStraightPath(e2);
  const [_, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={p1}
        style={{
          stroke: "#007FFF",
        }}
      />
      <BaseEdge
        id={id}
        path={p2}
        style={{
          stroke: "#007FFF",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            backgroundColor: "white",
            padding: `8px 16px`,
            boxShadow: `6px 6px 11px 0 rgba(0,0,0,0.45)`,
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function getEdgeEnds({ x1, y1, x2, y2 }) {
  const slope = -(y2 - y1) / (x2 - x1);
  const pSlope = -1 / slope;
  const [p1, p2] = pointAtDist(pSlope, 3, { x: x1, y: -y1 });
  const [p3, p4] = pointAtDist(pSlope, 3, { x: x2, y: -y2 });
  return [
    { sourceX: p1.x, sourceY: -p1.y, targetX: p3.x, targetY: -p3.y },
    { sourceX: p2.x, sourceY: -p2.y, targetX: p4.x, targetY: -p4.y },
  ];
}

function pointAtDist(slope, dist, { x, y }) {
  if (slope === 0) {
    return [
      { x: x - dist, y },
      { x: x + dist, y },
    ];
  } else if (!isFinite(slope)) {
    return [
      { x, y: y - dist },
      { x, y: y + dist },
    ];
  } else {
    const dx = dist / Math.sqrt(1 + slope * slope);
    const dy = slope * dx;
    return [
      { x: x + dx, y: y + dy },
      { x: x - dx, y: y - dy },
    ];
  }
}