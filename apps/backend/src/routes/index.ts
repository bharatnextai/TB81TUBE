import { Router } from "express";
import { env, envDiagnostics } from "../config/env.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { connectionsRouter } from "../modules/connections/connections.routes.js";
import { favoritesRouter } from "../modules/library/favorites.routes.js";
import { historyRouter } from "../modules/library/history.routes.js";
import { playlistsRouter } from "../modules/library/playlists.routes.js";
import { searchRouter } from "../modules/search/search.routes.js";
import { youtubeRouter } from "../modules/youtube/youtube.routes.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const apiRouter = Router();

apiRouter.get("/status", (_req, res) => {
  return sendSuccess(res, "API v1 is active");
});

apiRouter.get("/status/config", (_req, res) => {
  if (env.NODE_ENV === "production") {
    return res.status(404).json({
      success: false,
      message: "Not found"
    });
  }

  return sendSuccess(res, "Development config status fetched successfully", {
    devMockYouTubeAuthEnabled: envDiagnostics.devMockYouTubeAuthEnabled,
    googleClientIdConfigured: envDiagnostics.googleClientIdConfigured,
    googleClientIdLooksValid: envDiagnostics.googleClientIdLooksValid,
    googleClientSecretConfigured: envDiagnostics.googleClientSecretConfigured,
    googleRedirectUriConfigured: envDiagnostics.googleRedirectUriConfigured
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/connections", connectionsRouter);
apiRouter.use("/youtube", youtubeRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/favorites", favoritesRouter);
apiRouter.use("/history", historyRouter);
apiRouter.use("/playlists", playlistsRouter);
