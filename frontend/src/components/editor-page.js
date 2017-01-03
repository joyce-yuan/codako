import React, {PropTypes} from 'react';
import EditorRoot from '../editor/root';

export default class EditorPage extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      stageId: PropTypes.string,
    }),
  }

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <EditorRoot stageId={this.props.params.stageId} />
    );
  }
}
