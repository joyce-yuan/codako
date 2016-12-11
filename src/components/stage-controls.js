import React, {PropTypes} from 'react';
import classNames from 'classnames';

class SegmentedControl extends React.Component {
  static propTypes = {
    values: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  render() {
    const {values, value, onChange} = this.props;
    return (
      <div className="segmented-control">
        {values.map((v) =>
          <button
            key={v}
            className={classNames({'selected': v === value})}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        )}
      </div>
    );
  }
}

export default class StageControls extends React.Component {
  static propTypes = {
    tool: PropTypes.string,
    onToolChange: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="stage-controls">
        <div className="stage-initial-state-controls">
        </div>
        <div className="stage-playback-controls">
          <button>Back</button>
          <button>Stop</button>
          <button>Run</button>
          <button>Forward</button>
        </div>
        <div className="stage-speed-controls">
          <SegmentedControl value={'slow'} values={['slow', 'medium', 'fast']} />
        </div>
      </div>
    );
  }
}
