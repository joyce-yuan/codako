import { Position, RuleExtent } from "../../../../types";
import { SquaresCanvas } from "./squares-canvas";

export const ActorPositionCanvas = ({
  extent,
  position,
}: {
  extent: RuleExtent;
  position: Position;
}) => {
  return (
    <SquaresCanvas
      width={extent.xmax - extent.xmin + 1}
      height={extent.ymax - extent.ymin + 1}
      onDraw={(el, c, squareSize) => {
        c.fillStyle = "#fff";
        c.fillRect(0, 0, el.width, el.height);
        c.fillStyle = "#f00";
        c.fillRect(
          (position.x - extent.xmin) * squareSize,
          (position.y - extent.ymin) * squareSize,
          squareSize,
          squareSize,
        );

        c.lineWidth = 1;
        c.strokeStyle = "rgba(0,0,0,0.4)";
        c.strokeRect(0, 0, el.width, el.height);
      }}
    />
  );
};
