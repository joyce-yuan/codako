import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Button from 'reactstrap/lib/Button';

import {updateTutorialState} from '../../actions/ui-actions';
import {getCurrentStage} from '../../utils/selectors';
import {tutorialSteps} from '../../constants/tutorial';

import TutorialAnnotation from './annotation';
import Girl from './girl';

class TutorialAdvancer {
  constructor(step, callback) {
    this._waitsFor = step.waitsFor || {};
    this._callback = callback;

    if (this._waitsFor.stateMatching) {
      this._unsub = window.editorStore.subscribe(() => {
        const state = window.editorStore.getState();
        if (this._waitsFor.stateMatching(state, getCurrentStage(state))) {
          this._timer = setTimeout(this._callback, this._waitsFor.delay || 750);
          this._unsub();
        }
      });
    }

    if (this._waitsFor.elementMatching) {
      const interval = setInterval(() => {
        if (document.querySelector(this._waitsFor.elementMatching)) {
          this._timer = setTimeout(this._callback, this._waitsFor.delay || 250);
          this._unsub();
        }
      }, 500);
      this._unsub = () => clearInterval(interval);
    }
  }

  onAudioEnded() {
    if (this._waitsFor.stateMatching || this._waitsFor.elementMatching) {
      return;
    }
    this._callback();
  }

  detach() {
    clearTimeout(this._timer);
    if (this._unsub) {
      this._unsub();
    }
  }
}


class TutorialContainer extends React.Component {
  static propTypes = {
    stepSet: PropTypes.string,
    stepIndex: PropTypes.number,
    dispatch: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      playing: false,
    };
  }

  componentDidMount() {
    this._startCurrentStep();

    const pageQueryParams = location.search.split(/[?&]/g).map(p => p.split('='));
    const pageQueryStepSet = (pageQueryParams.find(p => p[0] === 'tutorial') || [])[1];

    if (pageQueryStepSet && !this.props.stepSet) {
      this.props.dispatch(updateTutorialState({
        stepSet: pageQueryStepSet,
        stepIndex: 0,
      }));
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.stepIndex !== this.props.stepIndex) {
      this._startCurrentStep();
    }
  }

  componentWillUnmount() {
    this._detatchForCurrentStep();
  }

  _detatchForCurrentStep() {
    if (this._audio) {
      this._audio.pause();
      this._audio = null;
    }
    if (this._advancer) {
      this._advancer.detach();
      this._advancer = null;
    }
  }

  _startCurrentStep() {
    this._detatchForCurrentStep();

    const {stepSet, stepIndex} = this.props;
    if (!stepSet) {
      return;
    }

    const step = tutorialSteps[stepSet][stepIndex];
    if (!step) {
      return;
    }
    this._advancer = new TutorialAdvancer(step, () => this._onNextStep());

    if (step.soundURL) {
      this._audio = new Audio(step.soundURL);
      this._audio.addEventListener('playing', () => {
        if (this.props.stepIndex !== stepIndex || !this._audio) { return; }
        this.setState({playing: true});
      });
      this._audio.addEventListener('pause', () => {
        if (this.props.stepIndex !== stepIndex || !this._audio) { return; }
        this.setState({playing: false});
      });
      this._audio.addEventListener('ended', () => {
        if (this.props.stepIndex !== stepIndex || !this._audio) { return; }
        this.setState({playing: false});
        this._advancer.onAudioEnded();
      });
      this._audio.play();
    }
  }

  _onNextStep = () => {
    const {dispatch, stepIndex} = this.props;
    dispatch(updateTutorialState({stepIndex: stepIndex + 1}));
  }

  render() {
    const {stepSet, stepIndex} = this.props;
    if (!stepSet) {
      return (
        <div/>
      );
    }

    const step = tutorialSteps[stepSet][stepIndex];
    return (
      <div>
        <div className="tutorial-container">
          <Girl pose={step.pose} playing={this.state.playing} />
          <div className="copy" >
            {step.text}
            <br />
            <Button color="primary" onClick={this._onNextStep}>Next</Button>
          </div>
        </div>

        <TutorialAnnotation {...step.annotation} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return state.ui.tutorial;
}

export default connect(
  mapStateToProps,
)(TutorialContainer);