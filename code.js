const minHeight = 8;
const minWidth = 8;
const maxHeight = 128;
const maxWidth = 128;

const fillSelect = (id, min, max) => {
  const sel = document.getElementById(id);
  for (let i = min; i <= max; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    sel.appendChild(opt);
  }
};

let grid = [];

const copyRow = (destRow, srcRow) => {
  for (let i=0; i < destRow.length && i < srcRow.length; i++) {
    destRow[i] = srcRow[i];
  }
  return destRow;
};

let mouseDown = false;
let destination = undefined;

const targetIsCell = (e) => e.target.classList.contains("cell");
const onGridClick = (e) => {
  if (targetIsCell(e)) {
    e.target.classList.toggle("on");
    e.target.classList.toggle("off");
  }
};

const setInfoBox = (text) => {
  document.getElementById("info").innerText = text;
};

const onGridMouseDown = (e) => {
  if (targetIsCell(e)) {
    destination = e.target.classList.contains("off");
    setInfoBox(destination.toString());
    mouseDown = true;
    setCellValue(e.target, destination);
  }
};

const onGridMouseUp = (e) => {
  mouseDown = false;
  destination = undefined;
  setInfoBox("");
};

const coordsFromCell = cell => {
  return cell.id.split("_").map(x => parseInt(x, 10));
};

const setCellValue = (cell, destination) => {
  coords = coordsFromCell(cell);
  setInfoBox(`${coords}: ${destination}`);
  grid[coords[1]][coords[0]] = destination;
};

const onGridMouseOver = (e) => {
  if (mouseDown && targetIsCell(e)) {
    const cell = e.target;
    if (destination) {
      cell.classList.add("on")
      cell.classList.remove("off")
    } else {
      cell.classList.add("off")
      cell.classList.remove("on")
    }
    setCellValue(cell, destination);
  }
}

const getCell = (state, x, y) => {
  const cls = state ? "on" : "off";
  const cell = document.createElement('div');
  cell.id = `${x}_${y}`;
  cell.classList.add("cell");
  cell.classList.add(state ? "on" : "off");
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
  fillSelect("width", minWidth, maxWidth);
  fillSelect("height", minHeight, maxHeight);

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

  const opBox = document.getElementById("output");
  opBox.innerText = lines.join('\n');
  opBox.classList.remove("hidden");
};

const copyToClipboard = () => {
  const op = document.getElementById("output");
  op.select();
  op.setSelectionRange(0, 999999);

  document.execCommand("copy");
};
