export function getAngle(edges, position) {
  let x1 = position.x,
    y1 = position.y,
    x2,
    y2,
    x3,
    y3;
  let x = edges[0].x1,
    y = edges[0].y1;
  if (x === position.x && y === position.y) {
    x2 = edges[0].x2;
    y2 = edges[0].y2;
  } else {
    x2 = edges[0].x1;
    y2 = edges[0].y1;
  }
  x = edges[1].x1;
  y = edges[1].y1;
  if (x === position.x && y === position.y) {
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
