import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World");
});

// Mount API routes
app.use("/api", apiRoutes);

export default app;
