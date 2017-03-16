import stage from './initial-state-stage';
import {nullActorPath} from '../utils/stage-helpers';
import {WORLDS} from '../constants/constants';

export default {
  characters: {},
  world: {
    id: WORLDS.ROOT,
    stages: {
      [stage.id]: stage,
    },
    globals: {
      selectedStageId: {
        id: "selectedStageId",
        name: "Current Stage",
        value: stage.id,
        type: "stage",
      },
    },
    input: {
      keys: {},
      clicks: {}
    },

    history: [],
    evaluatedRuleIds: {},
  },
  undoStack: [],
  redoStack: [],
  ui: {
    selectedToolId: 'pointer',
    selectedCharacterId: null,
    selectedActorPath: nullActorPath(),
    tutorial: {
      stepIndex: 0,
    },
    playback: {
      speed: 500,
      running: false,
    },
    keypicker: {
      characterId: null,
      initialKeyCode: null,
      ruleId: null,
    },
    paint: {
      characterId: null,
      appearanceId: null,
    },
    modal: {
      openId: null,
    }
  },
  recording: {
    phase: null,
    characterId: null,
    actorId: null,
    ruleId: null,
    conditions: {},
    extent: {
      xmin: 0,
      xmax: 0,
      ymin: 0,
      ymax: 0,
      ignored: {},
    },
    prefs: {},
    beforeWorld: {
      id: WORLDS.BEFORE,
      stages: {},
      globals: {},
    },
    afterWorld: {
      id: WORLDS.AFTER,
      stages: {},
      globals: {},
    },
  },
};
