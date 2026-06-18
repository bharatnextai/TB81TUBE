# TB81TUBE GitHub Push Guide

Use this guide to push the TB81TUBE MVP repository to GitHub safely.

## Before Pushing

Confirm real secrets are not committed:

- Do not commit `apps/backend/.env`.
- Do not commit `apps/mobile/.env`.
- Do not commit Google client secrets.
- Do not commit JWT secrets used in production.
- Do not commit production database URLs.
- Do not commit OAuth access tokens or refresh tokens.

Safe files to commit:

- `apps/backend/.env.example`
- `apps/mobile/.env.example`

These files should contain placeholders or local development examples only.

## A) Initialize Git If Needed

```powershell
git init
```

## B) Check Status

```powershell
git status
```

Review the output before adding files. Make sure `.env`, `node_modules`, `dist`, `build`, `.expo`, `.eas`, and logs are not staged.

## C) Add Files

```powershell
git add .
```

## D) Commit

```powershell
git commit -m "Initial TB81TUBE MVP"
```

## E) Create GitHub Repository

Create a new repository on GitHub named:

```text
tb81tube
```

Do not initialize the GitHub repository with a README if your local repository already has one.

## F) Add Remote

Replace `YOUR_USERNAME` with your GitHub username:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/tb81tube.git
```

## G) Push

```powershell
git branch -M main
git push -u origin main
```

## After Pushing To GitHub

1. Deploy backend to Render, Railway, Fly.io, VPS, or another Node hosting provider.
2. Add production environment variables in the hosting dashboard.
3. Use hosted PostgreSQL.
4. Keep `DEV_MOCK_YOUTUBE_AUTH=false` in production.
5. Update mobile `EXPO_PUBLIC_API_BASE_URL` to the hosted backend:
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://your-hosted-backend-url.com/api/v1
   ```
6. Build APK with EAS.
7. Test register/login, search, player, library, playlists, and Home against the hosted backend.

## Deployment Docs

- Render deployment: `docs/RENDER_DEPLOYMENT.md`
- Backend deployment: `docs/DEPLOY_BACKEND.md`
- Mobile environment setup: `docs/MOBILE_ENV_SETUP.md`
- Android build: `docs/ANDROID_BUILD.md`
