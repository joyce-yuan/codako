import { useEffect } from "react";
import { useSelector } from "react-redux";

import { EditorState, Stage } from "../../../types";
import { getStagesList } from "../../utils/selectors";
import { prepareCrossoriginImages } from "../../utils/stage-helpers";

export const StageImagesLoader = () => {
  const stages = useSelector<EditorState, Stage[]>((state) => getStagesList(state));
  useEffect(() => {
    prepareCrossoriginImages(stages);
  }, [stages]);

  return <span />;
};
