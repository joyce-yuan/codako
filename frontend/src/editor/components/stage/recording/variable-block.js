import React, {PropTypes} from 'react';

export default class VariableBlock extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    variableId: PropTypes.string,
  }

  render() {
    const {variableId, character} = this.props;
    return (
      <code>{character.variables[variableId].name}</code>
    );
  }
}