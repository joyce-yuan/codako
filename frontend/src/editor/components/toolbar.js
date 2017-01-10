import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {Button} from 'reactstrap';

import * as actions from '../actions/ui-actions';
import {TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT} from '../constants/constants';
import UndoRedoControls from './undo-redo-controls';

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
        data-tutorial-id={`toolbar-tool-${toolId}`}
        onClick={() => dispatch(actions.selectToolId(toolId))}
      >
        <img src={`/editor/img/sidebar_${toolId}.png`} />
      </Button>
    );
  }

  render() {
    return (
      <div className="toolbar">
        <div style={{flex: 1, textAlign: 'left'}}>
          {[TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT].map(this._renderTool)}
        </div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <Button onClick={() => this.props.dispatch(actions.showSettingsModal())}>
            <img src="/editor/img/sidebar_choose_background.png" />
          </Button>
          <div className="title">
            <a>World</a> > <a>Stage 1</a>
          </div>
        </div>

        <div style={{flex: 1, textAlign: 'right'}}>
          <UndoRedoControls />
        </div>
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
