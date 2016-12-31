import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {Button} from 'reactstrap';

import * as actions from '../actions/ui-actions';
import {TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT} from '../constants/constants';

class Toolbar extends React.Component {
  static propTypes = {
    selectedToolId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  _renderTool = (toolId) => {
    const {selectedToolId, dispatch} = this.props;
    const classes = classNames({
      'tool-option': true,
      'enabled': true,
      'selected': selectedToolId === toolId,
    });

    return (
      <Button
        key={toolId}
        className={classes}
        onClick={() => dispatch(actions.selectToolId(toolId))}
      >
        <img src={`/editor/img/sidebar_${toolId}.png`} />
      </Button>
    );
  }

  render() {
    return (
      <div className="panel toolbar">
        {[TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT].map(this._renderTool)}
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
