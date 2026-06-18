import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { clearSearchHistory, getSearchHistory, search } from "./search.controller.js";

export const searchRouter = Router();

searchRouter.get("/", authMiddleware, search);
searchRouter.get("/history", authMiddleware, getSearchHistory);
searchRouter.delete("/history", authMiddleware, clearSearchHistory);
