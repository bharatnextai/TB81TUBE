# Google OAuth Setup for TB81TUBE

Use this guide to connect YouTube accounts through the official Google OAuth flow. Keep Google secrets only in `apps/backend/.env`; do not put `GOOGLE_CLIENT_SECRET` in the mobile app.

## How YouTube Login Works

TB81TUBE does not create its own YouTube login form. The app redirects users to Google's official OAuth login page. Users enter credentials only on Google, choose their Google/YouTube account, and approve the requested permissions there.

After permission is granted, TB81TUBE receives OAuth access tokens from Google. The backend uses those tokens to fetch permitted YouTube data through the official YouTube Data API.

Never ask users to type their YouTube or Google password inside TB81TUBE. TB81TUBE must never collect, store, log, or proxy Google passwords.

## Simple Checklist

1. Go to Google Cloud Console.
2. Select or create a project.
3. Enable **YouTube Data API v3**.
4. Configure the OAuth consent screen.
5. If the app is in Testing mode, add your Google account email as a test user.
6. Open **Credentials** and choose **Create Credentials** -> **OAuth client ID**.
7. Application type must be **Web application**.
8. Add this authorized redirect URI exactly:

```text
http://localhost:4000/api/v1/connections/youtube/callback
```

9. Copy the **Client ID** into `GOOGLE_CLIENT_ID`.
10. Copy the **Client Secret** into `GOOGLE_CLIENT_SECRET`.

Warning: `GOOGLE_CLIENT_ID` is not the same as `GOOGLE_CLIENT_SECRET`. The Client ID usually ends with `.apps.googleusercontent.com`. Never paste the Client Secret into `GOOGLE_CLIENT_ID`.

11. Add them to the real backend environment file.

Do not put credentials only in `.env.example`. Create or update this real file:

```text
apps/backend/.env
```

Example:

```env
GOOGLE_CLIENT_ID="your_web_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/v1/connections/youtube/callback"
FRONTEND_URL="http://localhost:8081"
```

12. Stop and restart the backend after saving `.env`:

```text
Ctrl+C
```

```powershell
npm.cmd run dev -w @tb81tube/backend
```

## Required Scopes

The backend requests these official Google scopes:

```text
https://www.googleapis.com/auth/youtube.readonly
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

## Development Mock YouTube Connection

To continue app development without Google OAuth credentials, set this in `apps/backend/.env`:

```env
DEV_MOCK_YOUTUBE_AUTH=true
```

Then restart the backend:

```powershell
npm.cmd run dev -w @tb81tube/backend
```

This lets the `Continue with Google` button mark YouTube as connected for development only.

Warning: mock mode does not fetch real YouTube videos, playlists, or account data. Real YouTube features require Google OAuth credentials.

## Troubleshooting

The Google Client ID usually ends with:

```text
.apps.googleusercontent.com
```

If the app shows:

```text
Google OAuth credentials missing. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to apps/backend/.env, then restart the backend.
```

Check:

- `apps/backend/.env` exists.
- `GOOGLE_CLIENT_ID` is set in `apps/backend/.env`.
- `GOOGLE_CLIENT_ID` is not empty.
- `GOOGLE_CLIENT_SECRET` is set in `apps/backend/.env`.
- `GOOGLE_CLIENT_SECRET` is not empty.
- There are no extra spaces before variable names.
- Values are wrapped in quotes.
- The backend was restarted after changing `.env`.
- YouTube Data API v3 is enabled in Google Cloud.
- OAuth consent screen is configured.
- Your email is added as a test user if the app is in testing mode.
- The redirect URI in Google Cloud exactly matches:

```text
http://localhost:4000/api/v1/connections/youtube/callback
```

Then open this development config check in your browser:

```text
http://localhost:4000/api/v1/status/config
```

Expected values after setup:

```json
{
  "googleClientIdConfigured": true,
  "googleClientIdLooksValid": true,
  "googleClientSecretConfigured": true,
  "googleRedirectUriConfigured": true
}
```

If Google redirects to a failure page, re-check the redirect URI first. It must match exactly, including protocol, host, port, path, and trailing slash behavior.

### Error 401: invalid_client

If Google shows:

```text
Client missing a project id
Error 401: invalid_client
```

Check:

- `GOOGLE_CLIENT_ID` is real and complete.
- `GOOGLE_CLIENT_ID` ends with `.apps.googleusercontent.com`.
- The Google credential type is **Web application**.
- `GOOGLE_CLIENT_SECRET` is pasted into the correct field.
- You did not paste the Client Secret into `GOOGLE_CLIENT_ID`.
- The backend was restarted after editing `apps/backend/.env`.
- The redirect URI exactly matches:

```text
http://localhost:4000/api/v1/connections/youtube/callback
```
