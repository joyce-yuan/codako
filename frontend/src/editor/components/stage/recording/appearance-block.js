import React, {PropTypes} from 'react';
import Sprite from '../../sprites/sprite';

export default class AppearanceBlock extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    appearanceId: PropTypes.string,
  };
  render() {
    const {character, appearanceId} = this.props;
    return (
      <code>
        <Sprite spritesheet={character.spritesheet} appearance={appearanceId} />
        {character.spritesheet.appearanceNames[appearanceId]}
      </code>
    );
  }
}