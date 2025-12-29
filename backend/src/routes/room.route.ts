import { Router } from "express";
import { roomController } from "../controllers/room.controller";
import { authenticateJWT, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { roomValidator } from "../validators/room.validator";

const router = Router();

/**
 * @swagger
 * /api/rooms/create:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoom'
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.post("/create", authenticateJWT, validate(roomValidator.createRoom), (req, res) => roomController.createRoom(req, res));

/**
 * @swagger
 * /api/rooms/join:
 *   post:
 *     summary: Join a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinRoom'
 *     responses:
 *       200:
 *         description: Successfully joined room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       400:
 *         description: Bad request (room full, invalid code, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.post("/join", authenticateJWT, validate(roomValidator.joinRoom), (req, res) => roomController.joinRoom(req, res));

/**
 * @swagger
 * /api/rooms/{code}/leave:
 *   post:
 *     summary: Leave a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Room code
 *     responses:
 *       200:
 *         description: Successfully left room
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.post("/:code/leave", authenticateJWT, validate(roomValidator.leaveRoom), (req, res) => roomController.leaveRoom(req, res));

/**
 * @swagger
 * /api/rooms/{code}/start:
 *   post:
 *     summary: Start a match in a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Room code
 *     responses:
 *       200:
 *         description: Match started successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       400:
 *         description: Cannot start match (not enough players, already started, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.post("/:code/start", authenticateJWT, validate(roomValidator.startMatch), (req, res) => roomController.startMatch(req, res));

/**
 * @swagger
 * /api/rooms/{code}:
 *   get:
 *     summary: Get room by code
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Room code
 *     responses:
 *       200:
 *         description: Room retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.get("/:code", optionalAuth, validate(roomValidator.getRoom), (req, res) => roomController.getRoom(req, res));

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get available rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of rooms to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of rooms to skip
 *     responses:
 *       200:
 *         description: Available rooms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.get("/", optionalAuth, validate(roomValidator.getAvailableRooms), (req, res) => roomController.getAvailableRooms(req, res));

export default router;

