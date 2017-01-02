import * as types from '../constants/action-types';
import {replace, push} from 'react-router-redux';
import objectAssign from 'object-assign';

function request(path, {method = 'GET', headers = {}, body, dispatch}) {
  dispatch({
    type: types.NETWORK_ACTIVITY,
    error: null,
    delta: 1,
  });

  return fetch(`http://api.lvh.me:4310${path}`, {
    method,
    body,
    headers: objectAssign({
      'Content-Type': 'application/json',
    }, headers),
  })
  .then((response) => response.json())
  .then((json) => {
    dispatch({
      type: types.NETWORK_ACTIVITY,
      error: json.error ? json : null,
      delta: -1,
    });
    if (json.error) {
      throw new Error(json.message);
    }
    return json;
  });
}

export function logout() {
  return function(dispatch) {
    dispatch({
      type: types.USER_CHANGED,
      user: null,
    });
    dispatch(push('/'));
  };
}

export function register({username, password, email}, redirectTo) {
  return function(dispatch) {
    request('/users', {
      method: 'POST',
      dispatch,
      body: JSON.stringify({username, password, email}),
    }).then((user) => {
      dispatch({
        type: types.USER_CHANGED,
        user,
      });
      dispatch(replace(redirectTo || '/'));
    }).catch((err) => {
      console.error(err);
    });
  };
}
export function login({username, password}, redirectTo) {
  return function(dispatch) {
    request('/users/me', {
      dispatch,
      headers: {
        'Authorization': `Basic ${btoa(username + ':' + password)}`,
      },
    }).then((user) => {
      dispatch({
        type: types.USER_CHANGED,
        user,
      });
      dispatch(replace(redirectTo || '/'));
    }).catch((err) => {
      console.error(err);
    });
  };
}