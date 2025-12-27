/**
 * Game Constants
 * @description Constants used throughout the game
 */

export const GAME_CONSTANTS = {
  MIN_BOARD_SIZE: 10,
  MAX_BOARD_SIZE: 20,
  DEFAULT_BOARD_SIZE: 15,
  WIN_CONDITION: 5, // 5 nước liên tiếp để thắng
  MAX_PLAYERS: 2,
  MIN_PLAYERS: 2,
} as const;

export const MATCH_STATUS = {
  ONGOING: "ongoing",
  WIN_LOSS: "win-loss",
  DRAW: "draw",
  ABANDONED: "abandoned",
} as const;

export const ROOM_STATUS = {
  WAITING: "waiting",
  STARTING: "starting",
  IN_GAME: "in-game",
  CLOSED: "closed",
} as const;

export const PLAYER_SYMBOLS = {
  X: "X",
  O: "O",
} as const;

