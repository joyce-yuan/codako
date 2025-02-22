import { useState } from "react";

import ButtonDropdown from "reactstrap/lib/ButtonDropdown";
import DropdownItem from "reactstrap/lib/DropdownItem";
import DropdownMenu from "reactstrap/lib/DropdownMenu";
import DropdownToggle from "reactstrap/lib/DropdownToggle";

import { useDispatch } from "react-redux";
import { Actor, Character, RuleTreeEventItem } from "../../../types";
import {
  createCharacterEventContainer,
  createCharacterFlowContainer,
} from "../../actions/characters-actions";
import {
  setupRecordingForActor,
  setupRecordingForCharacter,
} from "../../actions/recording-actions";
import { pickCharacterRuleEventKey, selectToolId } from "../../actions/ui-actions";
import { TOOLS } from "../../constants/constants";

const RuleAddButton = ({
  character,
  isRecording,
  actor,
}: {
  character: Character;
  actor: Actor;
  isRecording: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const _onCreateRule = () => {
    if (actor) {
      dispatch(setupRecordingForActor({ characterId: character.id, actor }));
      dispatch(selectToolId(TOOLS.POINTER));
    } else {
      dispatch(setupRecordingForCharacter({ characterId: character.id }));
      dispatch(selectToolId(TOOLS.POINTER));
    }
  };

  const _onCreateFlowContainer = () => {
    const id = `${Date.now()}`;
    dispatch(createCharacterFlowContainer(character.id, { id }));
  };

  const _onCreateEventContainer = (
    eventType: RuleTreeEventItem["event"],
    eventCode: RuleTreeEventItem["code"] | null = null,
  ) => {
    const id = `${Date.now()}`;

    dispatch(
      createCharacterEventContainer(character.id, {
        id,
        eventType,
        eventCode: eventCode ? eventCode : undefined,
      }),
    );
    if (eventType === "key" && !eventCode) {
      dispatch(pickCharacterRuleEventKey(character.id, id, null));
    }
  };

  return (
    <ButtonDropdown
      isOpen={open}
      data-tutorial-id="inspector-add-rule"
      toggle={() => setOpen(!open)}
    >
      <DropdownToggle caret disabled={!character || isRecording}>
        <i className="fa fa-tasks" /> Add
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem onClick={_onCreateRule}>
          <span className="badge rule" /> Add New Rule
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={_onCreateFlowContainer}>
          <span className="badge rule-flow" /> Add Flow Container
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem
          data-tutorial-id="inspector-add-rule-key"
          onClick={() => _onCreateEventContainer("key")}
        >
          <span className="badge rule-event" /> When a Key is Pressed...
        </DropdownItem>
        <DropdownItem onClick={() => _onCreateEventContainer("click")}>
          <span className="badge rule-event" /> When I&#39;m Clicked...
        </DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>
  );
};

export default RuleAddButton;
