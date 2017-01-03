/* eslint no-unused-vars: 0 */
import jsondiffpatch from 'jsondiffpatch';
import objectAssign from 'object-assign';

const PERFORM_UNDO = 'PERFORM_UNDO';
const PERFORM_REDO = 'PERFORM_REDO';
const PUSH_STACK = 'PUSH_STACK';

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

export const undoRedoReducerFactory = ({trackedKeys, ignoredActions} = {}) => {
  return (state, action) => {
    if (action.type === PERFORM_UNDO) {
      let nextState = JSON.parse(JSON.stringify(state));
      const diff = nextState.undoStack.pop();
      if (diff) {
        nextState = jsondiffpatch.patch(nextState, diff);
        nextState.redoStack.push(jsondiffpatch.reverse(diff));
      }
      return nextState;
    }
    if (action.type === PERFORM_REDO) {
      let nextState = JSON.parse(JSON.stringify(state));
      const diff = nextState.redoStack.pop();
      if (diff) {
        nextState = jsondiffpatch.patch(nextState, diff);
        nextState.undoStack.push(jsondiffpatch.reverse(diff));
      }
      return nextState;
    }
    if (action.type === PUSH_STACK) {
      let diff = action.diff || {};
      if (ignoredActions.includes(action.triggeringActionType)) {
        return state;
      }
      if (trackedKeys) {
        diff = {};
        Object.keys(action.diff).filter(key =>
          trackedKeys.includes(key)
        ).forEach(key => {
          diff[key] = action.diff[key];
        });
      }
      if (Object.keys(diff).length > 0) {
        return objectAssign({}, state, {
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
  const diff = jsondiffpatch.diff(after, before);
  if (diff && Object.keys(diff).length > 0) {
    store.dispatch({
      type: 'PUSH_STACK',
      triggeringActionType: action.type,
      diff: diff,
    });
  }
  return result;
};