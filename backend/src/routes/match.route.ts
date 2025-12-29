import { Router } from "express";
import { matchController } from "../controllers/match.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { matchValidator } from "../validators/match.validator";

const router = Router();

// All match routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Match not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.get("/:id", validate(matchValidator.getMatch), (req, res) => matchController.getMatch(req, res));

/**
 * @swagger
 * /api/matches/{id}/move:
 *   post:
 *     summary: Make a move in a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MakeMove'
 *     responses:
 *       200:
 *         description: Move made successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       400:
 *         description: Invalid move or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.post("/:id/move", validate(matchValidator.makeMove), (req, res) => matchController.makeMove(req, res));

/**
 * @swagger
 * /api/matches/{id}/end:
 *   post:
 *     summary: End a match (abandon)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Match not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.post("/:id/end", validate(matchValidator.endMatch), (req, res) => matchController.endMatch(req, res));

/**
 * @swagger
 * /api/matches/{id}/history:
 *   get:
 *     summary: Get match history (for replay)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       404:
 *         description: Match not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.get("/:id/history", validate(matchValidator.getMatchHistory), (req, res) => matchController.getMatchHistory(req, res));

/**
 * @swagger
 * /api/matches/user/{userId}:
 *   get:
 *     summary: Get all matches for a user
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of matches to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of matches to skip
 *     responses:
 *       200:
 *         description: User matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.get("/user/:userId", validate(matchValidator.getUserMatches), (req, res) => matchController.getUserMatches(req, res));

export default router;

