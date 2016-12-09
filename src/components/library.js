import React, {PropTypes} from 'react';

export default class Library extends React.Component {
  static propTypes = {
    tool: PropTypes.string,
    onToolChange: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="library">
      </div>
    );
  }
}
