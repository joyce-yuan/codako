import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Stage from './stage';
import StageControls from './stage-controls';
import StageRecordingControls from './stage-recording-controls';

class StageContainer extends React.Component {
  static propTypes = {

  };

  render() {
    const {selectedToolId, selectedActorId, characters, running, stage, recording, dispatch} = this.props;

    const baseStageProps = {selectedToolId, selectedActorId, characters, running, dispatch};
    let stageA = null;
    let stageB = null;
    let actions = null;
    let controls = null;

    console.log(recording);
    
    if (recording.characterId) {
      if (recording.phase === 'setup') {
        stageA = (
          <Stage key="before" {...baseStageProps} {...stage} recording={recording} />
        );
        controls = (
          <StageRecordingControls {...this.props.recording} dispatch={dispatch} />
        );
      } else if (recording.phase === 'record') {
        stageA = (
          <Stage key="before" {...baseStageProps} {...stage} recording={recording} />
        );
        stageB = (
          <Stage key="after" {...baseStageProps} {...stage} recording={recording} />
        );
        actions = (
          <div key="actions" className="actions" style={{height: 200}} />
        )
        controls = (
          <StageRecordingControls key="controls" {...this.props.recording} dispatch={dispatch} />
        );
      }
    } else {
      stageA = (
        <Stage key="before" {...baseStageProps} {...stage} recording={null} />
      );
      controls = (
        <StageControls {...this.props.playback} dispatch={dispatch} />
      );
    }

    return ( 
      <div className="panel stages">
        <div style={{display: 'flex'}}>
          {stageA}
          {stageB || <Stage key="after" style={{flex: 0}} />}
        </div>
        {actions || <div key="actions" className="actions" style={{height: 0}} />}
        {controls}
      </div>
    );
  }
}


function mapStateToProps(state) {
  return Object.assign({}, {
    stage: state.stage,
    selectedActorId: state.ui.selectedActorId,
    selectedToolId: state.ui.selectedToolId,
    running: state.ui.playback.running,
    recording: state.ui.recording,
    characters: state.characters,
  });
}

export default connect(
  mapStateToProps,
)(StageContainer);
