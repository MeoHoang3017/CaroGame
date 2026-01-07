import type { Request, Response } from "express";
import { roomService } from "../services/room.service";
import type { CreateRoomData, JoinRoomData, LeaveRoomData } from "../types/Room";
import { SuccessResponse, ErrorResponse, sendResponse } from "../utils/response";
import { SYSTEM_MESSAGES } from "../constants/messages";

/**
 * Room Controller
 * @description Handles HTTP requests for room operations
 */
export class RoomController {
  /**
   * Create a new room
   * POST /api/rooms/create
   */
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      const roomData: CreateRoomData = {
        hostId: userId,
        boardSize: req.body.boardSize,
        maxPlayers: req.body.maxPlayers,
        isPrivate: req.body.isPrivate,
        allowSpectators: req.body.allowSpectators,
      };

      const room = await roomService.createRoom(roomData);
      const response = SuccessResponse.CREATED("Room", room);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.ROOM.CREATE_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Join a room
   * POST /api/rooms/join
   */
  async joinRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { roomCode } = req.body;

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      if (!roomCode) {
        const response = ErrorResponse.MISSING_FIELDS(["roomCode"]);
        return sendResponse(res, response);
      }

      const joinData: JoinRoomData = {
        roomCode,
        userId,
      };

      const room = await roomService.joinRoom(joinData);
      const response = SuccessResponse.CUSTOM(200, SYSTEM_MESSAGES.ROOM.JOIN_SUCCESS, room);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.ROOM.JOIN_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Leave a room
   * POST /api/rooms/:code/leave
   */
  async leaveRoom(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { code } = req.params;

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      if (!code) {
        const response = ErrorResponse.MISSING_FIELDS(["code"]);
        return sendResponse(res, response);
      }

      const leaveData: LeaveRoomData = {
        roomCode: code,
        userId,
      };

      await roomService.leaveRoom(leaveData);
      const response = SuccessResponse.CUSTOM(200, SYSTEM_MESSAGES.ROOM.LEAVE_SUCCESS, null);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.ROOM.LEAVE_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Get room by code
   * GET /api/rooms/:code
   */
  async getRoom(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      if (!code) {
        const response = ErrorResponse.MISSING_FIELDS(["code"]);
        return sendResponse(res, response);
      }

      const room = await roomService.getRoom(code);

      if (!room) {
        const response = ErrorResponse.NOT_FOUND("Room");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.ITEM("Room", room);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }

  /**
   * Get available rooms
   * GET /api/rooms
   */
  async getAvailableRooms(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;

      const rooms = await roomService.getAvailableRooms(limit, skip);

      const response = SuccessResponse.CUSTOM(200, "Available rooms retrieved successfully", {
        rooms,
        pagination: {
          limit,
          skip,
          total: rooms.length,
        },
      });
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }

  /**
   * Start match from room
   * POST /api/rooms/:code/start
   */
  async startMatch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { code } = req.params;

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      if (!code) {
        const response = ErrorResponse.MISSING_FIELDS(["code"]);
        return sendResponse(res, response);
      }

      const result = await roomService.startMatch(code, userId);
      const response = SuccessResponse.CUSTOM(200, SYSTEM_MESSAGES.MATCH.CREATE_SUCCESS, result);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.MATCH.CREATE_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Rematch (reset room to start a new match)
   * POST /api/rooms/:code/rematch
   */
  async rematch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { code } = req.params;

      if (!userId) {
        const response = ErrorResponse.UNAUTHORIZED;
        return sendResponse(res, response);
      }

      if (!code) {
        const response = ErrorResponse.MISSING_FIELDS(["code"]);
        return sendResponse(res, response);
      }

      const room = await roomService.rematch(code, userId);
      const response = SuccessResponse.CUSTOM(200, "Room reset for rematch", room);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || "Failed to reset room for rematch",
        error
      );
      sendResponse(res, response);
    }
  }
}

export const roomController = new RoomController();

