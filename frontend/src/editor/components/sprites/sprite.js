import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';

export default class Sprite extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    transform: PropTypes.string,
    spritesheet: PropTypes.object.isRequired,
    appearance: PropTypes.string,
    frame: PropTypes.number,
  }

  render() {
    const {appearance, transform, frame, spritesheet, className} = this.props;
    const {width, appearances} = spritesheet;

    let data = '/editor/img/splat.png';
    if (appearance && appearances[appearance]) {
      data = appearances[appearance][frame || 0];
    }

    const style = objectAssign({
      width: width,
      height: width,
      display: 'inline-block',
      transform: {
        'flip-x': 'scale(-1, 1)',
        'flip-y': 'scale(1, -1)',
        'flip-xy': 'scale(-1, -1)',
        'none': undefined,
      }[transform],
    }, this.props.style);

    return (
      <img src={data} className={`sprite ${className}`} style={style} />
    );
  }
}
