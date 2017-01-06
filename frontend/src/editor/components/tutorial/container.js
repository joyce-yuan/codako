import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';

import {updateTutorialState} from '../../actions/ui-actions';
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
        if (this._waitsFor.stateMatching(window.editorStore.getState())) {
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



// $scope.$root.$on 'tutorial_content_ready', ->
//   window.AudioContext = window.AudioContext || window.webkitAudioContext
//   $scope.audioContext = new AudioContext()

//   async.eachSeries $scope.tutorial, (step, callback) ->
//     return callback() unless step.soundURL
//     request = new XMLHttpRequest()
//     request.open('GET', step.soundURL, true)
//     request.responseType = 'arraybuffer'
//     request.onload = ->
//       $scope.audioContext.decodeAudioData @response,
//       (buffer) ->
//         step.soundBuffer = buffer
//         callback(null)
//       ,
//       (buffer) ->
//         console.log(`Failed to load sound #{step.soundURL}`)
//         callback(null)
//     request.send()
//   , (allready) ->
//     # Once everything has loaded, replay the current step action
//     # so the user feels like they pick up where they left off.
//     window.Game.tutorial_step -= 1
//     $scope.advanceByStep()


// $scope.isInTutorial = ->
//   window.Game.tutorial_name != null


// $scope.currentStep = ->
//   $scope.tutorial[window.Game.tutorial_step]


// $scope.mainCharacter = ->
//   descriptor = { definition_id: 'aamlcui8uxr' } # main character
//   options = window.Game.mainStage.actorsMatchingDescriptor(descriptor)
//   return options[options.length - 1] if options.length > 0
//   return null


// $scope.boulderCharacter = ->
//   descriptor = { definition_id: 'oou4u6jemi' } # boulder character
//   options = window.Game.mainStage.actorsMatchingDescriptor(descriptor)
//   return options[options.length - 1] if options.length > 0
//   return null


// $scope.clearHighlights = (callback = null) ->
//   if $scope.highlighted
//     $($scope.highlighted).highlighter('erase')
//     $scope.highlighted = null
//     setTimeout(callback, 500) if callback
//   else
//     callback() if callback


// $scope.arrow = (fromEl, toEl) ->
//   $(fromEl).arrow('show', $(toEl))
//   $scope.arrowed = fromEl
//   setTimeout ->
//     if $scope.arrowed == fromEl
//       $(fromEl).arrow('erase')
//       $scope.arrowed = null
//   ,2000


// $scope.highlight = (selector, options = {}) ->
//   $scope.clearHighlights ->
//     $(selector).highlighter('show')
//     $scope.highlighted = selector
//     if (options.temporary)
//       setTimeout ->
//         if $scope.highlighted == selector
//           $(selector).highlighter('erase')
//           $scope.highlighted = null
//       ,2000


// $scope.highlightStageTile = (tile, options = {}) ->
//   $scope.clearHighlights ->
//     stage = options.stage || window.Game.mainStage
//     offset = stage.screenPointForTile(tile)
//     $('#platformerCanvasPane1').highlighter('show', {offset: {top: offset.y-30, left: offset.x-30}, width: Tile.WIDTH+60, height: Tile.HEIGHT+60})
//     $scope.highlighted = '#platformerCanvasPane1'
//     if (options.temporary)
//       setTimeout ->
//         if $scope.highlighted == '#platformerCanvasPane1'
//           $('#platformerCanvasPane1').highlighter('erase')
//           $scope.highlighted = null
//       ,2000


// $scope.advanceByStep = ->
//   clearTimeout($scope.tutorialTimer)
//   clearInterval($scope.poseTimer)

//   if window.Game.tutorial_step >= $scope.tutorial.length - 1
//     return;
//   window.Game.tutorial_step += 1

//   step = $scope.currentStep()
//   if !step
//     return;

//   step.action() if step.action

//   if step.text
//     initialDelay = 1500 + step.text.length * 23
//   else
//     initialDelay = 1500

//   if $scope.audioSource
//     if $scope.audioSource.stop then $scope.audioSource.stop() else $scope.audioSource.noteOff()

//   if step.soundBuffer
//     try
//       initialDelay = step.soundBuffer.duration * 1000
//       $scope.audioSource = $scope.audioContext.createBufferSource()
//       $scope.audioSource.buffer = step.soundBuffer
//       $scope.audioSource.connect($scope.audioContext.destination)
//       $scope.audioSource.addEventListener('ended', $scope.stopPoseUpdates)
//       if $scope.audioSource.start then $scope.audioSource.start(0) else $scope.audioSource.noteOn()

//     catch e
//       console.log(e)

//   # wait until finished speaking instructions
//   $scope.tutorialTimer = setTimeout($scope.checkShouldAdvance, initialDelay)

//   # move the character's pose
//   $scope.poseUpdateCount = 0
//   $scope.poseIndex = 0
//   $scope.poseTimer = setInterval($scope.updatePose, 800)
//   $scope.$apply() unless $scope.$$phase


// $scope.poseUpdateCount = 0
// $scope.updatePose = ->
//   $scope.poseUpdateCount += 1
//   index = Math.floor($scope.poseUpdateCount / 4)

//   step = $scope.currentStep()
//   if step.pose instanceof Array
//     pose = step.pose[Math.min(index, step.pose.length - 1)]
//   else
//     pose = step.pose

//   frames = $scope.poseFrames[pose]
//   console.log('No frames for pose ', pose) unless frames instanceof Array

//   frame = frames[($scope.poseUpdateCount % 5) % frames.length]
//   $scope.girlPose = 'girl-'+frame
//   $scope.$apply() unless $scope.$$phase


// $scope.stopPoseUpdates = ->
//   clearInterval($scope.poseTimer)


// $scope.checkShouldAdvance = ->
//   nextStep = $scope.tutorial[window.Game.tutorial_step+1]

//   if nextStep && (!nextStep.trigger || nextStep.trigger() == true)
//     $scope.advanceByStep()
//   else
//     $scope.tutorialTimer = setTimeout($scope.checkShouldAdvance, 500)
