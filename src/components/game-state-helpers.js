import u from 'updeep';

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
}

export function applyRuleAction(actor, character, action) {
  if (action.type === 'move') {
    const [dx, dy] = action.delta.split(',').map(s => s / 1);
    return u({position: {x: actor.position.x + dx, y: actor.position.y + dy}}, actor);
  } else if (action.type === 'delete') {
    return undefined;
  } else if (action.type === 'appearance') {
    return u({appearance: action.to}, actor);
  } else if (action.type === 'variable') {
    const current = getVariableValue(actor, character, action.variable);
    const next = applyVariableOperation(current, action.operation, action.value);
    return u({variableValues: {[action.variable]: next}}, actor);
  } else {
    throw new Error("Not sure how to apply action", action);
  }
}

export function nameForKey(code) {
  if (code == 32) {
    return "Space Bar";
  }
  if (code == 38) {
    return "Up Arrow";
  }
  if (code == 37) {
    return "Left Arrow";
  }
  if (code == 39) {
    return "Right Arrow";
  }
  return String.fromEventKeyCode(code);
}
