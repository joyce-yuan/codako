import { updateRecordingActionPrefs } from "../../../actions/recording-actions";
import { changeActor } from "../../../actions/stage-actions";
import { upsertGlobal } from "../../../actions/world-actions";
import { actionsForRecording } from "../../../utils/recording-helpers";
import { getCurrentStageForWorld } from "../../../utils/selectors";
import {
  applyVariableOperation,
  buildActorPath,
  getVariableValue,
} from "../../../utils/stage-helpers";

import { useDispatch } from "react-redux";
import { Characters, MathOperation, RecordingState, RuleAction } from "../../../../types";
import { ActorDeltaCanvas } from "./actor-delta-canvas";
import { ActorPositionCanvas } from "./actor-position-canvas";
import { ActorBlock, AppearanceBlock, TransformBlock, VariableBlock } from "./blocks";

export const VariableActionPicker = (props: {
  operation: MathOperation;
  value: string | number;
  onChangeValue: (value: number) => void;
  onChangeOperation: (op: MathOperation) => void;
}) => {
  const { operation, value, onChangeOperation, onChangeValue } = props;

  return (
    <span>
      <select
        value={operation}
        className="variable-operation-select"
        onChange={(e) => onChangeOperation(e.target.value as MathOperation)}
      >
        <option value="add">Add</option>
        <option value="subtract">Subtract</option>
        <option value="set">Put</option>
      </select>
      <input
        type="text"
        key={`${value}`}
        defaultValue={value}
        className="variable-value-input"
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => (e.keyCode === 13 ? e.currentTarget.blur() : null)}
        onBlur={(e) => onChangeValue(Number(e.target!.value))}
      />
      {{ set: "into", add: "to", subtract: "from" }[operation]}
    </span>
  );
};

export const RecordingActions = (props: { characters: Characters; recording: RecordingState }) => {
  const dispatch = useDispatch();
  const { characters, recording } = props;
  const { beforeWorld, afterWorld, extent } = recording;

  const _onChangeVariableValue = (
    actorId: string,
    variableId: string,
    operation: MathOperation,
    value: number,
  ) => {
    const beforeStage = getCurrentStageForWorld(beforeWorld);
    const afterStage = getCurrentStageForWorld(afterWorld);
    if (!beforeStage || !afterStage) {
      return;
    }
    if (actorId === "globals") {
      const beforeValue = beforeWorld.globals[variableId].value || 0;
      const after = applyVariableOperation(beforeValue, operation, value);
      dispatch(updateRecordingActionPrefs("globals", { [variableId]: operation }));
      dispatch(
        upsertGlobal(
          afterWorld.id,
          variableId,
          typeof after === "string" ? { value: after } : { value: after },
        ),
      );
    } else {
      const actor = beforeStage.actors[actorId];
      const character = characters[actor.characterId];
      const beforeValue = getVariableValue(actor, character, variableId);
      const after = beforeValue
        ? Number(applyVariableOperation(beforeValue, operation, value))
        : value;

      dispatch(updateRecordingActionPrefs(actorId, { [variableId]: operation }));
      dispatch(
        changeActor(buildActorPath(afterWorld.id, afterStage.id, actorId), {
          variableValues: { [variableId]: after },
        }),
      );
    }
  };

  const _renderAction = (a: RuleAction, idx: number) => {
    const beforeStage = getCurrentStageForWorld(beforeWorld);
    const afterStage = getCurrentStageForWorld(afterWorld);
    if (!beforeStage || !afterStage) {
      return;
    }
    if ("actorId" in a && a.actorId) {
      const actor = beforeStage.actors[a.actorId];
      const afterActor = afterStage.actors[a.actorId];
      const character = characters[(actor || afterActor).characterId];

      if (a.type === "create") {
        return (
          <li key={idx}>
            Create a
            <ActorBlock actor={a.actor} character={character} />
            at
            <ActorPositionCanvas position={a.actor.position} extent={extent} />
          </li>
        );
      }
      if (a.type === "move") {
        return (
          <li key={idx}>
            Move
            <ActorBlock actor={actor} character={character} />
            to
            <ActorDeltaCanvas delta={a.delta} />
          </li>
        );
      }
      if (a.type === "delete") {
        return (
          <li key={idx}>
            Remove
            <ActorBlock actor={actor} character={character} />
            from the stage
          </li>
        );
      }
      if (a.type === "variable") {
        return (
          <li key={idx}>
            <VariableActionPicker
              value={a.value}
              operation={a.operation}
              onChangeValue={(v) => _onChangeVariableValue(a.actorId, a.variable, a.operation, v)}
              onChangeOperation={(op) => _onChangeVariableValue(a.actorId, a.variable, op, a.value)}
            />
            <VariableBlock name={character.variables[a.variable].name} />
            of
            <ActorBlock character={character} actor={actor} />
          </li>
        );
      }
      if (a.type === "appearance") {
        return (
          <li key={idx}>
            Change appearance of
            <ActorBlock character={character} actor={actor} />
            to
            <AppearanceBlock
              character={character}
              appearanceId={a.to}
              transform={afterActor.transform}
            />
          </li>
        );
      }
      if (a.type === "transform") {
        return (
          <li key={idx}>
            Turn
            <ActorBlock character={character} actor={actor} />
            to
            <TransformBlock
              character={character}
              appearanceId={afterActor.appearance}
              transform={a.to}
            />
          </li>
        );
      }
    }

    if (a.type === "global") {
      const declaration = afterWorld.globals[a.global];
      if (declaration.type === "stage") {
        return (
          <li key={idx}>
            Set
            <VariableBlock name={"Current Stage"} />
            to
            <code>{afterWorld.stages[a.value] && afterWorld.stages[a.value].name}</code>
          </li>
        );
      }
      return (
        <li key={idx}>
          <VariableActionPicker
            value={a.value}
            operation={a.operation}
            onChangeValue={(v) => _onChangeVariableValue("globals", a.global, a.operation, v)}
            onChangeOperation={(op) => _onChangeVariableValue("globals", a.global, op, a.value)}
          />
          <VariableBlock name={declaration.name} />
        </li>
      );
    }

    throw new Error(`Unknown action type: ${a.type}`);
  };

  const actions = actionsForRecording(recording, { characters });

  return (
    <div className="panel-actions" style={{ flex: 1, marginLeft: 3 }}>
      <h2>It should...</h2>
      <ul>{actions.map((a, idx) => _renderAction(a, idx))}</ul>
    </div>
  );
};
