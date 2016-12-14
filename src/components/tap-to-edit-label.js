import React, {PropTypes} from 'react';

export default class TapToEditLabel extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  _onChange = (event) => {
    const nextValue = event.target.innerText.trim();
    if (nextValue != this.props.value) {
      event.target = {value: nextValue.trim()};
      this.props.onChange(event);
    }
  }

  render() {
    const {value, ...props} = this.props;
    return (
      <div
        contentEditable
        onChange={this._onChange}
        onBlur={this._onChange}
        dangerouslySetInnerHTML={{__html: value}}
        {...props}
      />
  );
  }
}
