import * as types from '../constants/action-types';
import objectAssign from 'object-assign';
import xhr from 'xhr';

const API_ROOT = (window.location.host.includes('codako') ? `//api.codako.org` : `http://api.lvh.me:4310`);

export function makeRequest(path, {method = 'GET', headers = {}, json, body} = {}) {
  const {dispatch} = window.store;

  dispatch({
    type: types.NETWORK_ACTIVITY,
    error: null,
    delta: 1,
  });

  const user = window.store.getState().user || {};

  return new Promise((resolve, reject) => {
    xhr(`${API_ROOT}${path}`, {
      method,
      body: json ? JSON.stringify(json) : body,
      headers: objectAssign({
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(user.username + ':' + user.password)}`,
      }, headers),
    }, (err, response, responseBody) => {
      if (err) {
        reject(err);
        return;
      }

      let responseJSON = null;
      try {
        responseJSON = JSON.parse(responseBody);
      } catch (jsonErr) {
        reject(jsonErr);
        return;
      }

      if (response.statusCode !== 200 || responseJSON.error) {
        reject(new Error(responseJSON.message));
      } else {
        dispatch({type: types.NETWORK_ACTIVITY, error: null, delta: -1});
        resolve(responseJSON);
      }
    });
  }).catch((error) => {
    dispatch({type: types.NETWORK_ACTIVITY, error, delta: -1});
    throw error;
  });
}
