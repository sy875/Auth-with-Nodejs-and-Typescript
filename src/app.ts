import express from "express";
import cors from "cors";
import connectDb from "./db";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser"
const app = express();

dotenv.config();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser())

app.use(
  cors({
    origin: "*",
  })
);

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware";

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
