import {createStore, compose, applyMiddleware} from 'redux';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

// thunk middleware can also accept an extra argument to be passed to each thunk action
// https://github.com/gaearon/redux-thunk#injecting-a-custom-argument


function configureStoreProd(initialState) {
  return createStore(rootReducer, initialState, compose(
    applyMiddleware(
      thunk,
    )
  ));
}

function configureStoreDev(initialState) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // add support for Redux dev tools
  const store = createStore(rootReducer, initialState, composeEnhancers(
    applyMiddleware(
      reduxImmutableStateInvariant(),
      thunk,
    )
  ));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

export default process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev;