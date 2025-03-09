import { getCurrentStageForWorld } from "../../../utils/selectors";

import { useDispatch } from "react-redux";
import { Characters, MathOperation, RecordingState, RuleAction } from "../../../../types";
import { ActorDeltaCanvas } from "./actor-delta-canvas";
import { ActorOffsetCanvas } from "./actor-offset-canvas";
import { ActorBlock, AppearanceBlock, TransformBlock, VariableBlock } from "./blocks";
import { getAfterWorldForRecording } from "./utils";
import { VariableActionPicker } from "./variable-action-picker";

export const RecordingActions = (props: { characters: Characters; recording: RecordingState }) => {
  const dispatch = useDispatch();
  const { characters, recording } = props;
  const { beforeWorld, actions, extent } = recording;

  const _onChangeVariableValue = (
    actorId: string,
    variableId: string,
    operation: MathOperation,
    value: number,
  ) => {
    // const beforeStage = getCurrentStageForWorld(beforeWorld);
    // const afterStage = getCurrentStageForWorld(afterWorld);
    // if (!beforeStage || !afterStage) {
    //   return;
    // }
    // if (actorId === "globals") {
    //   const beforeValue = beforeWorld.globals[variableId].value || 0;
    //   const after = applyVariableOperation(beforeValue, operation, value);
    //   dispatch(updateRecordingActionPrefs("globals", { [variableId]: operation }));
    //   dispatch(
    //     upsertGlobal(
    //       afterWorld.id,
    //       variableId,
    //       typeof after === "string" ? { value: after } : { value: after },
    //     ),
    //   );
    // } else {
    //   const actor = beforeStage.actors[actorId];
    //   const character = characters[actor.characterId];
    //   const beforeValue = getVariableValue(actor, character, variableId);
    //   const after = beforeValue
    //     ? Number(applyVariableOperation(beforeValue, operation, value))
    //     : value;
    //   dispatch(updateRecordingActionPrefs(actorId, { [variableId]: operation }));
    //   dispatch(
    //     changeActor(buildActorPath(afterWorld.id, afterStage.id, actorId), {
    //       variableValues: { [variableId]: after },
    //     }),
    //   );
    // }
  };

  const beforeStage = getCurrentStageForWorld(beforeWorld);

  let afterStage = getCurrentStageForWorld(beforeWorld);

  const _renderAction = (a: RuleAction, idx: number) => {
    if (!beforeStage || !afterStage) {
      return;
    }
    if ("actorId" in a && a.actorId) {
      if (a.type === "create") {
        return (
          <li key={idx}>
            Create a
            <ActorBlock actor={a.actor} character={characters[a.actor.characterId]} />
            at
            <ActorOffsetCanvas offset={a.offset} extent={extent} />
          </li>
        );
      }
      const actor = afterStage.actors[a.actorId];
      const character = characters[actor.characterId];

      if (a.type === "move") {
        return (
          <li key={idx}>
            Move
            <ActorBlock actor={actor} character={character} />
            to
            {a.delta ? (
              <ActorDeltaCanvas delta={a.delta} />
            ) : (
              <ActorOffsetCanvas offset={a.offset!} extent={recording.extent} />
            )}
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
              transform={actor.transform}
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
              appearanceId={actor.appearance}
              transform={a.to}
            />
          </li>
        );
      }
    }

    if (a.type === "global") {
      const declaration = beforeWorld.globals[a.global];
      if (declaration.type === "stage") {
        return (
          <li key={idx}>
            Set
            <VariableBlock name={"Current Stage"} />
            to
            <code>{beforeWorld.stages[a.value] && beforeWorld.stages[a.value].name}</code>
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

  return (
    <div className="panel-actions" style={{ flex: 1, marginLeft: 3 }}>
      <h2>It should...</h2>
      <ul>
        {actions.map((a, idx) => {
          const node = _renderAction(a, idx);
          const afterWorld = getAfterWorldForRecording(beforeWorld, characters, recording, idx);
          afterStage = getCurrentStageForWorld(afterWorld);
          return node;
        })}
      </ul>
    </div>
  );
};
