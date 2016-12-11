import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {
  createActorDefinition,
  changeActorDefinition,
  changeActorAnimationName,
  createActorAnimation,
} from '../actions/actors-actions';
import {selectDefinitionId} from '../actions/ui-actions';

import Sprite from './sprite';

class TapToEditLabel extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  _onChange = (event) => {
    const nextValue = event.target.innerText.trim();
    if (nextValue != this.props.value) {
      event.target = {value: nextValue.trim()};
      this.props.onChange(event);
    }
  }

  render() {
    const {value, ...props} = this.props;
    return (
      <div
        contentEditable
        onChange={this._onChange}
        onBlur={this._onChange}
        dangerouslySetInnerHTML={{__html: value}}
        {...props}
      />
  );
  }
}

class LibraryItem extends React.Component {
  static propTypes = {
    actor: PropTypes.object,
    appearance: PropTypes.string,
    label: PropTypes.string,
    onChangeLabel: PropTypes.func,
    selected: PropTypes.bool,
    onSelect: PropTypes.func,
  };

  _onDragStart = (event) => {
    const {top, left} = event.target.getBoundingClientRect();
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('sprite', JSON.stringify({
      definitionId: this.props.actor.id,
      dragLeft: event.clientX - left,
      dragTop: event.clientY - top,
    }));
  }

  render() {
    const {selected, onSelect, actor, label, appearance} = this.props;
    const {spritesheet} = actor;

    return (
      <div
        className={classNames({"actor": true, "selected": selected})}
        draggable
        onDragStart={this._onDragStart}
        onClick={onSelect}
      >
        <Sprite spritesheet={spritesheet} frame={0} animationId={appearance} />
        <TapToEditLabel className="name" value={label} onChange={this.props.onChangeLabel}/>
      </div>
    );
  }
}

class Library extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    actors: PropTypes.object,
    ui: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
  }

  renderActorsPanel() {
    const {actors, dispatch, ui} = this.props;

    return (
      <div className="actor-grid">
        {Object.keys(actors).map(id =>
          <LibraryItem
            key={id}
            actor={actors[id]}
            label={actors[id].name}
            onChangeLabel={(event) =>
              dispatch(changeActorDefinition(id, {name: event.target.value}))
            }
            selected={id === ui.selectedDefinitionId}
            onSelect={() =>
              dispatch(selectDefinitionId(id))
            }
          />
        )}
      </div>
    );
  }

  renderAppearancesPanel() {
    const {actors, ui, dispatch} = this.props;
    const actor = actors[ui.selectedDefinitionId];

    if (!actor) {
      return(
        <div>
          Select an actor in your library to view it's appearances.
        </div>
      );
    }

    return(
      <div className="actor-grid">
        {Object.keys(actor.spritesheet.animations).map(animationId =>
          <LibraryItem
            key={animationId}
            actor={actor}
            appearance={animationId}
            label={actor.spritesheet.animationNames[animationId]}
            onChangeLabel={(event) =>
              dispatch(changeActorAnimationName(actor.id, animationId, event.target.value))
            }
          />
        )}
      </div>
    );
  }

  render() {
    const {ui, dispatch} = this.props;

    return (
      <div className="library-container">
        <div className="panel library">
          <div style={{display: 'flex'}}>
            <h2>Library</h2>
            <button
              disabled={false}
              onClick={() => dispatch(createActorDefinition())}
            >
              +
            </button>
          </div>
          {this.renderActorsPanel()}
        </div>
        <div className="panel appearances">
          <div style={{display: 'flex'}}>
            <h2>Appearances</h2>
            <button
              disabled={!ui.selectedDefinitionId}
              onClick={() => dispatch(createActorAnimation(ui.selectedDefinitionId))}>
              +
            </button>
          </div>
          {this.renderAppearancesPanel()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    actors: state.actors,
    ui: state.ui,
  };
}

export default connect(
  mapStateToProps,
)(Library);
