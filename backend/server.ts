import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDB } from "./src/config/database";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
