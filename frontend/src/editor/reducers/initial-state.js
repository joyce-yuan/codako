import stage from './initial-state-stage';

export default {
  stages: {
    [stage.id]: stage,
  },
  characters: {},
  world: {
    id: 'root',
    globals: {
      selectedStageId: {
        id: "selectedStageId",
        name: "Current Stage",
        value: stage.id,
        type: "stage",
      },
      mainCharacterId: {
        id: "mainCharacterId",
        name: "Main Character",
        value: null,
        type: "character",
      },
      as123123: {
        id: "as123123",
        name: "Points",
        value: 0,
        type: "number",
      },
    }
  },
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
