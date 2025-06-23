import { useMemo } from "react";
import { Provider } from "react-redux";
import u from "updeep";

import { restoreInitialGameState } from "./actions/stage-actions";
import StageContainer from "./components/stage/container";
import initialState from "./reducers/initial-state";
import configureStore from "./store/configureStore";

import { EditorState, Game } from "../types";
import { applyDataMigrations } from "./data-migrations";
import "./styles/editor.scss";

export const RootPlayer = (props: { world: Game }) => {
  const editorStore = useMemo(() => {
    const migrated = applyDataMigrations(props.world);
    const { world, characters } = migrated.data;
    const state = u({ world, characters }, initialState) as EditorState;
    const editorStore = configureStore(state);
    window.editorStore = editorStore;
    // immediately dispatch actions to reset every stage to the initial play state
    Object.keys(state.world.stages).forEach((stageId) => {
      editorStore.dispatch(restoreInitialGameState(state.world.id, stageId));
    });
    return editorStore;
  }, [props.world]);

  return (
    <Provider store={editorStore}>
      <div className="stage-container">
        <StageContainer readonly />
      </div>
    </Provider>
  );
};
