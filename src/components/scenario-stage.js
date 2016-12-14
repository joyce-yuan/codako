import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';

import {STAGE_CELL_SIZE} from '../constants/constants';
import {applyRuleAction} from './game-state-helpers';
import ActorSprite from './actor-sprite';


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
    const {scenario, descriptors, actions} = rule;
    const {characters} = this.context;

    let xmin = 0;
    let xmax = 0;
    let ymin = 0;
    let ymax = 0;
    let actors = {};

    for (const block of scenario) {
      const [x, y] = block.coord.split(',').map(s => s / 1);
      xmin = Math.min(xmin, x);
      ymin = Math.min(ymin, y);
      xmax = Math.max(xmax, x);
      ymax = Math.max(ymax, y);

      for (const ref of block.refs) {
        actors[ref] = objectAssign({}, descriptors[ref], {position: {x: -xmin + x, y: -ymin + y}});
      }
    }

    const width = (xmax - xmin + 1) * STAGE_CELL_SIZE;
    const height = (ymax - ymin + 1) * STAGE_CELL_SIZE;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);

    // lay out the before state and apply any rules that apply to
    // the actors currently on the board
    if (applyActions && actions) {
      for (const action of actions) {
        if (action.type === 'create') {
          const [x, y] = action.offset.split(',').map(s => s / 1);
          actors[action.ref] = objectAssign({}, descriptors[action.ref], {position: {x, y}});
        } else {
          const character = characters[actors[action.ref].characterId];
          actors[action.ref] = applyRuleAction(actors[action.ref], character, action);
        }
      }
    }

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
