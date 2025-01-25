import PropTypes from "prop-types";
import React from "react";
import TapToEditLabel from "../tap-to-edit-label";
import ConnectedStagePicker from "./connected-stage-picker";

export default class VariableGridItem extends React.Component {
  static propTypes = {
    actorId: PropTypes.string,
    draggable: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    definition: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      defaultValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),

    onChangeValue: PropTypes.func,
    onChangeDefinition: PropTypes.func,
    onBlurValue: PropTypes.func,
    onClick: PropTypes.func,
  };

  static contextTypes = {
    selectedToolId: PropTypes.string,
  };

  _onDragStart = (event) => {
    const { value, definition } = this.props;
    const displayValue = value !== undefined ? value : definition.defaultValue;

    event.dataTransfer.dropEffect = "copy";
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "variable",
      JSON.stringify(
        this.props.actorId
          ? {
              type: "variable",
              actorId: this.props.actorId,
              variableId: this.props.definition.id,
              value: { constant: displayValue || 0 },
            }
          : {
              type: "variable",
              globalId: this.props.definition.id,
              value: { constant: displayValue || 0 },
            },
      ),
    );
    event.dataTransfer.setData("variable-type:variable", "true");
  };

  render() {
    const {
      value,
      actorId,
      definition,
      draggable,
      onChangeDefinition,
      onChangeValue,
      onBlurValue,
      onClick,
    } = this.props;
    const displayValue = value !== undefined ? value : definition.defaultValue;
    const disabled = this.context.selectedToolId === "trash";

    let content = null;

    if (definition.type === "number") {
      if (disabled) {
        content = <div className="value">{displayValue}</div>;
      } else {
        content = (
          <input
            className="value"
            value={displayValue}
            onChange={(e) => onChangeValue(definition.id, e.target.value)}
            onDoubleClick={(e) => e.currentTarget.select()}
            onBlur={(e) => onBlurValue(definition.id, e.target.value)}
          />
        );
      }
    } else if (definition.type === "stage") {
      content = (
        <ConnectedStagePicker
          value={displayValue}
          disabled={disabled}
          onChange={(e) => onChangeValue(definition.id, e.target.value)}
        />
      );
    }

    return (
      <div
        className={`variable-box draggable-${draggable} variable-set-${value !== undefined}`}
        onClick={(e) => onClick(definition.id, e)}
        draggable={draggable}
        onDragStart={this._onDragStart}
      >
        <TapToEditLabel
          className="name"
          value={definition.name}
          onChange={
            disabled || definition.type === "stage"
              ? null
              : (e) => onChangeDefinition(definition.id, { name: e.target.value })
          }
        />
        {content}
      </div>
    );
  }
}
