/* eslint-disable import/default */

import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';
import u from 'updeep';

import configureStore from './store/configureStore';
import initialState from './reducers/initial-state';
import {getStageScreenshot} from './utils/stage-helpers';
import {getCurrentStage} from './utils/selectors';
import {makeRequest} from '../helpers/api';

export default class WorldStoreProvider extends React.Component {
  static propTypes = {
    worldId: PropTypes.string,
    children: PropTypes.node,
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
    this.loadWorld(this.props.worldId);
    window.addEventListener("beforeunload", this._onBeforeUnload);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.worldId !== this.props.worldId) {
      this.loadWorld(nextProps.worldId);
    }
  }

  loadWorld = () => {
    return makeRequest(`/worlds/${this.props.worldId}`).then((world) => {
      const state = u(world.data, initialState);
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

    const savedState = u({
      undoStack: u.constant([]),
      redoStack: u.constant([]),
      stages: u.map({history: u.constant([])}),
    }, this.state.editorStore.getState());

    makeRequest(`/worlds/${this.props.worldId}`, {
      method: 'PUT',
      json: {
        thumbnail: getStageScreenshot(getCurrentStage(savedState)),
        data: savedState,
      },
    }).then(() => {
      this.setState({saving: false});
    }).catch((e) => {
      this.setState({saving: false});
      alert(`Codako was unable to save changes to your world. Your internet connection may be offline. \n(Detail: ${e.message})`);
    });
  }

  render() {
    const {loaded, editorStore} = this.state;

    if (!loaded) {
      return (
        <div className="editor">
          <div className="loading">Loading...</div>
        </div>
      );
    }

    return (
      <Provider store={editorStore}>
        {this.props.children}
      </Provider>
    );
  }
}
