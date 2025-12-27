import { Router } from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import matchRoutes from "./match.route";
import roomRoutes from "./room.route";

const router = Router();

// Mount route handlers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/matches", matchRoutes);
router.use("/rooms", roomRoutes);

export default router;