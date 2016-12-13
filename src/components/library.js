import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {Button} from 'reactstrap';

import {
  createCharacter,
  changeCharacter,
  changeCharacterAnimationName,
  createCharacterAnimation,
} from '../actions/characters-actions';
import {
  selectCharacterId,
  paintCharacterAnimation,
} from '../actions/ui-actions';

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
    character: PropTypes.object,
    appearance: PropTypes.string,
    label: PropTypes.string,
    onChangeLabel: PropTypes.func,
    selected: PropTypes.bool,
    onSelect: PropTypes.func,
    onDoubleClick: PropTypes.func,
  };

  _onDragStart = (event) => {
    const {top, left} = event.target.getBoundingClientRect();
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('sprite', JSON.stringify({
      characterId: this.props.character.id,
      dragLeft: event.clientX - left,
      dragTop: event.clientY - top,
    }));
  }

  render() {
    const {selected, onSelect, character, label, appearance, onDoubleClick} = this.props;
    const {spritesheet} = character;

    return (
      <div
        className={classNames({"item": true, "selected": selected})}
        draggable
        onDragStart={this._onDragStart}
        onClick={onSelect}
        onDoubleClick={onDoubleClick}
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
    characters: PropTypes.object,
    ui: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
  }

  renderCharactersPanel() {
    const {characters, dispatch, ui} = this.props;

    return (
      <div className="item-grid">
        {Object.keys(characters).map(id =>
          <LibraryItem
            key={id}
            character={characters[id]}
            label={characters[id].name}
            onChangeLabel={(event) =>
              dispatch(changeCharacter(id, {name: event.target.value}))
            }
            selected={id === ui.selectedCharacterId}
            onSelect={() =>
              dispatch(selectCharacterId(id))
            }
          />
        )}
      </div>
    );
  }

  renderAppearancesPanel() {
    const {characters, ui, dispatch} = this.props;
    const character = characters[ui.selectedCharacterId];

    if (!character) {
      return(
        <div>
          Select an actor in your library to view it's appearances.
        </div>
      );
    }

    return(
      <div className="item-grid">
        {Object.keys(character.spritesheet.animations).map(animationId =>
          <LibraryItem
            key={animationId}
            character={character}
            appearance={animationId}
            label={character.spritesheet.animationNames[animationId]}
            onDoubleClick={() =>
              dispatch(paintCharacterAnimation(character.id, animationId))
            }
            onChangeLabel={(event) =>
              dispatch(changeCharacterAnimationName(character.id, animationId, event.target.value))
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
            <Button
              size="sm"
              disabled={false}
              onClick={() => dispatch(createCharacter())}
            >
            +
            </Button>
          </div>
          {this.renderCharactersPanel()}
        </div>
        <div className="panel appearances">
          <div style={{display: 'flex'}}>
            <h2>Appearances</h2>
            <Button
              size="sm"
              disabled={!ui.selectedCharacterId}
              onClick={() => dispatch(createCharacterAnimation(ui.selectedCharacterId))}
            >
            +
            </Button>
          </div>
          {this.renderAppearancesPanel()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    characters: state.characters,
    ui: state.ui,
  };
}

export default connect(
  mapStateToProps,
)(Library);
