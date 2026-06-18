export type AuthUser = {
  id: string;
  email: string;
  name: string;
  youtubeConnected: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
};

export type SearchFilters = {
  query: string;
  order?: "date" | "rating" | "relevance" | "title" | "videoCount" | "viewCount";
  duration?: "any" | "short" | "medium" | "long";
};

export type Favorite = {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  createdAt: string;
};

export type LocalPlaylist = {
  id: string;
  name: string;
  createdAt: string;
  items: PlaylistItem[];
};

export type PlaylistItem = {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  addedAt: string;
};

export type WatchHistoryItem = {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  watchedAt: string;
};
