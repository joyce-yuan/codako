import React, { useContext, useState } from "react";

import ButtonDropdown from "reactstrap/lib/ButtonDropdown";
import DropdownItem from "reactstrap/lib/DropdownItem";
import DropdownMenu from "reactstrap/lib/DropdownMenu";
import DropdownToggle from "reactstrap/lib/DropdownToggle";

import { useDispatch } from "react-redux";
import { DeepPartial } from "redux";
import { Actor, ActorPath, Character, Global, WorldMinimal } from "../../../types";
import { changeCharacter, deleteCharacterVariable } from "../../actions/characters-actions";
import { changeActor } from "../../actions/stage-actions";
import { selectToolId } from "../../actions/ui-actions";
import { deleteGlobal, upsertGlobal } from "../../actions/world-actions";
import { TOOLS } from "../../constants/constants";
import Sprite from "../sprites/sprite";
import { InspectorContext } from "./inspector-context";
import { TransformImages } from "./transform-images";
import { VariableGridItem } from "./variable-grid-item";

const AppearanceGridItem = ({
  spritesheet,
  actorId,
  appearanceId,
  onChange,
}: {
  spritesheet: Character["spritesheet"];
  actorId: string;
  appearanceId: string;
  onChange: (event: { target: { value: string } }) => void;
}) => {
  const [open, setOpen] = useState(false);

  const _onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.dropEffect = "copy";
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "variable",
      JSON.stringify({
        type: "appearance",
        actorId: actorId,
        value: {},
      }),
    );
    event.dataTransfer.setData("variable-type:appearance", "true");
  };

  return (
    <div className={`variable-box variable-set-true`} draggable onDragStart={_onDragStart}>
      <div className="name">Appearance</div>
      <ButtonDropdown size="sm" isOpen={open} toggle={() => setOpen(!open)}>
        <DropdownToggle caret>
          <Sprite spritesheet={spritesheet} appearance={appearanceId} fit />
        </DropdownToggle>
        <DropdownMenu className="with-sprites">
          {Object.keys(spritesheet.appearances).map((id) => (
            <DropdownItem onClick={() => onChange({ target: { value: id } })} key={id}>
              <Sprite spritesheet={spritesheet} appearance={id} fit />
            </DropdownItem>
          ))}
        </DropdownMenu>
      </ButtonDropdown>
    </div>
  );
};

