import { Handle, Position, useReactFlow } from "reactflow";
import React from "react";
import Input from "./Input";
import { getAngle } from "./utils";

export default function Point({ selected, data, xPos, yPos, id }) {
  const [editing, setEditing] = React.useState(false);
  const [angle, setAngle] = React.useState("");
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

  function onChange(e) {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setAngle(value);
    } else if (e.target.value === "") {
      setAngle("");
    }
  }

  function onDone() {
    if (typeof angle !== "number" || angle < 0 || angle > 180) {
      alert("angle needs to be between 0 and 180 deg");
      return;
    }
    setEditing(false);
    data.onAngleUpdate(id, getAngle(edges, { x: xPos, y: yPos }), angle);
  }

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
      {edges.length > 1 ? (
        <div
          className="nopan pointer-events"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {!editing ? (
            getAngle(edges, { x: xPos, y: yPos })
          ) : (
            <Input
              placeholder="90"
              onDone={onDone}
              value={angle}
              onChange={onChange}
            />
          )}
        </div>
      ) : null}
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
