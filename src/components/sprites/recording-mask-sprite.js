import React, {PropTypes} from 'react';
import {STAGE_CELL_SIZE} from '../../constants/constants';

export default class RecordingMaskSprite extends React.Component {
  static propTypes = {
    position: PropTypes.object,
  };

  render() {
    return (
      <div style={{
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: STAGE_CELL_SIZE - 1,
        height: STAGE_CELL_SIZE - 1,
        left: this.props.position.x * STAGE_CELL_SIZE + 0.5,
        top: this.props.position.y * STAGE_CELL_SIZE + 0.5,
      }} />
    );
  }
}