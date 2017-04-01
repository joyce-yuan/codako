/* eslint no-unused-vars: 0 */
import {DiffPatcher} from 'jsondiffpatch/src/diffpatcher';


const PERFORM_UNDO = 'PERFORM_UNDO';
const PERFORM_REDO = 'PERFORM_REDO';
const PUSH_STACK = 'PUSH_STACK';

const patcher = new DiffPatcher({
  textDiff: {
    minLength: Number.MAX_SAFE_INTEGER,
  },
});

export function undo() {
  return {
    type: PERFORM_UNDO,
  };
}

export function redo() {
  return {
    type: PERFORM_REDO,
  };
}

function shift(state, sourceStackName, targetStackName) {
  let nextState = JSON.parse(JSON.stringify(state));
  const diff = nextState[sourceStackName].pop();
  if (diff) {
    nextState = patcher.patch(nextState, diff);
    nextState[targetStackName].push(patcher.reverse(diff));
  }
  return nextState;
}

function diffByApplyingOptions(fullDiff = {}, {trackedKeys} = {}) {
  let diff = fullDiff || {};
  if (trackedKeys) {
    diff = {};
    Object.keys(fullDiff).filter(key =>
      trackedKeys.includes(key)
    ).forEach(key => {
      diff[key] = fullDiff[key];
    });
  }
  return (Object.keys(diff).length > 0) ? diff : null;
}

export const undoRedoReducerFactory = ({trackedKeys, ignoredActions} = {}) => {
  return (state, action) => {
    if (action.type === PERFORM_UNDO) {
      return shift(state, 'undoStack', 'redoStack');
    }
    if (action.type === PERFORM_REDO) {
      return shift(state, 'redoStack', 'undoStack');
    }
    if (action.type === PUSH_STACK) {
      if (ignoredActions.includes(action.triggeringActionType)) {
        return state;
      }
      const diff = diffByApplyingOptions(action.diff, {trackedKeys});
      if (diff) {
        return Object.assign({}, state, {
          undoStack: [].concat(state.undoStack.slice(state.undoStack.length - 50), [diff]),
          redoStack: [],
        });
      }
    }

    return state;
  };
};

export const undoRedoMiddleware = store => next => action => {
  if ([PERFORM_UNDO, PERFORM_REDO, PUSH_STACK].includes(action.type)) {
    return next(action);
  }

  const before = store.getState();
  const result = next(action);
  const after = store.getState();

  const t = Date.now();
  const diff = patcher.diff(after, before);
  if (Date.now() - t > 50) {
    console.warn("Spent more than 50ms creating the undo/redo diff.");
  }
  if (diff && Object.keys(diff).length > 0) {
    store.dispatch({
      type: 'PUSH_STACK',
      triggeringActionType: action.type,
      diff: diff,
    });
  }
  return result;
};