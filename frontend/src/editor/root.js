/* eslint-disable import/default */

import React from 'react';
import configureStore from './store/configureStore';
const store = configureStore();
window.editorStore = store;

import {Provider} from 'react-redux';
import Toolbar from './components/toolbar';
import Library from './components/library';
import StageContainer from './components/stage/container';
import InspectorContainer from './components/inspector/container';
import PaintContainer from './components/paint/container';
import KeypickerContainer from './components/keypicker/container';
import SettingsContainer from './components/settings/container';

import './styles/editor.scss';

export default class EditorRoot extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <Provider store={store}>
        <div className="editor">
          <Toolbar />
          <div className="stage-container">
            <StageContainer />
            <Library />
          </div>
          <InspectorContainer />

          <PaintContainer />
          <KeypickerContainer />
          <SettingsContainer />
        </div>
      </Provider>
    );
  }
}

