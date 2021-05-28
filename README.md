# ESPHome-display-generator

**WIP**

Born out of the desire to not have to code up display drawings but draw them.

Currently it's hosted on GitHub Pages: https://stephengolub.github.io/ESPHome-display-generator

## Usage

You can choose the dimensions and the grid will auto-resize. It'll attempt to clone existing marks into the new grid (if the size is adequate).

Click a cell to highlight it. Once your picture is set, you can click the generate button at the top to output the code for the ESPHome display component to draw.

### Query Params

* **w**: will preset the width
* **h**: will preset the height

## Limitations

Currently, it is a point-by-point drawing. Ultimately the desire is to calculate or track lines and shapes.
