import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import objectAssign from 'object-assign';

const tempCanvas = document.createElement('canvas');


class PixelTool {
  constructor() {
    this.name = 'Undefined';
  }

  mousedown(point, state) {
    state.interaction = {
      s: point,
      e: point,
    };
    return state;
  }

  mousemove(point, state) {
    state.interaction.e = point;
    return state;
  }

  mouseup(point, state) {
    state.interaction.e = point;
    return state;
  }

  previewRender(context, props, state) {
    this.render(context, props, state);
  }

  render(context, props, state) {
    return state;
  }
}


class PixelFillRectTool extends PixelTool {
  constructor() {
    super();
    this.name = 'rect';
  }

  render(context, {interaction}) {
    if (!interaction.s || !interaction.e) {
      return;
    }
    for (let x = interaction.s.x; x < interaction.end.x; x ++) {
      for (let y = interaction.s.y; y < interaction.end.y; y ++) {
        context.fillPixel(x, y);
      }
    }
  }
}


class PixelPaintbucketTool extends PixelTool {
  constructor() {
    super();
    this.name = 'paintbucket';
  }

  render(context, {color}, state) {
    const e = state.interaction.e;

    if (!e) {
      return;
    }

    state.imageData.getContiguousPixels(e, state.selectedPixels, (p) => {
      context.fillPixel(p.x, p.y, color);
    });
  }
}

class PixelFillEllipseTool extends PixelTool {

  constructor() {
    super();
    this.name = 'ellipse';
  }

  render(context, {color}, {interaction}) {
    const {s, e} = interaction;
    if (!s || !e) {
      return;
    }

    const rx = (e.x - s.x) / 2;
    const ry = (e.y - s.y) / 2;
    const cx = Math.round(s.x + rx);
    const cy = Math.round(s.y + ry);

    for (let x = s.x; x < e.x; x ++) {
      for (let y = s.y; y < e.y; y ++) {
        if (Math.pow((x-cx) / rx, 2) + Math.pow((y-cy) / ry, 2) < 1) {
          context.fillPixel(x, y, color);
        }
      }
    }
  }
}

class PixelFreehandTool extends PixelTool {
  constructor() {
    super();
    this.name = 'pen';
  }

  mousedown(point, state) {
    state.interaction = {
      points: [point],
    };
    return state;
  }

  mousemove(point, state) {
    state.interaction = {
      points: [].concat(state.interaction.points, [point]),
    };
    return state;
  }

  mouseup(point, state) {
    state.interaction = {
      points: [].concat(state.interaction.points, [point]),
    };
    return state;
  }

  render(context, {color}, {interaction}) {
    if (!interaction.points || !interaction.points.length) {
      return;
    }
    let prev = interaction.points[0];
    for (const point of interaction.points) {
      context.drawPixelLine(prev.x, prev.y, point.x, point.y, color);
      prev = point;
    }
  }
}

class PixelLineTool extends PixelTool {
  constructor() {
    super();
    this.name = 'line';
  }

  render(context, {color}, {interaction}) {
    const {s, e} = interaction;
    if (!s || !e) {
      return;
    }
    context.drawPixelLine(s.x, s.y, e.x, e.y, color);
  }
}

class PixelEraserTool extends PixelFreehandTool {
  constructor() {
    super();
    this.name = 'eraser';
  }

  previewRender(context, {color}, {interaction}) {
    if (!interaction.points || !interaction.points.length) {
      return;
    }
    let prev = interaction.points[0];
    for (const point of interaction.points) {
      context.drawPixelLine(prev.x, prev.y, point.x, point.y, "rgba(0,0,0,0)", context.clearPixel);
      prev = point;
    }
  }

  render(context, {color}, {interaction}) {
    if (!interaction.points || !interaction.points.length) {
      return;
    }
    let prev = interaction.points[0];
    for (const point of interaction.points) {
      context.drawPixelLine(prev.x, prev.y, point.x, point.y, "rgba(0,0,0,0)");
      prev = point;
    }
  }
}

class PixelRectSelectionTool extends PixelTool {
  constructor() {
    super();
    this.name = 'select';
  }

