import {forEachInLine, forEachInRect} from './helpers';
import objectAssign from 'object-assign';

export class PixelTool {
  constructor() {
    this.name = 'Undefined';
  }

  layerForProps(props, {clone = false} = {}) {
    const key = props.selectionImageData ? 'selectionImageData' : 'imageData';
    return {layerKey: key, layerImageData: clone ? props[key].clone() : props[key]};
  }

  mousedown(point, props) {
    return objectAssign({}, props, {
      interaction: {
        s: point,
        e: point,
        points: [point],
      },
    });
  }

  mousemove(point, props) {
    return objectAssign({}, props, {
      interaction: {
        s: props.interaction.s,
        e: point,
        points: [].concat(props.interaction.points, [point]),
      },
    });
  }

  mouseup(props) {
    const {layerImageData, layerKey} = this.layerForProps(props, {clone: true});
    this.render(layerImageData, props);

    return objectAssign({}, props, {
      [layerKey]: layerImageData,
      interaction: {
        s: null,
        e: null,
        points: [],
      }
    });
  }

  render() {
    // no effect
  }
}


export class PixelFillRectTool extends PixelTool {
  constructor() {
    super();
    this.name = 'rect';
  }

  render(context, {color, interaction}) {
    if (!interaction.s || !interaction.e) {
      return;
    }
    forEachInRect(interaction.s, interaction.e, (x, y) => {
      context.fillPixel(x, y, color);
    });
  }
}


export class PixelPaintbucketTool extends PixelTool {
  constructor() {
    super();
    this.name = 'paintbucket';
  }

  render(context, props) {
    if (!props.interaction.e) {
      return;
    }
    const {layerImageData} = this.layerForProps(props);
    layerImageData.getContiguousPixels(props.interaction.e, layerImageData.getOpaquePixels(), (p) => {
      context.fillPixel(p.x, p.y, props.color);
    });
  }
}

export class PixelFillEllipseTool extends PixelTool {

  constructor() {
    super();
    this.name = 'ellipse';
  }

  render(context, {color, interaction}) {
    const {s, e} = interaction;
    if (!s || !e) {
      return;
    }

    const rx = (e.x - s.x) / 2;
    const ry = (e.y - s.y) / 2;
    const cx = Math.round(s.x + rx);
    const cy = Math.round(s.y + ry);

    forEachInRect(s, e, (x, y) => {
      if (Math.pow((x-cx) / rx, 2) + Math.pow((y-cy) / ry, 2) < 1) {
        context.fillPixel(x, y, color);
      }
    });
  }
}

export class PixelFreehandTool extends PixelTool {
  constructor() {
    super();
    this.name = 'pen';
  }

  render(context, {color, interaction: {points}}) {
    if (!points || !points.length) {
      return;
    }
    let prev = points[0];
    for (const point of points) {
      forEachInLine(prev.x, prev.y, point.x, point.y, (x, y) => context.fillPixel(x, y, color));
      prev = point;
    }
  }
}

export class PixelLineTool extends PixelTool {
  constructor() {
    super();
    this.name = 'line';
  }

  render(context, {color, pixelSize, interaction}, isPreview) {
    const {s, e} = interaction;
    if (!s || !e) {
      return;
    }
    forEachInLine(s.x, s.y, e.x, e.y, (x, y) => context.fillPixel(x, y, color));
    if (isPreview) {
      context.beginPath();
      context.moveTo((s.x + 0.5) * pixelSize, (s.y + 0.5) * pixelSize);
      context.lineTo((e.x + 0.5) * pixelSize, (e.y + 0.5) * pixelSize);
      context.translate(0.5, 0.5);
      context.strokeWidth = 0.5;
      context.strokeStyle = 'rgba(0,0,0,1)';
      context.stroke();
      context.translate(1, 1);
      context.strokeStyle = 'rgba(255,255,255,1)';
      context.stroke();
      context.translate(-1.5, -1.5);
      context.closePath();
    }
  }
}

