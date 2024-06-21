import { Handle, Position, useReactFlow } from "reactflow";

export default function Point({ selected, data, xPos, yPos }) {
  const instance = useReactFlow();
  const edges = data.edges.map((edge) => {
    const n1 = instance.getNode(edge.n1);
    const n2 = instance.getNode(edge.n2);
    return {
      x1: n1.position.x,
      y1: n1.position.y,
      x2: n2.position.x,
      y2: n2.position.y,
    };
  });

  return (
    <>
      <div
        style={{
          width: 10,
          height: 10,
          backgroundColor: selected ? "#E32636" : "#03C03C",
          borderRadius: "50%",
          transform: "translate(-50%,-50%)",
          cursor: "pointer",
        }}
      />
      {edges.length > 1 ? getAngle(edges, { x: xPos, y: yPos }) : null}
      <Handle
        type="source"
        position={Position.Top}
        style={{
          left: 0,
          top: -2,
          visibility: "hidden",
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{
          left: 0,
          top: -2,
          visibility: "hidden",
        }}
      />
    </>
  );
}

export function getAngle(edges, position) {
  console.log(position);
  let x1 = position.x,
    y1 = position.y,
    x2,
    y2,
    x3,
    y3;
  let x = edges[0].x1;
  if (x === position.x) {
    x2 = edges[0].x2;
    y2 = edges[0].y2;
  } else {
    x2 = edges[0].x1;
    y2 = edges[0].y1;
  }
  x = edges[1].x1;
  if (x === position.x) {
    x3 = edges[1].x2;
    y3 = edges[1].y2;
  } else {
    x3 = edges[1].x1;
    y3 = edges[1].y1;
  }

  const dx21 = x2 - x1;
  const dx31 = x3 - x1;
  const dy21 = y2 - y1;
  const dy31 = y3 - y1;
  const m12 = Math.sqrt(dx21 * dx21 + dy21 * dy21);
  const m13 = Math.sqrt(dx31 * dx31 + dy31 * dy31);
  const theta = Math.acos((dx21 * dx31 + dy21 * dy31) / (m12 * m13));
  return Math.round((180 * theta) / Math.PI);
}