  mouseup(point, state) {
    state.selectedPixels = [];
    for (let x = state.interaction.s.x; x < point.x; x ++) {
      for (let y = state.interaction.s.y; y < point.y; y ++) {
        state.selectedPixels.push({x, y});
      }
    }
    return super.mouseup(point, state);
  }
}

class PixelMagicSelectionTool extends PixelTool {
  constructor() {
    super();
    this.name = 'magicWand';
  }

  mousemove(point, state) {
    state.selectedPixels = [];
    state.imageData.getContiguousPixels(point, null, (p) => {
      state.selectedPixels.push(p);
    });
    return state;
  }
}

class PixelTranslateTool extends PixelTool {
  constructor() {
    super();
    this.name = 'translate';
  }

  mousedown(point, state) {
    // this.down = true;
    // if (!canvas.selectedPixels.length) {
    //   return;
    // }
    // canvas.cut()
    // canvas.paste()
    return state;
  }
}

function getImageDataFromDataURL(dataURL, callback) {
  const img = new Image();
  img.onload = () => {
    const {width, height} = img;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempContext = tempCanvas.getContext('2d');
    tempContext.imageSmoothingEnabled = false;
    tempContext.clearRect(0, 0, width, height);
    tempContext.drawImage(img, 0, 0);
    callback(tempContext.getImageData(0, 0, width, height));
  };
  img.src = dataURL;
}

function CreatePixelImageData() {
  this.fillPixel = (xx, yy, color) => {
    if ((xx >= this.width || xx < 0) || (yy >= this.height || yy < 0)) {
      return;
    }

    const components = color.substr(5, color.length - 7).split(',');
    components.forEach((val, idx) => {
      this.data[(yy * this.width + xx) * 4 + idx] = val / 1;
    });
  };

  this.getPixel = (xx, yy) => {
    const oo = (yy * this.width + xx) * 4;
    return [this.data[oo], this.data[oo+1], this.data[oo+2], this.data[oo+3]];
  };

  this.clearPixelsInRect = ( startX, startY, endX, endY ) => {
    if (((endX - startX) <= 0) || ((endY - startY) <= 0)) {
      return;
    }
    for (let x = startX; x < endX; x ++) {
      for (let y = startY; y < endY; y ++) {
        this.fillPixel(x, y, 'rgba(0,0,0,0)');
      }
    }
  };

  this.getContiguousPixels = (startPixel, region, callback) => {
    const points = [startPixel];
    const startPixelData = this.getPixel(startPixel.x, startPixel.y);

    const pointsHit = {};
    pointsHit[`${startPixel.x}-${startPixel.y}`] = 1;
    let p = points.pop();

    while (p) {
      callback(p);

      for (const d of [{x:-1, y:0}, {x:0,y:1}, {x:0,y:-1}, {x:1,y:0}]) {
        const pp = {x: p.x + d.x, y: p.y + d.y};
        const pkey =  `${pp.x}-${pp.y}`;

        if (!(pp.x >= 0 && pp.y >= 0 && pp.x < this.width && pp.y < this.height)) {
          continue;
        }
        if (region && region.length && region.find((test) => pp.x === test.x && pp.y === test.y)) {
          continue;
        }
        if (pointsHit[pkey]) {
          continue;
        }

        const pixelData = this.getPixel(pp.x, pp.y);
        let colorDelta = 0;
        for (let i = 0; i < 4; i ++) {
          colorDelta += Math.abs(pixelData[i] - startPixelData[i]);
          if (colorDelta < 15) {
            points.push(pp);
            pointsHit[pkey] = true;
          }
        }
      }

      p = points.pop();
    }
  };

  // this function calls a callback on every pixel on the border of a group of pixels
  this.getBorderPixels = (pixels, callback) => {
    for (const p of pixels) {
      let left = false;
      let right = false;
      let top = false;
      let bot = false;
      for (const other of pixels) {
        if (other.x === p.x - 1 && other.y === p.y) {
          left = true;
        }
        if (other.x === p.x + 1 && other.y === p.y) {
          right = true;
        }
        if (other.x === p.x && other.y === p.y - 1) {
          top = true;
        }
        if (other.x === p.x && other.y === p.y + 1) {
          bot = true;
        }
      }

      if (!left || !right || !top || !bot) {
        callback(p.x, p.y, left, right, top, bot);
      }
    }
  };
}


