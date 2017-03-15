import {getVariableValue, pointIsOutside, pointIsInside} from '../utils/stage-helpers';
import {getCurrentStageForWorld} from '../utils/selectors';

export function defaultOperationForValueChange(before, after) {
  if (after === before + 1) {
    return 'add';
  } else if (after === before - 1) {
    return 'subtract';
  }
  return 'set';
}

function operandForValueChange(before, after, op) {
  if (op === 'add') {
    return after - before;
  } else if (op === 'set') {
    return after;
  } else if (op === 'subtract') {
    return before - after;
  }
  throw new Error("Unknown op");
}

export function extentIgnoredPositions(extent) {
  return Object.keys(extent.ignored).map(k => {
    const coords = k.split(',').map(v => v / 1);
    if (coords.length !== 2) {
      throw new Error(`${k} is not in X,Y form`);
    }
    return {x: coords[0], y: coords[1]};
  });
}

export function extentByShiftingExtent(extent, d) {
  const ignored = {};
  extentIgnoredPositions(extent).forEach(({x, y}) => {
    ignored[`${x + d.x},${y + d.y}`] = true;
  });

  return {
    xmin: extent.xmin + d.x,
    xmax: extent.xmax + d.x,
    ymin: extent.ymin + d.y,
    ymax: extent.ymax + d.y,
    ignored: ignored,
  };
}


export function actionsForVariables({beforeActor, afterActor, character, prefs}) {
  const actions = [];
  for (const vkey of Object.keys(character.variables)) {
    const before = beforeActor ? getVariableValue(beforeActor, character, vkey) : undefined;
    const after = getVariableValue(afterActor, character, vkey);
    if (before === after) {
      continue;
    }

    const op = prefs[vkey] || defaultOperationForValueChange(before, after);

    actions.push({
      actorId: beforeActor.id,
      type: 'variable',
      operation: op,
      variable: vkey,
      value: operandForValueChange(before, after, op),
    });
  }
  return actions;
}

export function actionsForGlobals({beforeGlobals, afterGlobals, prefs}) {
  const actions = [];
  for (const gkey of Object.keys(beforeGlobals)) {
    const before = beforeGlobals[gkey].value;
    const after = afterGlobals[gkey].value;
    if (before === after) {
      continue;
    }

    const op = prefs[gkey] || defaultOperationForValueChange(before, after);

    actions.push({
      type: 'global',
      operation: op,
      global: gkey,
      value: operandForValueChange(before, after, op),
    });
  }
  return actions;
}


export function actionsForRecording({beforeWorld, afterWorld, extent, prefs, actorId}, {characters}) {
  const beforeStage = getCurrentStageForWorld(beforeWorld);
  const afterStage = getCurrentStageForWorld(afterWorld);
  
  if (!beforeStage.actors || !afterStage.actors) {
    return [];
  }

  const beforeMainActor = beforeStage.actors[actorId];
  if (!beforeMainActor) {
    throw new Error("Could not find main actor");
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
      actions.push(...actionsForVariables({beforeActor, afterActor, character, prefs: prefs[beforeActor.id] || {}}));
    } else {
      actions.push({
        actorId: beforeActor.id,
        type: 'delete',
      });
    }
  });

  createdActorsForRecording({beforeWorld, afterWorld, extent}).forEach((actor) => {
    actions.push({
      actor: actor,
      actorId: actor.id,
      type: 'create',
      offset: {x: actor.position.x - beforeMainActor.position.x, y: actor.position.y - beforeMainActor.position.y},
    });
    actions.push(...actionsForVariables({
      beforeActor: null,
      afterActor: actor,
      character: characters[actor.characterId],
      prefs: {},
    }));
  });
  
  actions.push(...actionsForGlobals({
    beforeGlobals: beforeWorld.globals,
    afterGlobals: afterWorld.globals,
    prefs: prefs['globals'] || {},
  }));

  return actions;
}


export function createdActorsForRecording({beforeWorld, afterWorld, extent}) {
  const beforeStage = getCurrentStageForWorld(beforeWorld);
  const afterStage = getCurrentStageForWorld(afterWorld);

  const beforeIds = Object.keys(beforeStage.actors);
  const afterIds = Object.keys(afterStage.actors);
  const createdIds = afterIds.filter(id => !beforeIds.includes(id));

  return createdIds.map((id) => afterStage.actors[id]).filter(a => 
    pointIsInside(a.position, extent)
  );
}