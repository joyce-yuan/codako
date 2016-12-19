import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';
import CreatePixelContext from './create-pixel-context';

const SELECTION_ANTS_INTERVAL = 200;

export default class PixelCanvas extends React.Component {
  static propTypes = {
    tool: PropTypes.object,
    color: PropTypes.string,
    pixelSize: PropTypes.number,
    imageData: PropTypes.object,
    onChangeImageData: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);

    this._cachedEdgePixels = null;
    this.state = {
      selectionPixels: [],
      interaction: {},
      mousedown: false,
    };
  }


  componentDidMount() {
    const {pixelSize} = this.props;
    this._pixelContext = this._pixelCanvas.getContext('2d');
    CreatePixelContext.call(this._pixelContext, pixelSize);

    this.renderToCanvas();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectionPixels !== prevState.selectionPixels) {
      this._cachedEdgePixels = null;
    }

    const shouldRender = (this.state.selectionPixels.length > 0);
    if (shouldRender && !this._timer) {
      this._timer = setInterval(() => this.renderToCanvas(), SELECTION_ANTS_INTERVAL);
    } else if (!shouldRender && this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }

    this.renderToCanvas();
  }

  renderToCanvas() {
    const {pixelSize, imageData} = this.props;
    const c = this._pixelContext;

    c.fillStyle = "rgb(255,255,255)";
    c.clearRect(0,0, c.canvas.width, c.canvas.height);
    c.drawTransparentPattern();

    if (imageData) {
      c.applyPixelsFromData(imageData, 0, 0, 40, 40, 0, 0, {});
    }

    if (this.props.tool) {
      this.props.tool.render(c, this.props, this.state, true);
    }

    // draw selected pixels with marching ant funtimes.
    c.beginPath();
    if (!this._cachedEdgePixels) {
      this._cachedEdgePixels = imageData.getEdgePixels(this.state.selectionPixels);
    }
    for (const [x, y, left, right, top, bot] of this._cachedEdgePixels) {
      if ((Math.floor( Date.now() / SELECTION_ANTS_INTERVAL ) + x + y * (imageData.width + 1)) % 2 === 0) {
        const topY = (y) * pixelSize + 0.5;
        const botY = (y+1) * pixelSize + 0.5;
        const leftX = (x) * pixelSize + 0.5;
        const rightX = (x+1) * pixelSize + 0.5;
        if (!left) {
          c.moveTo(leftX, topY);
          c.lineTo(leftX, botY);
        }
        if (!right) {
          c.moveTo(rightX, topY);
          c.lineTo(rightX, botY);
        }
        if (!top) {
          c.moveTo(leftX, topY);
          c.lineTo(rightX, topY);
        }
        if (!bot) {
          c.moveTo(leftX, botY);
          c.lineTo(rightX, botY);
        }
      }
    }
    c.lineWidth = 2.4;
    c.strokeStyle = "rgba(255,255,255,1)";
    c.lineCap = 'round';
    c.stroke();
    c.lineWidth = 1;
    c.strokeStyle = "rgba(0,0,0,1)";
    c.stroke();
    // end marching ant funtimes.

    c.drawGrid();
  }

  _stateByApplyingToolEvent = (event, type) => {
    const {pixelSize, tool} = this.props;

    if (!tool) {
      return {};
    }
    const {top, left} = this._pixelCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - left) / pixelSize);
    const y = Math.floor((event.clientY - top) / pixelSize);
    return tool[type]({x, y}, this.props, this.state);
  }

  _onMouseDown = (event) => {
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);

    this.setState(objectAssign(this._stateByApplyingToolEvent(event, 'mousedown'), {
      mousedown: true,
    }));
  }

  _onMouseMove = (event) => {
    if (this.state.mousedown) {
      this.setState(this._stateByApplyingToolEvent(event, 'mousemove'));
    }
  }

  _onMouseUp = (event) => {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);

    const {imageData, tool, onChangeImageData} = this.props;
    const {mousedown} = this.state;

    if (mousedown && tool) {
      const nextImageData = imageData.clone();
      tool.render(nextImageData, this.props, this.state, false);
      onChangeImageData(nextImageData);

      this.setState(objectAssign(this._stateByApplyingToolEvent(event, 'mouseup'), {
        mousedown: false,
        interaction: {},
      }));
    }
  }

  render() {
    return (
      <canvas
        width="440"
        height="440"
        onMouseDown={this._onMouseDown}
        ref={(el) => this._pixelCanvas = el}
      />
    );
  }
}
