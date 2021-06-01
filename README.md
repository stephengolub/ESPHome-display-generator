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

### Tools

There are only the three tools implemented:
* Pixel Toggle (pencil)
* Line drawing
* Rectangle

_As of now, none of these will create the proper code, they still do the "turn pixel on" code._

### Known Bugs

There's an issue that I know is a decimal point or some mundane details that is causing the lines when the slope is negative to be offset weirdly. So if anyone has any ideas, PRs are welcome. I'll be tracking this as issue #1.

## TODO

* Fix line offset weirdness with negative slopes.
* Drawing tools:
    * Circle/Ellipse
* Track lines drawn and actually generate the `it.line` or `it.rectangle` code
* Colors
