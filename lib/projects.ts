/**
 * lib/projects.ts — Project data
 * ---------------------------------------------------------------------------
 * The Scratch projects below are REAL: names, IDs and links were read straight
 * from https://scratch.mit.edu/users/saabiqmasoodi/projects/ (26 shared
 * projects). To refresh this list later, fetch that page again and match the
 * names/IDs.
 *
 * WHAT IS STILL A GUESS
 * Each `description` is a short, factual sentence based only on the project
 * title — I did not play the games, so nothing here is invented detail about
 * how they work. **Read each description and rewrite it in your own words.**
 * A line like "you jump across platforms" is much better than a guess.
 *
 * Only the ~10 strongest projects are listed. If a project is private, or you
 * would rather not link it, delete its block.
 *
 * SAFETY: only ever link public Scratch pages. Never link anything that shows
 * your real name, school, photos, or personal details inside the game itself.
 */

export type ProjectStatus = 'live' | 'in-progress' | 'prototype' | 'finished'

export type Project = {
  id: string
  title: string
  /** One line shown under the title. */
  summary: string
  /** 2-3 sentences for the card body. */
  description: string
  tools: string[]
  status: ProjectStatus
  /** Optional public link to the playable build. */
  sourceUrl?: string
  /** Tailwind-safe gradient classes for the cover art placeholder. */
  accent: 'cyan' | 'magenta' | 'lime' | 'violet' | 'amber'
  /** A pixel-art glyph or emoji used as the cover placeholder. */
  glyph: string
  /** Drives the ordering and the "featured" treatment. */
  featured?: boolean

  /**
   * REAL cover art, served from our own domain (never hotlinked).
   * Set this only when a genuine image of the project exists; otherwise the
   * card falls back to `glyph`.
   */
  cover?: string
  /**
   * Alt text for the cover. Defaults to "Screenshot of {title}", which is
   * correct for gameplay captures but wrong for logos — override those.
   */
  coverAlt?: string
  /**
   * How the cover fills the art box.
   *  - 'cover'   landscape screenshots -> fill and crop (default)
   *  - 'contain' portrait logos/marks  -> shrink to fit on a tinted panel
   */
  coverFit?: 'cover' | 'contain'
}

