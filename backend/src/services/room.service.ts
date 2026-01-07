/**
 * Room Service
 * @description Handles room operations: create, join, leave, start match
 */
import Room from "../models/room.model";
import { matchService } from "./match.service";
import type {
  RoomModel,
  CreateRoomData,
  JoinRoomData,
  LeaveRoomData,
  RoomDocument,
} from "../types/Room";
import { createError } from "../middleware/error.middleware";
import mongoose from "mongoose";

export class RoomService {

  private async findActiveRoomByUser(userId: string) {
    return await Room.findOne({
      players: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userId) },
      },
      status: { $in: ["waiting", "starting", "in-game"] },
      expiresAt: { $gt: new Date() },
    }).lean() as RoomModel | null;
  }

  /**
   * Tạo room mới
   */
  async createRoom(data: CreateRoomData): Promise<RoomModel> {
    //Xử lý việc room mà cả 2 user đang chơi game không thể tạo room mới
    const existing = await this.findActiveRoomByUser(data.hostId);
    if (existing) {
      const existingUser = existing.players.find((player: any) => player.userId.toString() === data.hostId);
      if (existingUser) {
        throw createError(
          `User already in room ${existing.roomCode}. Leave current room before creating a new one.`,
          400
        );
      }
    }

    const maxRetries = 10;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const roomCode = await this.generateRoomCode();

        const room = await Room.create({
          roomCode,
          hostId: new mongoose.Types.ObjectId(data.hostId),
          players: [
            {
              userId: new mongoose.Types.ObjectId(data.hostId),
              joinedAt: new Date(),
            },
          ],
          maxPlayers: data.maxPlayers || 2,
          boardSize: data.boardSize || 15,
          status: "waiting",
          settings: {
            isPrivate: data.isPrivate || false,
            allowSpectators: data.allowSpectators || false,
          },
        } as any);

        const populatedRoom = await Room.findById((room as any)._id)
          .populate("hostId", "username email")
          .populate("players.userId", "username email")
          .lean();

        return populatedRoom as RoomModel;
      } catch (error: any) {
        if (error.code === 11000 && attempts < maxRetries - 1) {
          // Duplicate room code, retry với code mới
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw createError("Failed to create room after multiple attempts", 500);
  }

  /**
   * Tham gia room
   * Sử dụng atomic operation để tránh race condition
   */
  async joinRoom(data: JoinRoomData): Promise<RoomModel> {
    // Nếu user đang ở room khác (waiting/starting/in-game), không cho join room mới
    const existing = await this.findActiveRoomByUser(data.userId);
    if (existing && existing.roomCode !== data.roomCode) {
      throw createError(
        `User already in room ${existing.roomCode}. Leave current room before joining another.`,
        400
      );
    }

    // Sử dụng findOneAndUpdate với atomic operation để tránh race condition
    const joinFilter: any = {
      roomCode: data.roomCode,
      status: "waiting",
      expiresAt: { $gt: new Date() }, // Chỉ lấy rooms chưa expire
      $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] }, // Chỉ update nếu chưa đủ người
      "players.userId": { $ne: new mongoose.Types.ObjectId(data.userId) }, // Chưa tham gia
    };

    const updatedRoom = await (Room as any).findOneAndUpdate(
      joinFilter,
      {
        $addToSet: {
          players: {
            userId: new mongoose.Types.ObjectId(data.userId),
            joinedAt: new Date(),
          }
        }
      },
      { 
        new: true,
        runValidators: true
      }
    )
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .lean();

    if (!updatedRoom) {
      // Nếu không update được, kiểm tra lại để trả về error message chính xác
      const checkRoom = await Room.findOne({ roomCode: data.roomCode })
        .populate("hostId", "username email")
        .populate("players.userId", "username email") as RoomDocument | null;
      
      if (!checkRoom) {
        throw createError("Room not found", 404);
      }

      // Kiểm tra expiration
      if ((checkRoom as any).expiresAt && new Date((checkRoom as any).expiresAt) <= new Date()) {
        throw createError("Room has expired", 400);
      }
      
      if ((checkRoom as any).status !== "waiting") {
        throw createError("Room is not accepting new players", 400);
      }

      // Kiểm tra đã tham gia chưa
      const alreadyJoined = (checkRoom as any).players.some(
        (p: any) => p.userId.toString() === data.userId
      );
      if (alreadyJoined) {
        throw createError("Already in this room", 400);
      }
      
      if ((checkRoom as any).players.length >= (checkRoom as any).maxPlayers) {
        throw createError("Room is full", 400);
      }
      
      throw createError("Failed to join room. Please try again", 400);
    }

    // Kiểm tra lại status sau khi update - nếu đủ người, cập nhật status thành starting
    const finalRoom = await Room.findById((updatedRoom as any)._id)
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .lean();

    if (finalRoom && (finalRoom as any).players.length >= (finalRoom as any).maxPlayers) {
      await Room.findByIdAndUpdate((finalRoom as any)._id, { status: "starting" });
      (finalRoom as any).status = "starting";
    }

    return finalRoom as RoomModel;
  }

  /**
   * Rời khỏi room
   */
  async leaveRoom(data: LeaveRoomData): Promise<void> {
    const room = await Room.findOne({ roomCode: data.roomCode }) as RoomDocument | null;

    if (!room) {
      throw createError("Room not found", 404);
    }

    // Xóa người chơi khỏi room
    (room as any).players = (room as any).players.filter(
      (p: any) => p.userId.toString() !== data.userId
    );

    // Nếu host rời, chuyển host cho người đầu tiên hoặc đóng room
    if ((room as any).hostId.toString() === data.userId) {
      if ((room as any).players.length > 0) {
        (room as any).hostId = (room as any).players[0].userId;
      } else {
        (room as any).status = "closed";
      }
    }

    // Nếu không còn ai, đóng room
    if ((room as any).players.length === 0) {
      (room as any).status = "closed";
    } else if ((room as any).status === "starting") {
      (room as any).status = "waiting";
    }

    await room.save();
  }

  /**
   * Bắt đầu match từ room
   * Sử dụng transaction để đảm bảo atomicity
   * @param roomCode - Room code
   * @param userId - User ID của người yêu cầu start (phải là host)
   */
  async startMatch(roomCode: string, userId: string): Promise<{
    room: RoomModel;
    match: any;
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await this.startMatchWithSession(roomCode, userId, session);
      await session.commitTransaction();
      return result;
    } catch (error: any) {
      // Fallback for standalone MongoDB (no replica set) that doesn't support transactions
      const isTxNotSupported =
        error?.code === 20 ||
        (typeof error?.message === "string" &&
          error.message.includes("Transaction numbers are only allowed"));

      if (isTxNotSupported) {
        // Use non-transactional path as a graceful fallback
        return await this.startMatchWithoutTransaction(roomCode, userId);
      }

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Core start match logic using provided session (transactional path)
   */
  private async startMatchWithSession(
    roomCode: string,
    userId: string,
    session: mongoose.ClientSession
  ): Promise<{ room: RoomModel; match: any }> {
    const room = await Room.findOne({ roomCode })
      .populate("players.userId", "username email")
      .session(session) as RoomDocument | null;

    if (!room) {
      await session.abortTransaction();
      throw createError("Room not found", 404);
    }

    // Kiểm tra user có phải là host không
    if ((room as any).hostId.toString() !== userId) {
      await session.abortTransaction();
      throw createError("Only room host can start the match", 403);
    }

    if ((room as any).status !== "starting" && (room as any).players.length < (room as any).maxPlayers) {
      await session.abortTransaction();
      throw createError("Room is not ready to start", 400);
    }

    if ((room as any).matchId) {
      await session.abortTransaction();
      throw createError("Match already started", 400);
    }

    const players = (room as any).players.map((p: any, index: number) => ({
      userId:
        typeof p.userId === "string"
          ? p.userId
          : p.userId?._id?.toString() || p.userId?.id?.toString(),
      symbol: index === 0 ? "X" : "O", // Người đầu tiên là X
      color: index === 0 ? "#FF0000" : "#0000FF", // Màu mặc định
    }));

    const match = await matchService.createMatch({
      players,
      boardSize: (room as any).boardSize,
      roomCode: (room as any).roomCode,
    }, session);

    // Cập nhật room trong transaction
    (room as any).matchId = new mongoose.Types.ObjectId(match._id);
    (room as any).status = "in-game";
    await room.save({ session });

    const updatedRoom = await Room.findById((room as any)._id)
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .populate("matchId")
      .lean();

    return {
      room: updatedRoom as RoomModel,
      match,
    };
  }

  /**
   * Fallback start match when MongoDB doesn't support transactions (standalone)
   * Still enforces the same checks but without a session/transaction.
   */
  private async startMatchWithoutTransaction(
    roomCode: string,
    userId: string
  ): Promise<{ room: RoomModel; match: any }> {
    const room = await Room.findOne({ roomCode })
      .populate("players.userId", "username email") as RoomDocument | null;

    if (!room) {
      throw createError("Room not found", 404);
    }

    if ((room as any).hostId.toString() !== userId) {
      throw createError("Only room host can start the match", 403);
    }

    if ((room as any).status !== "starting" && (room as any).players.length < (room as any).maxPlayers) {
      throw createError("Room is not ready to start", 400);
    }

    if ((room as any).matchId) {
      throw createError("Match already started", 400);
    }

    const players = (room as any).players.map((p: any, index: number) => ({
      userId:
        typeof p.userId === "string"
          ? p.userId
          : p.userId?._id?.toString() || p.userId?.id?.toString(),
      symbol: index === 0 ? "X" : "O",
      color: index === 0 ? "#FF0000" : "#0000FF",
    }));

    const match = await matchService.createMatch({
      players,
      boardSize: (room as any).boardSize,
      roomCode: (room as any).roomCode,
    });

    (room as any).matchId = new mongoose.Types.ObjectId(match._id);
    (room as any).status = "in-game";
    await room.save();

    const updatedRoom = await Room.findById((room as any)._id)
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .populate("matchId")
      .lean();

    return {
      room: updatedRoom as RoomModel,
      match,
    };
  }

  /**
   * Lấy thông tin room
   * Kiểm tra expiration
   */
  async getRoom(roomCode: string): Promise<RoomModel | null> {
    const room = await Room.findOne({ 
      roomCode,
      expiresAt: { $gt: new Date() } // Chỉ lấy rooms chưa expire
    })
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .populate("matchId")
      .lean();

    return room as RoomModel | null;
  }

  /**
   * Lấy danh sách rooms đang chờ
   * Chỉ lấy rooms chưa expire
   */
  async getAvailableRooms(
    limit: number = 20,
    skip: number = 0
  ): Promise<RoomModel[]> {
    const rooms = await Room.find({
      status: "waiting",
      "settings.isPrivate": false,
      expiresAt: { $gt: new Date() }, // Chỉ lấy rooms chưa expire
    } as any)
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return rooms as RoomModel[];
  }

  /**
   * Reset room for a rematch (clear matchId, set status back to waiting/starting)
   */
  async rematch(roomCode: string, userId: string): Promise<RoomModel> {
    const room = await Room.findOne({ roomCode })
      .populate("players.userId", "username email") as RoomDocument | null;

    if (!room) {
      throw createError("Room not found", 404);
    }

    // Only host can trigger rematch
    if ((room as any).hostId.toString() !== userId) {
      throw createError("Only room host can start a rematch", 403);
    }

    // If match exists and still ongoing, block rematch
    if ((room as any).matchId) {
      const match = await matchService.getMatch((room as any).matchId.toString());
      if (match && match.result === "ongoing") {
        throw createError("Match is still in progress", 400);
      }
    }

    (room as any).matchId = null;
    // If room still has enough players, set to starting, otherwise waiting
    (room as any).status =
      (room as any).players.length >= (room as any).maxPlayers ? "starting" : "waiting";
    // Extend expiration
    (room as any).expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await room.save();

    const updatedRoom = await Room.findById((room as any)._id)
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .populate("matchId")
      .lean();

    return updatedRoom as RoomModel;
  }

  /**
   * Tạo room code ngẫu nhiên và kiểm tra unique
   * @param maxRetries - Số lần retry tối đa (default: 10)
   * @returns Room code unique
   */
  private async generateRoomCode(maxRetries: number = 10): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Kiểm tra code đã tồn tại chưa
      const exists = await Room.findOne({ roomCode: code });
      if (!exists) {
        return code;
      }
    }
    
    throw createError("Failed to generate unique room code", 500);
  }
}

export const roomService = new RoomService();

