import React, { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  Actor,
  ActorTransform,
  Character,
  Characters,
  EditorState,
  RuleCondition,
  RuleValue,
  Stage,
  VariableComparator,
  WorldMinimal,
} from "../../../../types";
import { selectToolId } from "../../../actions/ui-actions";
import { TOOLS } from "../../../constants/constants";
import { AppearanceDropdown, TransformDropdown } from "../../inspector/container-pane-variables";
import { ActorBlock, AppearanceBlock, TransformBlock, VariableBlock } from "./blocks";

interface FreeformConditionRowProps {
  actors: Stage["actors"];
  world: WorldMinimal;
  characters: Characters;
  condition: RuleCondition;
  onChange?: (keep: boolean, condition: RuleCondition) => void;
}

type ImpliedDatatype = { type: "transform" } | { type: "appearance"; character: Character } | null;

export const FreeformConditionRow = ({
  condition,
  actors,
  world,
  characters,
  onChange,
}: FreeformConditionRowProps) => {
  const { left, right, comparator } = condition;
  const selectedToolId = useSelector<EditorState>((state) => state.ui.selectedToolId);
  const dispatch = useDispatch();

  const leftActor = "actorId" in left ? actors[left.actorId] : null;
  const leftCharacter = leftActor && characters[leftActor.characterId];
  const rightActor = "actorId" in right ? actors[right.actorId] : null;
  const rightCharacter = rightActor && characters[rightActor.characterId];

  const disambiguate =
    leftActor && rightActor && leftActor !== rightActor
      ? leftActor.characterId === rightActor.characterId
      : false;

  const variableIds = [
    "variableId" in left && left.variableId,
    "variableId" in right && right.variableId,
  ];
  const impliedDatatype: ImpliedDatatype = variableIds.includes("transform")
    ? { type: "transform" }
    : variableIds.includes("appearance")
      ? { type: "appearance", character: leftCharacter! || rightCharacter! }
      : null;

  const onToolClick = (e: React.MouseEvent) => {
    if (selectedToolId === TOOLS.TRASH) {
      onChange?.(false, condition);
      if (!e.shiftKey) {
        dispatch(selectToolId(TOOLS.POINTER));
      }
    }
  };

  return (
    <li className={`enabled-true tool-${selectedToolId}`} onClick={onToolClick}>
      <FreeformConditionValue
        value={left}
        actor={leftActor}
        world={world}
        character={leftCharacter}
        disambiguate={disambiguate}
        onChange={onChange ? (value) => onChange(true, { ...condition, left: value }) : undefined}
        impliedDatatype={impliedDatatype}
      />

      {onChange ? (
        <ComparatorSelect
          value={comparator}
          onChange={(comparator) => onChange(true, { ...condition, comparator })}
          impliedDatatype={impliedDatatype}
        />
      ) : (
        ` ${ComparatorLabels[condition.comparator]} `
      )}

      <FreeformConditionValue
        value={right}
        actor={rightActor}
        world={world}
        character={rightCharacter}
        disambiguate={disambiguate}
        onChange={onChange ? (value) => onChange(true, { ...condition, right: value }) : undefined}
        impliedDatatype={impliedDatatype}
      />

      <div style={{ flex: 1 }} />
      {onChange && (
        <div onClick={() => onChange(false, condition)} className="condition-remove">
          <div />
        </div>
      )}
    </li>
  );
};

