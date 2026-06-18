import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { clearHistory, getHistory, saveHistory } from "./history.controller.js";

export const historyRouter = Router();

historyRouter.use(authMiddleware);

historyRouter.post("/", saveHistory);
historyRouter.get("/", getHistory);
historyRouter.delete("/", clearHistory);
