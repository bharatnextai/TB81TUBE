import type { NavigatorScreenParams } from "@react-navigation/native";
import type { ContentItem } from "./content";

export type RootStackParamList = {
  Loading: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Player: { contentItem: ContentItem };
  PlaylistDetail: { playlistId: string };
  ConnectedAccounts: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Playlists: undefined;
  Profile: undefined;
};