const TransformGridItem = ({
  actorId,
  transform,
  onChange,
}: {
  spritesheet: Character["spritesheet"];
  actorId: string;
  appearanceId: string;
  transform: Actor["transform"];
  onChange: (value: Actor["transform"] | undefined) => void;
}) => {
  const [open, setOpen] = useState(false);

  const _onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.dropEffect = "copy";
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "variable",
      JSON.stringify({
        type: "transform",
        actorId: actorId,
        value: {},
      }),
    );
    event.dataTransfer.setData("variable-type:transform", "true");
  };

  return (
    <div className={`variable-box variable-set-true`} draggable onDragStart={_onDragStart}>
      <div className="name">Direction</div>
      <ButtonDropdown size="sm" isOpen={open} toggle={() => setOpen(!open)}>
        <DropdownToggle caret>{TransformImages[transform || "none"]}</DropdownToggle>
        <DropdownMenu className="with-sprites">
          {[
            "none" as const,
            "90deg" as const,
            "270deg" as const,
            "180deg" as const,
            "flip-x" as const,
            "flip-y" as const,
          ].map((option) => (
            <DropdownItem onClick={() => onChange(option)} key={option}>
              {TransformImages[option]}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </ButtonDropdown>
    </div>
  );
};

export const ContainerPaneVariables = ({
  character,
  actor,
  world,
  selectedActorPath,
}: {
  character: Character;
  actor: Actor | null;
  world: WorldMinimal;
  selectedActorPath: ActorPath;
}) => {
  const dispatch = useDispatch();
  const { selectedToolId } = useContext(InspectorContext);

  // Chararacter and actor variables

  const _onClickVar = (id: string, event: React.MouseEvent) => {
    if (selectedToolId === TOOLS.TRASH) {
      dispatch(deleteCharacterVariable(character.id, id));
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOLS.POINTER));
      }
    }
  };

  const _onChangeVarDefinition = (id: string, changes: Partial<Character["variables"][0]>) => {
    dispatch(
      changeCharacter(character.id, {
        variables: {
          [id]: changes,
        },
      }),
    );
  };

  const _onChangeVarValue = (id: string, value: string | undefined) => {
    if (!selectedActorPath.actorId) {
      _onChangeVarDefinition(id, { defaultValue: value });
      return;
    }
    dispatch(
      changeActor(selectedActorPath, {
        variableValues: {
          [id]: value,
        },
      }),
    );
  };

  // Globals

  const _onChangeGlobalDefinition = (globalId: string, changes: DeepPartial<Global>) => {
    dispatch(upsertGlobal(world.id, globalId, changes));
  };

  const _onClickGlobal = (globalId: string, event: React.MouseEvent) => {
    if (selectedToolId === TOOLS.TRASH) {
      dispatch(deleteGlobal(world.id, globalId));
      if (!event.shiftKey) {
        dispatch(selectToolId(TOOLS.POINTER));
      }
    }
  };

  function _renderCharacterSection() {
    if (!character) {
      return <div className="empty">Please select a character.</div>;
    }

    const actorValues = actor ? actor.variableValues : {};

    return (
      <div className="variables-grid">
        {actor && (
          <AppearanceGridItem
            actorId={actor.id}
            appearanceId={actor.appearance}
            spritesheet={character.spritesheet}
            onChange={(e) => {
              dispatch(changeActor(selectedActorPath, { appearance: e.target.value }));
            }}
          />
        )}
        {actor && (
          <TransformGridItem
            transform={actor.transform}
            actorId={actor.id}
            appearanceId={actor.appearance}
            spritesheet={character.spritesheet}
            onChange={(value) => {
              dispatch(changeActor(selectedActorPath, { transform: value }));
            }}
          />
        )}
        {Object.values(character.variables).map((definition) => (
          <VariableGridItem
            disabled={selectedToolId !== TOOLS.POINTER}
            draggable={!!actor && selectedToolId === TOOLS.POINTER}
            actorId={actor ? actor.id : null}
            key={definition.id}
            definition={definition}
            value={actorValues[definition.id]}
            onClick={_onClickVar}
            onChangeDefinition={_onChangeVarDefinition}
            onChangeValue={_onChangeVarValue}
            onBlurValue={(id, value) => _onChangeVarValue(id, value)}
          />
        ))}
        {Object.values(character.variables).length === 0 && (
          <div className="empty">
            Add variables (like "age" or "health") that each {character.name} will have.
          </div>
        )}
      </div>
    );
  }

  function _renderWorldSection() {
    return (
      <div className="variables-grid">
        {Object.values(world.globals).map((definition) => (
          <VariableGridItem
            draggable={true}
            actorId={null}
            disabled={selectedToolId !== TOOLS.POINTER}
            key={definition.id}
            definition={definition}
            value={definition.value || ""}
            onClick={_onClickGlobal}
            onChangeDefinition={_onChangeGlobalDefinition}
            onChangeValue={(id, value) => _onChangeGlobalDefinition(id, { value })}
            onBlurValue={(id, value) => _onChangeGlobalDefinition(id, { value })}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`scroll-container`}>
      <div className="scroll-container-contents">
        <div className="variables-section">
          <h3>
            {actor
              ? `${character.name} at (${actor.position.x},${actor.position.y})`
              : `${character.name} (Defaults)`}
          </h3>
          {_renderCharacterSection()}
        </div>
        <div className="variables-section">
          <h3>World</h3>
          {_renderWorldSection()}
        </div>
      </div>
    </div>
  );
};
