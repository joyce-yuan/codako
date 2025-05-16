import { useEffect, useRef } from "react";

const DELTA_SQUARE_SIZE = 10;

export const SquaresCanvas = ({
  width,
  height,
  onDraw,
}: {
  width: number;
  height: number;
  onDraw: (el: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) => void;
}) => {
  const el = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!el.current) {
      return;
    }
    onDraw(el.current, el.current.getContext("2d")!, el.current.width / width);
  });

  const scale = Math.min(DELTA_SQUARE_SIZE, 40.0 / height);
  return (
    <canvas
      ref={(e) => (el.current = e)}
      width={width * scale * window.devicePixelRatio}
      height={height * scale * window.devicePixelRatio}
      className="delta-canvas"
      style={{ width: width * scale, height: height * scale }}
    />
  );
};
