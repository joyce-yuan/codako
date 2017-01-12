import u from 'updeep';
import objectAssign from 'object-assign';

import initialState from './initial-state';
import * as Types from '../constants/action-types';
import {FLOW_BEHAVIORS, CONTAINER_TYPES} from '../constants/constants';
import {findRule, pointIsInside, createdActorsForRecording} from '../utils/stage-helpers';
import {actionsForRecording, extentByShiftingExtent} from '../utils/recording-helpers';

export default function charactersReducer(state = initialState.characters, action) {
  switch (action.type) {
    case Types.UPSERT_CHARACTER: {
      return u.updateIn(action.characterId, action.values, state);
    }
    
    case Types.DELETE_CHARACTER: {
      return u.omit(action.characterId, state);
    }

    case Types.CREATE_CHARACTER_VARIABLE: {
      return u.updateIn(action.characterId, {
        variables: {
          [action.variableId]: {
            defaultValue: 0,
            name: "Untitled",
            id: action.variableId,
          },
        },
      }, state);
    }

    case Types.DELETE_CHARACTER_VARIABLE: {
      return u.updateIn(action.characterId, {
        variables: u.omit(action.variableId),
      }, state);
    }

    case Types.DELETE_CHARACTER_APPEARANCE: {
      return u.updateIn(action.characterId, {
        spritesheet: {
          appearances: u.omit(action.appearanceId),
          appearanceNames: u.omit(action.appearanceId),
        },
       }, state);
    }

    case Types.CREATE_CHARACTER_EVENT_CONTAINER: {
      const {characterId, eventType, eventCode, id} = action;

      let rules = JSON.parse(JSON.stringify(state[characterId].rules));
      const hasSameAlready = rules.some(r => r.event === eventType && r.code === eventCode);
      const hasEvents = rules.some(r => !!r.event);

      if (hasSameAlready) {
        return state;
      }

      const rule = {
        id: id,
        type: CONTAINER_TYPES.EVENT,
        rules: [],
        event: eventType,
        code: eventCode,
      };

      if (!hasEvents) {
        rules = [rule, {
          id: id + 1,
          type: CONTAINER_TYPES.EVENT,
          rules: rules,
          event: "idle",
        }];
      } else {
        rules.unshift(rule);
      }
      return u.updateIn(action.characterId, {rules}, state);
    }

    case Types.CREATE_CHARACTER_FLOW_CONTAINER: {
      const {characterId, id} = action;
      const rules = JSON.parse(JSON.stringify(state[characterId].rules));

      const idleContainer = rules.find(r => r.event === 'idle') || {rules};
      idleContainer.rules.push({
        id,
        behavior: FLOW_BEHAVIORS.FIRST,
        name: "Untitled Group",
        type: CONTAINER_TYPES.FLOW,
        rules: [],
      });
      return u.updateIn(action.characterId, {rules}, state);
    }

    case Types.FINISH_RECORDING: {
      const {recording} = window.editorStore.getState();
      const rules = JSON.parse(JSON.stringify(state[recording.characterId].rules));

      // locate the main actor in the recording to "re-center" the extent to it
      const mainActor = Object.values(recording.beforeStage.actors).find(a => a.id === recording.actorId);
      const allActors = createdActorsForRecording(recording).concat(Object.values(recording.beforeStage.actors));
      const recordingActors = {};

      for (const a of allActors) {
        if (pointIsInside(a.position, recording.extent)) {
          recordingActors[a.id] = objectAssign({}, a, {
            position: {
              x: a.position.x - mainActor.position.x,
              y: a.position.y - mainActor.position.y,
            },
          });
        }
      }

      const recordedRule = {
        type: 'rule',
        mainActorId: recording.actorId,
        conditions: recording.conditions,
        actors: recordingActors,
        actions: actionsForRecording(recording, {characters: state}),
        extent: extentByShiftingExtent(recording.extent, {x: -mainActor.position.x, y: -mainActor.position.y}),
      };

      if (recording.ruleId) {
        const [existingRule, parentRule, parentIdx] = findRule({rules}, recording.ruleId);
        parentRule.rules[parentIdx] = objectAssign({}, existingRule, recordedRule);
        return u.updateIn(recording.characterId, {rules}, state);
      }

      const idleContainer = rules.find(r => r.event === 'idle') || {rules};
      idleContainer.rules.push(objectAssign(recordedRule, {
        id: `${Date.now()}`,
        name: 'Untitled Rule',
      }));
      return u.updateIn(recording.characterId, {rules}, state);
    }
    default:
      return state;
  }
}
