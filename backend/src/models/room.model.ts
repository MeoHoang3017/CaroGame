import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomCode: { 
    type: String, 
    unique: true, 
    required: true,
    index: true
  },
  hostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now }
  }],
  maxPlayers: { 
    type: Number, 
    default: 2 
  },
  boardSize: { 
    type: Number, 
    default: 15 
  },
  status: { 
    type: String, 
    enum: ['waiting', 'starting', 'in-game', 'closed'], 
    default: 'waiting' 
  },
  matchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Match', 
    default: null 
  },
  settings: {
    isPrivate: { type: Boolean, default: false },
    allowSpectators: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  versionKey: false,
});

// Index for faster queries
roomSchema.index({ status: 1, createdAt: -1 });
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Room = mongoose.model("Room", roomSchema, "rooms");

export default Room;

