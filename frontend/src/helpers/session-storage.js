/* eslint no-unused-vars: 0 */
import Cookies from 'js-cookie';

const KEY = 'session';
let value = Cookies.get(KEY);

export const sessionStorageMiddleware = store => next => action => {
  const result = next(action);

  const {user} = store.getState();
  const nextValue = JSON.stringify({user});
  if (value !== nextValue) {
    Cookies.set(KEY, nextValue);
    value = nextValue;
  }

  return result;
};

export const getInitialState = () => {
  if (!value) {
    return null;
  }
  return JSON.parse(value);
};