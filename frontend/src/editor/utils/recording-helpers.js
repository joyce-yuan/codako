import {getVariableValue, pointIsOutside, createdActorsForRecording} from '../utils/stage-helpers';

export function defaultOperationForVariableChange(before, after) {
  if (after === before + 1) {
    return 'add';
  } else if (after === before - 1) {
    return 'subtract';
  }
  return 'set';
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

    const op = prefs[vkey] || defaultOperationForVariableChange(before, after);
    let value = null;
    if (op === 'add') {
      value = after - before;
    } else if (op === 'set') {
      value = after;
    } else if (op === 'subtract') {
      value = before - after;
    }
    actions.push({
      actorId: beforeActor.id,
      type: 'variable',
      operation: op,
      variable: vkey,
      value: value,
    });
  }
  return actions;
}


export function actionsForRecording({beforeStage, afterStage, extent, prefs}, {characters}) {
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
      actions.push(...actionsForVariables({beforeActor, afterActor, character, prefs: prefs[beforeActor.id] || {}}));
    } else {
      actions.push({
        actorId: beforeActor.id,
        type: 'delete',
      });
    }
  });

  createdActorsForRecording({beforeStage, afterStage, extent}).forEach((actor) => {
    actions.push({
      actorId: actor.id,
      type: 'create',
    });
    actions.push(...actionsForVariables({
      beforeActor: null,
      afterActor: actor,
      character: characters[actor.characterId],
      prefs: {},
    }));
  });
  
  return actions;
}

