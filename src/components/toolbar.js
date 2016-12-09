import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';

import * as actions from '../actions/toolbar-actions';

class Toolbar extends React.Component {
  static propTypes = {
    tool: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  _renderTool(tool) {
    const classes = classNames({
      'tool-option': true,
      'enabled': true,
      'active': this.props.tool === tool,
    });

    return (
      <button
        key={tool}
        className={classes}
        onClick={() => this.props.dispatch(actions.changeTool(tool))}
      >
        {tool}
      </button>
    );
  }

  render() {
    return (
      <div className="toolbar">
        {[
          this._renderTool('a'),
          this._renderTool('b'),
        ]}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state.toolbar;
}

export default connect(
  mapStateToProps,
)(Toolbar);
