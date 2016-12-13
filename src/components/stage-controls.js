import React, {PropTypes} from 'react';
import classNames from 'classnames';

import {Button, ButtonGroup} from 'reactstrap';


export default class StageControls extends React.Component {
  static propTypes = {
    tool: PropTypes.string,
    onToolChange: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const {value, onChange} = {};

    return (
      <div className="stage-controls">
        <div className="stage-initial-state-controls">
        </div>
        <div className="stage-playback-controls">
          <Button size="sm">Back</Button>{' '}
          <Button>Stop</Button>{' '}
          <Button>Run</Button>{' '}
          <Button size="sm">Forward</Button>
        </div>
        <div className="stage-speed-controls">
          <ButtonGroup>
            {['Slow', 'Medium', 'Fast'].map((speedOption) =>
              <Button
                key={speedOption}
                style={{minWidth: 0}}
                className={classNames({'selected': speedOption === value})}
                onClick={() => onChange(speedOption)}
              >
                {speedOption}
              </Button>
            )}
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
