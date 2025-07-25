import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import Button from "reactstrap/lib/Button";
import Modal from "reactstrap/lib/Modal";
import ModalBody from "reactstrap/lib/ModalBody";
import ModalFooter from "reactstrap/lib/ModalFooter";

import { upsertCharacter } from "../../actions/characters-actions";
import { pickCharacterRuleEventKey } from "../../actions/ui-actions";
import { findRule } from "../../utils/stage-helpers";
import { deepClone } from "../../utils/utils";
import Keyboard from "./keyboard";

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    characters: PropTypes.object,
    characterId: PropTypes.string,
    ruleId: PropTypes.string,
    initialKeyCode: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      keyCode: props.initialKeyCode,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ keyCode: nextProps.initialKeyCode });
  }

  _onClose = () => {
    this.props.dispatch(pickCharacterRuleEventKey(null));
  };

  _onCloseAndSave = () => {
    const { dispatch, characterId, ruleId, characters } = this.props;
    const rules = deepClone(characters[characterId].rules);

    if (!this.state.keyCode) {
      return window.alert(
        "Uhoh - press a key on your keyboard or choose one in the picture to continue.",
      );
    }

    const [rule] = findRule({ rules }, ruleId);
    rule.code = this.state.keyCode;

    dispatch(pickCharacterRuleEventKey(null));
    dispatch(upsertCharacter(characterId, { rules }));
  };

  _onKeyDown = (event) => {
    this.setState({ keyCode: event.keyCode });
    event.preventDefault();
  };

  render() {
    const { characterId } = this.props;

    return (
      <Modal
        isOpen={characterId !== null}
        backdrop="static"
        toggle={() => {}}
        style={{ maxWidth: 600, minWidth: 600 }}
      >
        <div className="modal-header" style={{ display: "flex" }}>
          <h4 style={{ flex: 1 }}>Choose Key</h4>
        </div>
        <ModalBody>
          {characterId !== null && (
            <Keyboard keyCode={this.state.keyCode} onKeyDown={this._onKeyDown} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={this._onClose}>Cancel</Button>{" "}
          <Button data-tutorial-id="keypicker-done" onClick={this._onCloseAndSave}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.ui.keypicker, {
    characters: state.characters,
  });
}

export default connect(mapStateToProps)(Container);
