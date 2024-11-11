## Codako

This is the MIT-licensed source code for https://www.codako.org/. Feel free to use it in whole or in part. If your contributions would benefit the core project, please feel free to open pull requests!

### Core Concepts

Codako is a programming-by-demonstration tool that allows anyone to create simulations (worlds) containing one or more stages (2D grids) and build their own games. Codako allows you to draw your own characters, demonstrate rules they should follow, manage control flow and handle events, and create interactive experiences.

### Terminology

In Codako's source code, the following terminology is used:

- `character` refers to a "class" in your game

- `actor` refers to an instance of a `character` at a particular position with a particular state.

- `stage` refers to the two-dimensional grid that contains actors.

- `world` refers to the overall game, which may contain one or more stages.

- `rules` are attached to characters and define requirements that must be matched, and `actions` that are taken.  Rules can be nested inside `flow containers`, which apply control flow policies (eg: run a random rule in this group, run all rules in this group), or event handlers. (eg: run this group when a key is pressed)

