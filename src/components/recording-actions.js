import React, {PropTypes} from 'react';

export default class RecordingActions extends React.Component {
  static propTypes = {
    descriptors: PropTypes.object,
  };

  render() {
    return (
      <div style={{flex: 1, marginLeft: 3}}>
        <h2>It should...</h2>
      </div>
    );
  }
}