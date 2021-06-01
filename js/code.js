const minHeight = 8;
const minWidth = 8;
const maxHeight = 128;
const maxWidth = 128;

const STATE_ON = "on";
const STATE_OFF = "off";

const TOOL_PENCIL = "pencil";
const TOOL_LINE = "line";
const TOOL_ELLIPSE = "ellipse";
const TOOL_RECTANGLE = "rectangle";

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

const lineBetweenPoints = (pointA, pointB) => {
  x1 = pointA[0];
  y1 = pointA[1];
  x2 = pointB[0];
  y2 = pointB[1];

  points = [];
  if (x2 == x1) { // Vertical Line
    for (let y = y1; y <= y2 && validPoint([x1, y]); y++) {
      points.push([x1, y]);
    }
  } else if (y2 == y1) { // Horizontal Line
    for (let x = x1; x <= x2 && validPoint([y1, x]); x++) {
      points.push([x, y1]);
    }
  } else {
    let m = (y2 - y1) / (x2 - x1);
    console.log("Slope:", m);
    let xMin = x1;
    let xMax = x2;
    let b = y1;
    let y = y2;
    if (x1 > x2) {
      xMax = x1;
      xMin = x2;
    }
    if (y1 > y2) {
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

const onGridMouseUp = () => {
  mouseDown = false;
  destination = undefined;
  resetToolPoints();
  switch (currentTool) {
    case TOOL_PENCIL:
      break;
    case TOOL_LINE:
      break;
    case TOOL_ELLIPSE:
      break;
    case TOOL_RECTANGLE:
      break;
  }
};

const coordsFromCell = cell => {
  return cell.id.split("_").map(x => parseInt(x, 10));
};

const setCellValueByCoords = (coords, state, cell) => {
  const x = coords[0];
  const y = coords[1];
  grid[y][x] = state;
  if (cell == undefined) {
    cell = document.getElementById(`${x}_${y}`);
  }
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
  console.log("Cell:", coords)
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
  const cls = state ? STATE_ON : STATE_OFF;
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

const generate = () => {
  let lines = ["// First we'll handle the turn on pixels."];

  for (let y in grid) {
    const row = grid[y];
    for (let x in row) {
      const cell = row[x];
      if (cell === true) {
        lines.push(`it.draw_pixel_at(${x}, ${y}, COLOR_ON);`);
      }
    }
  }

  document.getElementById("output").innerText = lines.join('\n');
  document.querySelector(".output-container").classList.remove("hidden");
};


const copyToClipboard = () => {
  navigator.clipboard.writeText(document.getElementById("output").innerText);
};