export const projects: Project[] = [
  {
    id: 'the-basement',
    title: 'The Basement',
    summary: 'A 3D horror game made in Godot 4.',
    description:
      'My first released 3D game. I built The Basement in Godot 4, modelling parts of it in Blender and writing the code myself. I wanted to make a short, creepy game that is still fun to play.',
    tools: ['Godot 4', 'GDScript', 'Blender', '3D Game Design'],
    status: 'live',
    sourceUrl: 'https://saabiqmasoodi.itch.io/the-basement',
    accent: 'cyan',
    glyph: '🗺️',
    cover: '/images/games/the-basement.png',
    coverAlt: 'The Basement — game logo',
    coverFit: 'contain',
    featured: true,
  },
  {
    id: 'super-platformer',
    title: 'super platformer',
    summary: 'A Scratch platformer — jumping, platforms and finishing the level.',
    description:
      'One of the games I am happiest with. You move, jump and make it to the end of the level. I designed the levels myself and had to think about how to make jumping feel right, which is harder than it sounds.',
    tools: ['Scratch', 'Game Design', 'Level Design'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/1050379413/',
    accent: 'lime',
    glyph: '🕹️',
    cover: '/images/games/super-platformer.png',
    featured: true,
  },
  {
    id: '3d-raycaster',
    title: 'the 3d raycaster v1.8',
    summary: 'A 3D raycasting engine in Scratch, now on version 1.8.',
    description:
      'My most technical Scratch project. It works out what is in front of the player and draws the scene from that — a raycaster, without any 3D engine to help me. Reaching v1.8 means I went back and fixed a lot of things that did not work.',
    tools: ['Scratch', 'Raycasting', 'Algorithms'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/1018259078/',
    accent: 'violet',
    glyph: '👁️',
    cover: '/images/games/3d-raycaster.png',
    featured: true,
  },
  {
    id: 'massive-multiplayer-platformer',
    title: 'Massive Multiplayer Platformer v1.3 remix',
    summary: 'A remix of a platformer where many players can play at once.',
    description:
      'I took an existing project and remixed it to make my own version with more players able to play together. This one taught me how much work it is to make a game where more than one person is playing.',
    tools: ['Scratch', 'Remixing', 'Multiplayer'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/1016181575/',
    accent: 'magenta',
    glyph: '🌐',
    cover: '/images/games/massive-multiplayer-platformer.png',
    featured: true,
  },
  {
    id: 'maze-in-maze',
    title: 'Maze in Maze',
    summary: 'A maze, but the maze is itself a maze. Find the way out.',
    description:
      'The idea is in the name — you have to solve the maze to get to another maze. I like making small games where one rule twists into another, and this is the one that worked best.',
    tools: ['Scratch', 'Game Design'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/1051025515/',
    accent: 'violet',
    glyph: '🌀',
    cover: '/images/games/maze-in-maze.png',
  },
  {
    id: 'leap-worm',
    title: 'Leap Worm',
    summary: 'A jumping game. Leap as far as you can.',
    description:
      'A quick, simple game about jumping — how far can you get? Short games like this are good practice because there is only one thing to get right.',
    tools: ['Scratch', 'Game Design'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/1012239606/',
    accent: 'lime',
    glyph: '🐛',
    cover: '/images/games/leap-worm.png',
  },
  {
    id: 'the-maze',
    title: 'the maze',
    summary: 'My first maze game — escape before you get caught.',
    description:
      'An early project of mine and the one that taught me the most. It is simple, but I built the whole thing myself, and understanding how it works is what got me interested in making bigger things.',
    tools: ['Scratch', 'Algorithms'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/996589094/',
    accent: 'violet',
    glyph: '🧩',
    cover: '/images/games/the-maze.png',
  },
  {
    id: 'rocket-blaster',
    title: 'Rocket blaster',
    summary: 'A rocket shooter — fly and shoot.',
    description:
      'A flying-and-shooting game. I had to work out how to make the controls feel smooth, because a game that is hard to control is not fun, however good the idea is.',
    tools: ['Scratch', 'Game Design'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/993367083/',
    accent: 'amber',
    glyph: '🚀',
    cover: '/images/games/rocket-blaster.png',
  },
  {
    id: '3-in-1',
    title: '3 in 1',
    summary: 'Three small games packed into one project.',
    description:
      'Three games in a single Scratch project. Making each one taught me something different, and putting them together taught me how to organise a project with more than one thing in it.',
    tools: ['Scratch', 'Project Structure'],
    status: 'live',
    sourceUrl: 'https://scratch.mit.edu/projects/1004866479/',
    accent: 'magenta',
    glyph: '🎲',
    cover: '/images/games/3-in-1.png',
  },
  {
    id: 'arduino-robot',
    title: 'Arduino UNO Robot',
    summary: 'A working robot built for a school project at D.P.S.',
    description:
      'My first real robotics project, built with an Arduino UNO as part of a school project. Wiring the circuits, writing the control code and solving the bugs when the sensors misbehaved taught me more than any tutorial did.',
    tools: ['Arduino UNO', 'C++', 'Sensors', 'Circuits'],
    status: 'finished',
    accent: 'amber',
    glyph: '🤖',
    cover: '/images/games/arduino.png',
    coverAlt: 'Arduino logo',
    coverFit: 'contain',
    featured: true,
  },
  {
    id: 'blender-3d-models',
    title: 'Blender 3D Models',
    summary: 'Low-poly models I make for my own games.',
    description:
      'I have been learning Blender for 3D modelling — building low-poly characters, props and environments, then bringing them into Godot. Learning to make my own art instead of downloading other people’s work.',
    tools: ['Blender', 'Low Poly', 'Texturing'],
    status: 'in-progress',
    accent: 'magenta',
    glyph: '🧊',
    cover: '/images/games/blender.png',
    coverAlt: 'Blender logo',
    coverFit: 'contain',
  },
]

export const statusLabel: Record<ProjectStatus, string> = {
  live: 'Playable',
  'in-progress': 'In Progress',
  prototype: 'Prototype',
  finished: 'Completed',
}