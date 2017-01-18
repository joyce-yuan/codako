import {TOOL_RECORD, RECORDING_PHASE_SETUP, RECORDING_PHASE_RECORD} from './constants';
import {getCurrentStageForWorld} from '../utils/selectors';

export const poseFrames = {
  'sitting-looking': ['sitting-looking'],
  'sitting-talking': ['sitting-talking-1', 'sitting-talking-2', 'sitting-talking-4', 'sitting-talking-5'],
  'standing-pointing': ['standing-pointing'],
  'standing-talking': ['standing-talking-1', 'standing-talking-2', 'standing-talking-3'],
  'standing-confused': ['standing-confused-1', 'standing-confused-2'],
  'ashamed': ['ashamed', 'ashamed-blink'],
  'excited': ['excited', 'excited-blink'],
  'folded-talking': ['folded-talking-1', 'folded-talking-2', 'folded-talking-3', 'folded-talking-4'],
};

export const tutorialSteps = [
  {
    pose: 'sitting-talking',
    text: `Hi there! Welcome to Codako. Click here to start the tutorial!`,
    soundURL: '/editor/sounds/tutorial/tutorial-01.mp3',
    annotation: {selectors: ['.tutorial-container button.btn-primary'], style: 'outline'},
    waitsFor: {
      stateMatching: () => false, // user must click to start
    },
  },
  {
    pose: 'sitting-talking',
    text: `I'm Preethi, and this is a game I've been working on! It takes place
    in a cave where the hero has to avoid the lava and escape. I'm not quite
    done yet, but let me show you what I have so far!`,
    soundURL: '/editor/sounds/tutorial/tutorial-02.mp3',
    annotation: null,
  },
  {
    pose: ['standing-pointing', 'standing-talking'],
    text: `These are the buttons that start and stop the game. When you play a normal
    computer game, you can't pause and rewind, but since we're making our own game,
    we can stop it or rewind whenever we want. It's helpful to go back when something
    doesn't work the way you thought it would.`,
    soundURL: '/editor/sounds/tutorial/tutorial-03.mp3',
    annotation: {selectors: ['[data-tutorial-id=controls]'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `Click the 'Run' button to start my game.`,
    soundURL: '/editor/sounds/tutorial/tutorial-04.mp3',
    annotation: {selectors: ['[data-tutorial-id=run]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.ui.playback.running === true, 
    },
  },
  {
    pose: 'standing-talking',
    text: `You can move the hero around with the arrow keys. Go ahead and try it!`,
    soundURL: '/editor/sounds/tutorial/tutorial-05.mp3',
    waitsFor: {
      stateMatching: (state, stage) => Object.keys(stage.input.keys).length > 0,
      delay: 10000,
    },
  },
  {
    pose: ['ashamed', 'folded-talking'],
    text: `Oops—you can't get to the exit yet! I need to make a bridge over the lava
    so the hero can walk across. Want to help me add the bridge? Let's do it together.
    Okay. Let's see...`,
    soundURL: '/editor/sounds/tutorial/tutorial-06.mp3',
  },
  {
    pose: 'standing-pointing',
    text: `This is called the stage - it's where we design our game world.`,
    soundURL: '/editor/sounds/tutorial/tutorial-07.mp3',
    annotation: {selectors: ['.stage'], style: 'outline'},
  },
  {
    pose: ['standing-pointing', 'standing-talking'],
    text: `This is the character library. It shows all of the game pieces we've made.
    In Codako, you get to draw your own game pieces, so they can be anything you want!
    I've already drawn dirt and lava since this is a cave world. To make a bridge for
    our hero to get over the lava, we need to make a new bridge piece.`,
    soundURL: '/editor/sounds/tutorial/tutorial-08.mp3',
    annotation: {selectors: ['[data-tutorial-id=characters]'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `Go ahead and click on the + sign in the library. You can help me draw it!`,
    soundURL: '/editor/sounds/tutorial/tutorial-09.mp3',
    annotation: {selectors: ['[data-tutorial-id=characters-add-button]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => !!state.ui.paint.characterId,
      delay: 2000,
    },
  },
  {
    pose: 'standing-pointing',
    text: `Use the tools on the left side to draw a piece of a bridge. It can look like
    anything you want, and you can always come back and change it later.`,
    soundURL: '/editor/sounds/tutorial/tutorial-10.mp3',
    annotation: {selectors: ['[data-tutorial-id=paint-tools]'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `When you're done, click the blue button down here.`,
    soundURL: '/editor/sounds/tutorial/tutorial-11.mp3',
    annotation: {selectors: ['[data-tutorial-id=paint-save-and-close]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => !state.ui.paint.characterId,
    },
  },
  {
    pose: ['standing-talking', 'standing-pointing', 'standing-talking'],
    text: `Wow! That looks cool. See how that bridge block is down in our library now?
    Move the mouse over the bridge piece and drag it up into our game world. You can
    drag pieces around the world to set it up the way you want. Drag enough blocks
    out from the library to create a bridge over the lava.`,
    soundURL: '/editor/sounds/tutorial/tutorial-12.mp3',
    annotation: {selectors: ['[data-tutorial-id=characters] .item.active'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `If you make a mistake, click on the trash can tool and click on the block you
    want to get rid of.`,
    soundURL: '/editor/sounds/tutorial/tutorial-13.mp3',
    annotation: {selectors: ['[data-tutorial-id=toolbar-tool-trash]'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: 'Drag enough blocks out from the library to create a bridge over the lava.',
    annotation: null,
    waitsFor: {
      stateMatching: (state, stage) => {
        // wait for there to be five of a single characterId, assume it's new bridge
        const counts = {};
        Object.values(stage.actors).forEach((a) => {
          counts[a.characterId] = counts[a.characterId] ? counts[a.characterId] + 1 : 1;
        });
        return (Object.values(counts).find(v => v === 5));
      }
    },
  },
  {
    pose: 'standing-pointing',
    text: `Let's see how your bridge does! Click 'Run' again to play our game. Try using the arrow keys
    to walk over the lava. Can you get to the other side? If you can't, try moving the bridge pieces around.`,
    soundURL: '/editor/sounds/tutorial/tutorial-14.mp3',
    annotation: {selectors: ['[data-tutorial-id=run]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state, stage) => {
        return Object.values(stage.actors).find(a => a.characterId === 'aamlcui8uxr' && a.position.x === 9);
      },
    },
  },
  {
    pose: ['excited','standing-confused','standing-pointing'],
    text: `Great job! You made it over the lava! It doesn't look like our character can make
    it to the exit, though. I forgot - I never told him how to climb over that obstacle! Since we're
    creating this game, we can decide what he should do. Let's teach him to climb over the obstacle
    so he can get to the exit.`,
    soundURL: '/editor/sounds/tutorial/tutorial-15.mp3',
  },
  {
    pose: ['folded-talking','standing-pointing'],
    text: `Okay - let's see. Click on the rule recording icon in the sidebar. Using the recording tool,
    we can create a rule for our character that teaches him what to do when he's next to a obstacle.`,
    soundURL: '/editor/sounds/tutorial/tutorial-16.mp3',
    annotation: {selectors: ['[data-tutorial-id=toolbar-tool-record]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.ui.selectedToolId === 'record',
    },
  },
  {
    pose: ['standing-pointing', 'standing-talking'],
    text: `Tap on our hero - we want to show him how to climb, so we'll focus on him.`,
    soundURL: '/editor/sounds/tutorial/tutorial-17.mp3',
    annotation: {selectors: ['[data-stage-character-id=aamlcui8uxr]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.recording.phase === RECORDING_PHASE_SETUP,
    },
  },
  {
    pose: ['standing-pointing', 'standing-talking'],
    text: `Perfect. See how the stage has been grayed out? When we're showing our hero a
    new rule, it's important for us to show him what he should pay attention to. We don't
    want him getting distracted by what's going on in the rest of the world.`,
    soundURL: '/editor/sounds/tutorial/tutorial-18.mp3',
  },
  {
    pose: ['standing-pointing', 'sitting-talking'],
    text: `These handles let us expand the area our hero will focus on. For this rule,
    it's important that there's an obstacle in front of him! Drag the right handle
    so it includes the block he has to climb.`,
    soundURL: '/editor/sounds/tutorial/tutorial-19.mp3',
    annotation: {selectors: ['[data-stage-handle=right]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => (state.recording.extent.xmax - state.recording.extent.xmin) > 0
    },
  },
  {
    pose: 'standing-pointing',
    text: `Great! Go ahead and drag the top handle up by one block, too. Since we're going
    to teach him to climb, he needs to make sure he has space above him!`,
    soundURL: '/editor/sounds/tutorial/tutorial-20.mp3',
    annotation: {selectors: ['[data-stage-handle=top]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => (state.recording.extent.ymax - state.recording.extent.ymin) > 0
    },
  },
  {
    pose: ['excited', 'standing-pointing'],
    text: `Perfect. Now we're ready to show our hero what to do! Click the Start Recording button.`,
    soundURL: '/editor/sounds/tutorial/tutorial-21.mp3',
    annotation: {selectors: ['[data-tutorial-id=record-next-step]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.recording.phase === RECORDING_PHASE_RECORD,
    },
  },
  {
    pose: ['excited'],
    text: `Okay good!`,
    soundURL: '/editor/sounds/tutorial/tutorial-22.mp3',
  },
  {
    pose: 'sitting-talking',
    text: `Whenever our hero is walking around, he'll look at the picture on the left
    and see if his surroundings look like that.`,
    soundURL: '/editor/sounds/tutorial/tutorial-23.mp3',
    annotation: {selectors: ['[data-stage-wrap-id=before]'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `If they do, he'll follow the instructions we give him here!`,
    soundURL: '/editor/sounds/tutorial/tutorial-24.mp3',
    annotation: {selectors: ['[data-stage-wrap-id=after]'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `To tell our hero to climb the block, drag him on top of the block here.`,
    soundURL: '/editor/sounds/tutorial/tutorial-25.mp3',
    waitsFor: {
      stateMatching: ({recording}) => {
        const beforeStage = getCurrentStageForWorld(recording.beforeWorld);
        const afterStage = getCurrentStageForWorld(recording.afterWorld);
        const before = Object.values(beforeStage.actors).find(a => a.characterId === 'aamlcui8uxr');
        const after = Object.values(afterStage.actors).find(a => a.characterId === 'aamlcui8uxr');
        return before && after && (after.position.x === before.position.x + 1) && (after.position.y === before.position.y - 1); 
      }
    },
  },
  {
    pose: 'sitting-talking',
    text: `Great! See how that created an instruction for our character? Now he knows what he should do!`,
    soundURL: '/editor/sounds/tutorial/tutorial-26.mp3',
    annotation: {selectors: ['.recording-specifics .action'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `Click 'Save Recording' and let's try out your new rule.`,
    soundURL: '/editor/sounds/tutorial/tutorial-27.mp3',
    annotation: {selectors: ['[data-tutorial-id=record-next-step]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.recording.characterId === null,
    },
  },
  {
    pose: 'standing-pointing',
    text: `Press 'Run'! If we did it right, our hero should climb the block now.`,
    soundURL: '/editor/sounds/tutorial/tutorial-28.mp3',
    annotation: {selectors: ['[data-tutorial-id=run]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state, stage) => {
        const main = Object.values(stage.actors).find(a => a.characterId === 'aamlcui8uxr');
        return main && main.position.x > 9;
      },
    },
  },
  {
    pose: ['excited', 'sitting-talking', 'sitting-talking'],
    text: `Wow that was great! We taught the hero how to climb up over the block,
    and now we can use the arrow keys to gide him to the exit.`,
    soundURL: '/editor/sounds/tutorial/tutorial-29.mp3',
  },
  {
    pose: 'standing-confused',
    text: `You know, since we're making a game, we should probably make our hero
    climb when you press the space bar. Right now, he climbs all by himself and
    we might not want him to!`,
    soundURL: '/editor/sounds/tutorial/tutorial-30.mp3',
  },
  {
    pose: 'standing-pointing',
    text: `Double-click on our hero and let's look at the rules we've taught him.`,
    soundURL: '/editor/sounds/tutorial/tutorial-31.mp3',
    annotation: {selectors: ['[data-stage-character-id=aamlcui8uxr]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.ui.selectedCharacterId === 'aamlcui8uxr'
    },
  },
  {
    pose: ['standing-pointing', 'standing-talking', 'folded-talking'],
    text: `Each time our hero thinks about his next step, he starts with the first
    rule and moves down the list. He looks at each one to see if his surroundings
    match the picture in that rule. If it does, he does what the rule tells him and stops.`,
    soundURL: '/editor/sounds/tutorial/tutorial-32.mp3',
    annotation: {
      style: 'arrow',
      selectors: [
        '.rules-list li:first-child',
        '.rules-list li:last-child',
      ],
    },
    waitsFor: {
      delay: 3000,
    },
  },
  {
    pose: ['standing-talking', 'folded-talking', 'standing-talking'],
    text: `Sometimes, we only want our hero to follow a rule if we tell him to. He
    knows how to walk to the right, but we can't have him walking into danger. He may be fearless,
    but there's lava! To make sure he only walks when we want him to, we can use
    event containers. They're the green blocks. Our hero knows not to look inside them
    until we tell him to!`,
    soundURL: '/editor/sounds/tutorial/tutorial-33.mp3',
  },
  {
    pose: ['standing-pointing', 'folded-talking'],
    text: `See? Here's the rule that tells our hero to walk right. You can tell the rule is
    showing him how to walk right, because the picture shows him starting in the first square,
    and ending in the second square.`,
    soundURL: '/editor/sounds/tutorial/tutorial-34.mp3',
    annotation: {selectors: ['.rule-container.event:first-child'], style: 'outline'},
  },
  {
    pose: ['standing-pointing', 'folded-talking'],
    text: `That rule is inside a green block that says 'when the right arrow key is pressed.' Our hero
    will only think about walking right when we're pressing that key!`,
    soundURL: '/editor/sounds/tutorial/tutorial-35.mp3',
    annotation: {selectors: ['.rule-container:first-child .header .name'], style: 'outline'},
  },
  {
    pose: ['standing-confused', 'folded-talking'],
    text: `We taught our hero to climb, but we didn't tell him to wait us to press a key. Our climbing
    rule is down at the bottom with the other rules our hero looks at when he's not busy.`,
    soundURL: '/editor/sounds/tutorial/tutorial-36.mp3',
  },
  {
    pose: 'standing-pointing',
    text: `We'll need a new green block. Click 'Add' up here.`,
    soundURL: '/editor/sounds/tutorial/tutorial-37.mp3',
    annotation: {selectors: ['[data-tutorial-id=inspector-add-rule]'], style: 'outline'},
    waitsFor: {
      elementMatching: '[data-tutorial-id=inspector-add-rule-key]',
    },
  },
  {
    pose: 'standing-pointing',
    text: `Choose 'When a Key is Pressed' from the menu.`,
    soundURL: '/editor/sounds/tutorial/tutorial-38.mp3',
    annotation: {selectors: ['[data-tutorial-id=inspector-add-rule-key]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.ui.keypicker.characterId === 'aamlcui8uxr'
    },
  },
  {
    pose: 'standing-pointing',
    text: `Okay. What key should we use? Maybe the space bar? Press a key you want
    to use and then click the done button.`,
    soundURL: '/editor/sounds/tutorial/tutorial-39.mp3',
    annotation: {selectors: ['[data-tutorial-id=keypicker-save]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => state.ui.keypicker.characterId === null
    },
  },
  {
    pose: ['excited', 'sitting-talking'],
    text: `Great! There's our new green block. Let's put our climbing rule in there
    so the hero will only climb when we press that key.`,
    soundURL: '/editor/sounds/tutorial/tutorial-40.mp3',
    annotation: {selectors: ['.rule-container.event:first-child'], style: 'outline'},
  },
  {
    pose: 'standing-pointing',
    text: `Drag and drop the climbing rule into the empty space inside our new green block.`,
    soundURL: '/editor/sounds/tutorial/tutorial-41.mp3',
    annotation: {
      style: 'arrow',
      selectors: [
        '.rule-container.event:last-child .rule:first-child',
        '.rule-container.event:first-child .rules-list',
      ],
    },
    waitsFor: {
      elementMatching: '.rule-container.event:first-child li',
    },
  },
  {
    pose: ['excited', 'sitting-talking'],
    text: `We've just told our hero that he should only climb when you press
    the key. Move the hero back to the left side of the stage and let's try this out!`,
    soundURL: '/editor/sounds/tutorial/tutorial-42.mp3',
  },
  {
    pose: 'standing-pointing',
    text: `Click the 'Run' button to start the game. Try climbing over the barrier now.`,
    soundURL: '/editor/sounds/tutorial/tutorial-43.mp3',
    annotation: {selectors: ['[data-tutorial-id=run]'], style: 'outline'},
    // action: ->
    //   $scope.mainCharacter().setWorldPos(1, 5)
    //   $scope.highlight('#button-run')
    waitsFor: {
      stateMatching: (state, stage) => {
        const main = Object.values(stage.actors).find(a => a.characterId === 'aamlcui8uxr');
        return main.position.x > 9;
      },
    },
  },
  {
    pose: 'excited',
    text: `Nice - it worked! This game is getting cool! To make the game harder I was going
    to make this boulder fall off the mountain as the hero walked by. The person playing the
    game would have to dodge the boulder to get to the exit! The boulder doesn't do anything
    yet. Want to help me?`,
    soundURL: '/editor/sounds/tutorial/tutorial-44.mp3',
  },
  {
    pose: 'folded-talking',
    text: `This time, I think we need to teach the boulder a new rule. When the hero gets
    close, it should slip off the ledge and start falling! Let's say the hero should be...`,
    soundURL: '/editor/sounds/tutorial/tutorial-45.mp3',
  },
  {
    pose: 'folded-talking',
    text: `here when the boulder starts to fall. Remember how we created our first rule?`,
    soundURL: '/editor/sounds/tutorial/tutorial-46.mp3',
    // action: ->
    //   $scope.mainCharacter().setWorldPos(11, 9)
  },
  {
    pose: 'standing-pointing',
    text: `Switch to the recording tool again. This time, click on the boulder!`,
    soundURL: '/editor/sounds/tutorial/tutorial-47.mp3',
    annotation: {selectors: ['[data-tutorial-id=toolbar-tool-record]'], style: 'outline'},
    waitsFor: {
      stateMatching: (state) => {
        return state.ui.selectedToolId === TOOL_RECORD && state.recording.phase === RECORDING_PHASE_SETUP;
      },
    },
  },
  {
    annotation: {selectors: ['[data-stage-character-id=oou4u6jemi]'], style: 'outline'}, // boulder
  },
];
//   {
//     trigger: -> $('#button-start-recording').length > 0
//     text: `Perfect. Let's think about this for a minute... See how the stage has been grayed out?
//     We want our boulder to focus on where the hero is down below, so let's use the handles to
//     expand the area we're focusing on. Can you expand them so that the hero is inside the box?`,
//     soundURL: '/editor/sounds/tutorial/tutorial-48.mp3',
//     pose: ['standing-confused', 'sitting-talking'],
//     action: ->
//       p = $scope.boulderCharacter().worldPos
//       $scope.highlightStageTile(new Point(p.x - 1, p.y), {temporary: true})
//   },
//   {
//     trigger: -> window.Game.mainStage.recordingExtent.bottom >= $scope.mainCharacter().worldPos.y && window.Game.mainStage.recordingExtent.left <= $scope.mainCharacter().worldPos.x
//     text: `Perfect. Now we're ready to show the boulder what to do. Click the Start Recording button.`,
//     soundURL: '/editor/sounds/tutorial/tutorial-49.mp3',
//     pose: 'standing-pointing',
//     action: -> $scope.highlight('#button-start-recording', {temporary:true})
//   },
//   {
//     trigger: -> $('#button-save-recording').length > 0
//     text: `Okay good!`,
//     pose: 'excited',
//     soundURL: '/editor/sounds/tutorial/tutorial-50.mp3',
//   },
//   {
//     text: `To make our boulder fall off the ledge, drag it over by one square so it's in the air.`,
//     pose: 'standing-pointing',
//     soundURL: '/editor/sounds/tutorial/tutorial-51.mp3',
//   },
//   {
//     trigger: -> window.Game.selectedRule?.actions?.length > 0
//     text: `Great! Now the boulder will slip off the ledge when our hero walks over and the picture on the left matches!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-52.mp3',
//     pose: 'standing-pointing',
//     action: -> $scope.highlight('.panel.actions .action', {temporary: true})
//   },
//   {
//     text: `Click 'Save Recording' and let's try out your new rule.`,
//     soundURL: '/editor/sounds/tutorial/tutorial-53.mp3',
//     pose: 'standing-pointing',
//     action: ->
//       $scope.highlight('#button-save-recording', {temporary:true})
//   },
//   {
//     trigger: -> $('#button-run').is(':visible')
//     text: `Press 'Run'! Walk the hero toward the block and let's see if it falls.`,
//     soundURL: '/editor/sounds/tutorial/tutorial-54.mp3',
//     pose: 'excited',
//     action: ->
//       $scope.highlight('#button-run', {temporary: true})
//       $scope.mainCharacter().setWorldPos(8, 5)
//       $scope.boulderStartX = $scope.boulderCharacter().worldPos.x
//   },
//   {
//     trigger: ->
//       $scope.boulderCharacter().worldPos.x != $scope.boulderStartX
//     text: `Hmm... The boulder moved over, but it didn't fall! I wonder what we forgot? Oh - I know! we made the boulder slip off the ledge, but we never programmed it to fall down! In the real world, gravity makes everything fall down. In our game, we need to program things to fall. Maybe next time we can make a space game and we won't need gravity!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-55.mp3',
//     pose: 'standing-confused',
//   },
//   {
//     text: `Switch to the recording tool again. Let's teach the boulder to fall!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-56.mp3',
//     action: -> $scope.highlight('#tool-record'),
//     pose: 'standing-pointing',
//   },
//   {
//     trigger: -> $('#tool-record').hasClass('btn-info') || $('#button-start-recording').length > 0
//     action: -> $scope.highlightStageTile($scope.boulderCharacter().worldPos, {temporary: true})
//   },
//   {
//     trigger: -> $('#button-start-recording').length > 0
//     text: `Perfect. Let's think about this for a minute..
//     We want our boulder to fall whenever there's an empty square beneath it.
//     Can you expand the box to include the empty space beneath the boulder?`,
//     soundURL: '/editor/sounds/tutorial/tutorial-57.mp3',
//     pose: ['standing-confused', 'standing-pointing'],
//   },
//   {
//     trigger: -> window.Game.mainStage.recordingExtent.top != window.Game.mainStage.recordingExtent.bottom
//     text: `Perfect. Now we're ready to show the boulder what to do. Click the Start Recording button.`,
//     soundURL: '/editor/sounds/tutorial/tutorial-58.mp3',
//     pose: 'standing-pointing',
//     action: -> $scope.highlight('#button-start-recording', {temporary:true})
//   },
//   {
//     trigger: -> $('#button-save-recording').length > 0
//     text: `Okay good!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-59.mp3',
//     pose: 'excited',
//   },
//   {
//     text: `In the picture on the right, drag the boulder down into the empty space just beneath it.`,
//     soundURL: '/editor/sounds/tutorial/tutorial-60.mp3',
//     pose: 'standing-pointing',
//   },
//   {
//     trigger: -> window.Game.selectedRule?.actions?.length > 0
//     text: `Great! I think that will do the trick. The boulder will fall down until it reaches the ground. If it's on the ground, the picture on the left won't match - there won't be any empty space for the boulder to fall into!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-61.mp3',
//     pose: 'folded-talking',
//   },
//   {
//     text: `Click 'Save Recording' and let's try out your new rule.`,
//     soundURL: '/editor/sounds/tutorial/tutorial-62.mp3',
//     pose: 'standing-pointing',
//     action: ->
//       $scope.highlight('#button-save-recording', {temporary:true})
//   },
//   {
//     trigger: -> $('#button-run').is(':visible')
//     text: `Okay let's try rtunning it again. This time when our hero walks toward the ledge, the boulder should slip off and fall! Can you get him past the boulder before it blocks his path?`,
//     soundURL: '/editor/sounds/tutorial/tutorial-63.mp3',
//     pose: 'sitting-talking',
//     action: ->
//       $scope.highlight('#button-run', {temporary: true})
//       $scope.mainCharacter().setWorldPos(new Point(1, 5))
//       $scope.boulderCharacter().setWorldPos(new Point(14, 5))
//       $scope.boulderStartX = $scope.boulderCharacter().worldPos.x
//   },
//   {
//     trigger: -> $scope.mainCharacter().worldPos.x >= 12
//     text: `That was pretty cool, huh? I don't really know what we should do next. Why don't you make your own rules! You could make our hero jump over the boulder, or teach him to dig into the dirt, or create a whole new game piece!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-64.mp3',
//     pose: 'sitting-talking'
//   },
//   {
//     text: `That's it for the tutorial. If you want to pair program more games with me and my friends, you can find more vieos under the Examples tab!`,
//     soundURL: '/editor/sounds/tutorial/tutorial-65.mp3',
//     pose: 'sitting-looking',
//     action: ->
//       $scope.highlight('#linkto-Examples', {temporary: true})
//   }
// ]
