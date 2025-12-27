import { Types, Document } from "mongoose";

export interface Player {
  userId: Types.ObjectId | string;
  symbol: 'X' | 'O';
  color?: string;
}

export interface Move {
  x: number;
  y: number;
  playerId: Types.ObjectId | string;
  timestamp: Date;
}

export interface MatchModel {
  _id?: Types.ObjectId;
  players: Player[];
  boardSize: number;
  currentTurn?: number;
  history: Move[];
  winner: Types.ObjectId | string | null;
  result: 'win-loss' | 'draw' | 'ongoing' | 'abandoned';
  roomCode: string;
  startTime: Date;
  endTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface cho Mongoose Document (khi fetch từ DB không dùng lean())
 */
export interface MatchDocument extends Document {
  players: Array<{
    userId: Types.ObjectId;
    symbol: 'X' | 'O';
    color?: string;
  }>;
  boardSize: number;
  currentTurn: number;
  history: Array<{
    x: number;
    y: number;
    playerId: Types.ObjectId;
    timestamp: Date;
  }>;
  winner: Types.ObjectId | null;
  result: 'win-loss' | 'draw' | 'ongoing' | 'abandoned';
  roomCode: string;
  startTime: Date;
  endTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMatchData {
  players: Player[];
  boardSize?: number;
  roomCode?: string | undefined;
}

export interface MakeMoveData {
  matchId: string;
  x: number;
  y: number;
  playerId: string;
}

export interface JoinMatchData {
  matchId: string;
  userId: string;
  symbol?: 'X' | 'O';
  color?: string;
}

