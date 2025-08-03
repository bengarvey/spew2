# Spew 2

A retro-style Tetris game with rotating and zooming effects that activate at higher levels, inspired by the original Spew written in Perl TCL/Tk.

## Features

- Classic Tetris gameplay with NES scoring system
- Board rotation effects starting at level 2
- Zoom in/out effects starting at level 4
- Random rotation direction changes at level 6
- Retro 8-bit styling with accessible colors
- Mobile-friendly responsive design
- Sound effects using Web Audio API
- Pause and menu system

## How to Play

1. Open `index.html` in a modern web browser
2. Use arrow keys to control the falling pieces:
   - **←→** Move left/right
   - **↓** Drop faster
   - **↑** Rotate piece
   - **SPACE** Pause/resume
   - **ESC** Open menu

## Game Mechanics

- **Scoring**: Uses classic NES Tetris scoring (40, 100, 300, 1200 points × level for 1-4 lines)
- **Levels**: Every 10 lines cleared increases the level
- **Speed**: Game speed increases with each level
- **Rotation**: Board slowly rotates clockwise starting at level 2
- **Zoom**: Board zooms in/out starting at level 4
- **Random Rotation**: Direction changes randomly at level 6

## Files

- `index.html` - Main HTML structure
- `styles.css` - Retro styling and responsive design
- `game.js` - Main game logic and mechanics
- `game-constants.js` - Game configuration and constants
- `plan.md` - Original game specifications

## Browser Compatibility

Requires a modern browser with support for:
- HTML5 Canvas
- Web Audio API
- ES6 Classes
- CSS Grid/Flexbox

## Development

The game constants in `game-constants.js` can be easily modified to adjust:
- Game speeds and timing
- Rotation and zoom effects
- Colors and styling
- Sound settings

## Credits

Inspired by the original Spew game written in Perl TCL/Tk. This is a modern web-based recreation with enhanced features and mobile support. 