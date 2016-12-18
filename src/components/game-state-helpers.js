import u from 'updeep';
import objectAssign from 'object-assign';

Object.values = function(obj) {
  const results = [];
  Object.keys(obj).forEach(r => results.push(obj[r]));
  return results;
};

export function pointIsOutside({x, y}, {xmin, xmax, ymin, ymax}) {
  return (x < xmin || x > xmax || y < ymin || y > ymax);
}

export function pointIsInside(...args) {
  return !pointIsOutside(...args);
}

export function buildActorsFromRule(rule, characters, {applyActions = false, offsetX = 0, offsetY = 0}) {
  const actors = {};
  
  for (const actor of Object.values(rule.actors)) {
    actors[actor.id] = objectAssign({}, actor, {
      position: {
        x: actor.position.x + offsetX,
        y: actor.position.y + offsetY,
      },
    });
  }

  // lay out the before state and apply any rules that apply to
  // the actors currently on the board
  if (applyActions && rule.actions) {
    for (const action of rule.actions) {
      if (action.type === 'create') {
        actors[action.actor.id] = objectAssign({}, action.actor, {
          variableValues: {},
          position: {
            x: action.offset.x + offsetX,
            y: action.offset.y + offsetY,
          },
        });
      } else {
        const {actorId, characterId} = action;
        actors[actorId] = applyRuleAction(actors[actorId], characters[characterId], action);
      }
    }
  }

  return actors;
}

export function getVariableValue(actor, character, id) {
  if (actor.variableValues[id]) {
    return actor.variableValues[id] / 1;
  }
  if (character.variableDefaults[id].value) {
    return character.variableDefaults[id].value / 1;
  }
  return null;
}

export function applyVariableOperation(existing, operation, value) {
  if (operation === 'add') {
    return existing / 1 + value / 1;
  }
  if (operation === 'subtract') {
    return existing / 1 - value / 1;
  }
  if (operation === 'set') {
    return value / 1;
  }

  throw new Error(`applyVariableOperation unknown operation ${operation}`);
}

export function applyRuleAction(actor, character, action) {
  if (action.type === 'move') {
    return u({position: {x: actor.position.x + action.delta.x, y: actor.position.y + action.delta.y}}, actor);
  } else if (action.type === 'delete') {
    return undefined;
  } else if (action.type === 'appearance') {
    return u({appearance: action.to}, actor);
  } else if (action.type === 'variable') {
    const current = getVariableValue(actor, character, action.variable);
    const next = applyVariableOperation(current, action.operation, action.value);
    return u({variableValues: {[action.variable]: next}}, actor);
  }
  throw new Error("Not sure how to apply action", action);
}

export function nameForKey(code) {
  if (!code) {
    return "";
  }
  return {
    9: 'Tab',
    13: 'Enter',
    32: "Space Bar",
    37: "Left Arrow",
    38: "Up Arrow",
    39: "Right Arrow",
    40: "Down Arrow",
    187: '+',
    189: '-',
    192: '`',
    188: '<',
    190: '>',
    191: '?',
    186: ',',
    222: '"',
    220: '\\',
    221: ']',
    219: '[',
  }[code] || String.fromCharCode(code);
}

export function findRule(node, id) {
  for (let idx = 0; idx < node.rules.length; idx ++) {
    const n = node.rules[idx];
    if (n.id === id) {
      return [n, node, idx];
    } else if (n.rules) {
      const rval = findRule(n, id);
      if (rval) {
        return rval;
      }
    }
  }
  return null;
}

export function actionsBetweenStages({beforeStage, afterStage, extent}) {
  if (!beforeStage.actors || !afterStage.actors) {
    return [];
  }

  const actions = [];

  Object.values(beforeStage.actors).forEach((beforeActor) => {
    if (pointIsOutside(beforeActor.position, extent)) {
      return;
    }
    const {x: bx, y: by} = beforeActor.position;
    const afterActor = afterStage.actors[beforeActor.id];
    if (afterActor) {
      const {x: ax, y: ay} = afterActor.position;
      if (ax !== bx || ay !== by) {
        actions.push({
          actorId: beforeActor.id,
          type: 'move',
          delta: {
            x: ax - bx,
            y: ay - by,
          },
        });
      }
      if (beforeActor.appearance !== afterActor.appearance) {
        actions.push({
          actorId: beforeActor.id,
          type: 'appearance',
          to: afterActor.appearance,
        });
      }
    } else {
      actions.push({
        actorId: beforeActor.id,
        type: 'delete',
      });
    }
  });

  // find created actors
  const beforeIds = Object.keys(beforeStage.actors);
  const afterIds = Object.keys(afterStage.actors);
  const createdIds = afterIds.filter(id => !beforeIds.includes(id));

  createdIds.forEach((id) => {
    const actor = afterStage.actors[id];
    if (pointIsOutside(actor.position, extent)) {
      return;
    }
    actions.push({
      actorId: actor.id,
      type: 'create',
    });
  });
  
  return actions;
}


export function StageOperator(stage) {
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
        const value = getVariableValue(actor, characters[actor.characterId], id);
        if ((condition.comparator === '=') && (value / 1 !== condition.value / 1)) {
          return false;
        }
        if ((condition.comparator === '>') && (value / 1 <= condition.value / 1)) {
          return false;
        }
        if ((condition.comparator === '<') && (value / 1 >= condition.value / 1)) {
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

  function ActorOperator(actor) {
    function tickRules(struct, behavior = 'first') {
      let rules = [].concat(struct.rules);

      if (behavior === 'random') {
        rules = rules.sort(() => Math.random());
      }

      for (const rule of rules) {
        if (tickRule(rule)) {
          stage.applied[rule.id] = true;
          stage.applied[struct.id] = true;
          if (behavior !== 'all') {
            break;
          }
        }
      }

      return stage.applied[struct.id];
    }

    function tickRule(rule) {
      if (rule.type === 'group-event') {
        if (checkEvent(rule)) {
          return tickRules(rule, 'first');
        }
      } else if (rule.type === 'group-flow') {
        return tickRules(rule, rule.behavior);
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
        return (stage.input.clicks[actor.id]);
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
          const stagePosition = {x: actor.position.x + x, y: actor.position.y + y};
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
        // pos = @stage.wrappedPosition(pos) if @stage

        if (action.type === 'create') {
          // actor = @stage.addActor(descriptor, pos)
          // actor._id = Math.createUUID() unless rule.editing
        } else {
          // find the actor on the stage that matches
          const ruleActor = rule.actors[action.actorId];
          const ruleActorConditions = rule.conditions[action.actorId];

          const stagePosition = {
            x: actor.position.x + ruleActor.position.x,
            y: actor.position.y + ruleActor.position.y,
          };
          const stageCandidates = actorsAtPosition(stagePosition);
          if (!stageCandidates) {
            throw new Error(`Couldn't apply action because the position is not valid.`);
          }
          const stageActor = stageCandidates.find(a => actorsMatch(a, ruleActor, ruleActorConditions));
          if (!stageActor) {
            throw new Error(`Couldn't find the actor for performing rule: ${rule}`);
          }
          stage.actors[stageActor.id] = applyRuleAction(stageActor, characters[stageActor.characterId], action);
        }
      }
    }

    return {
      tick() {
        tickRules(characters[actor.characterId]);
      }
    };
  }

  return {
    tick() {
      stage.applied = {};
      Object.values(stage.actors).forEach(actor =>
        ActorOperator(actor).tick()
      );
      stage.input = {
        keys: {},
        clicks: {},
      };
    }
  };
}
