import React, {PropTypes} from 'react';

export default class InspectorPanelContainer extends React.Component {
  static propTypes = {
    tool: PropTypes.string,
    onToolChange: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="inspector-panel-container">
      </div>
    );
  }
}
