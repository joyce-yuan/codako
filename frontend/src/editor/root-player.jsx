/* eslint-disable import/default */

import PropTypes from "prop-types";
import React from "react";
import { Provider } from "react-redux";
import u from "updeep";

import { restoreInitialGameState } from "./actions/stage-actions";
import StageContainer from "./components/stage/container";
import initialState from "./reducers/initial-state";
import configureStore from "./store/configureStore";

import "./styles/editor.scss";

export default class RootPlayer extends React.Component {
  static propTypes = {
    world: PropTypes.object,
    characters: PropTypes.object,
    playback: PropTypes.object,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    const { world, characters } = props.world.data;
    const state = u({ world, characters }, initialState);
    this._editorStore = window.editorStore = configureStore(state);

    // immediately dispatch actions to reset every stage to the initial play state
    Object.keys(state.world.stages).forEach((stageId) => {
      this._editorStore.dispatch(restoreInitialGameState(state.world.id, stageId));
    });
  }

  render() {
    return (
      <Provider store={this._editorStore}>
        <div className="stage-container">
          <StageContainer readonly />
        </div>
      </Provider>
    );
  }
}
