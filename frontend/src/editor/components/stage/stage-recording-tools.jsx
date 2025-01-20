import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";

import classNames from "classnames";
import Button from "reactstrap/lib/Button";
import { selectToolId } from "../../actions/ui-actions";
import { TOOLS } from "../../constants/constants";

class StageRecordingTools extends React.Component {
  static propTypes = {
    selectedToolId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  render() {
    const { selectedToolId, dispatch } = this.props;
    const selected = selectedToolId === TOOLS.IGNORE_SQUARE;

    return (
      <Button
        className={classNames({
          "tool-ignored-square": true,
          selected: selected,
          enabled: true,
        })}
        onClick={() => dispatch(selectToolId(selected ? TOOLS.POINTER : TOOLS.IGNORE_SQUARE))}
      >
        <img src={new URL("../../img/ignored_square.png", import.meta.url).href} />
      </Button>
    );
  }
}

function mapStateToProps(state) {
  return state.ui;
}

export default connect(mapStateToProps)(StageRecordingTools);
