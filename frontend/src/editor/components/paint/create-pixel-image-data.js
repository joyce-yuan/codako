import {forEachInRect} from './helpers';

export default function CreatePixelImageData() {
  this.clone = () => {
    const clone = new ImageData(new Uint8ClampedArray(this.data), this.width, this.height);
    CreatePixelImageData.call(clone);
    return clone;
  };

  this.log = () => {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(this, 0, 0);
    const url = canvas.toDataURL();
    
		const img = new Image();
		img.onload = function() {
			const dim = {
        string: "+",
        style: "font-size: 1px; padding: " + Math.floor(this.height/2) + "px " + Math.floor(this.width/2) + "px; line-height: " + this.height + "px;"
      };
			console.log("%c" + dim.string, dim.style + "background: url(" + url + "); background-size: " + (this.width) + "px " + (this.height) + "px; color: transparent;");
		};
		img.src = url;
  }

  this.maskUsingPixels = (mask) => {
    forEachInRect({x: 0, y: 0}, {x: this.width, y: this.height}, (x, y) => {
      if (!mask[`${x},${y}`]) {
        this.fillPixelRGBA(x, y, 0, 0, 0, 0);
      }
    });
  }

  this.fillPixel = (xx, yy, color) => {
    if (!color) {
      throw new Error("fillPixel requires a color.");
    }
    if ((xx >= this.width || xx < 0) || (yy >= this.height || yy < 0)) {
      return;
    }
    const components = color.substr(5, color.length - 6).split(',');
    this.fillPixelRGBA(xx, yy, ...components);
  };

  this.fillPixelRGBA = (xx, yy, r, g, b, a) => {
    this.data[(yy * this.width + xx) * 4 + 0] = r / 1;
    this.data[(yy * this.width + xx) * 4 + 1] = g / 1;
    this.data[(yy * this.width + xx) * 4 + 2] = b / 1;
    this.data[(yy * this.width + xx) * 4 + 3] = a / 1;
  };

  this.getPixel = (xx, yy) => {
    const oo = (yy * this.width + xx) * 4;
    return [this.data[oo], this.data[oo + 1], this.data[oo + 2], this.data[oo + 3]];
  };

  this.clearPixelsInRect = (startX, startY, endX, endY) => {
    forEachInRect({x: startX, y: startY}, {x: endX, y: endY}, (x, y) =>
      this.fillPixelRGBA(x, y, 0, 0, 0, 0)
    );
  };

  this.getContiguousPixels = (startPixel, regionMap, callback) => {
    const points = [startPixel];
    const startPixelData = this.getPixel(startPixel.x, startPixel.y);

    const pointsHit = {};
    pointsHit[`${startPixel.x},${startPixel.y}`] = 1;
    let p = points.pop();

    while (p) {
      callback(p);

      for (const d of [{x:-1, y:0}, {x:0,y:1}, {x:0,y:-1}, {x:1,y:0}]) {
        const pp = {x: p.x + d.x, y: p.y + d.y};
        const pkey =  `${pp.x},${pp.y}`;
        if (pointsHit[pkey]) {
          continue;
        }
        if (!(pp.x >= 0 && pp.y >= 0 && pp.x < this.width && pp.y < this.height)) {
          continue;
        }
        if (regionMap && regionMap[pkey]) {
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

  this.getOpaquePixels = () => {
    const pixels = {};
    forEachInRect({x: 0, y: 0}, {x: this.width, y: this.height}, (x, y) => {
      const [,,,a] = this.getPixel(x, y);
      if (a > 0) {
        pixels[`${x},${y}`] = true;
      }
    });
    return pixels;
  };
}
