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
          <div>
            <input id="wrapX" type="checkbox" checked={wrapX} onChange={(e) => this.setState({wrapX: e.target.checked})} />
            <label htmlFor="wrapX">Wrap Horizontally</label>
            <input id="wrapY" type="checkbox" checked={wrapY} onChange={(e) => this.setState({wrapY: e.target.checked})} />
            <label htmlFor="wrapY">Wrap Vertically</label>
          </div>
          <div>
            <label htmlFor="width">Stage Size</label>
            <input id="width" type="number" value={width} onChange={(e) => this.setState({width: e.target.value / 1})} />
            <span>x</span>
            <input type="number" value={height} onChange={(e) => this.setState({height: e.target.value / 1})} />
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
    stage: state.stage,
    open: state.ui.settings.open,
  };
}

export default connect(
  mapStateToProps,
)(Container);
