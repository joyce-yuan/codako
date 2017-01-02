/* eslint no-param-reassign: 0 */
import objectAssign from 'object-assign';
import * as Types from '../constants/action-types';
import stageReducer from './stage-reducer';
import initialState from './initial-state';
import u from 'updeep';

import StageOperator from '../utils/stage-operator';
import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from '../constants/constants';

export default function recordingReducer(state = initialState.recording, action) {

  state = objectAssign({}, state, {
    beforeStage: stageReducer(state.beforeStage, action),
    afterStage: stageReducer(state.afterStage, action),
  });
  
  switch (action.type) {
    case Types.SETUP_RECORDING_FOR_ACTOR: {
      const {stage} = window.editorStore.getState();
      const {characterId, actor} = action;
      return u({
        phase: RECORDING_PHASE_SETUP,
        actorId: actor.id,
        characterId,
        conditions: u.constant({
          [actor.id]: {},
        }),
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

    case Types.SETUP_RECORDING_FOR_CHARACTER: {
      const {characters, stage} = window.editorStore.getState();
      const character = characters[action.characterId];
      const cx = Math.floor(stage.width / 2);
      const cy = Math.floor(stage.height / 2);
      return u({
        ruleId: null,
        actorId: 'dude',
        phase: RECORDING_PHASE_SETUP,
        characterId: action.characterId,
        conditions: u.constant({}),
        afterStage: u.constant({uid: 'after'}),
        beforeStage: u.constant(objectAssign({}, stage, {
          actors: {
            dude: {
              id: 'dude',
              variableValues: {},
              appearance: Object.keys(character.spritesheet.appearances)[0],
              characterId: action.characterId,
              position: {x: cx, y: cy},
            },
          },
          uid: 'before',
        })),
        extent: {
          xmin: cx,
          xmax: cx,
          ymin: cy,
          ymax: cy,
        },
      }, state);
    }

    case Types.EDIT_RULE_RECORDING: {
      const {stage} = window.editorStore.getState();
      const {characterId, rule} = action;
      const offset = {
        x: Math.round((stage.width / 2 - (rule.extent.xmax - rule.extent.xmin) / 2)),
        y: Math.round((stage.height / 2 - (rule.extent.ymax - rule.extent.ymin) / 2)),
      };

      const beforeStage = JSON.parse(JSON.stringify(stage));
      const afterStage = JSON.parse(JSON.stringify(stage));

      StageOperator(beforeStage).resetForRule(rule, {offset, applyActions: false, uid: 'before'});
      StageOperator(afterStage).resetForRule(rule, {offset, applyActions: true, uid: 'after'});

      return u({
        ruleId: rule.id,
        characterId,
        phase: RECORDING_PHASE_RECORD,
        actorId: rule.mainActorId,
        conditions: rule.conditions,
        beforeStage: u.constant(beforeStage),
        afterStage: u.constant(afterStage),
        extent: {
          xmin: rule.extent.xmin + offset.x,
          xmax: rule.extent.xmax + offset.x,
          ymin: rule.extent.ymin + offset.y,
          ymax: rule.extent.ymax + offset.y,
        },
      }, state);
    }
    case Types.FINISH_RECORDING: {
      return objectAssign({}, initialState.recording);
    }
    case Types.CANCEL_RECORDING: {
      return objectAssign({}, initialState.recording);
    }
    case Types.START_RECORDING: {
      return u({
        phase: RECORDING_PHASE_RECORD,
        afterStage: objectAssign(JSON.parse(JSON.stringify(state.beforeStage)), {
          uid: 'after',
        }),
      }, state);
    }
    case Types.UPDATE_RECORDING_CONDITION: {
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
        const mainActor = Object.values(stage.actors || {}).find(a => a.id === state.actorId);
        if (mainActor) {
          extent.xmin = Math.min(extent.xmin, mainActor.position.x);
          extent.ymin = Math.min(extent.ymin, mainActor.position.y);
          extent.xmax = Math.max(extent.xmax, mainActor.position.x);
          extent.ymax = Math.max(extent.ymax, mainActor.position.y);
        }
      }
      return u({ extent }, state);
    }
    default:
      return state;
  }
}
