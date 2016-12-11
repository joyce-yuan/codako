import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';

import * as actions from '../actions/ui-actions';

class Toolbar extends React.Component {
  static propTypes = {
    selectedToolId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  _renderTool(tool) {
    const {selectedToolId, dispatch} = this.props;
    const classes = classNames({
      'tool-option': true,
      'enabled': true,
      'active': selectedToolId === tool,
    });

    return (
      <button
        key={tool}
        className={classes}
        onClick={() => dispatch(actions.selectToolId(tool))}
      >
        {tool}
      </button>
    );
  }

  render() {
    return (
      <div className="panel toolbar">
        {[
          this._renderTool('a'),
          this._renderTool('b'),
        ]}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state.ui;
}

export default connect(
  mapStateToProps,
)(Toolbar);
