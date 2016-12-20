import React, {PropTypes} from 'react';

export default class TapToEditLabel extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.editing === false && this.state.editing === true) {
      this._el.focus();
      document.execCommand('selectAll', false, null);
    }
  }

  render() {
    const {value, onChange, className, ...props} = this.props;
    const {editing} = this.state;
    
    return (
      <div
        contentEditable={editing}
        ref={(el) => this._el = el}
        className={`tap-to-edit editing-${editing} ${className}`}
        dangerouslySetInnerHTML={{__html: value}}
        onChange={(e) => {
          onChange({target: {value: e.target.innerText}});
        }}
        onDoubleClick={(e) => {
          if (!editing) {
            this.setState({editing: true});
            e.stopPropagation();
            e.preventDefault();
          }
        }}  
        onKeyUp={(e) => {
          if (e.keyCode === 13) {
            e.target.blur();            
          }
        }}
        onBlur={(e) => {
          this.setState({editing: false});
          onChange({target: {value: e.target.innerText}});
        }}
        {...props}
      />
    );

  }
}
