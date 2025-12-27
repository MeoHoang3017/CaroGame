import { body, param, query } from "express-validator";

/**
 * Room Validation Rules
 */
export const roomValidator = {
  /**
   * Create room validation rules
   */
  createRoom: [
    body("boardSize")
      .optional()
      .isInt({ min: 10, max: 20 })
      .withMessage("Board size must be an integer between 10 and 20")
      .toInt(),

    body("maxPlayers")
      .optional()
      .isInt({ min: 2, max: 2 })
      .withMessage("Max players must be 2"),

    body("isPrivate")
      .optional()
      .isBoolean()
      .withMessage("isPrivate must be a boolean"),

    body("allowSpectators")
      .optional()
      .isBoolean()
      .withMessage("allowSpectators must be a boolean"),
  ],

  /**
   * Join room validation rules
   */
  joinRoom: [
    body("roomCode")
      .trim()
      .notEmpty()
      .withMessage("Room code is required")
      .isLength({ min: 4, max: 10 })
      .withMessage("Room code must be between 4 and 10 characters")
      .matches(/^[A-Z0-9]+$/)
      .withMessage("Room code can only contain uppercase letters and numbers"),
  ],

  /**
   * Get room by code validation
   */
  getRoom: [
    param("code")
      .trim()
      .notEmpty()
      .withMessage("Room code is required")
      .isLength({ min: 4, max: 10 })
      .withMessage("Room code must be between 4 and 10 characters"),
  ],

  /**
   * Leave room validation
   */
  leaveRoom: [
    param("code")
      .trim()
      .notEmpty()
      .withMessage("Room code is required")
      .isLength({ min: 4, max: 10 })
      .withMessage("Room code must be between 4 and 10 characters"),
  ],

  /**
   * Start match validation
   */
  startMatch: [
    param("code")
      .trim()
      .notEmpty()
      .withMessage("Room code is required")
      .isLength({ min: 4, max: 10 })
      .withMessage("Room code must be between 4 and 10 characters"),
  ],

  /**
   * Get available rooms validation
   */
  getAvailableRooms: [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be an integer between 1 and 100")
      .toInt(),

    query("skip")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Skip must be a non-negative integer")
      .toInt(),
  ],
};

