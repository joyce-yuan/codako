import { CharacterActions } from "./characters-actions";
import { RecordingActions } from "./recording-actions";
import { StageActions } from "./stage-actions";
import { UIActions } from "./ui-actions";
import { WorldActions } from "./world-actions";

export type Actions = CharacterActions | RecordingActions | StageActions | UIActions | WorldActions;