export class PixelEraserTool extends PixelTool {
  constructor() {
    super();
    this.name = 'eraser';
  }

  render(context, {color, interaction: {points}}, isPreview) {
    if (!points || !points.length) {
      return;
    }
    let prev = points[0];
    for (const point of points) {
      if (isPreview) {
        forEachInLine(prev.x, prev.y, point.x, point.y, (x, y) => context.clearPixel(x, y));
      } else {
        forEachInLine(prev.x, prev.y, point.x, point.y, (x, y) => context.fillPixel(x, y, "rgba(0,0,0,0)"));
      }
      prev = point;
    }
  }
}

class PixelSelectionTool extends PixelTool {
  selectionOffsetForProps(props) {
    const {interaction: {s, e}, initialSelectionOffset} = props;
    return {
      x: initialSelectionOffset.x + (e.x - s.x),
      y: initialSelectionOffset.y + (e.y - s.y),
    };
  }

  selectionPixelsForProps(props) {
    // override in subclasses
  }

  shouldDrag(point, props) {
    const x = point.x - props.selectionOffset.x;
    const y = point.y - props.selectionOffset.y;
    return props.selectionImageData && props.selectionImageData.getOpaquePixels()[`${x},${y}`];
  }

  mousedown(point, props) {
    if (this.shouldDrag(point, props)) {
      return objectAssign({}, super.mousedown(point, props), {
        initialSelectionOffset: props.selectionOffset,
        draggingSelection: true,
      });
    }

    let nextImageData = props.imageData;
    if (props.selectionImageData) {
      nextImageData = props.imageData.clone();
      nextImageData.applyPixelsFromData(props.selectionImageData, 0, 0, props.selectionImageData.width, props.selectionImageData.height, props.selectionOffset.x, props.selectionOffset.y, {
        ignoreClearPixels: true,
      });
    }

    return objectAssign({}, super.mousedown(point, props), {
      imageData: nextImageData,
      selectionImageData: null,
      selectionOffset: {x: 0, y: 0},
      interactionPixels: this.selectionPixelsForProps(props),
    });
  }

  mousemove(point, props) {
    if (props.draggingSelection) {
      return objectAssign({}, super.mousemove(point, props), {
        selectionOffset: this.selectionOffsetForProps(props),
      });
    }
    return objectAssign({}, super.mousemove(point, props), {
      interactionPixels: this.selectionPixelsForProps(props),
    });
  }

  mouseup(props) {
    if (props.draggingSelection) {
      return objectAssign({}, super.mouseup(props), {
        selectionOffset: this.selectionOffsetForProps(props),
        draggingSelection: false,
      });
    }

    const selectionImageData = props.imageData.clone();
    selectionImageData.maskUsingPixels(props.interactionPixels);

    const imageData = props.imageData.clone();
    for (const key of Object.keys(props.interactionPixels)) {
      const [x, y] = key.split(',').map(v => v / 1);
      imageData.fillPixelRGBA(x, y, 0, 0, 0, 0);
    }
    return objectAssign({}, super.mouseup(props), {
      selectionOffset: {x: 0, y: 0},
      selectionImageData,
      imageData,
      interactionPixels: null,
    });

  }
}

export class PixelRectSelectionTool extends PixelSelectionTool {
  constructor() {
    super();
    this.name = 'select';
  }

  selectionPixelsForProps({interaction}) {
    if (!interaction.s || !interaction.e) {
      return null;
    }
    const interactionPixels = {};
    forEachInRect(interaction.s, interaction.e, (x, y) =>
      interactionPixels[`${x},${y}`] = true
    );
    return interactionPixels;
  }
}

export class PixelMagicSelectionTool extends PixelSelectionTool {
  constructor() {
    super();
    this.name = 'magicWand';
  }

  selectionPixelsForProps({imageData, interaction}) {
    const interactionPixels = {};
    imageData.getContiguousPixels(interaction.e, null, (p) => {
      interactionPixels[`${p.x},${p.y}`] = true;
    });
    return interactionPixels;
  }
}