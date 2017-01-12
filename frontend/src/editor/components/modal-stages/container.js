import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter} from 'reactstrap';

import StageSettings from './settings';
import {MODALS} from '../../constants/constants';
import {selectStageId, dismissModal} from '../../actions/ui-actions';
import {createStage, deleteStageId, updateStageSettings} from '../../actions/stage-actions';
import {getStageScreenshot} from '../../utils/stage-helpers';

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    stagesArray: PropTypes.array,
    stage: PropTypes.object,
    open: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    this._scrollToSelectedStage();
  }

  componentDidUpdate() {
    window.requestAnimationFrame(() => {
      this._scrollToSelectedStage();
    });
  }
  
  _scrollToSelectedStage() {
    const item = this._listEl.querySelector(`[data-stage-id="${this.props.stage.id}"]`);
    if (item) {
      if ((item.offsetTop > this._listEl.scrollTop + this._listEl.clientHeight - item.clientHeight) || (item.offsetTop < this._listEl.scrollTop)) {
        item.scrollIntoView();
      }
    }
  }

  _onSelectStage = (id) => {
    this.props.dispatch(selectStageId(id));
  }

  _onAddStage = () => {
    this.props.dispatch(createStage());
  }

  _onRemoveStage = () => {
    const {stagesArray, stage, dispatch} = this.props;

    if (stage && stagesArray.length > 1) {
      const selectedIdx = stagesArray.findIndex(s => s.id === stage.id);
      const nextId = stagesArray[selectedIdx === 0 ? selectedIdx + 1 : selectedIdx - 1].id;

      dispatch(selectStageId(nextId));
      dispatch(deleteStageId(stage.id));
    }
  }

  _onClose = () => {
    this.props.dispatch(dismissModal());
  }

  render() {
    const {dispatch, stagesArray, stage} = this.props;

    return (
      <Modal isOpen={this.props.open} backdrop="static" toggle={() => {}}>
        <div className="modal-header" style={{display: 'flex'}}>
          <h4 style={{flex: 1}}>Stages</h4>
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div className="stage-sidebar">
            <div
              ref={(el) => this._listEl = el}
              className="stage-list"
            >
              {stagesArray.map((s) => 
                <div
                  key={s.id}
                  data-stage-id={s.id}
                  className={`stage-item ${(stage.id === s.id) && 'selected'}`}
                  onClick={() => this._onSelectStage(s.id)}
                >
                  <img src={getStageScreenshot(s)} />
                  <h3>{s.name || "Untitled"}</h3>  
                </div>
              )}
            </div>
            <div className="bar">
              <Button
                className="add"
                onClick={this._onAddStage}
              >
                <i className="fa fa-plus" />
              </Button>
              <Button
                className="remove"
                disabled={stagesArray.length <= 1}
                onClick={this._onRemoveStage}>
                <i className="fa fa-minus" />
              </Button>
              <div className="space" />
            </div>
          </div>
          <ModalBody>
            <StageSettings
              stage={stage}
              key={stage.id}
              onChange={(settings) => dispatch(updateStageSettings(stage.id, settings))}
            />
          </ModalBody>
        </div>
        <ModalFooter>
          <Button color="primary" onClick={this._onClose}>Done</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    stagesArray: Object.values(state.stages).sort((a, b) => a.order - b.order),
    stage: state.stages[state.ui.selectedStageId],
    open: state.ui.modal.openId === MODALS.STAGES,
  };
}

export default connect(
  mapStateToProps,
)(Container);
