import actors from './initial-state-actors';
import stage from './initial-state-stage';
import world from './initial-state-world';

export default {
  ui: {
    selectedToolId: 'a',
    selectedDefinitionId: null,
  },
  actors: actors,
  stage: stage,
  world: world,
};
