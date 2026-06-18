# TB81TUBE

TB81TUBE is a production-minded MVP for a YouTube-style video and audio mobile app. Users can create an account, connect YouTube through official Google OAuth or development mock mode, search videos, play videos with an official YouTube embed/player approach, and manage local favorites, watch history, and playlists.

TB81TUBE does not download, scrape, extract, proxy, cache, or rehost YouTube video or audio.

## Current MVP Features

- Register, login, logout, and session restore.
- PostgreSQL database with Prisma ORM.
- Backend health, auth, connected account, search, library, and playlist APIs.
- Development mock YouTube connection for local MVP testing.
- Real Google OAuth foundation for YouTube account connection.
- Mock YouTube data for development search and playback testing.
- Mobile Home, Search, Player, Library, Playlists, Connected Accounts, and Profile screens.
- Favorites, watch history, local playlists, and Add to Playlist.
- Responsive 16:9 YouTube player layout.
- Polished loading, empty, retry, and navigation states.

## Tech Stack

- Mobile: React Native, Expo, TypeScript, React Navigation, Axios, Expo SecureStore, `react-native-youtube-iframe`.
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, Google APIs.
- Workspace: npm workspaces.

## Run The Project

Install dependencies:

```powershell
npm.cmd install
```

Create backend env:

```powershell
copy apps\backend\.env.example apps\backend\.env
```

For local MVP testing, set this in `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public"
JWT_SECRET="tb81tube_super_secret_development_key_change_later"
DEV_MOCK_YOUTUBE_AUTH=true
```

Start PostgreSQL:

```powershell
docker compose up -d postgres
```

Run Prisma and check DB:

```powershell
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run db:check
```

Start backend:

```powershell
npm.cmd run dev:backend
```

Start mobile:

```powershell
npm.cmd run dev:mobile
```

Run typecheck:

```powershell
npm.cmd run typecheck
```

## Useful Scripts

- `npm.cmd run dev:backend`
- `npm.cmd run dev:mobile`
- `npm.cmd run db:up`
- `npm.cmd run db:down`
- `npm.cmd run db:logs`
- `npm.cmd run db:check`
- `npm.cmd run typecheck`

## Mobile API URL

Expo web can use:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

Expo Go on a physical phone cannot use `localhost` for your computer backend. Use your computer LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.99:4000/api/v1
```

Restart Expo after changing `apps/mobile/.env`.

## Google OAuth

Mock mode is for development only:

```env
DEV_MOCK_YOUTUBE_AUTH=true
```

Real YouTube login requires backend-only Google OAuth credentials in `apps/backend/.env`:

```env
DEV_MOCK_YOUTUBE_AUTH=false
GOOGLE_CLIENT_ID="your_web_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/v1/connections/youtube/callback"
FRONTEND_URL="http://localhost:8081"
```

Full setup guide: [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)

## QA And Build Docs

- MVP testing checklist: [docs/MVP_TESTING_CHECKLIST.md](docs/MVP_TESTING_CHECKLIST.md)
- Build readiness notes: [docs/BUILD_READINESS.md](docs/BUILD_READINESS.md)
- Android EAS build guide: [docs/ANDROID_BUILD.md](docs/ANDROID_BUILD.md)
- API testing guide: [docs/API_TESTING.md](docs/API_TESTING.md)
- Database setup: [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)
- Launch checklist: [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)

## Legal And API Policy Notes

- Use YouTube Data API for YouTube metadata.
- Use official YouTube embed/player approach for playback.
- Do not download YouTube videos.
- Do not extract YouTube audio.
- Do not scrape YouTube.
- Do not rehost, proxy, cache, or redistribute third-party media.
- Keep Google client secrets only in the backend environment.

## MVP Limitations

- YouTube is the only active external platform.
- JioSaavn, Amazon Music, Airtel/Wynk Music, and Spotify are placeholders until official API or SDK support is available.
- Local playlists do not modify YouTube playlists.
- Mock YouTube mode does not represent a real YouTube login.
- Production release still needs real OAuth testing, legal pages, production hosting, and APK/AAB signing checks.
