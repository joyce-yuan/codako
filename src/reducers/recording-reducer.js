/* eslint no-param-reassign: 0 */
import objectAssign from 'object-assign';
import * as Types from '../constants/action-types';
import stageReducer from './stage-reducer';
import initialState from './initial-state';
import u from 'updeep';

import {buildActorsFromRule, getScenarioExtent} from '../components/game-state-helpers';
import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from '../constants/constants';

export default function recordingReducer(state = initialState.recording, action) {

  state = objectAssign({}, state, {
    beforeStage: stageReducer(state.beforeStage, action),
    afterStage: stageReducer(state.afterStage, action),
  });
  
  switch (action.type) {
    case Types.START_RECORDING: {
      const {stage} = window.store.getState();
      const {characterId, actor} = action;
      return u({
        phase: RECORDING_PHASE_SETUP,
        actorId: actor.id,
        characterId,
        conditions: u.constant({}),
        afterStage: u.constant({uid: 'after'}),
        beforeStage: u.constant(objectAssign(JSON.parse(JSON.stringify(stage)), {
          uid: 'before',
        })),
        extent: {
          xmin: actor.position.x,
          xmax: actor.position.x,
          ymin: actor.position.y,
          ymax: actor.position.y,
        },
      }, state);
    }
    case Types.EDIT_RULE_RECORDING: {
      const {characters, stage} = window.store.getState();
      const {characterId, rule} = action;
      const extent = getScenarioExtent(rule.scenario);
      const offsetX = Math.round((stage.width / 2 - (extent.xmax - extent.xmin) / 2));
      const offsetY = Math.round((stage.height / 2 - (extent.ymax - extent.ymin) / 2));
      extent.xmin += offsetX;
      extent.xmax += offsetX;
      extent.ymin += offsetY;
      extent.ymax += offsetY;

      return u({
        phase: RECORDING_PHASE_RECORD,
        actorId: rule.actorDescriptorId,
        characterId,
        conditions: u.constant({}),
        beforeStage: u.constant(objectAssign(JSON.parse(JSON.stringify(stage)), {
          actors: buildActorsFromRule(rule, characters, {applyActions: false, offsetX, offsetY}),
          uid: 'before',
        })),
        afterStage: u.constant(objectAssign(JSON.parse(JSON.stringify(stage)), {
          actors: buildActorsFromRule(rule, characters, {applyActions: true, offsetX, offsetY}),
          uid: 'after',
        })),
        extent: extent,
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
    case Types.UPDATE_RECORDING_EXTENT: {
      const {actorId, key, values} = action;
      return u({
        conditions: {
          [actorId]: {
            [key]: values,
          },
        },
      }, state);
    }
    case Types.SET_RECORDING_EXTENT: {
      // find the primary actor, make sure the extent still includes it
      const extent = objectAssign({}, action.extent);
      for (const stage of [state.beforeStage, state.afterStage]) {
        const actor = Object.values(stage.actors || {}).find(a => a.id === state.actorId);
        if (actor) {
          extent.xmin = Math.min(extent.xmin, actor.position.x);
          extent.ymin = Math.min(extent.ymin, actor.position.y);
          extent.xmax = Math.max(extent.xmax, actor.position.x);
          extent.ymax = Math.max(extent.ymax, actor.position.y);
        }
      }
      return u({ extent }, state);
    }
    default:
      return state;
  }
}
