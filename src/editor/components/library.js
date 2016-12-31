import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import {Button} from 'reactstrap';

import {
  createCharacter,
  changeCharacter,
  changeCharacterAppearanceName,
  createCharacterAppearance,
} from '../actions/characters-actions';
import {
  select,
  paintCharacterAppearance,
} from '../actions/ui-actions';

import Sprite from './sprites/sprite';
import TapToEditLabel from './tap-to-edit-label';


class LibraryItem extends React.Component {
  static propTypes = {
    character: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    onChangeLabel: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    onSelect: PropTypes.func,
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
        <Sprite
          spritesheet={spritesheet}
          frame={0}
          appearance={appearance || Object.keys(spritesheet.appearances)[0]}
        />
        <TapToEditLabel
          className="name"
          value={label}
          onChange={this.props.onChangeLabel}
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

  renderCharactersPanel() {
    const {characters, dispatch, ui} = this.props;

    return (
      <div className="item-grid">
        {Object.keys(characters).map(id =>
          <LibraryItem
            key={id}
            character={characters[id]}
            label={characters[id].name}
            dragType="sprite"
            onChangeLabel={(event) =>
              dispatch(changeCharacter(id, {name: event.target.value}))
            }
            selected={id === ui.selectedCharacterId}
            onSelect={() =>
              dispatch(select(id, null))
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
            onDoubleClick={() =>
              dispatch(paintCharacterAppearance(character.id, appearanceId))
            }
            onChangeLabel={(event) =>
              dispatch(changeCharacterAppearanceName(character.id, appearanceId, event.target.value))
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
          <div className="header">
            <h2>Library</h2>
            <Button
              size="sm"
              disabled={false}
              onClick={() =>
                dispatch(createCharacter())
              }
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
              disabled={!ui.selectedCharacterId}
              onClick={() =>
                dispatch(createCharacterAppearance(ui.selectedCharacterId))
              }
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
