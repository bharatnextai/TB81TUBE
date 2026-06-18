export type ContentItem = {
  platform: string;
  contentType: string;
  externalContentId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  creatorName: string | null;
  duration: string | number | null;
  sourceUrl: string | null;
  playbackType: string;
};
