import classNames from "classnames";
import React from "react";
import { PixelTool } from "./tools";

interface PixelToolbarProps {
  tools: PixelTool[];
  tool: PixelTool;
  onToolChange: (tool: PixelTool) => void;
}

const PixelToolbar: React.FC<PixelToolbarProps> = ({ tools, tool, onToolChange }) => {
  return (
    <div className="tools" data-tutorial-id="paint-tools">
      {tools.map((t) => (
        <button
          key={t.name}
          className={classNames({ tool: true, selected: tool === t })}
          onClick={() => onToolChange(t)}
        >
          <img src={new URL(`../../img/tool_${t.name}.png`, import.meta.url).href} />
        </button>
      ))}
    </div>
  );
};

export default PixelToolbar;
