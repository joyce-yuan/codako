import * as types from '../constants/action-types';
import {replace, push} from 'react-router-redux';

export function logout() {
  return function(dispatch) {
    dispatch({
      type: types.USER_CHANGED,
      user: null,
    });
    dispatch(push('/'));
  };
}

export function login(username, password, redirectTo) {
  return function(dispatch) {
    dispatch({
      type: types.NETWORK_ACTIVITY,
      error: null,
      delta: 1,
    });

    setTimeout(() => {
      dispatch({
        type: types.USER_CHANGED,
        user: {
          id: 1,
          username: 'bengotow',
        },
      });
      dispatch({
        type: types.NETWORK_ACTIVITY,
        error: null,
        delta: -1,
      });
      dispatch(replace(redirectTo || '/'));
    }, 500);
  };
}