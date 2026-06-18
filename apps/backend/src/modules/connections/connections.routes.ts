import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  completeYouTubeConnection,
  getConnections,
  removeConnection,
  startYouTubeConnection
} from "./connections.controller.js";

export const connectionsRouter = Router();

connectionsRouter.get("/", authMiddleware, getConnections);
connectionsRouter.get("/youtube/start", authMiddleware, startYouTubeConnection);
connectionsRouter.get("/youtube/callback", completeYouTubeConnection);
connectionsRouter.delete("/:id", authMiddleware, removeConnection);
