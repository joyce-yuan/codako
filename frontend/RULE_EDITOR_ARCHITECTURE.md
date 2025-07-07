# Rule Editor Architecture

This document explains how the rule recording and editing system works in this application, based on research conducted during bug investigation. This serves as reference material for future debugging and development.

## Overview

The rule editor allows users to create game rules by recording actions on a stage. It works by capturing a "before" state, allowing the user to make changes, recording those changes as actions, and then simulating an "after" state to show the user what the rule will do.

## Core Components

### 1. Recording State (`RecordingState`)

Located in: `src/types.ts`

```typescript
export type RecordingState = {
  phase: RECORDING_PHASE;
  characterId: string | null;
  actorId: string | null;
  ruleId: string | null;
  actions: RuleAction[];
  conditions: RuleCondition[];
  extent: RuleExtent;
  beforeWorld: WorldMinimal & { id: WORLDS.BEFORE };
  afterWorld: WorldMinimal & { id: WORLDS.AFTER };
};
```

Key concepts:
- **beforeWorld**: Captures the initial game state when recording starts
- **afterWorld**: Shows the computed result after applying recorded actions
- **actions**: List of recorded actions (move, create, delete, variable changes, etc.)
- **extent**: Defines the spatial boundaries of the rule (which squares are included)

### 2. World States

The system uses three world states:
- **Main World**: The actual game world the user is editing
- **Before World**: A snapshot taken when recording starts (id: `WORLDS.BEFORE`)
- **After World**: A computed world showing the result of applying actions (id: `WORLDS.AFTER`)

### 3. Key Files and Functions

#### `src/editor/components/stage/recording/utils.tsx`

**`getAfterWorldForRecording(beforeWorld, characters, recording, actionSteps?)`**
- This is the core function that computes the "after" state
- Takes the `beforeWorld` and applies the first `actionSteps` actions to simulate the result
- Used by the UI to show progressive action effects
- **Critical Bug Pattern**: Be careful with the `actionSteps` parameter - when it's `0` (falsy), ensure proper slicing

**`ruleFromRecordingState(beforeStage, characters, recording)`**
- Converts the current recording session into a Rule object
- Handles coordinate transformations (main actor becomes 0,0 in the rule)
- Creates actor copies with relative positions

#### `src/editor/utils/world-operator.ts`

**`WorldOperator.resetForRule(rule, { offset, applyActions })`**
- Sets up a world state to match a rule's requirements
- When `applyActions: true`, it applies the rule's actions to simulate the result
- **Critical for before/after simulation**

**`WorldOperator.applyRule(rule, stageActorForId)`**
- Applies individual actions to actors
- **Mutation Warning**: This function directly mutates actor objects passed to it
- All mutations happen to the `actors` dictionary within WorldOperator scope

### 4. Action Rendering (`panel-actions.tsx`)

The actions panel shows each action with its effect:

```typescript
{actions.map((a, idx) => {
  afterStage = getCurrentStageForWorld(
    getAfterWorldForRecording(beforeWorld, characters, recording, idx),
  );

  const node = _renderAction(a, onChange);
  // ...
})}
```

**Critical Pattern**: Each action is rendered with an `afterStage` that shows the cumulative effect of actions 0 through `idx-1`. This allows users to see the progressive effect of each action.

## Data Flow

### Recording Initiation
1. User clicks "Record" on an actor
2. `setupRecordingForActor` creates initial `RecordingState`
3. `beforeWorld` captures current game state with `u({ id: WORLDS.BEFORE }, world)`
4. Recording extent is set around the selected actor

### Action Recording
1. User makes changes on stage (moves actors, changes variables, etc.)
2. Changes are detected by stage event handlers
3. Actions are created and added to `recording.actions` array
4. `afterWorld` is recomputed automatically via `recordingReducerWithDerivedState`

### Before/After Computation
1. `getAfterWorldForRecording` is called with the current `beforeWorld`
2. It creates a `Rule` object from the current recording state
3. It uses `WorldOperator.resetForRule` to apply the rule's actions
4. Returns the computed "after" world

### UI Rendering
1. Actions panel calls `getAfterWorldForRecording` for each action with `actionSteps = idx`
2. This shows the cumulative effect of actions 0 through idx-1
3. Each action is rendered with the appropriate before/after context

## Common Bug Patterns

### 1. Object Reference Sharing
**Problem**: If the same object references are shared between before/after worlds, mutations in one affect the other.

**Prevention**: Always use `deepClone` when creating objects that will be mutated. Be careful with `updeep`'s shallow copying.

### 2. Falsy Parameter Handling
**Problem**: Using `actionSteps ? array.slice(0, actionSteps) : array` fails when `actionSteps` is `0`.

**Solution**: Use `actionSteps !== undefined ? array.slice(0, actionSteps) : array`

### 3. Coordinate System Confusion
**Problem**: Rules use main-actor-relative coordinates (main actor at 0,0), but recording uses world coordinates.

**Understanding**: `ruleFromRecordingState` handles this transformation. The `offset` in `resetForRule` converts back to world coordinates.

### 4. Action Order Dependencies
**Problem**: Actions are applied sequentially, so later actions see the results of earlier ones.

**Understanding**: This is intentional - actions build on each other. The UI shows this with progressive `actionSteps`.

## Debugging Tips

### When Before/After States Are Identical
1. Check if `getAfterWorldForRecording` is properly cloning the `beforeWorld`
2. Verify the `actionSteps` parameter is being handled correctly (especially for `0`)
3. Ensure `WorldOperator.resetForRule` is creating new objects, not reusing references

### When Actions Don't Apply
1. Check if the rule's `extent` includes all necessary actors
2. Verify `checkRuleScenario` is finding the required actors
3. Ensure action objects have the correct structure and actor IDs

### When Mutations Appear in Wrong Places
1. Trace object references through the before/after computation
2. Check if `deepClone` is being used consistently
3. Look for direct mutations in `applyRule` or similar functions

## Rule Structure

Rules are stored with this coordinate system:
- Main actor is always at position (0, 0) within the rule
- Other actor positions are relative to the main actor
- Actions also use main-actor-relative coordinates
- The `extent` defines the bounding box around the main actor

This allows rules to be applied anywhere on the stage by translating coordinates appropriately.