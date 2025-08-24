// Game Constants for Spew 2
const GAME_CONFIG = {
  // Board dimensions
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  CELL_SIZE: 25,
  
  // Canvas padding for rotation (extra space around board)
  CANVAS_PADDING: 100,
  
  // Game speeds (milliseconds between drops)
  BASE_SPEED: 1000,
  SPEED_INCREASE_PER_LEVEL: 200,
  MIN_SPEED: 100,
  
  // Rotation speeds (degrees per second)
  BASE_ROTATION_SPEED: 5,
  ROTATION_SPEED_INCREASE: 2,
  
  // Zoom settings
  ZOOM_MIN: 0.2,
  ZOOM_MAX: 1.0,
  ZOOM_CYCLE_TIME: 2000, // milliseconds for full zoom cycle
  
  // Level thresholds
  ROTATION_START_LEVEL: 1,
  ZOOM_START_LEVEL: 4,
  RANDOM_ROTATION_START_LEVEL: 6,
  
  // Scoring (NES Tetris system)
  SCORE_MULTIPLIERS: {
    1: 40,   // 1 line
    2: 100,  // 2 lines
    3: 300,  // 3 lines
    4: 1200  // 4 lines (Tetris)
  },
  
  // Lines per level
  LINES_PER_LEVEL: 10
};

// Tetris pieces (I, O, T, S, Z, J, L)
const PIECES = {
  I: {
    shape: [
      [1, 1, 1, 1]
    ],
    color: '#00FFFF', // Cyan
    rotations: 2
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FFFF00', // Yellow
    rotations: 1
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#800080', // Purple
    rotations: 4
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00FF00', // Green
    rotations: 2
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#FF0000', // Red
    rotations: 2
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000FF', // Blue
    rotations: 4
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#FF8000', // Orange
    rotations: 4
  }
};

// UI Colors
const UI_COLORS = {
  background: '#1a1a1a',
  boardBackground: '#000000',
  gridLines: '#333333',
  text: '#FFFFFF',
  scoreText: '#FFFF00',
  levelText: '#00FFFF',
  gameOverText: '#FF0000',
  pauseText: '#FFFF00'
};

// Sound settings
const SOUND_CONFIG = {
  enabled: true,
  volume: 0.3,
  effects: {
    move: 'move.wav',
    rotate: 'rotate.wav',
    drop: 'drop.wav',
    lineClear: 'line-clear.wav',
    tetris: 'tetris.wav',
    gameOver: 'game-over.wav'
  }
};

// Music settings
const MUSIC_CONFIG = {
  enabled: true,
  defaultVolume: 0.5,
  autoPlay: true,
  fadeInDuration: 2000, // milliseconds
  fadeOutDuration: 1000 // milliseconds
}; 