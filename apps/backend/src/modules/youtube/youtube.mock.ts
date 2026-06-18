import { ContentType, Platform, PlaybackType } from "@prisma/client";

const mockThumbnailBaseUrl = "https://placehold.co";
const mockVideoIds = ["M7lc1UVf-VE", "ysz5S6PUM-U", "aqz-KE-bpKQ", "jNQXAC9IVRw", "ScMzIvxBSi4"];

export function getMockYouTubeChannel() {
  logMockYouTubeData("channel");

  return {
    id: "mock-channel-id",
    title: "TB81TUBE Mock Channel",
    description: "Development mock YouTube channel",
    thumbnailUrl: `${mockThumbnailBaseUrl}/300x300?text=TB81`,
    customUrl: "@tb81tube-mock"
  };
}

export function getMockYouTubePlaylists() {
  logMockYouTubeData("playlists");

  return [
    {
      id: "mock-playlist-music-mix",
      title: "Music Mix",
      description: "Development mock playlist for music videos.",
      thumbnailUrl: `${mockThumbnailBaseUrl}/480x270?text=Music+Mix`,
      itemCount: 5
    },
    {
      id: "mock-playlist-learning-videos",
      title: "Learning Videos",
      description: "Development mock playlist for learning content.",
      thumbnailUrl: `${mockThumbnailBaseUrl}/480x270?text=Learning`,
      itemCount: 5
    },
    {
      id: "mock-playlist-saved-favorites",
      title: "Saved Favorites",
      description: "Development mock playlist for favorite videos.",
      thumbnailUrl: `${mockThumbnailBaseUrl}/480x270?text=Favorites`,
      itemCount: 5
    }
  ];
}

export function getMockYouTubePlaylistVideos(playlistId: string) {
  logMockYouTubeData(`playlist videos for ${playlistId}`);

  return createMockVideos(`${playlistId}-video`, 5);
}

export function searchMockYouTubeVideos(query: string, maxResults = 10) {
  logMockYouTubeData(`search for "${query}"`);

  return {
    items: createMockVideos("mock-video", Math.min(maxResults, 10), query),
    nextPageToken: null
  };
}

function createMockVideos(idPrefix: string, count: number, query = "music") {
  return Array.from({ length: count }, (_value, index) => {
    const number = index + 1;
    const externalContentId = mockVideoIds[index % mockVideoIds.length] ?? `${idPrefix}-${number}`;

    return {
      platform: Platform.YOUTUBE,
      contentType: ContentType.VIDEO,
      externalContentId,
      title: `${titleCase(query)} Mock Video ${number}`,
      description: `Development mock YouTube video ${number} for TB81TUBE.`,
      thumbnailUrl: `https://img.youtube.com/vi/${externalContentId}/hqdefault.jpg`,
      creatorName: "TB81TUBE Mock Channel",
      duration: null,
      sourceUrl: `https://www.youtube.com/watch?v=${externalContentId}`,
      playbackType: PlaybackType.EMBEDDED_PLAYER
    };
  });
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

function logMockYouTubeData(area: string) {
  console.log("Development mock YouTube data returned", { area });
}
