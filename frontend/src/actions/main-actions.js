import {replace, push} from 'react-router-redux';
import objectAssign from 'object-assign';

import {makeRequest} from '../helpers/api';
import * as types from '../constants/action-types';

const DEFAULT_POST_AUTH_PATH = '/dashboard';

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
    makeRequest('/users', {
      method: 'POST',
      json: {username, password, email},
    }).then((user) => {
      dispatch({
        type: types.USER_CHANGED,
        user: objectAssign(user, {password}),
      });
      dispatch(replace(redirectTo || DEFAULT_POST_AUTH_PATH));
    });
  };
}

export function login({username, password}, redirectTo) {
  return function(dispatch) {
    makeRequest('/users/me', {
      headers: {
        'Authorization': `Basic ${btoa(username + ':' + password)}`,
      },
    }).then((user) => {
      dispatch({
        type: types.USER_CHANGED,
        user: objectAssign(user, {password}),
      });
      dispatch(replace(redirectTo || DEFAULT_POST_AUTH_PATH));
    });
  };
}

export function fetchWorlds() {
  return function(dispatch) {
    makeRequest('/worlds').then((worlds) => {
      dispatch({type: types.WORLDS_CHANGED, worlds});
    });
  };
}

export function deleteWorld(id) {
  return function(dispatch) {
    if (window.confirm("Are you sure you want to delete this world? This action cannot be undone.")) {
      makeRequest(`/worlds/${id}`, {method: 'DELETE'}).then(() => {
        dispatch(fetchWorlds());
      });
    }
  };
}

export function duplicateWorld(id) {
  return function(dispatch) {
    makeRequest(`/worlds/${id}/duplicate`, {method: 'POST'}).then(() => {
      dispatch(fetchWorlds());
    });
  };
}

export function createWorld() {
  return function(dispatch) {
    makeRequest(`/worlds`, {method: 'POST'}).then((created) => {
      dispatch(push(`/editor/${created.id}`));
    });
  };
}