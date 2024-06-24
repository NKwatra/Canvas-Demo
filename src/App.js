import ReactFlow, {
  Background,
  BackgroundVariant,
  Panel,
  applyNodeChanges,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import "./app.css";
import Point from "./Point";
import React from "react";
import DoubleEdge from "./DoubleEdge";
import { toPng } from "html-to-image";
import { getAngle } from "./utils";
import Girth from "./Girth";

const nodeTypes = {
  point: Point,
};

const edgeTypes = {
  double: DoubleEdge,
};

function getNewCoords(a, b, c, prevAngle, newAngle) {
  const posDelta = (Math.PI * Math.abs(prevAngle - newAngle)) / 180;
  const negDelta = (Math.PI * -Math.abs(prevAngle - newAngle)) / 180;
  const dx = c.x - a.x;
  const dy = c.y - a.y;
  const d_acx_p = dx * Math.cos(posDelta) - dy * Math.sin(posDelta);
  const d_acy_p = dx * Math.sin(posDelta) + dy * Math.cos(posDelta);

  const d_acx_n = dx * Math.cos(negDelta) - dy * Math.sin(negDelta);
  const d_acy_n = dx * Math.sin(negDelta) + dy * Math.cos(negDelta);

  const c1x = a.x + d_acx_p;
  const c1y = a.y + d_acy_p;

  const c2x = a.x + d_acx_n;
  const c2y = a.y + d_acy_n;

  const a1 = getAngle(
    [
      { x1: a.x, y1: a.y, x2: b.x, y2: b.y },
      { x1: a.x, y1: a.y, x2: c1x, y2: c1y },
    ],
    { x: a.x, y: a.y }
  );
  if (a1 === newAngle) {
    return { x: c1x, y: c1y };
  } else {
    return { x: c2x, y: c2y };
  }
}

export default function App() {
  const [dataUrl, setDataUrl] = React.useState("");
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);
  const { screenToFlowPosition, getNode, getNodes } = useReactFlow();

  const addPoint = React.useCallback(
    (e) => {
      function onEdgeUpdate(id, label) {
        setEdges((curr) => {
          const newEdges = [];
          curr.forEach((edge) => {
            if (edge.id !== id) {
              newEdges.push(edge);
            } else {
              newEdges.push({ ...edge, label });
            }
          });
          return newEdges;
        });
      }

      function onAngleUpdate(id, prevAngle, angle) {
        const index = parseInt(id) - 1;
        setNodes((curr) => {
          const newNodes = [...curr.slice(0, index)];
          newNodes.push({ ...curr[index], data: { ...curr[index].data } });
          newNodes.push({
            ...curr[index + 1],
            position: getNewCoords(
              curr[index].position,
              curr[index - 1].position,
              curr[index + 1].position,
              prevAngle,
              angle
            ),
          });
          if (index + 2 < curr.length) {
            newNodes.push({
              ...curr[index + 2],
              data: { ...curr[index + 2].data },
            });
            newNodes.push(...curr.slice(index + 3));
          }
          return newNodes;
        });
      }

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
              data: { onEdgeUpdate },
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
                  ...segments[segments.length - 1].data,
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
              onAngleUpdate: onAngleUpdate,
            },
          },
        ];
      });
    },
    [screenToFlowPosition]
  );

  const onNodesChange = React.useCallback(
    function (changes) {
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
    },
    [getNode]
  );

  function downloadImage() {
    const nodesBound = getNodesBounds(getNodes());
    const transform = getViewportForBounds(nodesBound, 1024, 768, 0.5, 2);
    toPng(document.querySelector(".react-flow__viewport"), {
      width: 1024,
      height: 768,
      style: {
        width: 1024,
        height: 768,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
    }).then((dataUrl) => {
      setDataUrl(dataUrl);
      const a = document.createElement("a");
      a.setAttribute("download", "flashing.png");
      a.setAttribute("href", dataUrl);
      a.click();
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
        <Panel position="top-right">
          <button
            onClick={() => {
              setNodes((curr) => {
                const edgeId = `${curr.length}-${curr.length - 1}`;
                setEdges((curr) => curr.filter((edge) => edge.id !== edgeId));
                return [...curr.slice(0, curr.length - 1)];
              });
            }}
          >
            Remove Last Point
          </button>
          <button
            onClick={downloadImage}
            style={{
              marginLeft: 16,
            }}
          >
            Download
          </button>
          <button
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
            style={{
              marginLeft: 16,
            }}
          >
            Clear
          </button>
        </Panel>
        <Girth edges={edges} />
      </ReactFlow>
    </div>
  );
}
