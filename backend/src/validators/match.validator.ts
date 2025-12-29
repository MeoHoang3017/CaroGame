import { body, param, query } from "express-validator";

/**
 * Match Validation Rules
 */
export const matchValidator = {
  /**
   * Make move validation rules
   */
  makeMove: [
    param("id")
      .notEmpty()
      .withMessage("Match ID is required")
      .isMongoId()
      .withMessage("Invalid match ID format"),

    body("x")
      .notEmpty()
      .withMessage("X coordinate is required")
      .isInt({ min: 0, max: 19 }) // Board size tối đa là 20 (0-19), có thể điều chỉnh
      .withMessage("X coordinate must be between 0 and 19")
      .toInt(),

    body("y")
      .notEmpty()
      .withMessage("Y coordinate is required")
      .isInt({ min: 0, max: 19 }) // Board size tối đa là 20 (0-19), có thể điều chỉnh
      .withMessage("Y coordinate must be between 0 and 19")
      .toInt(),
  ],

  /**
   * Get match by ID validation
   */
  getMatch: [
    param("id")
      .notEmpty()
      .withMessage("Match ID is required")
      .isMongoId()
      .withMessage("Invalid match ID format"),
  ],

  /**
   * End match validation
   */
  endMatch: [
    param("id")
      .notEmpty()
      .withMessage("Match ID is required")
      .isMongoId()
      .withMessage("Invalid match ID format"),
  ],

  /**
   * Get match history validation
   */
  getMatchHistory: [
    param("id")
      .notEmpty()
      .withMessage("Match ID is required")
      .isMongoId()
      .withMessage("Invalid match ID format"),
  ],

  /**
   * Get user matches validation
   */
  getUserMatches: [
    param("userId")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),

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

