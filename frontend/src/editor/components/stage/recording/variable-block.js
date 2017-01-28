import React, {PropTypes} from 'react';

export default class VariableBlock extends React.Component {
  static propTypes = {
    name: PropTypes.string,
  }

  render() {
    const {name} = this.props;
    return (
      <code>{name}</code>
    );
  }
}