import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDir, "../../.env");

dotenv.config({ path: envPath });

const booleanEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return false;
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string({
    required_error: "DATABASE_URL is required. Add it to apps/backend/.env."
  }).min(1, "DATABASE_URL cannot be empty."),
  JWT_SECRET: z.string({
    required_error: "JWT_SECRET is required. Add it to apps/backend/.env."
  }).min(24, "JWT_SECRET must be at least 24 characters."),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:8081,http://localhost:19006,http://localhost:4000"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_REDIRECT_URI: z
    .string()
    .url("GOOGLE_REDIRECT_URI must be a valid URL.")
    .default("http://localhost:4000/api/v1/connections/youtube/callback"),
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL.").default("http://localhost:8081"),
  DEV_MOCK_YOUTUBE_AUTH: booleanEnv.default(false)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const messages = parsedEnv.error.issues.map((issue) => `- ${issue.message}`).join("\n");
  throw new Error(`Missing or invalid backend environment variables:\n${messages}\n\nCreate apps/backend/.env from apps/backend/.env.example.`);
}

export const env = parsedEnv.data;

function isGoogleClientIdLikelyValid(clientId: string, clientSecret: string) {
  const trimmedClientId = clientId.trim();
  const trimmedClientSecret = clientSecret.trim();

  if (!trimmedClientId) {
    return false;
  }

  if (trimmedClientId !== clientId) {
    return false;
  }

  if (trimmedClientId === trimmedClientSecret) {
    return false;
  }

  if (trimmedClientId.includes("GOCSPX-")) {
    return false;
  }

  return trimmedClientId.endsWith(".apps.googleusercontent.com");
}

function maskGoogleClientId(clientId: string) {
  const trimmedClientId = clientId.trim();

  if (!trimmedClientId) {
    return "";
  }

  const suffix = ".apps.googleusercontent.com";
  if (trimmedClientId.endsWith(suffix)) {
    return `${trimmedClientId.slice(0, 4)}...${suffix}`;
  }

  return `${trimmedClientId.slice(0, 4)}...`;
}

export const envDiagnostics = {
  envPath,
  devMockYouTubeAuthEnabled: env.NODE_ENV === "development" && env.DEV_MOCK_YOUTUBE_AUTH,
  googleClientIdConfigured: env.GOOGLE_CLIENT_ID.trim().length > 0,
  googleClientIdLooksValid: isGoogleClientIdLikelyValid(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET),
  googleClientIdMasked: maskGoogleClientId(env.GOOGLE_CLIENT_ID),
  googleClientSecretConfigured: env.GOOGLE_CLIENT_SECRET.trim().length > 0,
  googleRedirectUriConfigured: env.GOOGLE_REDIRECT_URI.trim().length > 0
};
