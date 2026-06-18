# Launch Checklist

Use this checklist before sharing the MVP with testers or preparing a public release.

## Required

- [ ] API keys ready.
- [ ] Privacy policy ready.
- [ ] Terms and conditions ready.
- [ ] OAuth consent configured.
- [ ] App tested on Android.
- [ ] No copyrighted content stored on our server.
- [ ] Only official playback used.

## Backend

- [ ] Production `DATABASE_URL` configured.
- [ ] Strong `JWT_SECRET` configured.
- [ ] Strong `TOKEN_ENCRYPTION_KEY` configured and stored securely.
- [ ] Production `APP_ORIGIN`, `CORS_ORIGINS`, and `API_BASE_URL` configured.
- [ ] Database migrations applied with `prisma migrate deploy`.
- [ ] Rate limiting enabled.
- [ ] Request logs verified to avoid sensitive query strings, OAuth codes, or tokens.
- [ ] Backend tests pass.

## YouTube And OAuth

- [ ] YouTube Data API v3 enabled in Google Cloud.
- [ ] Google OAuth client configured with production redirect URI.
- [ ] OAuth consent screen has app name, support email, privacy policy, and terms links.
- [ ] Required scopes are reviewed and limited to what the app needs.
- [ ] YouTube account connection tested end to end.
- [ ] YouTube search tested through the backend.
- [ ] YouTube playlists tested through the backend.

## Mobile App

- [ ] `EXPO_PUBLIC_API_BASE_URL` points to the production backend.
- [ ] Login and register tested.
- [ ] Logout tested.
- [ ] Connected Accounts screen tested.
- [ ] Search screen tested.
- [ ] Player screen tested with official YouTube playback.
- [ ] Favorites tested.
- [ ] Local playlists tested.
- [ ] Watch history tested.

## Policy Check

- [ ] The app does not download YouTube videos or audio.
- [ ] The app does not extract YouTube audio.
- [ ] The app does not scrape YouTube pages.
- [ ] The app does not proxy or rehost YouTube media.
- [ ] The app uses official YouTube metadata APIs.
- [ ] The app uses official YouTube playback surfaces.
- [ ] Placeholder platforms remain disabled until official API access or playback SDK support is available.
