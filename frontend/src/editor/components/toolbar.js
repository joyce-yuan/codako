import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import classNames from 'classnames';
import {Button} from 'reactstrap';

import * as actions from '../actions/ui-actions';
import {getCurrentStage} from '../utils/selectors';
import {TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT, MODALS} from '../constants/constants';
import UndoRedoControls from './undo-redo-controls';

class SaveState extends React.Component {
  static propTypes = {
    metadata: PropTypes.object,
  };

  static contextTypes = {
    usingLocalStorage: PropTypes.bool,
  };

  render() {
    if (this.context.usingLocalStorage) {
      return (
        <div className="create-account-notice">
          <span>
            Your work has not been saved!
          </span>
          <Link to={{
            pathname: `/join`,
            state: {
              why: ` to save "${this.props.metadata.name}"`,
              redirectTo: `/join-send-world?storageKey=${this.props.metadata.id}`,
            },
          }}>
            <Button color="success">
              Create Account
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <span />
    );
  }
}


class Toolbar extends React.Component {
  static propTypes = {
    stageName: PropTypes.string,
    metadata: PropTypes.object,
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
        <img src={require(`../img/sidebar_${toolId}.png`)} />
      </Button>
    );
  }

  render() {
    const {stageName, dispatch} = this.props;

    return (
      <div className="toolbar">
        <div style={{flex: 1, textAlign: 'left'}}>
          <div className="button-group">
            {[TOOL_POINTER, TOOL_TRASH, TOOL_RECORD, TOOL_PAINT].map(this._renderTool)}
          </div>
          <UndoRedoControls />
        </div>

        <div style={{display: 'flex', alignItems: 'center'}}>
          <Button onClick={() => dispatch(actions.showModal(MODALS.STAGES))} className="dropdown-toggle">
            <img src={require('../img/sidebar_choose_background.png')} />
            <span className="title">{stageName || "Untitled Stage"}</span>
          </Button>
        </div>

        <div style={{flex: 1, textAlign: 'right'}}>
          <SaveState metadata={this.props.metadata} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    selectedToolId: state.ui.selectedToolId,
    stageName: getCurrentStage(state).name,
    metadata: state.metadata,
  };
}

export default connect(
  mapStateToProps,
)(Toolbar);
