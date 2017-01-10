import * as types from '../constants/action-types';
import objectAssign from 'object-assign';
import xhr from 'xhr';

export function makeRequest(path, {method = 'GET', headers = {}, json, body} = {}) {
  const {dispatch} = window.store;

  dispatch({
    type: types.NETWORK_ACTIVITY,
    error: null,
    delta: 1,
  });

  const user = window.store.getState().user || {};

  return new Promise((resolve, reject) => {
    xhr(`http://api.lvh.me:4310${path}`, {
      method,
      body: json ? JSON.stringify(json) : body,
      headers: objectAssign({
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(user.username + ':' + user.password)}`,
      }, headers),
    }, (err, response, responseBody) => {
      const responseJSON = JSON.parse(responseBody);

      dispatch({
        type: types.NETWORK_ACTIVITY,
        error: responseJSON.error ? responseJSON : null,
        delta: -1,
      });
      if (response.statusCode !== 200 || responseJSON.error) {
        reject(new Error(responseJSON.message));
      } else {
        resolve(responseJSON);
      }
    });
  });
}
