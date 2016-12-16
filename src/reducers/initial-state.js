import characters from './initial-state-characters';
import stage from './initial-state-stage';
import world from './initial-state-world';

export default {
  ui: {
    selectedToolId: 'pointer',
    selectedCharacterId: null,
    selectedActorId: null,
    recording: {
      characterId: null,
      actorId: null,
      phase: null,
      ruleId: null,
      scenario: null,
      actions: [],
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
    }
  },
  characters: characters,
  stage: stage,
  world: world,
};
