import characters from './initial-state-characters';
import stage from './initial-state-stage';
import world from './initial-state-world';

export default {
  ui: {
    selectedToolId: 'a',
    selectedCharacterId: null,
    selectedActorId: null,
    paint: {
      characterId: null,
      appearanceId: null,
    }
  },
  characters: characters,
  stage: stage,
  world: world,
};
