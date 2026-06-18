import { google } from "googleapis";
import { env, envDiagnostics } from "../../../config/env.js";
import { ApiError } from "../../../utils/apiError.js";

export const youtubeOAuthScopes = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

function createOAuthClient() {
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

function ensureGoogleOAuthConfigured() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    throw new ApiError(500, "Google OAuth is not configured. Add real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to apps/backend/.env, not .env.example, then restart backend.");
  }

  if (!envDiagnostics.googleClientIdLooksValid) {
    throw new ApiError(500, "Google OAuth setup is invalid. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in apps/backend/.env.");
  }
}

export function generateYouTubeOAuthUrl(state: string) {
  ensureGoogleOAuthConfigured();

  return createOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: youtubeOAuthScopes,
    state
  });
}

export async function exchangeYouTubeOAuthCode(code: string) {
  ensureGoogleOAuthConfigured();

  const { tokens } = await createOAuthClient().getToken(code);

  if (!tokens.access_token) {
    throw new ApiError(400, "Google OAuth did not return an access token.");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    scope: tokens.scope ?? youtubeOAuthScopes.join(" ")
  };
}

export async function fetchYouTubeAccountInfo(tokens: { accessToken: string; refreshToken?: string | null }) {
  ensureGoogleOAuthConfigured();

  const oauthClient = createOAuthClient();
  oauthClient.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken ?? undefined
  });

  const youtube = google.youtube({ version: "v3", auth: oauthClient });
  const channelResponse = await youtube.channels.list({
    part: ["id", "snippet"],
    mine: true
  });

  const channel = channelResponse.data.items?.[0];
  if (channel?.id) {
    return {
      platformUserId: channel.id,
      displayName: channel.snippet?.title ?? null
    };
  }

  const oauth2 = google.oauth2({ version: "v2", auth: oauthClient });
  const userInfoResponse = await oauth2.userinfo.get();

  if (!userInfoResponse.data.id) {
    throw new ApiError(400, "Could not fetch Google account information.");
  }

  return {
    platformUserId: userInfoResponse.data.id,
    displayName: userInfoResponse.data.name ?? userInfoResponse.data.email ?? null
  };
}
