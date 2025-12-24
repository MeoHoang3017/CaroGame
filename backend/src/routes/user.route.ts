import { Router } from "express";
import { userController } from "../controllers/user.controller";

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination
 * @access  Public
 */
router.get("/", (req, res) => {
  userController.getAllUsers(req, res);
});

/**
 * @route   GET /api/users/count
 * @desc    Get total user count
 * @access  Public
 */
router.get("/count", (req, res) => {
  userController.getUserCount(req, res);
});

/**
 * @route   GET /api/users/guests/:isGuest
 * @desc    Get users by guest status
 * @access  Public
 */
router.get("/guests/:isGuest", (req, res) => {
  userController.getUsersByGuestStatus(req, res);
});

/**
 * @route   GET /api/users/email/:email
 * @desc    Get user by email
 * @access  Public
 */
router.get("/email/:email", (req, res) => {
  userController.getUserByEmail(req, res);
});

/**
 * @route   GET /api/users/username/:username
 * @desc    Get user by username
 * @access  Public
 */
router.get("/username/:username", (req, res) => {
  userController.getUserByUsername(req, res);
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get("/:id", (req, res) => {
  userController.getUserById(req, res);
});

/**
 * @route   POST /api/users/guest
 * @desc    Create a guest user
 * @access  Public
 */
router.post("/guest", (req, res) => {
  userController.createGuestUser(req, res);
});

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Public
 */
router.put("/:id/password", (req, res) => {
  userController.updatePassword(req, res);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 * @access  Public
 */
router.put("/:id", (req, res) => {
  userController.updateUser(req, res);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.delete("/:id", (req, res) => {
  userController.deleteUser(req, res);
});

export default router;
