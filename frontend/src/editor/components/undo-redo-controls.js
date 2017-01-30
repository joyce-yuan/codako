import React, {PropTypes} from 'react';
import {Button} from 'reactstrap';
import {undo, redo} from '../utils/undo-redo';
import {connect} from 'react-redux';

class UndoRedoControls extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    undoDepth: PropTypes.number,
    redoDepth: PropTypes.number,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      showingSlider: false,
      mouseover: false,
    };
  }

  componentDidMount() {
    document.body.addEventListener("keydown", this._onGlobalKeydown);
  }

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this._onGlobalKeydown);
    clearTimeout(this._hideTimeout);
  }

  _onGlobalKeydown = (event) => {
    if (event.target.closest('.modal')) {
      return;
    }

    if (event.which === 89 && (event.ctrlKey || event.metaKey)) {
      this._dispatch(undo());
      event.preventDefault();
      event.stopPropagation();
    }
    else if (event.which === 90 && (event.ctrlKey || event.metaKey)) {
      this._dispatch(event.shiftKey ? redo() : undo());
      event.preventDefault();
      event.stopPropagation();
    }
  }

  _onSlideUndoRedo = (event) => {
    const dest = event.target.value;
    let current = this.props.undoDepth;
    while (dest < current) {
      this._dispatch(undo());
      current -= 1;
    }
    while (dest > current) {
      this._dispatch(redo());
      current += 1;
    }
  }

  _onHideDebounced = () => {
    clearTimeout(this._hideTimeout);
    this._hideTimeout = setTimeout(() => {
      if (this.state.mouseover) {
        this._onHideDebounced();
        return;
      }
      this.setState({showingSlider: false});
    }, 1000);
  }

  _dispatch = (action) => {
    if (!this.state.showingSlider) {
      this.setState({showingSlider: true});
    }
    this._onHideDebounced();
    this.props.dispatch(action);
  }

  render() {
    const {undoDepth, redoDepth} = this.props;
    const {showingSlider} = this.state;

    return (
      <div
        className={`undo-redo-controls showing-slider-${showingSlider}`}
        onMouseEnter={() => this.setState({mouseover: true})}
        onMouseLeave={() => { this.setState({mouseover: false}); this._onHideDebounced(); }}
      >
        <input 
          type="range"
          max={undoDepth + redoDepth}
          min={0}
          value={undoDepth}
          onChange={this._onSlideUndoRedo}
        />
        <Button
          className="icon"
          onClick={() => this._dispatch(undo())}
          disabled={undoDepth === 0}
        >
          <img src={require('../img/icon_undo.png')} />
        </Button>
        <Button
          className="icon"
          onClick={() => this._dispatch(redo())}
          disabled={redoDepth === 0}
        >
          <img src={require('../img/icon_redo.png')} />
        </Button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    undoDepth: state.undoStack.length,
    redoDepth: state.redoStack.length,
  };
}

export default connect(
  mapStateToProps,
)(UndoRedoControls);
