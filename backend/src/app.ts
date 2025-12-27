import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import apiRoutes from "./routes/index";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello World");
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Caro Game API Documentation",
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req: express.Request, res: express.Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Mount API routes
app.use("/api", apiRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
