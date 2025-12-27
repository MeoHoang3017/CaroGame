/**
 * Match Service
 * @description Handles match operations: create, join, make move, end match
 */

import Match from "../models/match.model";
import { gameLogicService } from "./game-logic.service";
import type { MatchModel, CreateMatchData, MakeMoveData, MatchDocument } from "../types/Match";
import { createError } from "../middleware/error.middleware";
import mongoose from "mongoose";

export class MatchService {
  /**
   * Tạo match mới từ room
   */
  async createMatch(data: CreateMatchData): Promise<MatchModel> {
    try {
      // Validate players
      if (!data.players || data.players.length !== 2) {
        throw createError("Match must have exactly 2 players", 400);
      }

      // Validate symbols
      const symbols = data.players.map((p) => p.symbol);
      if (new Set(symbols).size !== 2 || !symbols.includes("X") || !symbols.includes("O")) {
        throw createError("Players must have different symbols (X and O)", 400);
      }

      // Generate room code if not provided
      const roomCode = data.roomCode || this.generateRoomCode();

      const match = await Match.create({
        players: data.players,
        boardSize: data.boardSize || 15,
        roomCode,
        result: "ongoing",
        startTime: new Date(),
      } as any);

      return (match as any).toObject() as MatchModel;
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate room code
        const retryData = { ...data };
        delete retryData.roomCode;
        return this.createMatch(retryData); // Retry with new code
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin match
   */
  async getMatch(matchId: string): Promise<MatchModel | null> {
    const match = await Match.findById(matchId)
      .populate("players.userId", "username email")
      .populate("winner", "username")
      .lean();

    return match as MatchModel | null;
  }

  /**
   * Thực hiện nước đi
   */
  async makeMove(data: MakeMoveData): Promise<{
    match: MatchModel;
    isWin: boolean;
    isDraw: boolean;
  }> {
    const match = await Match.findById(data.matchId) as MatchDocument | null;
    if (!match) {
      throw createError("Match not found", 404);
    }

    // Kiểm tra match đã kết thúc chưa
    if ((match as any).result !== "ongoing") {
      throw createError("Match has already ended", 400);
    }

    // Kiểm tra người chơi có trong match không
    const player = (match as any).players.find(
      (p: any) => p.userId.toString() === data.playerId
    );
    if (!player) {
      throw createError("Player not in this match", 403);
    }

    // Tạo board từ history
    const board = gameLogicService.replayBoard(
      (match as any).history.map((move: any) => ({
        x: move.x,
        y: move.y,
        playerId: move.playerId.toString(),
      })),
      (match as any).boardSize,
      (match as any).players.map((p: any) => ({
        userId: p.userId.toString(),
        symbol: p.symbol,
      }))
    );

    // Validate move
    if (!gameLogicService.isValidMove(board, data.x, data.y, (match as any).boardSize)) {
      throw createError("Invalid move", 400);
    }

    // Kiểm tra lượt chơi (người chơi đầu tiên là X, sau đó luân phiên)
    // Sử dụng history.length vì đó là source of truth
    const moveCount = (match as any).history.length;
    const expectedSymbol = moveCount % 2 === 0 ? "X" : "O";
    if (player.symbol !== expectedSymbol) {
      throw createError("Not your turn", 400);
    }

    // Thực hiện nước đi
    const newMove = {
      x: data.x,
      y: data.y,
      playerId: new mongoose.Types.ObjectId(data.playerId),
      timestamp: new Date(),
    };

    (match as any).history.push(newMove);
    (match as any).currentTurn = (match as any).history.length;
    // Board đã được validate, nên data.x và data.y chắc chắn hợp lệ
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    board[data.x]![data.y] = player.symbol;

    // Kiểm tra thắng
    const isWin = gameLogicService.checkWin(
      board,
      data.x,
      data.y,
      player.symbol,
      (match as any).boardSize
    );

    // Kiểm tra hòa
    const isDraw = !isWin && gameLogicService.isBoardFull(board);

    if (isWin) {
      (match as any).winner = new mongoose.Types.ObjectId(data.playerId);
      (match as any).result = "win-loss";
      (match as any).endTime = new Date();
    } else if (isDraw) {
      (match as any).result = "draw";
      (match as any).endTime = new Date();
    }

    await match.save();

    const updatedMatch = await Match.findById(data.matchId)
      .populate("players.userId", "username email")
      .populate("winner", "username")
      .lean();

    return {
      match: updatedMatch as MatchModel,
      isWin,
      isDraw,
    };
  }

  /**
   * Kết thúc match (abandon)
   */
  async endMatch(matchId: string, userId: string): Promise<MatchModel> {
    const match = await Match.findById(matchId) as MatchDocument | null;
    if (!match) {
      throw createError("Match not found", 404);
    }

    if ((match as any).result !== "ongoing") {
      throw createError("Match has already ended", 400);
    }

    // Kiểm tra người chơi có trong match không
    const player = (match as any).players.find(
      (p: any) => p.userId.toString() === userId
    );
    if (!player) {
      throw createError("Player not in this match", 403);
    }

    // Xác định người thắng (người còn lại)
    const winner = (match as any).players.find(
      (p: any) => p.userId.toString() !== userId
    );

    (match as any).result = "abandoned";
    (match as any).winner = winner?.userId || null;
    (match as any).endTime = new Date();

    await match.save();

    const updatedMatch = await Match.findById(matchId)
      .populate("players.userId", "username email")
      .populate("winner", "username")
      .lean();

    return updatedMatch as MatchModel;
  }

  /**
   * Lấy lịch sử match (để replay)
   */
  async getMatchHistory(matchId: string): Promise<MatchModel | null> {
    return this.getMatch(matchId);
  }

  /**
   * Lấy danh sách matches của user
   */
  async getUserMatches(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<MatchModel[]> {
    const matches = await Match.find({
      "players.userId": new mongoose.Types.ObjectId(userId),
    } as any)
      .populate("players.userId", "username email")
      .populate("winner", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return matches as MatchModel[];
  }

  /**
   * Tạo room code ngẫu nhiên
   */
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export const matchService = new MatchService();