function CreatePixelContext(PixelSize) {
  this.applyPixelsFromData = (imageData, startX, startY, endX, endY, offsetX, offsetY, options = {}) => {
    const {data, width} = imageData;
    for (let x = startX; x < endX - 1; x ++) {
      for (let y = startY; y < endY - 1; y ++) {
        const r = data[(y * width + x) * 4 + 0];
        const g = data[(y * width + x) * 4 + 1];
        const b = data[(y * width + x) * 4 + 2];
        const a = data[(y * width + x) * 4 + 3];
        if (!(options.ignoreClearPixels && a <= 0)) {
          this.fillPixel(x+offsetX, y+offsetY,`rgba(${r},${g},${b},${a})`);
        }
      }
    }
  };

  this.fillPixel = (x, y, color) => {
    this.fillStyle = color;
    this.fillRect(x * PixelSize, y * PixelSize, PixelSize, PixelSize);
  };

  this.clearPixel = (x, y) => {
     this.clearRect(x * PixelSize, y * PixelSize, PixelSize, PixelSize);
   };

  this.getPixelExtent = () => {
    return {
      xMax: Math.ceil(this.canvas.width / PixelSize),
      yMax: Math.ceil(this.canvas.height / PixelSize),
    };
  };

  this.drawTransparentPattern = () => {
    this.fillStyle = "rgba(230,230,230,1)";
    const {xMax, yMax} = this.getPixelExtent();

    for (let x = 0; x < xMax; x ++) {
      for (let y = 0; y < yMax; y ++) {
        this.fillRect(x * PixelSize, y * PixelSize, PixelSize / 2, PixelSize / 2);
        this.fillRect(x * PixelSize + PixelSize / 2, y * PixelSize + PixelSize / 2, PixelSize / 2, PixelSize / 2);
      }
    }
  };

  this.drawGrid = () => {
    const {xMax, yMax} = this.getPixelExtent();
    this.lineWidth = 1;
    this.strokeStyle = "rgba(70,70,70,0.30)";
    this.beginPath();
    for (let x = 0; x < xMax; x++) {
      this.moveTo(x * PixelSize + 0.5, 0);
      this.lineTo(x * PixelSize + 0.5, this.height * PixelSize + 0.5);
    }
    for (let y = 0; y < yMax; y++) {
      this.moveTo(0, y * PixelSize + 0.5);
      this.lineTo(this.width * PixelSize + 0.5, y * PixelSize + 0.5);
    }
    this.stroke();
  };

  this.drawPixelLine = (x0, y0, x1, y1, color = null, pixelCallback = null) => {
    if (!pixelCallback) {
      pixelCallback = this.fillPixel;
    }

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    let arrived = false;

    while (arrived === false) {
      pixelCallback(x0, y0, color);
      if ((x0 === x1) && (y0 === y1)) {
        arrived = true;
        break;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err = err - dy;
        x0 = x0 + sx;
      }

      if (e2 < dx) {
        err = err + dx;
        y0 = y0 + sy;
      }
    }
  };
}

