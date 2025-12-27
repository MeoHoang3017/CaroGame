import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    symbol: { type: String, enum: ['X', 'O'] },
    color: String
  }],
  boardSize: { type: Number, default: 15 },
  // Lưu trạng thái bàn cờ hiện tại (optional, có thể tái tạo từ history)
  currentTurn: { type: Number, default: 0 }, // Số nước đã đánh (để xác định lượt)
  // Lưu lịch sử các nước đi để có thể xem lại (Replay)
  history: [{
    x: Number,
    y: Number,
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  result: { 
    type: String, 
    enum: ['win-loss', 'draw', 'ongoing', 'abandoned'], 
    default: 'ongoing' 
  },
  roomCode: { type: String, unique: true }, // Mã phòng để mời bạn bè
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  versionKey: false,
});

const Match = mongoose.model("Match", matchSchema, "matches");

export default Match;

