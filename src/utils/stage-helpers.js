import u from 'updeep';
import objectAssign from 'object-assign';

export function pointIsOutside({x, y}, {xmin, xmax, ymin, ymax}) {
  return (x < xmin || x > xmax || y < ymin || y > ymax);
}

export function pointIsInside(...args) {
  return !pointIsOutside(...args);
}

export function shuffleArray(d) {
  for (let c = d.length - 1; c > 0; c--) {
    const b = Math.floor(Math.random() * (c + 1));
    const a = d[c];
    d[c] = d[b];
    d[b] = a;
  }
  return d;
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
  if (character.variables[id].value) {
    return character.variables[id].value / 1;
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

export function actionsForVariables({beforeActor, afterActor, character}) {
  if (!afterActor) {
    return [];
  }

  const actions = [];
  for (const vkey of Object.keys(character.variables)) {
    const before = beforeActor ? getVariableValue(beforeActor, character, vkey) : undefined;
    const after = getVariableValue(afterActor, character, vkey);
    let [op, value] = [null, null];

    if (after === before + 1) {
      [op, value] = ['add', 1];
    } else if (after > before) {
      [op, value] = ['set', after - before];
    } else if (after < before) {
      [op, value] = ['subtract', before - after];
    }
    if (op) {
      actions.push({
        actorId: beforeActor.id,
        type: 'variable',
        operation: op,
        variable: vkey,
        value: value,
      });
    }
  }
  return actions;
}

export function createdActorsForRecording({beforeStage, afterStage, extent}) {
  const beforeIds = Object.keys(beforeStage.actors);
  const afterIds = Object.keys(afterStage.actors);
  const createdIds = afterIds.filter(id => !beforeIds.includes(id));

  return createdIds.map((id) => afterStage.actors[id]).filter(a => 
    pointIsInside(a.position, extent)
  );
}

export function actionsForRecording({characters, beforeStage, afterStage, extent}) {
  if (!beforeStage.actors || !afterStage.actors) {
    return [];
  }

  const actions = [];

  Object.values(beforeStage.actors).forEach((beforeActor) => {
    if (pointIsOutside(beforeActor.position, extent)) {
      return;
    }
    const {x: bx, y: by} = beforeActor.position;
    const character = characters[beforeActor.characterId];
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
      actions.push(...actionsForVariables({beforeActor, afterActor, character}));
    } else {
      actions.push({
        actorId: beforeActor.id,
        type: 'delete',
      });
    }
  });

  createdActorsForRecording({beforeStage, afterStage, extent}).forEach((actor) => {
    const character = characters[actor.characterId];
    actions.push({
      actorId: actor.id,
      type: 'create',
    });
    actions.push(...actionsForVariables({
      beforeActor: null,
      afterActor: actor,
      character,
    }));
  });
  
  return actions;
}