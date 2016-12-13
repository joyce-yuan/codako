import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';

export default class Sprite extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    spritesheet: PropTypes.object.isRequired,
    animationId: PropTypes.string,
    frame: PropTypes.number,
  }

  render() {
    const {animationId, frame, spritesheet, className} = this.props;
    const {width, animations} = spritesheet;

    let data = null;
    if (animationId) {
      data = animations[animationId][frame || 0];
    } else {
      data = animations[Object.keys(animations)[0]][0];
    }

    const style = objectAssign({
      width: width,
      height: width,
      display: 'inline-block',
    }, this.props.style);

    return (
      <img src={data} className={`sprite ${className}`} style={style} />
    );
  }
}
