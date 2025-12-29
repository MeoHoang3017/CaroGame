import type { Request, Response } from "express";
import { matchService } from "../services/match.service";
import type { MakeMoveData } from "../types/Match";
import { SuccessResponse, ErrorResponse, sendResponse } from "../utils/response";
import { SYSTEM_MESSAGES } from "../constants/messages";

/**
 * Match Controller
 * @description Handles HTTP requests for match operations
 */
export class MatchController {
  /**
   * Get match by ID
   * GET /api/matches/:id
   * Requires authentication and player check
   */
  async getMatch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      const match = await matchService.getMatch(id);

      if (!match) {
        const response = ErrorResponse.NOT_FOUND("Match");
        return sendResponse(res, response);
      }

      // Kiểm tra user có phải là player trong match không
      const isPlayer = (match as any).players?.some(
        (p: any) => p.userId?.toString() === userId || (p.userId as any)?._id?.toString() === userId
      );

      if (!isPlayer) {
        const response = ErrorResponse.FORBIDDEN;
        return sendResponse(res, response);
      }

      const response = SuccessResponse.ITEM("Match", match);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }

  /**
   * Make a move
   * POST /api/matches/:id/move
   */
  async makeMove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { x, y } = req.body;
      const userId = req.user?.id;

      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      if (typeof x !== "number" || typeof y !== "number") {
        const response = ErrorResponse.BAD_REQUEST_MSG(SYSTEM_MESSAGES.MATCH.INVALID_COORDINATES);
        return sendResponse(res, response);
      }

      const moveData: MakeMoveData = {
        matchId: id,
        x,
        y,
        playerId: userId,
      };

      const result = await matchService.makeMove(moveData);
      const response = SuccessResponse.CUSTOM(200, SYSTEM_MESSAGES.MATCH.MOVE_SUCCESS, result);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.MATCH.MOVE_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * End match (abandon)
   * POST /api/matches/:id/end
   */
  async endMatch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      const match = await matchService.endMatch(id, userId);
      const response = SuccessResponse.CUSTOM(200, SYSTEM_MESSAGES.MATCH.END_SUCCESS, match);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.MATCH.END_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Get match history (for replay)
   * GET /api/matches/:id/history
   * Requires authentication and player check
   */
  async getMatchHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      
      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      const match = await matchService.getMatchHistory(id);

      if (!match) {
        const response = ErrorResponse.NOT_FOUND("Match");
        return sendResponse(res, response);
      }

      // Kiểm tra user có phải là player trong match không
      const isPlayer = (match as any).players?.some(
        (p: any) => p.userId?.toString() === userId || (p.userId as any)?._id?.toString() === userId
      );

      if (!isPlayer) {
        const response = ErrorResponse.FORBIDDEN;
        return sendResponse(res, response);
      }

      const response = SuccessResponse.ITEM("Match history", match);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }

  /**
   * Get user's matches
   * GET /api/matches/user/:userId
   * Requires authentication and ownership check
   */
  async getUserMatches(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { userId: targetUserId } = req.params;
      
      if (!targetUserId) {
        const response = ErrorResponse.MISSING_FIELDS(["userId"]);
        return sendResponse(res, response);
      }

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      // Kiểm tra quyền - user chỉ có thể xem matches của chính mình
      if (userId !== targetUserId) {
        const response = ErrorResponse.FORBIDDEN;
        return sendResponse(res, response);
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const matches = await matchService.getUserMatches(targetUserId, limit, skip);

      const response = SuccessResponse.CUSTOM(200, "Matches retrieved successfully", {
        matches,
        pagination: {
          limit,
          skip,
          total: matches.length,
        },
      });
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }
}

export const matchController = new MatchController();

