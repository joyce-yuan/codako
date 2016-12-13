import React from 'react';
import Toolbar from './toolbar';
import Stage from './stage';
import StageControls from './stage-controls';
import Library from './library';
import InspectorPanelContainer from './inspector-panel-container';
import PaintContainer from './paint/paint-container';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/editor-root.scss';

export default class EditorPage extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="editor">
        <Toolbar />
        <div className="stage-container">
          <div className="panel">
            <Stage />
            <StageControls />
          </div>
          <Library />
        </div>
        <InspectorPanelContainer />
        <PaintContainer />
      </div>

    );
  }
}
