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

export function fetchStages() {
  return function(dispatch) {
    makeRequest('/stages').then((stages) => {
      dispatch({type: types.STAGES_CHANGED, stages});
    });
  };
}

export function deleteStage(id) {
  return function(dispatch) {
    makeRequest(`/stages/${id}`, {method: 'DELETE'}).then(() => {
      dispatch(fetchStages());
    });
  };
}

export function duplicateStage(id) {
  return function(dispatch) {
    makeRequest(`/stages/${id}/duplicate`, {method: 'POST'}).then(() => {
      dispatch(fetchStages());
    });
  };
}

export function createStage() {
  return function(dispatch) {
    makeRequest(`/stages`, {method: 'POST'}).then((created) => {
      dispatch(push(`/editor/${created.id}`));
    });
  };
}