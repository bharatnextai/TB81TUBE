export type ConnectedAccount = {
  id: string;
  platform: string;
  platformUserId: string;
  scope: string | null;
  createdAt: string;
};

export type ConnectedAccountsResponse = ConnectedAccount[];

export type YouTubeStartResponse = {
  url?: string;
  mockConnected?: boolean;
};
