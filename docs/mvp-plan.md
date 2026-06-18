# MVP Plan

## Boundaries

- Playback uses the official YouTube embed player inside the mobile WebView.
- Metadata and search use the YouTube Data API.
- The app never downloads, scrapes, extracts, proxies, caches, or rehosts YouTube video/audio.

## Step 1

- App login with email and password.
- Google OAuth connection for YouTube read-only account access.
- YouTube search with basic filters.
- Official embedded playback.
- Favorites, local playlists, and watch history stored in PostgreSQL.

## Step 2

- Existing playlist picker when saving a video.
- Favorite removal and playlist item removal.
- Google OAuth refresh-token handling before account-specific YouTube calls.
- Better loading and empty states.

## Step 3

- User profile screen.
- Channel details and video detail pages.
- Pagination for search and library lists.
- Basic observability and request logging.
