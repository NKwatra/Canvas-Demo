import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  applyNodeChanges,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "./app.css";
import Point from "./Point";
import React from "react";
import DoubleEdge from "./DoubleEdge";

const nodeTypes = {
  point: Point,
};

const edgeTypes = {
  double: DoubleEdge,
};

export default function App() {
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);
  const { screenToFlowPosition, getNode } = useReactFlow();

  const addPoint = React.useCallback(
    (e) => {
      setNodes((curr) => {
        let edgeAdded;
        let segments = curr;
        if (curr.length > 0) {
          setEdges((edgeCurr) => {
            const edge = {
              id: `${curr.length}-${curr.length + 1}`,
              source: curr.length.toString(),
              target: (curr.length + 1).toString(),
              type: "double",
              label: String.fromCodePoint("A".codePointAt(0) + edgeCurr.length),
            };
            edgeAdded = {
              n1: curr.length.toString(),
              n2: (curr.length + 1).toString(),
            };
            segments = [
              ...segments.slice(0, segments.length - 1),
              {
                ...segments[segments.length - 1],
                data: {
                  edges: [
                    ...segments[segments.length - 1].data.edges,
                    edgeAdded,
                  ],
                },
              },
            ];
            return [...edgeCurr, edge];
          });
        }
        return [
          ...segments,
          {
            id: (curr.length + 1).toString(),
            type: "point",
            position: screenToFlowPosition({
              x: e.clientX,
              y: e.clientY,
            }),
            data: {
              edges: edgeAdded ? [edgeAdded] : [],
            },
          },
        ];
      });
    },
    [screenToFlowPosition]
  );

  function onNodesChange(changes) {
    setNodes((curr) => {
      const updated = applyNodeChanges(changes, curr);
      const nodes = {};
      changes
        .filter((chg) => chg.type === "position")
        .forEach((chng) => {
          const node = getNode(chng.id);
          node.data.edges.forEach((edge) => {
            if (edge.n1 !== chng.id) {
              nodes[edge.n1] = true;
            } else {
              nodes[edge.n2] = true;
            }
          });
        });
      return updated.map((nd) => {
        if (nodes[nd.id]) {
          nd.data = {
            ...nd.data,
          };
        }
        return nd;
      });
    });
  }

  return (
    <div className="container">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        panOnScroll
        selectionOnDrag
        onlyRenderVisibleElements
        onPaneClick={addPoint}
        edgeTypes={edgeTypes}
      >
        <Background variant={BackgroundVariant.Lines} color="#ccc" gap={15} />
      </ReactFlow>
    </div>
  );
}
