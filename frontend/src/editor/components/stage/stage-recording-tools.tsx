import { useDispatch, useSelector } from "react-redux";

import classNames from "classnames";
import Button from "reactstrap/lib/Button";
import { EditorState } from "../../../types";
import { selectToolId } from "../../actions/ui-actions";
import { TOOLS } from "../../constants/constants";

const StageRecordingTools = () => {
  const selectedToolId = useSelector<EditorState, EditorState["ui"]["selectedToolId"]>(
    (sel) => sel.ui.selectedToolId,
  );
  const dispatch = useDispatch();
  const selected = selectedToolId === TOOLS.IGNORE_SQUARE;

  return (
    <Button
      className={classNames({ "tool-ignored-square": true, selected, enabled: true })}
      onClick={() => dispatch(selectToolId(selected ? TOOLS.POINTER : TOOLS.IGNORE_SQUARE))}
    >
      <img src={new URL("../../img/ignored_square.png", import.meta.url).href} />
    </Button>
  );
};

export default StageRecordingTools;
