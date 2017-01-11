import stage from './initial-state-stage';
import characters from './initial-state-characters';

export default {
  stages: [stage],
  stageIndex: 0,
  characters: characters,
  undoStack: [],
  redoStack: [],
  ui: {
    selectedToolId: 'pointer',
    selectedCharacterId: null,
    selectedActorPath: null,
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
    settings: {
      open: false,
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
    beforeStage: {
      uid: 'before',
    },
    afterStage: {
      uid: 'after',
    },
  },
};
