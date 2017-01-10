import React, {PropTypes} from 'react';
import Sprite from '../../sprites/sprite';

export default class ActorBlock extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    actor: PropTypes.object,
  }
  render() {
    const {character, actor} = this.props;
    return (
      <code>
        <Sprite spritesheet={character.spritesheet} appearance={actor.appearance} />
        {character.name}
      </code>
    );
  }
}