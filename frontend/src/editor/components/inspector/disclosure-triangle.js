import React, {PropTypes} from 'react';

export default class DisclosureTriangle extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    onClick: PropTypes.func,
  };

  _onClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.props.onClick(e);
  }

  render() {
    return (
      <div
        onClick={this._onClick}
        className={`triangle ${this.props.collapsed ? 'disclosed': ''}`}
      />
    );
  }
}
