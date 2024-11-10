### Headless Codako Simulation

This code shows how to interact with a Codako game from NodeJS. This is useful for evaluating Codako simulations rapidly, and without the hassle of spinning up a headless web browser or trying to send commands into the web environment.

To run the sample code in Node 20:

```
yarn install
yarn start
```

The steps run in the code sample are:

- Download a saved game from the Codako API

- Inspect the stage and `console.log` the area around the main character

- Advance the game state, simulating a key press

- Inspect the rules that ran and `console.log` their names to the console

- Write the updated game state back to the Codako API, so we can reload the web page and see what the new state of the world looks like.

### Notes:

- Running `yarn start` copies a folder of `frontend-editor-utils` from the `frontend` directory to use. Technically these should be built into a shared module, but for now copying the files is much easier for now.

- You could advance the game state more than once by passing the previous `next` state into a new WorldOperator in a loop. 

- The IDs that are used in Codako's save files have no format restrictions. If you're working with a game file directly, it might be helpful to edit the game file and replace all the characterIds and/or actorIds with readable constants. eg: `aamlcui8ux => hero` and `1483692683 => lava`, etc.

### Example Output:

```
Loaded Cave Adventure Tutorial
    -     |    -     |    -     |
    -     |aamlcui8ux|    -     |
    -     |    -     |1483692683|
Advanced game state! Here are the rules that ran:
Actor 1483668698770 (Hero): Walk Right
Actor 1483692729120 (Lava): Waves 2 => 1
Actor 1483692730066 (Lava): Waves 2 => 1
Actor 1483692730592 (Lava): Waves 2 => 1
Actor 1483692738445 (Lava): Waves 1 => 2
Actor 1483692743355 (Lava): Waves 2 => 1
Updated Cave Adventure Tutorial. Visit https://www.codako.org/editor/53 to see the new state.
```
