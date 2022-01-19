const minHeight = 8;
const minWidth = 8;
let maxHeight = 128;
let maxWidth = 128;

const STATE_ON = "on";
const STATE_OFF = "off";

const TOOL_PENCIL = "pencil";
const TOOL_LINE = "line";
const TOOL_ELLIPSE = "ellipse";
const TOOL_RECTANGLE = "rectangle";

const outputs = {};

outputs[TOOL_PENCIL] = [];
outputs[TOOL_LINE] = [];
outputs[TOOL_ELLIPSE] = [];
outputs[TOOL_RECTANGLE] = [];

let grid = [];

const copyRow = (destRow, srcRow) => {
  for (let i=0; i < destRow.length && i < srcRow.length; i++) {
    destRow[i] = srcRow[i];
  }
  return destRow;
};

let mouseDown = false;
let destination = undefined;
let currentTool = TOOL_PENCIL;
let point1 = undefined;
let point2 = undefined;
let drawPoints = [];

const resetToolPoints = () => {
  point1 = undefined;
  point2 = undefined;
  drawPoints = [];
};

const chooseTool = (toolName) => {
  if ([TOOL_PENCIL, TOOL_LINE, TOOL_ELLIPSE, TOOL_RECTANGLE].indexOf(toolName) >= 0) {
    document.getElementById(`tool-${currentTool}`).classList.remove("active");
    document.getElementById(`tool-${toolName}`).classList.add("active");
    currentTool = toolName;
    resetToolPoints();
  }
};

const targetIsCell = (e) => e.target.classList.contains("cell");
const onGridClick = (e) => {
  if (targetIsCell(e)) {
    const cell = e.target;
    if (currentTool == TOOL_PENCIL) {
      cell.classList.toggle(STATE_ON);
      cell.classList.toggle(STATE_OFF);
    }
  }
};

const setInfoBox = (text) => {
  document.getElementById("info").innerText = text;
};

const validPoint = (coords) => {
  return (coords[0] >= 0 && coords[0] <= maxWidth) && (coords[1] >= 0 && coords[1] <= maxHeight);
}

const getDistanceBetweenPoints = (pointA, pointB) => {
  return Math.sqrt(((pointA[0] - pointB[0])^2) * (pointA[1] - pointB[1])^2)
};

const lineBetweenPoints = (pointA, pointB) => {
  x1 = pointA[0];
  y1 = pointA[1];
  x2 = pointB[0];
  y2 = pointB[1];

  points = [];
  if (x2 == x1) { // Vertical Line
    let yMin = y1;
    let yMax = y2;
    if (y1 > y2) {
      yMin = y2;
      yMax = y1;
    }
    for (let y = yMin; y <= yMax && validPoint([x1, y]); y++) {
      points.push([x1, y]);
    }
  } else if (y2 == y1) { // Horizontal Line
    let xMin = x1;
    let xMax = x2;
    if (x1 > x2) {
      xMin = x2;
      xMax = x1;
    }
    for (let x = xMin; x <= xMax && validPoint([y1, x]); x++) {
      points.push([x, y1]);
    }
  } else {
    let m = (y2 - y1) / (x2 - x1);
    let xMin = x1;
    let xMax = x2;
    let b = y1;
    let y = y2;
    if (x1 > x2) {
      xMax = x1;
      xMin = x2;
      y = y1;
      b = y2;
    }
    for (let x = xMin; x <= xMax && validPoint([x, y]); x++) {
      y = m*(x - xMin) + b;
      points.push([Math.abs(Math.round(x)), Math.abs(Math.round(y))]);
    }
  }
  return points;
};

const rectAroundPoints = (pointA, pointB) => {
  x1 = pointA[0];
  y1 = pointA[1];
  x2 = pointB[0];
  y2 = pointB[1];

  points = [];
  if (x2 == x1 || y2 == y1) { // Vertical or Horizontal Line
    return lineBetweenPoints(pointA, pointB);
  } else {
    let xMin = x1;
    let xMax = x2;
    let yMin = y1;
    let yMax = y2;
    if (x1 > x2) {
      xMax = x1;
      xMin = x2;
    }
    if (y1 > y2) {
      yMax = y1;
      yMin = y2;
    }
    for (x = xMin; x <= xMax; x++) {
      if (x == xMin || x == xMax) {
        for (y = yMin; y <= yMax; y++) {
          points.push([x,y]);
        }
      }
      points.push([x,yMin]);
      points.push([x,yMax]);
    }
  }
  return points;
}

