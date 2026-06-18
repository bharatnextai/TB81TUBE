import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { env, envDiagnostics } from "../../config/env.js";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { connectMockYouTubeAccount, createYouTubeConnectionUrl, deleteConnection, handleYouTubeCallback, listConnections } from "./connections.service.js";

export async function getConnections(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const connections = await listConnections(userId);

    return sendSuccess(res, "Connected accounts fetched successfully", connections);
  } catch (error) {
    return next(error);
  }
}

export async function startYouTubeConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (envDiagnostics.devMockYouTubeAuthEnabled) {
      await connectMockYouTubeAccount(userId);

      console.log("Development mock YouTube account connected", {
        platform: "YOUTUBE",
        platformUserId: "mock-youtube-user"
      });

      return sendSuccess(res, "Mock YouTube account connected for development", {
        mockConnected: true
      });
    }

    const url = createYouTubeConnectionUrl(userId);

    return sendSuccess(res, "YouTube OAuth URL generated", { url });
  } catch (error) {
    return next(error);
  }
}

export async function completeYouTubeConnection(req: Request, res: Response) {
  const redirectBaseUrl = `${env.FRONTEND_URL}/connected-accounts`;

  try {
    const query = z
      .object({
        code: z.string().min(1),
        state: z.string().min(1)
      })
      .parse(req.query);

    await handleYouTubeCallback(query.code, query.state);

    return res.redirect(`${redirectBaseUrl}?youtube=connected`);
  } catch {
    return res.redirect(`${redirectBaseUrl}?youtube=failed`);
  }
}

export async function removeConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = z.object({ id: z.string().min(1) }).parse(req.params);

    await deleteConnection(userId, params.id);

    return sendSuccess(res, "Connected account removed successfully");
  } catch (error) {
    return next(error);
  }
}
