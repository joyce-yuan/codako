import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';
import CreatePixelContext from './create-pixel-context';

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

    this.state = {
      selectedPixels: [],
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

  componentDidUpdate() {
    const shouldRender = (this.state.selectedPixels.length > 0);
    if (shouldRender && !this._timer) {
      this._timer = setInterval(() => this.renderToCanvas(), 250);
    } else if (!shouldRender && this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }

    this.renderToCanvas();
  }

  renderToCanvas() {
    const {pixelSize, imageData} = this.props;
    const {selectedPixels} = this.state;
    const c = this._pixelContext;

    c.fillStyle = "rgb(255,255,255)";
    c.clearRect(0,0, c.canvas.width, c.canvas.height);
    c.drawTransparentPattern();

    if (imageData) {
      c.applyPixelsFromData(imageData, 0, 0, 40, 40, 0, 0, {});
    }

    if (this.props.tool) {
      this.props.tool.previewRender(c, this.props, this.state);
    }

    // draw selected pixels with marching ant funtimes.
    c.lineWidth = 1;
    c.strokeStyle = "rgba(70,70,70,.90)";
    c.beginPath();
    imageData.getBorderPixels(selectedPixels, (x,y, left, right, top, bot) => {
      if ((Math.floor( Date.now() / 250 ) + x + y * (imageData.width + 1)) % 2 === 0) {
        const topY = (y) * pixelSize;
        const botY = (y+1) * pixelSize;
        const leftX = (x) * pixelSize;
        const rightX = (x+1) * pixelSize;
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
    });
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
    const x = Math.round((event.clientX - left) / pixelSize);
    const y = Math.round((event.clientY - top) / pixelSize);
    return tool[type]({x, y}, this.props, this.state);
  }

  _onMouseDown = (event) => {
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
    const {imageData, tool, onChangeImageData} = this.props;
    const {mousedown} = this.state;

    if (mousedown && tool) {
      const nextImageData = imageData.clone();
      tool.render(nextImageData, this.props, this.state);
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
