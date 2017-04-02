/* eslint-disable import/default */

import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

// Add support for touch-based click events
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Apply various polyfills
import 'core-js/es6/array';
import 'core-js/fn/array/includes';
import 'core-js/es6/object';
import 'core-js/fn/object/values';
import 'core-js/es6/promise';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';
import 'core-js/fn/string/ends-with';

import routes from './routes';
import configureStore from './store/configureStore';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/styles.scss';
import './styles/font-awesome.min.css';

const store = configureStore();
window.store = store;

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>, document.getElementById('app')
);
