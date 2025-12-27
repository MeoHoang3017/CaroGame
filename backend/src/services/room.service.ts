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
  /**
   * Tạo room mới
   */
  async createRoom(data: CreateRoomData): Promise<RoomModel> {
    try {
      const roomCode = this.generateRoomCode();

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
      if (error.code === 11000) {
        // Duplicate room code, retry
        return this.createRoom(data);
      }
      throw error;
    }
  }

  /**
   * Tham gia room
   */
  async joinRoom(data: JoinRoomData): Promise<RoomModel> {
    const room = await Room.findOne({ roomCode: data.roomCode })
      .populate("hostId", "username email")
      .populate("players.userId", "username email") as RoomDocument | null;

    if (!room) {
      throw createError("Room not found", 404);
    }

    if ((room as any).status !== "waiting") {
      throw createError("Room is not accepting new players", 400);
    }

    // Kiểm tra đã tham gia chưa
    const alreadyJoined = (room as any).players.some(
      (p: any) => p.userId.toString() === data.userId
    );
    if (alreadyJoined) {
      throw createError("Already in this room", 400);
    }

    // Kiểm tra số lượng người chơi
    if ((room as any).players.length >= (room as any).maxPlayers) {
      throw createError("Room is full", 400);
    }

    // Thêm người chơi
    (room as any).players.push({
      userId: new mongoose.Types.ObjectId(data.userId),
      joinedAt: new Date(),
    });

    // Nếu đủ người, chuyển sang trạng thái starting
    if ((room as any).players.length >= (room as any).maxPlayers) {
      (room as any).status = "starting";
    }

    await room.save();

    const updatedRoom = await Room.findById((room as any)._id)
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .lean();

    return updatedRoom as RoomModel;
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
   */
  async startMatch(roomCode: string): Promise<{
    room: RoomModel;
    match: any;
  }> {
    const room = await Room.findOne({ roomCode })
      .populate("players.userId", "username email") as RoomDocument | null;

    if (!room) {
      throw createError("Room not found", 404);
    }

    if ((room as any).status !== "starting" && (room as any).players.length < (room as any).maxPlayers) {
      throw createError("Room is not ready to start", 400);
    }

    if ((room as any).matchId) {
      throw createError("Match already started", 400);
    }

    // Tạo match từ room
    const players = (room as any).players.map((p: any, index: number) => ({
      userId: p.userId.toString(),
      symbol: index === 0 ? "X" : "O", // Người đầu tiên là X
      color: index === 0 ? "#FF0000" : "#0000FF", // Màu mặc định
    }));

    const match = await matchService.createMatch({
      players,
      boardSize: (room as any).boardSize,
      roomCode: (room as any).roomCode,
    });

    // Cập nhật room
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
   */
  async getRoom(roomCode: string): Promise<RoomModel | null> {
    const room = await Room.findOne({ roomCode })
      .populate("hostId", "username email")
      .populate("players.userId", "username email")
      .populate("matchId")
      .lean();

    return room as RoomModel | null;
  }

  /**
   * Lấy danh sách rooms đang chờ
   */
  async getAvailableRooms(
    limit: number = 20,
    skip: number = 0
  ): Promise<RoomModel[]> {
    const rooms = await Room.find({
      status: "waiting",
      "settings.isPrivate": false,
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
   * Tạo room code ngẫu nhiên
   */
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export const roomService = new RoomService();

