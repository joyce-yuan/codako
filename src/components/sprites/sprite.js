import React, {PropTypes} from 'react';
import objectAssign from 'object-assign';

export default class Sprite extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    className: PropTypes.string,
    spritesheet: PropTypes.object.isRequired,
    appearance: PropTypes.string,
    frame: PropTypes.number,
  }

  render() {
    const {appearance, frame, spritesheet, className} = this.props;
    const {width, appearances} = spritesheet;

    let data = null;
    if (appearance) {
      data = appearances[appearance][frame || 0];
    } else {
      data = '/img/splat.png';
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
