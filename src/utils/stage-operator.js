import {applyRuleAction, shuffleArray, getVariableValue} from './stage-helpers';
import {FLOW_BEHAVIORS, CONTAINER_TYPES} from '../constants/constants';

export default function StageOperator(stage) {
  const {characters} = window.store.getState();

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
    // const position = @wrappedPosition(position)
    if (position.x < 0 || position.y < 0 || position.x >= stage.width || position.y >= stage.height) {
      return null;
    }
    return Object.values(stage.actors).filter((a) =>
      a.position.x === position.x && a.position.y === position.y
    );
  }

  function ActorOperator(actorId) {
    function tickRulesTree(struct, behavior = FLOW_BEHAVIORS.FIRST) {
      let rules = [].concat(struct.rules);

      if (behavior === FLOW_BEHAVIORS.RANDOM) {
        rules = shuffleArray(rules);
      }

      for (const rule of rules) {
        if (tickRule(rule)) {
          stage.applied[rule.id] = true;
          stage.applied[struct.id] = true;
          if (behavior !== FLOW_BEHAVIORS.ALL) {
            break;
          }
        }
      }

      return stage.applied[struct.id];
    }

    function tickRule(rule) {
      if ((rule.type === CONTAINER_TYPES.EVENT) && checkEvent(rule)) {
        return tickRulesTree(rule, FLOW_BEHAVIORS.FIRST);
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
        return (stage.input.clicks[actorId]);
      }
      if (trigger.event === 'idle') {
        return true;
      }
      throw new Error(`Unknown trigger event: ${trigger.event}`);
    }

    function checkRuleScenario(rule) {
      const rootActor = stage.actors[actorId];
      
      for (let x = rule.extent.xmin; x <= rule.extent.xmax; x ++) {
        for (let y = rule.extent.ymin; y <= rule.extent.ymax; y ++) {
          if (rule.extent.ignored.includes(`${x},${y}`)) {
            continue;
          }
          const ruleActors = Object.values(rule.actors).filter(({position}) => position.x === x && position.y === y);
          const stagePosition = {x: rootActor.position.x + x, y: rootActor.position.y + y};
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
        const rootActor = stage.actors[actorId];
        // pos = @stage.wrappedPosition(pos) if @stage

        if (action.type === 'create') {
          // actor = @stage.addActor(descriptor, pos)
          // actor._id = Math.createUUID() unless rule.editing
        } else {
          // find the actor on the stage that matches
          const actionActor = rule.actors[action.actorId];
          const actionActorConditions = rule.conditions[action.actorId];

          const stagePosition = {
            x: rootActor.position.x + actionActor.position.x,
            y: rootActor.position.y + actionActor.position.y,
          };
          const stageCandidates = actorsAtPosition(stagePosition);
          if (!stageCandidates) {
            throw new Error(`Couldn't apply action because the position is not valid.`);
          }
          const stageActor = stageCandidates.find(a => actorsMatch(a, actionActor, actionActorConditions));
          if (!stageActor) {
            throw new Error(`Couldn't find the actor for performing rule: ${rule}`);
          }
          stage.actors[stageActor.id] = applyRuleAction(stageActor, characters[stageActor.characterId], action);
        }
      }
    }

    return {
      tick() {
        const {characterId} = stage.actors[actorId];
        tickRulesTree(characters[characterId]);
      }
    };
  }

  return {
    tick() {
      stage.applied = {};
      Object.keys(stage.actors).forEach(actorId =>
        ActorOperator(actorId).tick()
      );
      stage.input = {
        keys: {},
        clicks: {},
      };
    }
  };
}