export const FreeformConditionValue = ({
  value,
  actor,
  character,
  world,
  disambiguate,
  onChange,
  impliedDatatype,
}: {
  value: RuleValue;
  actor: Actor | null;
  character: Character | null;
  world: WorldMinimal;
  disambiguate: boolean;
  onChange?: (value: RuleValue) => void;
  impliedDatatype: ImpliedDatatype;
}) => {
  const selectedToolId = useSelector<EditorState>((state) => state.ui.selectedToolId);
  const dispatch = useDispatch();

  const [droppingValue, setDroppingValue] = useState(false);

  const onDropValue = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("variable")) {
      const { actorId, globalId, variableId } = JSON.parse(e.dataTransfer.getData("variable"));
      const value = (globalId ? { globalId } : { actorId, variableId }) as RuleValue;
      onChange?.(value);
      e.stopPropagation();
    }
    setDroppingValue(false);
  };

  const inner = () => {
    if (!value) {
      return <div>Empty</div>;
    }
    if ("actorId" in value && actor && character) {
      return (
        <div>
          <ActorBlock character={character} actor={actor} disambiguate={disambiguate} />
          {value.variableId === "transform" ? (
            "direction"
          ) : value.variableId === "appearance" ? (
            "appearance"
          ) : (
            <VariableBlock
              name={(value.variableId && character.variables[value.variableId].name) || ""}
            />
          )}
        </div>
      );
    }
    if ("constant" in value) {
      if (impliedDatatype?.type === "transform") {
        if (onChange) {
          return (
            <TransformDropdown
              value={(value.constant as ActorTransform) ?? ""}
              onChange={(e) => onChange?.({ constant: e ?? "" })}
              displayAsLabel
            />
          );
        } else {
          return <TransformBlock transform={value.constant as ActorTransform} />;
        }
      }
      if (impliedDatatype?.type === "appearance") {
        if (onChange) {
          return (
            <AppearanceDropdown
              value={value.constant}
              spritesheet={impliedDatatype.character.spritesheet}
              onChange={(e) => onChange?.({ constant: e ?? "" })}
            />
          );
        } else {
          return (
            <AppearanceBlock character={impliedDatatype.character} appearanceId={value.constant} />
          );
        }
      }
      return (
        <input
          type="text"
          value={value.constant}
          style={{ width: 80 }}
          onChange={(e) => onChange?.({ constant: e.target.value })}
        />
      );
    }
    if ("globalId" in value) {
      return world.globals[value.globalId]?.name ?? "Unknown global";
    }

    return <span />;
  };

  const onDeleteValue = () => {
    if (impliedDatatype?.type === "appearance") {
      const appearanceIds = Object.keys(impliedDatatype.character.spritesheet.appearances);
      onChange?.({ constant: appearanceIds[0] });
    } else if (impliedDatatype?.type === "transform") {
      onChange?.({ constant: "0" });
    } else {
      onChange?.({ constant: "" });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      onDeleteValue();
    }
  };

  const onToolClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedToolId === TOOLS.TRASH) {
      onDeleteValue();
      if (!e.shiftKey) {
        dispatch(selectToolId(TOOLS.POINTER));
      }
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={onToolClick}
      className={`right tool-${selectedToolId} dropping-${droppingValue}`}
      title="Drop a variable or appearance here to create an expression linking two variables."
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(`variable`)) {
          setDroppingValue(true);
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragLeave={() => {
        setDroppingValue(false);
      }}
      onDrop={onDropValue}
    >
      <div style={selectedToolId !== TOOLS.POINTER ? { pointerEvents: "none" } : {}}>{inner()}</div>
    </div>
  );
};

const ComparatorLabels = {
  "=": "is",
  "!=": "is not",
  "<=": "<=",
  ">=": ">=",
  contains: "contains",
  "starts-with": "starts with",
  "ends-with": "ends with",
};

const ComparatorSelect = ({
  value,
  onChange,
  impliedDatatype,
  ...rest
}: Omit<React.HTMLProps<HTMLSelectElement>, "value" | "onChange"> & {
  value: VariableComparator;
  onChange: (value: VariableComparator) => void;
  impliedDatatype: ImpliedDatatype;
}) => (
  <select {...rest} value={value} onChange={(e) => onChange(e.target.value as VariableComparator)}>
    {Object.entries(ComparatorLabels)
      .filter((t) => (impliedDatatype ? ["=", "!="].includes(t[0]) : true))
      .map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ))}
  </select>
);
