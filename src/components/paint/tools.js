import {forEachInLine, forEachInRect} from './helpers';
import objectAssign from 'object-assign';

export class PixelTool {
  constructor() {
    this.name = 'Undefined';
  }

  mousedown(point, props, state) {
    return objectAssign({}, state, {
      interaction: {
        s: point,
        e: point,
        points: [point],
      },
    });
  }

  mousemove(point, props, state) {
    return objectAssign({}, state, {
      interaction: {
        s: state.interaction.s,
        e: point,
        points: [].concat(state.interaction.points, [point]),
      },
    });
  }

  mouseup(point, props, state) {
    return objectAssign({}, state, {
      interaction: {
        s: state.interaction.s,
        e: point,
        points: [].concat(state.interaction.points, [point]),
      },
    });
  }

  render(context, props, state) {
    return state;
  }
}


export class PixelFillRectTool extends PixelTool {
  constructor() {
    super();
    this.name = 'rect';
  }

  render(context, {color}, {interaction}) {
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

  render(context, {color, imageData}, state) {
    const e = state.interaction.e;

    if (!e) {
      return;
    }

    imageData.getContiguousPixels(e, state.selectionPixels, (p) => {
      context.fillPixel(p.x, p.y, color);
    });
  }
}

export class PixelFillEllipseTool extends PixelTool {

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

  render(context, {color}, {interaction}) {
    if (!interaction.points || !interaction.points.length) {
      return;
    }
    let prev = interaction.points[0];
    for (const point of interaction.points) {
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

  render(context, {color, pixelSize}, {interaction}, isPreview) {
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

  render(context, {color}, {interaction}, isPreview) {
    if (!interaction.points || !interaction.points.length) {
      return;
    }
    let prev = interaction.points[0];
    for (const point of interaction.points) {
      if (isPreview) {
        forEachInLine(prev.x, prev.y, point.x, point.y, (x, y) => context.clearPixel(x, y));
      } else {
        forEachInLine(prev.x, prev.y, point.x, point.y, (x, y) => context.fillPixel(x, y, "rgba(0,0,0,0)"));
      }
      prev = point;
    }
  }
}

export class PixelRectSelectionTool extends PixelTool {
  constructor() {
    super();
    this.name = 'select';
  }

  selectionPixelsForState(state) {
    const results = [];
    forEachInRect(state.interaction.s, state.interaction.e, (x, y) =>
      results.push({x, y})
    );
    return results;
  }

  mousedown(point, props, state) {
    return objectAssign(super.mousedown(point, props, state), {
      selectionPixels: [],
    });
  }

  mousemove(point, props, state) {
    return objectAssign(super.mousemove(point, props, state), {
      selectionPixels: this.selectionPixelsForState(state),
    });
  }

  mouseup(point, props, state) {
    return objectAssign(super.mouseup(point, props, state), {
      selectionPixels: this.selectionPixelsForState(state),
    });
  }
}

export class PixelMagicSelectionTool extends PixelTool {
  constructor() {
    super();
    this.name = 'magicWand';
  }

  mousemove(point, {imageData}, state) {
    const selectionPixels = [];
    imageData.getContiguousPixels(point, null, (p) => {
      selectionPixels.push(p);
    });
    return objectAssign({}, state, {selectionPixels});
  }
}

export class PixelTranslateTool extends PixelTool {
  constructor() {
    super();
    this.name = 'translate';
  }

  mousedown(point, props, state) {
    // this.down = true;
    // if (!canvas.selectionPixels.length) {
    //   return;
    // }
    // canvas.cut()
    // canvas.paste()
    return state;
  }
}
