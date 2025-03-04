import u from "updeep";
import * as Types from "../constants/action-types";
import initialState from "./initial-state";
import worldReducer from "./world-reducer";

import { EditorState, Rule, World } from "../../types";
import { Actions } from "../actions";
import { RECORDING_PHASE, WORLDS } from "../constants/constants";
import { extentByShiftingExtent } from "../utils/recording-helpers";
import { getCurrentStageForWorld } from "../utils/selectors";
import WorldOperator from "../utils/world-operator";

function stateForEditingRule(phase: RECORDING_PHASE, rule: Rule, entireState: EditorState) {
  const { world, characters } = entireState;
  const stage = getCurrentStageForWorld(world);

  const ex = rule.extent.xmax - rule.extent.xmin;
  const ey = rule.extent.ymax - rule.extent.ymin;
  const offset = {
    x: Math.round(stage!.width / 2 + ex / 2),
    y: Math.round(stage!.height / 2 + ey / 2),
  };

  return {
    ruleId: rule.id,
    characterId: rule.actors[rule.mainActorId].characterId,
    phase: phase,
    actorId: rule.mainActorId,
    conditions: u.constant(rule.conditions),
    beforeWorld: u.constant(
      WorldOperator(u({ id: WORLDS.BEFORE }, world) as World, characters).resetForRule(rule, {
        offset,
        applyActions: false,
      }),
    ),
    afterWorld: u.constant(
      WorldOperator(u({ id: WORLDS.AFTER }, world) as World, characters).resetForRule(rule, {
        offset,
        applyActions: true,
      }),
    ),
    extent: u.constant(extentByShiftingExtent(rule.extent, offset)),
    prefs: u.constant({}),
  };
}

export default function recordingReducer(
  state = initialState.recording,
  action: Actions,
  entireState: EditorState,
) {
  const { world, characters } = entireState;

  const nextState = Object.assign({}, state, {
    beforeWorld: worldReducer(state.beforeWorld, action, entireState),
    afterWorld: worldReducer(state.afterWorld, action, entireState),
  });

  switch (action.type) {
    case Types.SETUP_RECORDING_FOR_ACTOR: {
      const { actor } = action;
      return u(
        {
          ruleId: null,
          characterId: actor.characterId,
          phase: RECORDING_PHASE.SETUP,
          actorId: actor.id,
          conditions: u.constant({ [actor.id]: {} }),
          beforeWorld: u.constant(u({ id: WORLDS.BEFORE }, world)),
          afterWorld: u.constant(u({ id: WORLDS.AFTER }, world)),
          extent: u.constant({
            xmin: actor.position.x,
            xmax: actor.position.x,
            ymin: actor.position.y,
            ymax: actor.position.y,
            ignored: {},
          }),
          prefs: u.constant({}),
        },
        nextState,
      );
    }
    case Types.SETUP_RECORDING_FOR_CHARACTER: {
      const character = characters[action.characterId];

      const initialRule: Rule = {
        mainActorId: "dude",
        actions: [],
        type: "rule",
        id: "",
        name: "Untitled Rule",
        conditions: { dude: {} },
        extent: { xmin: 0, ymin: 0, xmax: 0, ymax: 0, ignored: {} },
        actors: {
          dude: {
            id: "dude",
            variableValues: {},
            appearance: Object.keys(character.spritesheet.appearances)[0],
            characterId: action.characterId,
            position: { x: 0, y: 0 },
          },
        },
      };
      return u(stateForEditingRule(RECORDING_PHASE.SETUP, initialRule, entireState), nextState);
    }
    case Types.EDIT_RULE_RECORDING: {
      return u(stateForEditingRule(RECORDING_PHASE.RECORD, action.rule, entireState), nextState);
    }
    case Types.FINISH_RECORDING: {
      return Object.assign({}, initialState.recording);
    }
    case Types.CANCEL_RECORDING: {
      return Object.assign({}, initialState.recording);
    }
    case Types.START_RECORDING: {
      return u(
        {
          phase: RECORDING_PHASE.RECORD,
          afterWorld: u.constant(u({ id: WORLDS.AFTER }, nextState.beforeWorld)),
        },
        nextState,
      );
    }
    case Types.UPDATE_RECORDING_CONDITION: {
      const { actorId, key, values } = action;
      if ("enabled" in values && values.enabled === false) {
        return u({ conditions: { [actorId]: u.omit(key) } }, nextState);
      }
      return u({ conditions: { [actorId]: { [key]: u.constant(values) } } }, nextState);
    }
    case Types.UPDATE_RECORDING_ACTION_PREFS: {
      const { actorId, values } = action;
      return u(
        {
          prefs: {
            [actorId]: values,
          },
        },
        nextState,
      );
    }
    case Types.SET_RECORDING_EXTENT: {
      // find the primary actor, make sure the extent still includes it
      const extent = Object.assign({}, action.extent);
      for (const world of [nextState.beforeWorld, nextState.afterWorld]) {
        const stage = getCurrentStageForWorld(world);
        const mainActor = Object.values(stage!.actors || {}).find(
          (a) => a.id === nextState.actorId,
        );
        if (mainActor) {
          extent.xmin = Math.min(extent.xmin, mainActor.position.x);
          extent.ymin = Math.min(extent.ymin, mainActor.position.y);
          extent.xmax = Math.max(extent.xmax, mainActor.position.x);
          extent.ymax = Math.max(extent.ymax, mainActor.position.y);
        }
      }
      return u({ extent }, nextState);
    }
    case Types.TOGGLE_RECORDING_SQUARE_IGNORED: {
      const { x, y } = action.position;
      const { xmin, xmax, ymin, ymax } = nextState.extent;

      if (x < xmin || x > xmax || y < ymin || y > ymax) {
        return nextState;
      }
      const key = `${x},${y}`;
      const ignored = nextState.extent.ignored[key] ? u.omit(key) : { [key]: true };
      return u({ extent: { ignored } }, nextState);
    }
    default:
      return nextState;
  }
}
