import { TOOLS, WORLDS } from "./editor/constants/constants";

export type ImageData = string;

export type ActorPath = { worldId: string | null; stageId: string | null; actorId: string | null };

export type Position = {
  x: number;
  y: number;
};

export type PositionRelativeToWorld = {
  x: number;
  y: number;
};

export type PositionRelativeToRuleExtent = {
  x: number;
  y: number;
};

export type FrameInput = { keys: { [keyCode: string]: true }; clicks: { [actorId: string]: true } };

export type MathOperation = "add" | "set" | "subtract";

export type MathComparator = "=" | ">=" | "<=";

export type RuleAction =
  | {
      actorId: string;
      type: "appearance";
      to: string;
    }
  | {
      actorId: string;
      type: "variable";
      operation: MathOperation;
      variable: string; // ID
      value: number;
    }
  | {
      type: "global";
      operation: MathOperation;
      global: string; // ID
      value: number;
    }
  | {
      actorId: string;
      type: "delete";
    }
  | {
      actor: Actor;
      actorId: string;
      offset: PositionRelativeToRuleExtent;
      type: "create";
    }
  | {
      actorId: string;
      type: "move";
      delta: { x: number; y: number };
    }
  | {
      actorId: string;
      type: "transform";
      to: ActorTransform;
    };

export type ActorTransform = "none" | "flip-x" | "flip-xy";

export type RuleExtent = {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  ignored: Record<string, boolean>; // [`${x},${y}`];
};

export type RuleTreeEventItem = {
  type: "group-event";
  rules: RuleTreeItem[];
  event: "idle" | "key" | "click";
  code?: number; // used for key event
  id: string;
};

export type RuleTreeFlowItemBase = {
  type: "group-flow";
  name: string;
  rules: RuleTreeItem[];
  id: string;
};

export type RuleTreeFlowItemFirst = RuleTreeFlowItemBase & {
  behavior: "first";
};

export type RuleTreeFlowItemAll = RuleTreeFlowItemBase & {
  behavior: "all";
};

export type RuleTreeFlowItemRandom = RuleTreeFlowItemBase & {
  behavior: "random";
};

export type RuleTreeFlowLoopItem = RuleTreeFlowItemBase & {
  behavior: "loop";
  loopCount: { constant: number } | { variableId: string };
};

export type RuleTreeItem =
  | RuleTreeEventItem
  | RuleTreeFlowItemFirst
  | RuleTreeFlowItemRandom
  | RuleTreeFlowItemAll
  | RuleTreeFlowLoopItem
  | Rule;

export type RuleConditionV1 = {
  enabled: boolean;
  actorId?: string;
  variableId?: string;
  comparator?: MathComparator;
};

export type RuleConditionVariable = {
  enabled: boolean;
  type: "variable";
  variableId: string;
  comparator: MathComparator;
  value: {
    actorId?: string;
    variableId?: string;
  };
};

export type RuleConditionTransform = {
  enabled: boolean;
  type: "transform";
  comparator: "=";
  value: {
    actorId?: string;
    variableId?: string;
  };
};

export type RuleConditionAppearance = {
  enabled: boolean;
  type: "appearance";
  comparator: "=";
  value: {
    actorId?: string;
    variableId?: string;
  };
};

export type RuleCondition =
  | RuleConditionV1
  | RuleConditionVariable
  | RuleConditionTransform
  | RuleConditionAppearance;

export type RuleConditionGlobal = {
  globalId: string;
  comparator: MathComparator;
  value: { constant: number } | { actorId: string; variableId: string } | { globalId: string };
};

export type RuleConditions = {
  globals?: {
    [ruleId: string]: RuleConditionGlobal;
  };
} & {
  [actorIdInRule: string]: {
    [ruleId: string]: RuleCondition;
  };
};

export type Rule = {
  type: "rule";
  mainActorId: string;
  conditions: RuleConditions;
  actors: { [actorIdInRule: string]: Actor };
  actions: RuleAction[];
  extent: RuleExtent;
  id: string;
  name: string;
};

export type Actor = {
  id: string;
  characterId: string;
  variableValues: Record<string, number>;
  appearance: string;
  position: PositionRelativeToWorld;
  transform?: ActorTransform;
};

export type Stage = {
  id: string;
  order: number;
  name: string;
  actors: { [actorId: string]: Actor };
  background: ImageData;
  height: number;
  startThumbnail: ImageData;
  tutorial_name?: string;
  tutorial_step?: number;
  world?: string;
  width: number;
  wrapX: boolean;
  wrapY: boolean;
  startActors: { [actorId: string]: Actor };
};

export type Characters = { [id: string]: Character };

export type Character = {
  id: string;
  name: string;
  rules: RuleTreeItem[];
  spritesheet: {
    width: number;
    appearances: { [appearanceId: string]: ImageData[] };
    appearanceNames: { [appearanceId: string]: string };
  };
  variables: Record<
    string,
    {
      id: string;
      name: string;
      defaultValue: number;
    }
  >;
};

export type EvaluatedRuleIds = {
  [actorId: string]: {
    [ruleTreeItemId: string]: boolean;
  };
};

export type Global =
  | {
      id: string;
      name: string;
      value: number;
      type: "number";
    }
  | {
      id: "selectedStageId";
      name: "Current Stage";
      value: string;
      type: "stage";
    };

export type Globals = {
  selectedStageId: Global;
  [globalId: string]: Global;
};

export type HistoryItem = {
  input: FrameInput;
  globals: Globals;
  evaluatedRuleIds: EvaluatedRuleIds;
  stages: { [stageId: string]: Pick<Stage, "actors"> };
};

export type WorldMinimal = {
  id: WORLDS;
  stages: { [stageId: string]: Stage };
  globals: Globals;
  input: FrameInput;
  evaluatedRuleIds: EvaluatedRuleIds;
};

export type World = WorldMinimal & {
  history: HistoryItem[];
  metadata: {
    name: string;
    id: number;
  };
};

export type EditorState = {
  version: 1;
  characters: Characters;
  world: World;
  undoStack: [];
  redoStack: [];
  ui: {
    selectedToolId: TOOLS;
    selectedCharacterId: string | null;
    selectedActorPath: ActorPath;
    tutorial: {
      stepIndex: number;
    };
    playback: {
      speed: number;
      running: boolean;
    };
    keypicker: {
      characterId: string | null;
      initialKeyCode: string | null;
      ruleId: string | null;
    };
    paint: {
      characterId: string | null;
      appearanceId: string | null;
    };
    modal: {
      openId: string | null;
    };
  };
  recording: RecordingState;
};

export type Game = {
  name: string;
  id: number;
  userId: number;
  playCount: number;
  forkCount: number;
  forkParent: Game | null;
  user: {
    id: number;
    username: string;
  };
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  data: {
    world: World;
    characters: Characters;
  };
};

export type RecordingState = {
  phase: null;
  characterId: string | null;
  actorId: string | null;
  ruleId: string | null;
  conditions: RuleConditions;
  extent: RuleExtent;
  prefs: { [actorId: string]: { [key: string]: string } };
  beforeWorld: WorldMinimal & { id: WORLDS.BEFORE };
  afterWorld: WorldMinimal & { id: WORLDS.AFTER };
};
