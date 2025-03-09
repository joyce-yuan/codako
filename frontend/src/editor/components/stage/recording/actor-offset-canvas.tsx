import { PositionRelativeToRuleExtent, RuleExtent } from "../../../../types";
import { SquaresCanvas } from "./squares-canvas";

export const ActorOffsetCanvas = ({
  extent,
  offset,
}: {
  extent: RuleExtent;
  offset: PositionRelativeToRuleExtent;
}) => {
  return (
    <SquaresCanvas
      width={extent.xmax - extent.xmin + 1}
      height={extent.ymax - extent.ymin + 1}
      onDraw={(el, c, squareSize) => {
        c.fillStyle = "#fff";
        c.fillRect(0, 0, el.width, el.height);
        c.fillStyle = "#f00";
        c.fillRect(offset.x * squareSize, offset.y * squareSize, squareSize, squareSize);

        c.lineWidth = 1;
        c.strokeStyle = "rgba(0,0,0,0.4)";
        c.strokeRect(0, 0, el.width, el.height);
      }}
    />
  );
};
