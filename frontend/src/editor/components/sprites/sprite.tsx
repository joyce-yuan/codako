import { CSSProperties } from "react";
import { Character } from "../../../types";

const Sprite = ({
  style,
  className,
  transform = "none",
  spritesheet,
  appearance,
  frame,
}: {
  spritesheet: Character["spritesheet"];
  appearance: string;
  className?: string;
  transform?: string;
  style?: CSSProperties;
  frame?: number;
}) => {
  const { width, appearances } = spritesheet;

  let data = new URL("../../img/splat.png", import.meta.url).href;
  if (appearance && appearances[appearance]) {
    data = appearances[appearance][frame || 0];
  }

  const allstyle = Object.assign(
    {
      width: width,
      height: width,
      display: "inline-block",
      transform: {
        "90deg": "rotate(90deg)",
        "180deg": "rotate(180deg)",
        "270deg": "rotate(270deg)",
        "flip-x": "scale(-1, 1)",
        "flip-y": "scale(1, -1)",
        "flip-xy": "scale(-1, -1)",
        none: undefined,
      }[transform],
    },
    style,
  );

  return <img src={data} draggable={false} className={`sprite ${className}`} style={allstyle} />;
};

export default Sprite;
