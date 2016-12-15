import characters from './initial-state-characters';
import stage from './initial-state-stage';
import world from './initial-state-world';

export default {
  ui: {
    selectedToolId: 'pointer',
    selectedCharacterId: null,
    selectedActorId: null,
    playback: {
      speed: 500,
      running: false,
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
