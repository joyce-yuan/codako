import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {Button} from 'reactstrap';

import {TOOL_POINTER, TOOL_TRASH} from '../constants/constants';

import {
  createCharacter,
  changeCharacter,
  deleteCharacter,
  changeCharacterAppearanceName,
  createCharacterAppearance,
  deleteCharacterAppearance,
} from '../actions/characters-actions';

import {
  select,
  selectToolId,
  paintCharacterAppearance,
} from '../actions/ui-actions';

import Sprite from './sprites/sprite';
import TapToEditLabel from './tap-to-edit-label';


class LibraryItem extends React.Component {
  static propTypes = {
    character: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    labelEditable: PropTypes.bool,
    onChangeLabel: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    dragType: PropTypes.string,
    appearance: PropTypes.string,
  };

  _onDragStart = (event) => {
    event.dataTransfer.dropEffect = 'copy';
    event.dataTransfer.effectAllowed = 'copy';

    const el = event.target;
    const {top, left} = el.getBoundingClientRect();
    const offset = {
      dragLeft: event.clientX - left,
      dragTop: event.clientY - top,
    };

    const img = new Image();
    img.src = ((el.tagName === 'IMG') ? el : el.querySelector('img')).src;
    event.dataTransfer.setDragImage(img, offset.dragLeft, offset.dragTop);

    event.dataTransfer.setData('drag-offset', JSON.stringify(offset));
    event.dataTransfer.setData(this.props.dragType, JSON.stringify({
      characterId: this.props.character.id,
      appearance: this.props.appearance,
    }));
  }

  render() {
    const {selected, onClick, character, label, labelEditable, appearance, onDoubleClick} = this.props;
    const {spritesheet} = character;

    return (
      <div
        className={classNames({"item": true, "selected": selected})}
        draggable
        onDragStart={this._onDragStart}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <Sprite
          spritesheet={spritesheet}
          frame={0}
          appearance={appearance || Object.keys(spritesheet.appearances)[0]}
        />
        <TapToEditLabel
          className="name"
          value={label}
          onChange={labelEditable ? this.props.onChangeLabel : undefined}
        />
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

  _onClickCharacter = (event, characterId) => {
    const {ui, dispatch} = this.props;
    if (ui.selectedToolId === TOOL_TRASH) {
      dispatch(deleteCharacter(characterId));
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOL_POINTER));
      }
    } else {
      dispatch(select(characterId, null));
    }
  }

  _onClickAppearance = (event, characterId, appearanceId) => {
    const {ui, dispatch} = this.props;
    if (ui.selectedToolId === TOOL_TRASH) {
      dispatch(deleteCharacterAppearance(characterId, appearanceId));
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOL_POINTER));
      }
    }
  }

  renderCharactersPanel() {
    const {characters, dispatch, ui} = this.props;

    return (
      <div className="item-grid">
        {Object.keys(characters).map(id =>
          <LibraryItem
            key={id}
            dragType="sprite"
            character={characters[id]}
            label={characters[id].name}
            labelEditable={ui.selectedToolId !== TOOL_TRASH}
            selected={id === ui.selectedCharacterId}
            onChangeLabel={(event) => dispatch(changeCharacter(id, {name: event.target.value}))}
            onClick={(event) => this._onClickCharacter(event, id)}
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
        <div className="empty">
          Select an actor in your library to view it's appearances.
        </div>
      );
    }

    return(
      <div className="item-grid">
        {Object.keys(character.spritesheet.appearances).map(appearanceId =>
          <LibraryItem
            key={appearanceId}
            character={character}
            appearance={appearanceId}
            dragType="appearance"
            label={character.spritesheet.appearanceNames[appearanceId]}
            labelEditable={ui.selectedToolId !== TOOL_TRASH}
            onDoubleClick={() =>
              dispatch(paintCharacterAppearance(character.id, appearanceId))
            }
            onClick={(event) =>
              this._onClickAppearance(event, character.id, appearanceId)
            }
            onChangeLabel={(event) =>
              dispatch(changeCharacterAppearanceName(character.id, appearanceId, event.target.value))
            }
          />
        )}
      </div>
    );
  }

  _onCreateCharacter = () => {
    const newCharacterId = `${Date.now()}`;
    this.props.dispatch(createCharacter(newCharacterId));
    this.props.dispatch(paintCharacterAppearance(newCharacterId, 'idle'));
  }

  _onCreateAppearance = () => {
    const {ui, characters, dispatch} = this.props;
    const char = characters[ui.selectedCharacterId];
    const appearance = Object.values(char.spritesheet.appearances)[0];

    const newAppearanceId = `${Date.now()}`;
    const newAppearanceData = appearance ? appearance[0] : null;
    dispatch(createCharacterAppearance(ui.selectedCharacterId, newAppearanceId, newAppearanceData));
    dispatch(paintCharacterAppearance(ui.selectedCharacterId, newAppearanceId));
  }

  render() {
    return (
      <div className={`library-container tool-${this.props.ui.selectedToolId}`}>
        <div className="panel library" data-tutorial-id="characters">
          <div className="header">
            <h2>Library</h2>
            <Button
              size="sm"
              data-tutorial-id="characters-add-button"
              disabled={false}
              onClick={this._onCreateCharacter}
            >
              <i className="fa fa-plus" />
            </Button>
          </div>
          {this.renderCharactersPanel()}
        </div>
        <div className="panel appearances">
          <div className="header">
            <h2>Appearances</h2>
            <Button
              size="sm"
              disabled={!this.props.ui.selectedCharacterId}
              onClick={this._onCreateAppearance}
            >
              <i className="fa fa-plus" />
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
