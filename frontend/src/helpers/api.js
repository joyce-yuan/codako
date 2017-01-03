import * as types from '../constants/action-types';
import objectAssign from 'object-assign';

export function makeRequest(path, {method = 'GET', headers = {}, json, body} = {}) {
  const {dispatch} = window.store;

  dispatch({
    type: types.NETWORK_ACTIVITY,
    error: null,
    delta: 1,
  });

  const user = window.store.getState().user || {};

  return fetch(`http://api.lvh.me:4310${path}`, {
    method,
    body: json ? JSON.stringify(json) : body,
    headers: objectAssign({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(user.username + ':' + user.password)}`,
    }, headers),
  })
  .then((response) => response.json())
  .then((responseJSON) => {
    dispatch({
      type: types.NETWORK_ACTIVITY,
      error: responseJSON.error ? responseJSON : null,
      delta: -1,
    });
    if (responseJSON.error) {
      throw new Error(responseJSON.message);
    }
    return responseJSON;
  });
}
