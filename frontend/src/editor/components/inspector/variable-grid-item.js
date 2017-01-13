import React, {PropTypes} from 'react';
import TapToEditLabel from '../tap-to-edit-label';

export default class VariableGridItem extends React.Component {
  static propTypes = {
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
  
  render() {
    const {value, definition, onChangeDefinition, onChangeValue, onBlurValue, onClick} = this.props;
    const disabled = this.context.selectedToolId === 'trash';

    return (
      <div
        className={`variable-box variable-set-${value !== undefined}`}
        onClick={(e) => onClick(definition.id, e)}
      >
        <TapToEditLabel
          className="name"
          value={definition.name}
          onChange={disabled ? null : (e) => onChangeDefinition(definition.id, {name: e.target.value})}
        />
        <input
          disabled={disabled}
          className="value"
          value={(value !== undefined) ? value : definition.defaultValue}
          onChange={(e) => onChangeValue(definition.id, e.target.value)}
          onBlur={(e) => onBlurValue(definition.id, e.target.value)}
        />
      </div>
    );
  }
}
