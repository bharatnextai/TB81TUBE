import { app } from "./app.js";
import { env, envDiagnostics } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);

  if (env.NODE_ENV === "development") {
    console.log("Backend env file:", envDiagnostics.envPath);
    console.log("Backend NODE_ENV:", env.NODE_ENV);
    console.log("DEV_MOCK_YOUTUBE_AUTH enabled:", envDiagnostics.devMockYouTubeAuthEnabled);
    console.log("Google OAuth config:", {
      googleClientIdConfigured: envDiagnostics.googleClientIdConfigured,
      googleClientIdLooksValid: envDiagnostics.googleClientIdLooksValid,
      googleClientIdMasked: envDiagnostics.googleClientIdMasked || null,
      googleClientSecretConfigured: envDiagnostics.googleClientSecretConfigured,
      googleRedirectUriConfigured: envDiagnostics.googleRedirectUriConfigured
    });
  }
});
