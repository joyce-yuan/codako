/* eslint no-param-reassign: 0 */
import objectAssign from 'object-assign';
import * as Types from '../constants/action-types';
import stageReducer from './stage-reducer';
import initialState from './initial-state';
import u from 'updeep';

import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from '../constants/constants';

export default function recordingReducer(state = initialState.recording, action) {
  state = objectAssign({}, state, {
    beforeStage: stageReducer(state.beforeStage, action),
    afterStage: stageReducer(state.afterStage, action),
  });
  
  switch (action.type) {
    case Types.START_RECORDING: {
      const {stage} = window.store.getState();
      const {characterId, actor, rule} = action;

      let beforeStage = null;
      let descriptors = null;
      let extent = null;
      if (rule) {
        // populate with existing rule 
      } else {
        beforeStage = objectAssign(JSON.parse(JSON.stringify(stage)), {
          uid: 'before',
        });
        extent = {
          xmin: actor.position.x,
          xmax: actor.position.x,
          ymin: actor.position.y,
          ymax: actor.position.y,
        };
        descriptors = [];
      }

      return u({
        phase: RECORDING_PHASE_SETUP,
        actorId: actor.id,
        characterId,
        beforeStage,
        extent,
        afterStage: {uid: 'after'},
        descriptors,
      }, state);
    }
    case Types.CANCEL_RECORDING: {
      return objectAssign({}, initialState.recording);
    }
    case Types.SET_RECORDING_PHASE: {
      const changes = {
        phase: action.phase,
      };
      if (action.phase === RECORDING_PHASE_RECORD) {
        changes.afterStage = objectAssign(JSON.parse(JSON.stringify(state.beforeStage)), {
          uid: 'after',
        });
      }
      return u(changes, state);
    }
    case Types.SET_RECORDING_EXTENT:
      return u({ extent: action.extent }, state);
    default:
      return state;
  }
}
