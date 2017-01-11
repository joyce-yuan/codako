import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, ModalBody, ModalFooter} from 'reactstrap';

import {dismissSettingsModal} from '../../actions/ui-actions';
import {updateStageSettings} from '../../actions/stage-actions';

class Container extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    stage: PropTypes.object,
    open: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);

    const {wrapX, wrapY, width, height} = props.stage;
    this.state = {wrapX, wrapY, width, height};
  }
  
  componentWillReceiveProps(nextProps) {
    const {wrapX, wrapY, width, height} = nextProps.stage;
    this.setState({wrapX, wrapY, width, height});
  }

  _onClose = () => {
    this.props.dispatch(dismissSettingsModal());
  }

  _onCloseAndSave = () => {
    const {dispatch, stage} = this.props;
    dispatch(dismissSettingsModal());
    dispatch(updateStageSettings(stage.uid, this.state));
  }

  render() {
    const {width, height, wrapX, wrapY} = this.state;

    return (
      <Modal isOpen={this.props.open} backdrop="static" toggle={() => {}}>
        <div className="modal-header" style={{display: 'flex'}}>
          <h4 style={{flex: 1}}>Stage Settings</h4>
        </div>
        <ModalBody>
          <fieldset className="form-group row form-inline">
            <legend className="col-form-legend col-sm-3">Stage Size</legend>
            <div className="col-sm-9">
              <input className="form-control" type="number" value={width} onChange={(e) => this.setState({width: e.target.value / 1})} />
              <span style={{paddingLeft: 10, paddingRight: 10}}>x</span>
              <input className="form-control" type="number" value={height} onChange={(e) => this.setState({height: e.target.value / 1})} />
            </div>
          </fieldset>
          <fieldset className="form-group row">
            <div className="col-sm-3">Wrapping</div>
            <div className="col-sm-9">
              <label className="form-check-label" htmlFor="wrapX">
                <input style={{marginRight: 5}} className="form-check-input" id="wrapX" type="checkbox" checked={wrapX} onChange={(e) => this.setState({wrapX: e.target.checked})} />
                Wrap Horizontally
              </label>
              <label className="form-check-label" htmlFor="wrapY">
                <input style={{marginRight: 5, marginLeft: 0}} className="form-check-input" id="wrapY" type="checkbox" checked={wrapY} onChange={(e) => this.setState({wrapY: e.target.checked})} />
                Wrap Vertically
              </label>
            </div>
          </fieldset>
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
    stage: state.stages[state.stageIndex],
    open: state.ui.settings.open,
  };
}

export default connect(
  mapStateToProps,
)(Container);
