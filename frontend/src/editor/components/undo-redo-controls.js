import React, {PropTypes} from 'react';
import {Button} from 'reactstrap';
import {undo, redo} from '../utils/undo-redo';
import {connect} from 'react-redux';

class UndoRedoControls extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    canRedo: PropTypes.bool,
    canUndo: PropTypes.bool,
  }

  componentDidMount() {
    document.body.addEventListener("keydown", this._onHandleGlobalShortcuts);
  }

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this._onHandleGlobalShortcuts);
  }

  _onHandleGlobalShortcuts = (event) => {
    if (event.which === 89 && (event.ctrlKey || event.metaKey)){
      this.props.dispatch(undo());
      event.preventDefault();
      event.stopPropagation();
    }
    else if (event.which === 90 && (event.ctrlKey || event.metaKey)){
      this.props.dispatch(event.shiftKey ? redo() : undo());
      event.preventDefault();
      event.stopPropagation();
    }
  }

  render() {
    const {canUndo, canRedo, dispatch} = this.props;

    return (
      <div>
        <Button
          className="icon"
          onClick={() => dispatch(undo())}
          disabled={!canUndo}
        >
          <img src="/editor/img/icon_undo.png" />
        </Button>
        <Button
          className="icon"
          onClick={() => dispatch(redo())}
          disabled={!canRedo}
        >
          <img src="/editor/img/icon_redo.png" />
        </Button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
  }
}

export default connect(
  mapStateToProps,
)(UndoRedoControls);
