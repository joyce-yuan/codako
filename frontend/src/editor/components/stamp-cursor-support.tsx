import { defaultAppearanceId } from "./library";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { ActorTransform, Characters, EditorState, Stage } from "../../types";
import { TOOLS } from "../constants/constants";
import { getCurrentStage } from "../utils/selectors";
import { applyActorTransformToContext } from "../utils/stage-helpers";

/** All our normal cursors are done via css ala `tool-stamp`, `tool-record`.
 * The stamp cursor changes once you pick up a character. This adds a temporary
 * stylesheet to the page containing the cursor on-the-fly and then deletes it
 * when you exit the mode.
 */
export const StampCursorSupport = () => {
  const stage = useSelector<EditorState, Stage | null>((state) => getCurrentStage(state));
  const characters = useSelector<EditorState, Characters>((state) => state.characters);
  const { selectedToolId, stampToolItem } = useSelector<EditorState, EditorState["ui"]>(
    (state) => state.ui,
  );

  let customCursorImage: string | undefined = undefined;
  let customCursorTransform: ActorTransform = "none";

  if (selectedToolId == TOOLS.STAMP && stampToolItem) {
    if ("characterId" in stampToolItem) {
      const spritesheet = characters[stampToolItem.characterId]?.spritesheet;
      if (spritesheet) {
        customCursorImage = spritesheet.appearances[defaultAppearanceId(spritesheet)][0];
        customCursorTransform = "none";
      }
    } else if ("actorId" in stampToolItem && stampToolItem.actorId) {
      const actor = stage?.actors[stampToolItem.actorId];
      const spritesheet = actor && characters[actor.characterId]?.spritesheet;
      customCursorImage = actor && spritesheet && spritesheet.appearances[actor.appearance][0];
      customCursorTransform = actor?.transform ?? "none";
    }
  }

  const styleEl = useRef<HTMLStyleElement>(document.createElement("style"));

  useEffect(() => {
    if (customCursorImage) {
      // put a ltitle tick in the top left of the cursor image so it has an anchor point
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = customCursorImage;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.translate(Math.floor(img.width / 2), Math.floor(img.height / 2));
      applyActorTransformToContext(ctx, customCursorTransform);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      ctx.moveTo(0.5, 0.5);
      ctx.lineTo(0.5, 5.5);
      ctx.lineTo(5.5, 0.5);
      ctx.lineTo(0.5, 0.5);
      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
      const composited = canvas.toDataURL("image/png");
      document.body.append(styleEl.current);
      styleEl.current.textContent = `.tool-stamp { cursor: url(${composited}) 0 0, auto; }`;
    } else {
      styleEl.current.remove();
    }
  }, [customCursorImage, customCursorTransform]);

  return <span />;
};
