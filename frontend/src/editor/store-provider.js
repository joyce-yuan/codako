/* eslint-disable import/default */

import React, {PropTypes} from 'react';
import {Provider} from 'react-redux';
import u from 'updeep';

import configureStore from './store/configureStore';
import initialState from './reducers/initial-state';
import {getStageScreenshot} from './utils/stage-helpers';
import {getCurrentStage} from './utils/selectors';


export default class StoreProvider extends React.Component {
  static propTypes = {
    world: PropTypes.object,
    children: PropTypes.node,
    onSave: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);

    this._saveTimeout = null;
    this.state = this.getStateForStore(props.world);
  }

  componentDidMount() {
    this._mounted = true;
    window.addEventListener("beforeunload", this._onBeforeUnload);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.world.id !== this.props.world.id) {
      this.setState(this.getStateForStore(nextProps.world));
    }
  }

  componentWillUnmount() {
    this._mounted = false;
    this._onBeforeUnload({});
  }

  getStateForStore = (world) => {
    const savedState = u({
      world: {
        metadata: {
          name: world.name,
          id: world.id,
        },
      },
    }, world.data);

    const editorStore = window.editorStore = configureStore(u(savedState, initialState));
    editorStore.subscribe(this._onSaveDebounced);
    return {editorStore, loaded: true};
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
    if (this._saving && !this._saveTimeout) {
      this._onSaveDebounced();
      return;
    }

    this._saving = true;

    const savedState = u({
      undoStack: u.constant([]),
      redoStack: u.constant([]),
      stages: u.map({history: u.constant([])}),
    }, this.state.editorStore.getState());

    this.props.onSave({
      thumbnail: getStageScreenshot(getCurrentStage(savedState), {size: 400}),
      name: savedState.world.metadata.name,
      data: savedState,
    }).then(() => {
      if (!this._mounted) { return; }
      this._saving = false;
    }).catch((e) => {
      if (!this._mounted) { return; }
      this._saving = false;
      alert(`Codako was unable to save changes to your world. Your internet connection may be offline. \n(Detail: ${e.message})`);
    });
  }

  render() {
    const {editorStore} = this.state;

    return (
      <Provider store={editorStore}>
        {this.props.children}
      </Provider>
    );
  }
}
