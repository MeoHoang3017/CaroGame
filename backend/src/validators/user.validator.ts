import { body, param, query } from "express-validator";

/**
 * User Validation Rules
 */
export const userValidator = {
  /**
   * Get user by ID validation
   */
  getUserById: [
    param("id")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),
  ],

  /**
   * Get user by email validation
   */
  getUserByEmail: [
    param("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),
  ],

  /**
   * Get user by username validation
   */
  getUserByUsername: [
    param("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
  ],

  /**
   * Create guest user validation
   */
  createGuestUser: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
  ],

  /**
   * Update user validation
   */
  updateUser: [
    param("id")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),

    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),

    body("isGuest")
      .optional()
      .isBoolean()
      .withMessage("isGuest must be a boolean"),
  ],

  /**
   * Update password validation
   */
  updatePassword: [
    param("id")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),

    body("oldPassword")
      .notEmpty()
      .withMessage("Old password is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],

  /**
   * Delete user validation
   */
  deleteUser: [
    param("id")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),
  ],

  /**
   * Get users by guest status validation
   */
  getUsersByGuestStatus: [
    param("isGuest")
      .notEmpty()
      .withMessage("isGuest parameter is required")
      .isIn(["true", "false"])
      .withMessage("isGuest must be either 'true' or 'false'"),

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

  /**
   * Get all users validation
   */
  getAllUsers: [
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

