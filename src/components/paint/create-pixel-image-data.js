import {forEachInRect} from './helpers';

export default function CreatePixelImageData() {
  this.clone = () => {
    const clone = new ImageData(new Uint8ClampedArray(this.data), this.width, this.height);
    CreatePixelImageData.call(clone);
    return clone;
  };

  this.fillPixel = (xx, yy, color) => {
    if (!color) {
      throw new Error("fillPixel requires a color.");
    }
    if ((xx >= this.width || xx < 0) || (yy >= this.height || yy < 0)) {
      return;
    }

    const components = color.substr(5, color.length - 6).split(',');
    components.forEach((val, idx) => {
      this.data[(yy * this.width + xx) * 4 + idx] = val / 1;
    });
  };

  this.getPixel = (xx, yy) => {
    const oo = (yy * this.width + xx) * 4;
    return [this.data[oo], this.data[oo + 1], this.data[oo + 2], this.data[oo + 3]];
  };

  this.clearPixelsInRect = (startX, startY, endX, endY) => {
    forEachInRect({x: startX, y: startY}, {x: endX, y: endY}, (x, y) =>
      this.fillPixel(x, y, 'rgba(0,0,0,0)')
    );
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
        if (pointsHit[pkey]) {
          continue;
        }
        if (!(pp.x >= 0 && pp.y >= 0 && pp.x < this.width && pp.y < this.height)) {
          continue;
        }
        if (region && region.length && !region.find((test) => pp.x === test.x && pp.y === test.y)) {
          continue;
        }

        const pixelData = this.getPixel(pp.x, pp.y);
        let colorDelta = 0;
        for (let i = 0; i < 4; i ++) {
          colorDelta += Math.abs(pixelData[i] - startPixelData[i]);
        }
        if (colorDelta < 15) {
          points.push(pp);
          pointsHit[pkey] = true;
        }
      }

      p = points.pop();
    }
  };

  // this function calls a callback on every pixel on the border of a group of pixels
  this.getEdgePixels = (selectionPixels) => {
    const selection = {};
    for (const p of selectionPixels) {
      selection[`${p.x},${p.y}`] = true;
    }
    const results = [];
    for (const p of selectionPixels) {
      const left = selection[`${p.x - 1},${p.y}`];
      const right = selection[`${p.x + 1},${p.y}`];
      const top = selection[`${p.x},${p.y - 1}`];
      const bot = selection[`${p.x},${p.y + 1}`];
      if (!left || !right || !top || !bot) {
        results.push([p.x, p.y, left, right, top, bot]);
      }
    }
    return results;
  };
}
