/* eslint-disable import/default */

import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';
import objectAssign from 'object-assign';

import configureStore from './store/configureStore';
import initialState from './reducers/initial-state';
import {getStageScreenshot} from './utils/stage-helpers';
import {makeRequest} from '../helpers/api';

import Toolbar from './components/toolbar';
import Library from './components/library';

import UndoRedoControls from './components/undo-redo-controls';
import StageContainer from './components/stage/container';
import InspectorContainer from './components/inspector/container';
import PaintContainer from './components/paint/container';
import KeypickerContainer from './components/keypicker/container';
import SettingsContainer from './components/settings/container';

import './styles/editor.scss';

export default class EditorRoot extends React.Component {
  static propTypes = {
    stageId: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);

    this._saveTimeout = null;
    this.state = {
      editorStore: null,
      saving: false,
      loaded: false,
    };
  }

  componentDidMount() {
    this.loadStage(this.props.stageId);
    window.addEventListener("beforeunload", this._onBeforeUnload);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.stageId !== this.props.stageId) {
      this.loadStage(nextProps.stageId);
    }
  }

  loadStage = () => {
    return makeRequest(`/stages/${this.props.stageId}/state`).then((savedState) => {
      const state = objectAssign({}, initialState, savedState);
      const editorStore = window.editorStore = configureStore(state);
      editorStore.subscribe(this._onSaveDebounced);
      this.setState({editorStore, loaded: true});
    });
  }

  _onBeforeUnload = (event) => {
    if (this._saveTimeout) {
      this._onSaveTimeoutFire();

      const msg = 'Your changes are still saving. Are you sure you want to close the editor?';
      event.returnValue = msg; // Gecko, Trident, Chrome 34+
      return msg; // Gecko, WebKit, Chrome <34
    }
    return undefined;
  }

  _onSaveDebounced = () => {
    clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(this._onSaveTimeoutFire, 2000);
  }

  _onSaveTimeoutFire = () => {
    clearTimeout(this._saveTimeout);
    this._saveTimeout = null;
    this._onSave();
  }

  _onSave = () => {
    if (this.state.saving && !this._saveTimeout) {
      this._onSaveDebounced();
      return;
    }

    this.setState({saving: true});

    const editorState = this.state.editorStore.getState();
    const savedState = objectAssign({}, editorState);
    delete savedState.undoStack;
    delete savedState.redoStack;
    
    makeRequest(`/stages/${this.props.stageId}`, {
      method: 'PUT',
      json: {
        thumbnail: getStageScreenshot(editorState.stage),
        state: savedState,
      },
    }).then(() => {
      this.setState({saving: false});
    }).catch((e) => {
      this.setState({saving: false});
      alert(`Codako was unable to save changes to your stage. Your internet connection may be offline. \n(Detail: ${e.message})`);
    });
  }

  render() {
    const {loaded, editorStore} = this.state;

    if (!loaded) {
      return (
        <div className="editor">
          <h1 style={{margin: 'auto'}}>Loading...</h1>
        </div>
      );
    }

    return (
      <Provider store={editorStore}>
        <div className="editor">
          <div style={{width: 1190}}>
            <div className="editor-horizontal-flex">
              <h3 style={{flex: 1}}>Stage Name</h3>
              <UndoRedoControls />
            </div>
          </div>
          <div className="editor-horizontal-flex">
            <Toolbar />
            <div className="stage-container">
              <StageContainer />
              <Library />
            </div>
            <InspectorContainer />
          </div>

          <PaintContainer />
          <KeypickerContainer />
          <SettingsContainer />
        </div>
      </Provider>
    );
  }
}