const RAD = Math.PI / 180;

const circleOfPoints = (centerPoint, radius) => {
  cX = centerPoint[0];
  cY = centerPoint[1];
  points = [];
  for (let deg=0; deg <= 360; deg++) {
    let x = radius * Math.sin(deg * RAD);
    let y = radius * Math.cos(deg * RAD);
    points.push([Math.round(x) + cX, Math.round(y) + cY]);
  }
  pSet = new Set(points.map(x => x.toString()));
  return [...pSet.values()].map(x => x.split(",").map(p => +p)).filter(validPoint);
};

const onGridMouseDown = (e) => {
  if (targetIsCell(e)) {
    const cell = e.target;
    destination = cell.classList.contains(STATE_OFF);
    mouseDown = true;
    switch (currentTool) {
      case TOOL_PENCIL:
        setCellValue(cell, destination);
        break;
      case TOOL_LINE:
        point1 = coordsFromCell(cell);
        break;
      case TOOL_ELLIPSE:
        point1 = coordsFromCell(cell);
        break;
      case TOOL_RECTANGLE:
        point1 = coordsFromCell(cell);
        break;
    }
  }
};

const onGridMouseUp = (e) => {
  const cell = e.target;
  switch (currentTool) {
    case TOOL_PENCIL:
      outputs[TOOL_PENCIL].push(coordsFromCell(cell))
      break;
    case TOOL_LINE:
      outputs[TOOL_LINE].push([point1, point2])
      break;
    case TOOL_ELLIPSE:
      outputs[TOOL_ELLIPSE].push([point1, point2])
      break;
    case TOOL_RECTANGLE:
      outputs[TOOL_RECTANGLE].push([point1, point2])
      break;
  }
  mouseDown = false;
  destination = undefined;
  resetToolPoints();
};

const coordsFromCell = cell => {
  return cell.id.split("_").map(x => parseInt(x, 10));
};

const setCellValueByCoords = (coords, state, cell) => {
  if (!validPoint(coords)) { return; }
  const x = coords[0];
  const y = coords[1];
  grid[y][x] = state;
  if (cell == undefined) {
    cell = document.getElementById(`${x}_${y}`);
  }
  if (!cell) { return; }
  if (state) {
    cell.classList.add(STATE_ON)
    cell.classList.remove(STATE_OFF)
  } else {
    cell.classList.add(STATE_OFF)
    cell.classList.remove(STATE_ON)
  }
};

const setCellValue = (cell, state) => {
  setCellValueByCoords(coordsFromCell(cell), state, cell);
};

const setBulkCellValueByCoords = (points, state) => {
  points.map(c => setCellValueByCoords(c, state));
};

const getCellValue = (coords) => {
  return grid[coords[1]][coords[0]];
};

const onGridMouseOver = (e) => {
  if (mouseDown && targetIsCell(e)) {
    const cell = e.target;
    switch (currentTool) {
      case TOOL_PENCIL:
        setCellValue(cell, destination);
        break;
      case TOOL_LINE:
        point2 = coordsFromCell(cell);
        setBulkCellValueByCoords(drawPoints, false);
        drawPoints = lineBetweenPoints(point1, point2).filter(c => !getCellValue(c));
        for (let i in points) {
          setCellValueByCoords(points[i], true);
        }
        break;
      case TOOL_ELLIPSE:
        point2 = coordsFromCell(cell);
        setBulkCellValueByCoords(drawPoints, false);
        drawPoints = circleOfPoints(point1, getDistanceBetweenPoints(point1, point2)).filter(c => !getCellValue(c));
        for (let i in points) {
          setCellValueByCoords(points[i], true);
        }
        break;
      case TOOL_RECTANGLE:
        point2 = coordsFromCell(cell);
        setBulkCellValueByCoords(drawPoints, false);
        drawPoints = rectAroundPoints(point1, point2).filter(c => !getCellValue(c));
        for (let i in points) {
          setCellValueByCoords(points[i], true);
        }
        break;
    }
  }
}

