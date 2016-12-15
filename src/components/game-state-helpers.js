import u from 'updeep';

Object.values = function(obj) {
  const results = [];
  Object.keys(obj).forEach(r => results.push(obj[r]));
  return results;
};

// state required to evaluate rule
// - actor position, appearance, etc.
// - character rules
// - entire stage
// - accumulated click events, key events
// set:
// - actor position, appearnce, etc.
// - create new actors

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
  }
  throw new Error("Not sure how to apply action", action);
}

export function nameForKey(code) {
  if (code === 32) {
    return "Space Bar";
  }
  if (code === 38) {
    return "Up Arrow";
  }
  if (code === 37) {
    return "Left Arrow";
  }
  if (code === 39) {
    return "Right Arrow";
  }
  return String.fromEventKeyCode(code);
}


export function StageOperator(stage) {
  const {characters} = window.store.getState();

  function actorMatchesDescriptor(actor, descriptor) {
    if (descriptor.characterId !== actor.characterId) {
      return false;
    }
    if (!descriptor.appearance_ignored && (actor.appearance !== descriptor.appearance)) {
      return false;
    }

    if (descriptor.variableConstraints) {
      for (const id of Object.keys(descriptor.variableConstraints)) {
        const constraint = descriptor.variableConstraints[id];
        if (constraint.ignored === true) {
          continue;
        }
        const value = getVariableValue(actor, characters[actor.characterId], id);
        if ((constraint.comparator === '=') && (value / 1 !== constraint.value / 1)) {
          return false;
        }
        if ((constraint.comparator === '>') && (value / 1 <= constraint.value / 1)) {
          return false;
        }
        if ((constraint.comparator === '<') && (value / 1 >= constraint.value / 1)) {
          return false;
        }
      }
    }
    return true;
  }

  function actorsAtPositionMatchDescriptors(position, descriptors) {
    const searchSet = actorsAtPosition(position);
    if (searchSet === null) {
      return null;
    }
    // if the descriptor is empty and no actors are present, we've got a match
    if (searchSet.length === 0 && (!descriptors || descriptors.length === 0)) {
      return true;
    }

    // if we don't have a descriptor for each item in the search set, no match
    if (searchSet.length !== descriptors.length) {
      return false;
    }

    // make sure the descriptors and actors all match
    return searchSet.every(searchSetActor =>
      descriptors.some(descriptor =>
        actorMatchesDescriptor(searchSetActor, descriptor)
      )
    );
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
        if (stage.input.keys.includes(trigger.code)) {
          return true;
        }
      }
      if (trigger.event === 'click') {
        return this.clickedInCurrentFrame;
      }
      if (trigger.event === 'idle') {
        return true;
      }
      return false;
    }

    function checkRuleScenario(rule) {
      for (const block of rule.scenario) {
        const [px, py] = block.coord.split(',').map(s => s / 1);
        const pos = {x: actor.position.x + px, y: actor.position.y + py};
        const descriptors = block.refs.map(ref => rule.descriptors[ref]);

        if (!actorsAtPositionMatchDescriptors(pos, descriptors)) {
          return false;
        }
      }
      return true;
    }

    function applyRule(rule) {
      // cache actors once they're found
      const actorsForRefs = {};

      for (const action of rule.actions) {
        const descriptor = rule.descriptors[action.ref];
        const scenarioBlock = rule.scenario.find(b => b.refs.includes(action.ref));
        const offset = action.offset || (scenarioBlock ? scenarioBlock.coord : null);

        const [ox, oy] = offset.split(',').map(s => s / 1);
        const pos = {x: actor.position.x + ox, y: actor.position.y + oy};
        // pos = @stage.wrappedPosition(pos) if @stage

        if (action.type === 'create') {
          // actor = @stage.addActor(descriptor, pos)
          // actor._id = Math.createUUID() unless rule.editing
        } else {
          const candidateActors = actorsAtPosition(pos);
          const actionActor = candidateActors.find(a => actorMatchesDescriptor(a, descriptor));
          if (!actionActor) {
            throw new Error(`Couldn't find the actor for performing rule: ${rule}`);
          }
          actorsForRefs[action.ref] = actionActor;
          stage.actors[actionActor.id] = applyRuleAction(actionActor, characters[actionActor.characterId], action);
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
    }
  };
}
