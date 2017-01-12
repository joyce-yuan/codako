import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';

import {updateTutorialState} from '../../actions/ui-actions';
import {getCurrentStage} from '../../utils/selectors';
import {tutorialSteps, poseFrames} from '../../constants/tutorial';
import TutorialAnnotation from './annotation';

import '../../styles/girl.scss';

class Girl extends React.Component {
  static propTypes = {
    pose: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    playing: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      frameIndex: 0,
    };
  }

  componentDidMount() {
    if (this.props.playing) {
      this.startTimer();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pose !== this.props.pose) {
      this.setState({frameIndex: 0});
    }
    if (nextProps.playing && !this.props.playing) {
      this.startTimer();
    }
    if (!nextProps.playing && this.props.playing) {
      this.setState({frameIndex: 0});
      this.stopTimer();
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  _flattenedFrames() {
    if (this.props.pose instanceof Array) {
      return [].concat(...(this.props.pose.map(key => poseFrames[key])));
    }
    return poseFrames[this.props.pose];
  }

  startTimer() {
    this._timer = setInterval(() => {
      const frameCount = this._flattenedFrames().length;
      this.setState({frameIndex: (this.state.frameIndex + 1) % frameCount});
    }, 1000);
  }

  stopTimer() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  render() {
    return (
      <div className="girl-container">
        <div
          className={`girl girl-${this._flattenedFrames()[this.state.frameIndex]}`}
          style={{position:'relative', top:-108, left:350}}
        />
      </div>
    );
  }
}

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
  }

  onAudioEnded() {
    if (this._waitsFor.stateMatching) {
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
    this.props.dispatch(updateTutorialState({stepIndex: 0}));
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

    const stepIndex = this.props.stepIndex;
    const step = tutorialSteps[stepIndex];

    if (!step) {
      return;
    }
    this._advancer = new TutorialAdvancer(step, () => this._onNextStep());

    if (step.soundURL) {
      this._audio = new Audio(step.soundURL);
      this._audio.addEventListener('playing', () => {
        if (this.props.stepIndex !== stepIndex) { return; }
        this.setState({playing: true});
      });
      this._audio.addEventListener('pause', () => {
        if (this.props.stepIndex !== stepIndex) { return; }
        this.setState({playing: false});
      });
      this._audio.addEventListener('ended', () => {
        if (this.props.stepIndex !== stepIndex) { return; }
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
    const step = tutorialSteps[this.props.stepIndex];
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