const getCell = (state, x, y) => {
  const cell = document.createElement('div');
  cell.id = `${x}_${y}`;
  cell.classList.add("cell");
  cell.classList.add(state ? STATE_ON : STATE_OFF);
  return cell;
};

const drawGrid = () => {
  const gridArea = document.getElementById("gridArea");
  gridArea.innerHTML = '';
  for (let y in grid) {
    for (let x in grid[y]) {
      gridArea.appendChild(getCell(grid[y][x], x, y));
    }
    gridArea.innerHTML += '<br>';
  }
};

const setGrid = (w, h) => {
  // Creating new empty grid
  let newGrid = [];
  maxHeight = h;
  maxWidth = w;
  for (let y=0; y<h; y++) {
    newGrid.push(Array(w).fill(false));
  }
  if (h < grid.length) {
    for (let i in newGrid) {
      copyRow(newGrid[i], grid[i]);
    }
  } else if (h > grid.length) {
    for (let i in grid) {
      copyRow(newGrid[i], grid[i]);
    }
  }
  grid = newGrid;
  drawGrid();
};

const getFieldValue = (id) => document.getElementById(id).value;

const onFieldChange = () => {
  setGrid(+getFieldValue("width"), +getFieldValue("height"));
};

const onReady = () => {
  const params = new URLSearchParams(window.location.search);

  const w = params.get("w");
  const h = params.get("h");
  if (w != undefined) {
    document.getElementById("width").value = +w;
  }
  if (h != undefined) {
    document.getElementById("height").value = +h;
  }
  onFieldChange();
};

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  onReady();
} else {
  document.addEventListener("DOMContentLoaded", onReady);
}

// We're calling COLORs explicitly so that it is obvious what we are looking for.
const generate = () => {
  let lines = ["// Lines"];

  for (let i in outputs[TOOL_LINE]) {
    points = outputs[TOOL_LINE][i];
    let x1 = points[0][0];
    let y1 = points[0][1];
    let x2 = points[1][0];
    let y2 = points[1][1];

    lines.push(`it.line(${x1},${y1},${x2},${y2},COLOR_ON);`);
  }

  lines.push("// Rectangles");
  for (let i in outputs[TOOL_RECTANGLE]) {
    points = outputs[TOOL_RECTANGLE][i];
    let x1 = points[0][0];
    let y1 = points[0][1];
    let x2 = points[1][0];
    let y2 = points[1][1];

    let w = Math.abs(x2-x1);
    let h = Math.abs(y2-y1);

    if (x1 < x2 && y1 < y2) { // Is Upper Left
      lines.push(`it.rectangle(${x1},${y1},${w},${h},COLOR_ON);`);
    } else if (x2 < x1 && y2 < y1) { // Is Lower Right
      lines.push(`it.rectangle(${x2},${y2},${w},${h},COLOR_ON);`);
    } else if (x1 < x2 && y2 < y1) { // Is Lower Left
      lines.push(`it.rectangle(${x1},${y2},${w},${h},COLOR_ON);`);
    } else { // Is Upper Right
      lines.push(`it.rectangle(${x2},${y1},${w},${h},COLOR_ON);`);
    }
  }

  lines.push("// Circles");
  for (let i in outputs[TOOL_ELLIPSE]) {
    points = outputs[TOOL_ELLIPSE][i]
    let x1 = points[0][0];
    let y1 = points[0][1];
    let r = getDistanceBetweenPoints(points[0], points[1]);
    lines.push(`it.circle(${x1},${y1},${r});`);
  }

  lines.push("// Clean up points");
  for (let i in outputs[TOOL_PENCIL]) {
    const coords = outputs[TOOL_PENCIL][i];
    const x = coords[0];
    const y = coords[1];
    const state = grid[y][x] ? 'ON' : 'OFF';
    lines.push(`it.draw_pixel_at(${x},${y},COLOR_${state});`)
  }

  document.getElementById("output").innerText = lines.join('\n');
  document.querySelector(".output-container").classList.remove("hidden");
};


function copyToClipboard(el) {
  var el = document.getElementById("output"),
    oldContentEditable = el.contentEditable,
    oldReadOnly = el.readOnly,
    range = document.createRange();

    el.contentEditable = true;
    el.readOnly = false;
    range.selectNodeContents(el);

    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

    el.contentEditable = oldContentEditable;
    el.readOnly = oldReadOnly;

    document.execCommand('copy');
}
