import { Types, Document } from "mongoose";

export interface RoomPlayer {
  userId: Types.ObjectId | string;
  joinedAt: Date;
}

export interface RoomSettings {
  isPrivate: boolean;
  allowSpectators: boolean;
}

export interface RoomModel {
  _id?: Types.ObjectId;
  roomCode: string;
  hostId: Types.ObjectId | string;
  players: RoomPlayer[];
  maxPlayers: number;
  boardSize: number;
  status: 'waiting' | 'starting' | 'in-game' | 'closed';
  matchId: Types.ObjectId | string | null;
  settings: RoomSettings;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

/**
 * Interface cho Mongoose Document (khi fetch từ DB không dùng lean())
 */
export interface RoomDocument extends Document {
  roomCode: string;
  hostId: Types.ObjectId;
  players: Array<{
    userId: Types.ObjectId;
    joinedAt: Date;
  }>;
  maxPlayers: number;
  boardSize: number;
  status: 'waiting' | 'starting' | 'in-game' | 'closed';
  matchId: Types.ObjectId | null;
  settings: {
    isPrivate: boolean;
    allowSpectators: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
}

export interface CreateRoomData {
  hostId: string;
  boardSize?: number;
  maxPlayers?: number;
  isPrivate?: boolean;
  allowSpectators?: boolean;
}

export interface JoinRoomData {
  roomCode: string;
  userId: string;
}

export interface LeaveRoomData {
  roomCode: string;
  userId: string;
}

