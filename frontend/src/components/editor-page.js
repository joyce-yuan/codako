import React, {PropTypes} from 'react';
import EditorRoot from '../editor/root';

export default class EditorPage extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      worldId: PropTypes.string,
    }),
  }

  static layoutConsiderations = {
    hidesNav: true,
    hidesFooter: true,
    unwrapped: true,
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <EditorRoot worldId={this.props.params.worldId} />
    );
  }
}
