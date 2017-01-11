import stage from './initial-state-stage';

export default {
  stages: [stage],
  characters: {},
  undoStack: [],
  redoStack: [],
  ui: {
    selectedStageIndex: 0,
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
    beforeStage: {
      id: 'before',
    },
    afterStage: {
      id: 'after',
    },
  },
};
