import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter} from 'reactstrap';

import {MODALS} from '../../constants/constants';
import {selectStageIndex, dismissModal} from '../../actions/ui-actions';
import {createStage} from '../../actions/stage-actions';
import {getStageScreenshot} from '../../utils/stage-helpers';

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    stages: PropTypes.array,
    stageIndex: PropTypes.number,
    open: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);

    this._thumbnails = {};
  }
  
  _onSelectStage = (idx) => {
    this.props.dispatch(selectStageIndex(idx));
  }

  _onAddStage = () => {
    this.props.dispatch(createStage());
  }

  _onClose = () => {
    this.props.dispatch(dismissModal());
  }

  render() {
    const {stages, stageIndex} = this.props;

    return (
      <Modal isOpen={this.props.open} backdrop="static" toggle={() => {}}>
        <div className="modal-header" style={{display: 'flex'}}>
          <h4 style={{flex: 1}}>Stage Settings</h4>
        </div>
        <ModalBody>
          <div className="stage-list">
            {stages.map((s, idx) => 
              <div key={s.uid} className="stage-item" onClick={() => this._onSelectStage(idx)}>
                <img src={getStageScreenshot(s)} style={{background: s.background}} />
                <h3>{s.uid}</h3>  
              </div>
            )}
            <div key="add" className="stage-item" onClick={this._onAddStage}>
              +
              <h3>Add Stage</h3>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button key="cancel" onClick={this._onClose}>Cancel</Button>{' '}
          <Button color="primary" key="save" onClick={this._onCloseAndSave}>Save</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    stages: state.stages,
    stageIndex: state.ui.selectedStageIndex,
    open: state.ui.modal.openId === MODALS.STAGES,
  };
}

export default connect(
  mapStateToProps,
)(Container);
