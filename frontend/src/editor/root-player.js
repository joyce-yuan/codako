/* eslint-disable import/default */

import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';
import u from 'updeep';

import configureStore from './store/configureStore';
import StageContainer from './components/stage/container';
import initialState from './reducers/initial-state';

import './styles/editor.scss';

export default class RootPlayer extends React.Component {
  static propTypes = {
    world: PropTypes.object,
    characters: PropTypes.object,
    playback: PropTypes.object,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    const {world, characters} = props.world.data;
    const state = u({world, characters}, initialState);
    this._editorStore = window.editorStore = configureStore(state);
  }

  render() {
    return (
      <Provider store={this._editorStore}>
        <div className="stage-container" style={{height: 585}}>
          <StageContainer readonly />
        </div>
      </Provider>
    );
  }
}