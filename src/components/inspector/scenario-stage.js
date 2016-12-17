import React, {PropTypes} from 'react';

import {STAGE_CELL_SIZE} from '../../constants/constants';
import {buildActorsFromRule, getScenarioExtent} from '../game-state-helpers';
import ActorSprite from '../sprites/actor-sprite';


export default class ScenarioStage extends React.Component {
  static propTypes = {
    rule: PropTypes.object,
    applyActions: PropTypes.bool,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
  };

  static contextTypes = {
    characters: PropTypes.object,
  };

  render() {
    const {rule, applyActions, maxWidth, maxHeight} = this.props;
    const {characters} = this.context;

    const actors = buildActorsFromRule(rule, characters, {applyActions});

    const {xmin, xmax, ymin, ymax} = getScenarioExtent(rule. scenario);
    const width = (xmax - xmin + 1) * STAGE_CELL_SIZE;
    const height = (ymax - ymin + 1) * STAGE_CELL_SIZE;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);

    return (
      <div className="scenario-stage" style={{width, height, transform:`scale(${scale}, ${scale})`}}>
        {Object.keys(actors).map((id) =>
          <ActorSprite
            key={id}
            character={characters[actors[id].characterId]}
            actor={actors[id]}
          />
        )}
      </div>
    );
  }
}
