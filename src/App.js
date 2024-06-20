import { Circle, Layer, Line, Shape, Stage, Text } from "react-konva";
import "./app.css";
import React from "react";

function App() {
  const [params, setParams] = React.useState([]);
  const [points, setPoints] = React.useState([]);
  const [selected, setSelected] = React.useState(-1);
  const stageRef = React.useRef();

  function pointAtPDist(pslope, dist, { newX, newY }) {
    let fx, fy;
    if (pslope === 0) {
      fx = newX + dist;
      fy = newY;
    } else if (!isFinite(pslope)) {
      fx = newX;
      fy = newY + dist;
    } else {
      var dx = dist / Math.sqrt(1 + pslope * pslope);
      var dy = pslope * dx;
      fx = pslope < 0 ? newX - dx : newX + dx;
      fy = pslope < 0 ? newY - dy : newY + dy;
    }
    return { fx: fx, fy: fy };
  }

  function pointAtDist(slope, dist, { newX, newY }, { xDir, yDir }) {
    let fx, fy;
    if (slope === 0) {
      fx = xDir > 0 ? newX + dist : newX - dist;
      fy = newY;
    } else if (!isFinite(slope)) {
      fx = newX;
      fy = yDir > 0 ? newY + dist : newY - dist;
    } else {
      let dx = dist / Math.sqrt(1 + slope * slope);
      let dy = slope * dx;
      fx = xDir > 0 ? newX + dx : newX - dx;

      if (slope > 0) {
        fy = yDir > 0 ? newY + dy : newY - dy;
      } else {
        fy = yDir > 0 ? newY - dy : newY + dy;
      }
    }
    return { fx: fx, fy: fy };
  }

  function mouseDown(e) {
    const x = e.evt.layerX;
    const y = -e.evt.layerY;
    setPoints((curr) => {
      let newElements = [];
      if (curr.length > 0) {
        const prev = curr[curr.length - 1];
        const prevX = prev.x,
          prevY = -prev.y;
        const midX = (x + prevX) / 2;
        const midY = (y + prevY) / 2;
        const slope = (y - prevY) / (x - prevX);
        const dist = 20;
        const pslope = -1 / slope;
        const { fx, fy } = pointAtPDist(pslope, dist, {
          newX: midX,
          newY: midY,
        });
        newElements.push({
          type: "side",
          name: `${params.length + 1}`,
          coords: [{ x: fx, y: -fy }],
          rotation: 360 - (180 * Math.atan(slope)) / Math.PI,
        });
      }
      if (curr.length > 1) {
        const last = curr[curr.length - 1];
        const second = curr[curr.length - 2];
        const secondY = -second.y;
        const lastY = -last.y;
        let length = Math.sqrt(
          (second.x - last.x) * (second.x - last.x) +
            (secondY - lastY) * (secondY - lastY)
        );
        let dist = length / 4;

        const c1 = pointAtDist(
          (lastY - secondY) / (last.x - second.x),
          dist,
          {
            newX: last.x,
            newY: lastY,
          },
          { xDir: second.x - last.x, yDir: secondY - lastY }
        );
        length = Math.sqrt(
          (x - last.x) * (x - last.x) + (y - lastY) * (y - lastY)
        );
        dist = length / 4;
        const c2 = pointAtDist(
          (y - lastY) / (x - last.x),
          dist,
          {
            newX: last.x,
            newY: lastY,
          },
          { xDir: x - last.x, yDir: y - lastY }
        );
        const middle = {
          x: (c1.fx + c2.fx) / 2,
          y: (c1.fy + c2.fy) / 2,
        };
        const cmid = pointAtDist(
          (middle.y - lastY) / (middle.x - last.x),
          10,
          { newX: middle.x, newY: middle.y },
          { xDir: middle.x - last.x, yDir: middle.y - lastY }
        );
        newElements.push({
          type: "bend",
          name: `${params.length + 2}`,
          coords: [
            { x: c1.fx, y: -c1.fy },
            { x: cmid.fx, y: -cmid.fy },
            { x: c2.fx, y: -c2.fy },
          ],
          rotation:
            360 -
            (180 * Math.atan((c2.fy - c1.fy) / (c2.fx - c1.fx))) / Math.PI,
        });
      }
      setParams((currParams) => [...currParams, ...newElements]);
      return [...curr, { x, y: -y }];
    });
  }

  const line = [];
  points.forEach((pt) => {
    line.push(pt.x);
    line.push(pt.y);
  });

  return (
    <div className="container">
      <Stage
        width={Math.min(window.innerWidth, 600)}
        height={400}
        className="stage"
        onMouseDown={mouseDown}
        ref={stageRef}
      >
        <Layer>
          {points.map((point, index) => (
            <Circle
              radius={5}
              fill="black"
              x={point.x}
              y={point.y}
              key={`${point.x},${point.y}`}
              onMouseDown={(e) => {
                e.evt.stopPropagation();
                setSelected(index);
              }}
            />
          ))}
          <Line points={line} stroke="black" strokeWidth={3} />
          {params.map((record) =>
            record.type === "side" ? (
              <Text
                text={record.name}
                x={record.coords[0].x}
                y={record.coords[0].y}
                fontSize={18}
                rotation={record.rotation}
                key={`${record.coords[0].x},${record.coords[0].y}`}
                fontStyle="bold"
              />
            ) : (
              <React.Fragment
                key={`${record.coords[0].x},${record.coords[0].y}-${record.coords[1].x},${record.coords[1].y}`}
              >
                <Curve points={record.coords} />
                <Text
                  text={record.name}
                  x={record.coords[1].x}
                  y={record.coords[1].y}
                  fontSize={18}
                  fontStyle="bold"
                  rotation={record.rotation}
                />
              </React.Fragment>
            )
          )}
        </Layer>
      </Stage>
      <div style={{ height: 400 }}>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {params.map((param) => (
              <tr>
                <td>{param.name}</td>
                <td>
                  <input type="text" inputMode="numeric" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;

function Curve({ points }) {
  return (
    <Shape
      stroke="black"
      strokeWidth={1}
      sceneFunc={(con) => {
        con.beginPath();
        con.moveTo(points[0].x, points[0].y);
        con.quadraticCurveTo(
          points[1].x,
          points[1].y,
          points[2].x,
          points[2].y
        );
        con.stroke();
      }}
    />
  );
}
