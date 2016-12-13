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
