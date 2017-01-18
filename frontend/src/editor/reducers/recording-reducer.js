import objectAssign from 'object-assign';
import * as Types from '../constants/action-types';
import worldReducer from './world-reducer';
import initialState from './initial-state';
import u from 'updeep';

import StageOperator from '../utils/stage-operator';
import {RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD, WORLDS} from '../constants/constants';
import {getCurrentStageForWorld} from '../utils/selectors';
import {extentByShiftingExtent} from '../utils/recording-helpers';

// helpers for creating recording worlds

function worldByCloningWorld(world, newId) {
  const clone = JSON.parse(JSON.stringify(world));
  return u.constant(u({id: newId}, clone));
}

function worldByTransformingStage(world, newId, callback) {
  const stage = getCurrentStageForWorld(world);
  const clone = JSON.parse(JSON.stringify(world));

  return u.constant(u({
    id: newId,
    stages: {
      [stage.id]: u.constant(callback(clone.stages[stage.id]))
    },
  }, clone));
}


export default function recordingReducer(state = initialState.recording, action) {
  const nextState = objectAssign({}, state, {
    beforeWorld: worldReducer(state.beforeWorld, action),
    afterWorld: worldReducer(state.afterWorld, action),
  });

  switch (action.type) {
    case Types.SETUP_RECORDING_FOR_ACTOR: {
      const {world} = window.editorStore.getState();
      const {characterId, actor} = action;
      return u({
        phase: RECORDING_PHASE_SETUP,
        actorId: actor.id,
        characterId,
        conditions: u.constant({
          [actor.id]: {},
        }),
        beforeWorld: worldByCloningWorld(world, WORLDS.BEFORE),
        afterWorld: worldByCloningWorld(world, WORLDS.AFTER),
        extent: {
          xmin: actor.position.x,
          xmax: actor.position.x,
          ymin: actor.position.y,
          ymax: actor.position.y,
          ignored: {},
        },
      }, nextState);
    }

    case Types.SETUP_RECORDING_FOR_CHARACTER: {
      const {characters, world} = window.editorStore.getState();
      const character = characters[action.characterId];
      const stage = getCurrentStageForWorld(world);
      const cx = Math.floor(stage.width / 2);
      const cy = Math.floor(stage.height / 2);

      const resetActorsToDude = (recordingStage) => {
        return u({
          actors: u.constant({
            dude: {
              id: 'dude',
              variableValues: {},
              appearance: Object.keys(character.spritesheet.appearances)[0],
              characterId: action.characterId,
              position: {x: cx, y: cy},
            },
          }),
        }, recordingStage);
      };

      return u({
        ruleId: null,
        actorId: 'dude',
        phase: RECORDING_PHASE_SETUP,
        characterId: action.characterId,
        conditions: u.constant({}),
        beforeWorld: worldByTransformingStage(world, WORLDS.BEFORE, resetActorsToDude),
        afterWorld: worldByTransformingStage(world, WORLDS.AFTER, resetActorsToDude),
        extent: {
          xmin: cx,
          xmax: cx,
          ymin: cy,
          ymax: cy,
        },
        prefs: {},
      }, nextState);
    }

    case Types.EDIT_RULE_RECORDING: {
      const {characterId, rule} = action;

      const {world} = window.editorStore.getState();
      const stage = getCurrentStageForWorld(world);
      const offset = {
        x: Math.round((stage.width / 2 - (rule.extent.xmax - rule.extent.xmin) / 2)),
        y: Math.round((stage.height / 2 - (rule.extent.ymax - rule.extent.ymin) / 2)),
      };

      return u({
        ruleId: rule.id,
        characterId,
        phase: RECORDING_PHASE_RECORD,
        actorId: rule.mainActorId,
        conditions: rule.conditions,
        beforeWorld: worldByTransformingStage(world, WORLDS.BEFORE, (recordingStage) => {
          return StageOperator(recordingStage).resetForRule(rule, {offset, applyActions: false});
        }),
        afterWorld: worldByTransformingStage(world, WORLDS.AFTER, (recordingStage) => {
          return StageOperator(recordingStage).resetForRule(rule, {offset, applyActions: true});
        }),
        extent: u.constant(extentByShiftingExtent(rule.extent, offset)),
        prefs: {},
      }, nextState);
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
        afterWorld: worldByCloningWorld(nextState.beforeWorld, WORLDS.BEFORE),
      }, nextState);
    }
    case Types.UPDATE_RECORDING_CONDITION: {
      const {actorId, key, values} = action;
      return u({
        conditions: {
          [actorId]: {
            [key]: values,
          },
        },
      }, nextState);
    }
    case Types.UPDATE_RECORDING_ACTION_PREFS: {
      const {actorId, values} = action;
      return u({
        prefs: {
          [actorId]: values,
        },
      }, nextState);

    }
    case Types.SET_RECORDING_EXTENT: {
      // find the primary actor, make sure the extent still includes it
      const extent = objectAssign({}, action.extent);
      for (const world of [nextState.beforeWorld, nextState.afterWorld]) {
        const stage = getCurrentStageForWorld(world);
        const mainActor = Object.values(stage.actors || {}).find(a => a.id === nextState.actorId);
        if (mainActor) {
          extent.xmin = Math.min(extent.xmin, mainActor.position.x);
          extent.ymin = Math.min(extent.ymin, mainActor.position.y);
          extent.xmax = Math.max(extent.xmax, mainActor.position.x);
          extent.ymax = Math.max(extent.ymax, mainActor.position.y);
        }
      }
      return u({extent}, nextState);
    }
    case Types.TOGGLE_RECORDING_SQUARE_IGNORED: {
      const {x, y} = action.position;
      const {xmin, xmax, ymin, ymax} = nextState.extent;

      if (x < xmin || x > xmax || y < ymin || y > ymax) {
        return nextState;
      }
      const key = `${x},${y}`;
      const ignored = nextState.extent.ignored[key] ? u.omit(key) : {[key]: true};
      return u({extent: {ignored}}, nextState);
    }
    default:
      return nextState;
  }
}
