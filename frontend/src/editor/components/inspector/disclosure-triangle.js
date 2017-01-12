import React, {PropTypes} from 'react';

export default class DisclosureTriangle extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    onClick: PropTypes.func,
  };

  render() {
    return (
      <div
        onClick={this.props.onClick}
        className={`triangle ${this.props.collapsed ? 'disclosed': ''}`}
      />
    );
  }
}
