import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { addFavorite, getFavorites, removeFavorite } from "./favorites.controller.js";

export const favoritesRouter = Router();

favoritesRouter.use(authMiddleware);

favoritesRouter.post("/", addFavorite);
favoritesRouter.get("/", getFavorites);
favoritesRouter.delete("/:contentItemId", removeFavorite);
