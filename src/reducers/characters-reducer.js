import u from 'updeep';
import objectAssign from 'object-assign';

import {UPSERT_CHARACTER, DELETE_CHARACTER, FINISH_RECORDING} from '../constants/action-types';
import initialState from './initial-state';
import {findRule, pointIsInside, actionsBetweenStages} from '../components/game-state-helpers';

export default function charactersReducer(state = initialState.characters, action) {
  switch (action.type) {
    case UPSERT_CHARACTER: {
      return u.updateIn(action.characterId, action.values, state);
    }
    case DELETE_CHARACTER: {
      return u.omit(action.characterId, state);
    }
    case FINISH_RECORDING: {
      const {recording} = window.store.getState();
      const rules = JSON.parse(JSON.stringify(state[recording.characterId].rules));

      // locate the main actor in the recording to "re-center" the extent to it
      const mainActor = Object.values(recording.beforeStage.actors).find(a => a.id === recording.actorId);
      const relativeExtent = {
        xmin: recording.extent.xmin - mainActor.position.x,
        xmax: recording.extent.xmax - mainActor.position.x,
        ymin: recording.extent.ymin - mainActor.position.y,
        ymax: recording.extent.ymax - mainActor.position.y,
        ignored: [],
      };

      const recordingActors = {};
      for (const a of Object.values(recording.beforeStage.actors)) {
        if (pointIsInside(a.position, recording.extent)) {
          recordingActors[a.id] = objectAssign({}, a, {
            position: {
              x: a.position.x - recording.extent.xmin,
              y: a.position.y - recording.extent.ymin,
            },
          });
        }
      }
      const recordingActions = actionsBetweenStages(recording);
      const recordedRule = {
        mainActorId: recording.actorId,
        conditions: recording.conditions,
        extent: relativeExtent,
        actors: recordingActors,
        actions: recordingActions,
      };

      if (recording.ruleId) {
        const [existingRule, parentRule, parentIdx] = findRule({rules}, recording.ruleId);
        parentRule.rules[parentIdx] = objectAssign({}, existingRule, recordedRule);
        return u.updateIn(recording.characterId, {rules}, state);
      }

      rules.push(objectAssign(recordedRule, {
        id: `${Date.now()}`,
        name: 'Untitled Rule',
      }));
      return u.updateIn(recording.characterId, {rules}, state);
    }
    default:
      return state;
  }
}
