import React, {PropTypes} from 'react';
import {Button} from 'reactstrap';
import {createCharacterVariable} from '../../actions/characters-actions';

export default class VariablesAddButton extends React.Component {
  static propTypes = {
    character: PropTypes.object,
    actor: PropTypes.object,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  _onClick = () => {
    this.props.dispatch(createCharacterVariable(this.props.character.id));
  }

  render() {
    const {character} = this.props;

    return (
      <Button disabled={!character} onClick={this._onClick}>
        <i className="fa fa-inbox" /> Add
      </Button>
    );
  }}
