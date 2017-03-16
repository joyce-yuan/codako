/* eslint-disable import/default */

import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';

import configureStore from './store/configureStore';
import StageContainer from './components/stage/container';

import './styles/editor.scss';

export default class EditorRoot extends React.Component {
  static propTypes = {
    world: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const {world, characters} = props.world.data;
    this._editorStore = window.editorStore = configureStore({world, characters});
  }

  render() {
    return (
      <Provider store={this._editorStore}>
        <div className="stage-container" style={{height: 585}}>
          <StageContainer />
        </div>
      </Provider>
    );
  }
}



