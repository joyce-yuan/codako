import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';

export default class Sprite extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    spritesheet: PropTypes.object.isRequired,
    animationId: PropTypes.string,
    frame: PropTypes.number,
  }

  render() {
    const {data, width, animations} = this.props.spritesheet;

    let _frame = this.props.frame;
    if (this.props.animationId) {
      _frame = animations[this.props.animationId][0];
    }
    if (!_frame) {
      _frame = 0;
    }

    const x = 0;
    const y = _frame * width;

    const style = objectAssign({
      width: width,
      height: width,
      display: 'inline-block',
      background: `url(${data}) top left no-repeat`,
      backgroundPosition: `${x}px ${y}px`
    }, this.props.style);

    return (
      <div style={style} />
    );
  }
}
