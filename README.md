# ESPHome-display-generator

**WIP**

Born out of the desire to not have to code up display drawings but draw them.

Currently it's hosted on GitHub Pages: https://stephengolub.github.io/ESPHome-display-generator

## Usage

You can choose the dimensions and the grid will auto-resize. It'll attempt to clone existing marks into the new grid (if the size is adequate).

![Grid Size Changing via Inputs](images/docs/input_grid_size.gif)

Click a cell to highlight it. Or click and drag to color multiple cells. Once your picture is set, you can click the generate button at the top to output the code for the ESPHome display component to draw.

![Drawing Demo](images/docs/drawing.gif)

### Query Parameters

* **w**: will preset the width
* **h**: will preset the height

![Query Param Entry Demonstration](images/docs/queryparams.gif)

### Tools

There are only four tools implemented:
* Pixel Toggle (pencil)
* Line drawing
* Rectangle
* Circles



### Known Bugs

* [Drawing circles is unstable](https://github.com/stephengolub/ESPHome-display-generator/issues/3)
* [Near vertical line is not contiguous](https://github.com/stephengolub/ESPHome-display-generator/issues/4)

## TODO

* Drawing tools:
    * Allow "filled" rectangles and circles
* Colors