class PixelCanvas extends React.Component {
  static propTypes = {
    tool: PropTypes.object,
    color: PropTypes.string,
    initialImageDataURL: PropTypes.string,
    pixelSize: PropTypes.number,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedPixels: [],
      imageData: null,
      interaction: {},
      mousedown: false,
    };
  }

  componentDidMount() {
    const {initialImageDataURL, pixelSize} = this.props;

    this._pixelContext = this._pixelCanvas.getContext('2d');
    CreatePixelContext.call(this._pixelContext, pixelSize);

    getImageDataFromDataURL(initialImageDataURL, (imageData) => {
      CreatePixelImageData.call(imageData);
      this.setState({imageData});
    });
  }

  componentDidUpdate() {
    this.renderToCanvas();
  }

  renderToCanvas() {
    const {imageData} = this.state;
    const c = this._pixelContext;

    c.fillStyle = "rgb(255,255,255)";
    c.clearRect(0,0, this.width, this.height);
    c.drawTransparentPattern();

    if (imageData) {
      c.applyPixelsFromData(
        imageData, 0, 0, 40, 40, 0, 0, {}
      );
    }
    if (this.props.tool) {
      this.props.tool.previewRender(c, this.props, this.state);
    }
    c.drawGrid();
  }

  _getStateFromToolEvent = (event, type) => {
    const {pixelSize, tool} = this.props;

    if (tool) {
      const {top, left} = this._pixelCanvas.getBoundingClientRect();
      const x = Math.round((event.clientX - left) / pixelSize);
      const y = Math.round((event.clientY - top) / pixelSize);
      return tool[type]({x, y}, this.state);
    }
  }

  _onMouseDown = (event) => {
    this.setState(objectAssign(this._getStateFromToolEvent(event, 'mousedown'), {mousedown: true}));
  }

  _onMouseMove = (event) => {
    if (this.state.mousedown) {
      this.setState(this._getStateFromToolEvent(event, 'mousemove'));
    }
  }

  _onMouseUp = (event) => {
    if (this.state.mousedown) {
      this.setState(objectAssign(this._getStateFromToolEvent(event, 'mouseup'), {mousedown: false}));
    }
  }

  render() {
    return (
      <canvas
        width="400"
        height="400"
        onMouseDown={this._onMouseDown}
        onMouseMove={this._onMouseMove}
        onMouseUp={this._onMouseUp}
        ref={(el) => this._pixelCanvas = el}
      />
    );
  }
}

class PixelToolbar extends React.Component {
  static propTypes = {
    tools: PropTypes.array,
    tool: PropTypes.object,
    onToolChange: PropTypes.func,
  };

  render() {
    const {tool, tools, onToolChange} = this.props;

    return (
      <div>
        {tools.map(t =>
          <button
            key={t.name}
            className={classNames({'tool': true, 'selected': tool === t})}
            onClick={() => onToolChange(t)}
          >
            {t.name}
          </button>
        )}
      </div>
    );
  }
}

const ColorOptions = [
  'rgba(255,0,0,1)',
  'rgba(0,255,0,1)',
  'rgba(0,0,255,1)',
];

class PixelColorPicker extends React.Component {
  static propTypes = {
    color: PropTypes.string,
    onColorChange: PropTypes.func,
  };

  render() {
    const {color, onColorChange} = this.props;

    return (
      <div>
        {ColorOptions.map(option =>
          <button
            key={option}
            style={{backgroundColor: option}}
            className={classNames({'color': true, 'selected': color === option})}
            onClick={() => onColorChange(option)}
          />
        )}
      </div>
    );
  }
}

class PaintContainer extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,

    characters: PropTypes.object,
    characterId: PropTypes.string,
    animationId: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      tools: [new PixelLineTool(), new PixelRectSelectionTool(), new PixelMagicSelectionTool(), new PixelEraserTool(), new PixelPaintbucketTool(), new PixelFillEllipseTool(), new PixelTranslateTool(), new PixelFreehandTool(), new PixelFillRectTool()],
      selectedTool: null,
    };
  }

  render() {
    const {characterId, characters} = this.props;

    if (!characterId) {
      return <span />;
    }

    const {spritesheet} = characters[characterId];

    return (
      <div className="modal-background">
        <div className="modal paint">
          <h2>Edit Appearance</h2>
          <PixelToolbar
            tools={this.state.tools}
            tool={this.state.selectedTool}
            onToolChange={(selectedTool) => this.setState({selectedTool})}
          />
          <PixelColorPicker
            color={this.state.selectedColor}
            onColorChange={(selectedColor) => this.setState({selectedColor})}
          />
          <PixelCanvas
            color={this.state.selectedColor}
            tool={this.state.selectedTool}
            initialImageDataURL={spritesheet.data}
            offsetX={0}
            offsetY={0}
            pixelSize={10}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.ui.paint, {characters: state.characters});
}

export default connect(
  mapStateToProps,
)(PaintContainer);
