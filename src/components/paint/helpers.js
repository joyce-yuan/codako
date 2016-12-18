
export function forEachInRect(s, e, pixelCallback) {
  let [sx, sy, ex, ey] = [s.x, s.y, e.x, e.y];
  if (ex < sx) {
    [ex, sx] = [sx, ex];
  }
  if (ey < sy) {
    [ey, sy] = [sy, ey];
  }
  for (let x = sx; x < ex; x ++) {
    for (let y = sy; y < ey; y ++) {
      pixelCallback(x, y);
    }
  }
}

export function forEachInLine(x0, y0, x1, y1, pixelCallback) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let x = x0;
  let y = y0;
  let err = dx - dy;
  let arrived = false;

  while (arrived === false) {
    pixelCallback(x, y);

    if ((x === x1) && (y === y1)) {
      arrived = true;
      break;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err = err - dy;
      x = x + sx;
    }

    if (e2 < dx) {
      err = err + dx;
      y = y + sy;
    }
  }
}

export function hsvToRgb(h, s, v) {
  let r, g, b;
  r = g = b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
  }
  return [r * 255, g * 255, b * 255];
}

const tempCanvas = document.createElement('canvas');

export function getDataURLFromImageData(imageData, callback) {
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempContext = tempCanvas.getContext('2d');
  tempContext.clearRect(0, 0, imageData.width, imageData.height);
  tempContext.putImageData(imageData, 0, 0);
  callback(tempCanvas.toDataURL());
}

export function getImageDataFromDataURL(dataURL, callback) {
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
