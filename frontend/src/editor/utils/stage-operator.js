import objectAssign from 'object-assign';
import {shuffleArray, getVariableValue, applyVariableOperation, pointByAdding} from './stage-helpers';
import {FLOW_BEHAVIORS, CONTAINER_TYPES} from '../constants/constants';

/*
Note: StageOperator and ActorOperator mutate the state you provide them. Clone
the entire stage before passing it in if you need to have a copy. It's just
too much of a pain to do all of the possible state changes with updeep, etc.
 */

export default function StageOperator(stage) {
  const {characters} = window.editorStore.getState();

  function wrappedPosition({x, y}) {
    const o = {
      x: stage.wrapX ? ((x + stage.width) % stage.width) : x,
      y: stage.wrapY ? ((y + stage.height) % stage.height) : y,
    };
    if (o.x < 0 || o.y < 0 || o.x >= stage.width || o.y >= stage.height) {
      return null;
    }
    return o;
  }

  function actorsMatch(actor, other, conditions = {}) {
    if (other.characterId !== actor.characterId) {
      return false;
    }

    for (const id of Object.keys(conditions)) {
      const condition = conditions[id];
      if (!condition.enabled) {
        continue;
      }

      if (id === 'appearance') {
        if (actor.appearance !== other.appearance) {
          return false;
        }
      } else {
        const actorValue = getVariableValue(actor, characters[actor.characterId], id);
        const otherValue = getVariableValue(other, characters[actor.characterId], id);

        if ((condition.comparator === '=') && (actorValue / 1 !== otherValue.value / 1)) {
          return false;
        }
        if ((condition.comparator === '>') && (actorValue / 1 <= otherValue.value / 1)) {
          return false;
        }
        if ((condition.comparator === '<') && (actorValue / 1 >= otherValue.value / 1)) {
          return false;
        }
      }
    }
    return true;
  }

  function actorsAtPosition(position) {
    if (!position) {
      return null;
    }
    return Object.values(stage.actors).filter((a) =>
      a.position.x === position.x && a.position.y === position.y
    );
  }

  function ActorOperator(me) {
    function tickRulesTree(struct, behavior = FLOW_BEHAVIORS.FIRST) {
      let rules = [].concat(struct.rules);

      if (behavior === FLOW_BEHAVIORS.RANDOM) {
        rules = shuffleArray(rules);
      }

      for (const rule of rules) {
        const applied = tickRule(rule);
        stage.evaluatedRuleIds[rule.id] = applied;
        stage.evaluatedRuleIds[struct.id] = applied;
        if (applied && behavior !== FLOW_BEHAVIORS.ALL) {
          break;
        }
      }

      return stage.evaluatedRuleIds[struct.id];
    }

    function tickRule(rule) {
      if (rule.type === CONTAINER_TYPES.EVENT) {
        return checkEvent(rule) && tickRulesTree(rule, FLOW_BEHAVIORS.FIRST);
      } else if (rule.type === CONTAINER_TYPES.FLOW) {
        return tickRulesTree(rule, rule.behavior);
      } else if (checkRuleScenario(rule)) {
        applyRule(rule);
        return true;
      }
      return false;
    }

    function checkEvent(trigger) {
      if (trigger.event === 'key') {
        return (stage.input.keys[trigger.code]);
      }
      if (trigger.event === 'click') {
        return (stage.input.clicks[me.id]);
      }
      if (trigger.event === 'idle') {
        return true;
      }
      throw new Error(`Unknown trigger event: ${trigger.event}`);
    }

    function checkRuleScenario(rule) {
      for (let x = rule.extent.xmin; x <= rule.extent.xmax; x ++) {
        for (let y = rule.extent.ymin; y <= rule.extent.ymax; y ++) {
          if (rule.extent.ignored.includes(`${x},${y}`)) {
            continue;
          }
          const ruleActors = Object.values(rule.actors).filter(({position}) => position.x === x && position.y === y);
          const stagePosition = wrappedPosition(pointByAdding(me.position, {x, y}));
          const stageActors = actorsAtPosition(stagePosition);

          if (stageActors === null) {
            return false; // offscreen?
          }

          // if we don't have a descriptor for each item in the search set, no match
          if (stageActors.length !== ruleActors.length) {
            return false;
          }

          // make sure the descriptors and actors all match, one to one
          const stageRemaining = [].concat(stageActors);
          const ruleRemaining = [].concat(ruleActors);
          for (const s of stageRemaining) {
            const idx = ruleRemaining.findIndex(r => actorsMatch(s, r, rule.conditions[r.id]));
            if (idx === -1) {
              return false;
            }
            ruleRemaining.splice(idx, 1);
          }
        }
      }
      return true;
    }

    function applyRule(rule) {
      for (const action of rule.actions) {
        if (action.type === 'create') {
          const nextID = Date.now();
          stage.actors[nextID] = objectAssign({}, action.actor, {
            id: nextID,
            position: wrappedPosition(pointByAdding(me.position, action.offset)),
            variableValues: {},
          });
        } else {
          // find the actor on the stage that matches
          const actionActor = rule.actors[action.actorId];
          const actionActorConditions = rule.conditions[action.actorId];

          const stagePosition = wrappedPosition(pointByAdding(me.position, actionActor.position));
          const stageCandidates = actorsAtPosition(stagePosition);
          if (!stageCandidates) {
            throw new Error(`Couldn't apply action because the position is not valid.`);
          }
          const stageActor = stageCandidates.find(a => actorsMatch(a, actionActor, actionActorConditions));
          if (!stageActor) {
            throw new Error(`Couldn't find the actor for performing rule: ${rule}`);
          }

          if (action.type === 'move') {
            stageActor.position = wrappedPosition(pointByAdding(stageActor.position, action.delta));
          } else if (action.type === 'delete') {
            delete stage.actors[stageActor.id];
          } else if (action.type === 'appearance') {
            stageActor.appearance = action.to;
          } else if (action.type === 'variable') {
            const current = getVariableValue(stageActor, characters[stageActor.characterId], action.variable);
            const next = applyVariableOperation(current, action.operation, action.value);
            stageActor.variableValues[action.variable] = next;
          } else {
            throw new Error("Not sure how to apply action", action);
          }
        }
      }
    }

    return {
      applyRule,
      tick() {
        const {characterId} = stage.actors[me.id];
        const struct = characters[characterId];
        tickRulesTree(struct);
      }
    };
  }

  function resetForRule(rule, {uid, applyActions, offset}) {
    stage.uid = uid;
    stage.actors = {};
    for (const actor of Object.values(rule.actors)) {
      stage.actors[actor.id] = objectAssign({}, actor, {
        position: pointByAdding(actor.position, offset),
      });
    }

    // lay out the before state and apply any rules that apply to
    // the actors currently on the board
    if (applyActions && rule.actions) {
      ActorOperator(stage.actors[rule.mainActorId]).applyRule(rule);
    }
  }

  return {
    resetForRule,
    tick() {
      stage.evaluatedRuleIds = {};
      Object.values(stage.actors).forEach(actor =>
        ActorOperator(actor).tick()
      );
      stage.input = {
        keys: {},
        clicks: {},
      };
    },
  };
}
