import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", (req, res) => {
  authController.register(req, res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", (req, res) => {
  authController.login(req, res);
});

export default router;

