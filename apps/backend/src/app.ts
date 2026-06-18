import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { sendSuccess } from "./utils/apiResponse.js";

export const app = express();

const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked request from origin: ${origin}`));
    }
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  return sendSuccess(res, "Welcome to TB81TUBE API");
});

app.get("/health", (_req, res) => {
  return sendSuccess(res, "TB81TUBE backend is running");
});

app.use("/api/v1", apiRouter);
app.use(errorHandler);
