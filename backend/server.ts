
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./src/app";
import { connectDB } from "./src/config/database";
import { socketAuth } from "./src/socket/socket.middleware";
import { SocketHandler } from "./src/socket/socket.handler";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Create HTTP server
  const httpServer = createServer(app);

  // Create Socket.io server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(socketAuth);

  // Initialize socket handlers
  new SocketHandler(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.io server initialized`);
  });

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Please stop the other process or use a different port.`);
      console.error(`   You can find the process using: netstat -ano | findstr :${PORT}`);
      console.error(`   Then kill it using: taskkill /PID <PID> /F`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", error);
      process.exit(1);
    }
  });
};

startServer();
