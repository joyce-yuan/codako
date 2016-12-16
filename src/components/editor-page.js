import React from 'react';
import Toolbar from './toolbar';
import StageContainer from './stage-container';
import Library from './library';
import InspectorContainer from './inspector/container';
import PaintContainer from './paint/container';
import KeypickerContainer from './keypicker/container';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/editor-root.scss';
import '../styles/font-awesome.min.css';

export default class EditorPage extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="editor">
        <Toolbar />
        <div className="stage-container">
          <StageContainer />
          <Library />
        </div>
        <InspectorContainer />

        <PaintContainer />
        <KeypickerContainer />
      </div>

    );
  }
}
