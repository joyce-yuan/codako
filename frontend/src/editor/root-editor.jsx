/* eslint-disable import/default */

import Library from "./components/library";
import Toolbar from "./components/toolbar";

import InspectorContainer from "./components/inspector/container";
import StageContainer from "./components/stage/container";
import TutorialContainer from "./components/tutorial/container";

import ExploreCharactersContainer from "./components/modal-explore-characters/container";
import KeypickerContainer from "./components/modal-keypicker/container";
import PaintContainer from "./components/modal-paint/container";
import StagesContainer from "./components/modal-stages/container";
import VideosContainer from "./components/modal-videos/container";
import { StageImagesLoader } from "./components/stage/stage-images-loader";

import "./styles/editor.scss";

const RootEditor = () => {
  return (
    <div className="editor">
      <div className="editor-centered-flex">
        <div className="editor-horizontal-flex">
          <Toolbar />
        </div>
        <div className="editor-horizontal-flex" style={{ flex: "1 1 85vh" }}>
          <div className="stage-container">
            <StageContainer />
            <Library />
          </div>
          <InspectorContainer />
        </div>

        <TutorialContainer />
        <PaintContainer />
        <KeypickerContainer />
        <StagesContainer />
        <StageImagesLoader />
        <VideosContainer />
        <ExploreCharactersContainer />
      </div>
    </div>
  );
};

export default RootEditor;
