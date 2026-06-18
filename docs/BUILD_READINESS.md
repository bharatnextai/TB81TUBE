# TB81TUBE Build Readiness Notes

TB81TUBE is currently a development MVP. It is ready for local QA testing, but it is not production release-ready until real OAuth, legal, and build checks are completed.

The final app must use a hosted backend for connected platform APIs. The mobile app should call the TB81TUBE backend only for private account data, search, playlists, favorites, history, and platform playback information.

## Current Development Mode

- `DEV_MOCK_YOUTUBE_AUTH=true` is allowed only for local development.
- Mock YouTube mode helps test mobile flows without real Google OAuth credentials.
- Mock mode does not fetch real YouTube account data.
- Mock mode must not be used in production builds.

## Before Release Or External Testing

- Deploy the backend to a reachable hosted environment.
- Point the mobile app to the hosted backend:
  ```env
  EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
  ```
- Set this in `apps/backend/.env`:
  ```env
  DEV_MOCK_YOUTUBE_AUTH=false
  ```
- Add real backend-only Google OAuth credentials:
  ```env
  GOOGLE_CLIENT_ID="your_web_client_id.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="your_client_secret"
  GOOGLE_REDIRECT_URI="https://your-api-domain.com/api/v1/connections/youtube/callback"
  ```
- Test real Google OAuth end to end.
- Test connected platform APIs through the hosted backend.
- Confirm the OAuth consent screen is configured and, if required, verified.
- Confirm production CORS origins are restricted to real app/web domains.
- Confirm `.env` files and secrets are not committed.
- Run typecheck and backend database checks.
- Test on Android device or emulator before creating an APK/AAB.

## YouTube And Media Policy

- Do not download YouTube videos.
- Do not extract YouTube audio.
- Do not scrape YouTube pages.
- Do not proxy, cache, rehost, or redistribute third-party media.
- Use the official YouTube Data API for metadata.
- Use the official YouTube embed/player approach for playback.
- Store only metadata needed for app features such as favorites, history, and local playlists.
- Keep platform tokens and API calls on the backend. The mobile app must not scrape or directly fetch private platform data.

## APK/Build Preparation

- Use Node.js LTS 20 or 22 for Expo/Metro stability.
- Avoid `npm audit fix --force` on Expo projects.
- Keep Expo dependencies aligned with the current Expo SDK.
- For physical phone testing, set `EXPO_PUBLIC_API_BASE_URL` to the computer LAN IP or production API URL.
- Test login, mock/real connection, search, player, favorites, history, playlists, and Home before packaging.

## Release Blockers To Resolve Later

- Production privacy policy.
- Terms and conditions.
- Google OAuth production consent configuration.
- Real YouTube OAuth testing.
- Production backend hosting and PostgreSQL hosting.
- Production logging and monitoring.
- APK/AAB signing configuration.
